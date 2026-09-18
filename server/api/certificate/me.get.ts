import { createError, getHeader, getQuery, setHeader } from 'h3'

// The signed-in user's Founding Homeowner certificate(s), built from live
// data:
//   name     - their current profile name (so a name change shows straight away)
//   property - the address of the claim being viewed
//   code     - the passport code for that same claim
//   date     - the day that property was claimed
//   number   - THIS PROPERTY's founder number, assigned on first request
//              and kept for good
//
// A user can claim more than one property, and gets a separate certificate
// - with its own founder number - for each one. Everything that describes
// the property - address, passport code, passport id, claim date, and now
// the founder number itself - is resolved per passport on every request,
// so a second claim gets its own certificate rather than reusing the
// first one's number.
//
// ?passportId=<id> picks a specific claim; without it the newest claim wins.
// ?format=json returns the details (including every claim, for the property
// switcher) instead of the image.
// ?email=1 also sends the certificate to the user - the claim flow passes it
// once per completed claim; plain page views never do, so refreshing the
// certificate page cannot re-send it.
//
// Requires the user's own bearer token; everything is read from the backend
// with it, so nobody can render someone else's certificate.

type AnyRecord = Record<string, any>

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization')
  if (!auth || !/^Bearer\s+\S+/.test(auth) || /^Bearer\s+(null|undefined)$/.test(auth)) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to view your certificate.' })
  }

  const { backendBase } = useRuntimeConfig(event)
  const api = <T>(path: string) =>
    $fetch<T>(`${backendBase}${path}`, { headers: { Authorization: auth } })

  // profile/me and profile/passports don't depend on one another - run them
  // together instead of one after another. This endpoint used to take 5 fully
  // sequential backend round-trips before it could even start rendering.
  // The founder number is deliberately NOT in here: it is a write, not a read
  // (it allocates a permanent, never-reused number), so it has to stay behind
  // the guards below - see where it is awaited.
  const [profile, passports] = await Promise.all([
    api<AnyRecord>('/profile/me').catch((err) => {
      const status = err?.statusCode ?? err?.response?.status
      throw createError(
        status === 401 || status === 403
          ? { statusCode: 401, statusMessage: 'Your session has expired. Sign in again.' }
          : { statusCode: 502, statusMessage: 'Could not load your profile. Try again in a moment.' },
      )
    }),
    api<AnyRecord[]>('/profile/passports').catch(() => [] as AnyRecord[]),
  ])

  const userId = String(profile?.id ?? profile?.userId ?? profile?.email ?? '')
  const name = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!userId) {
    throw createError({ statusCode: 502, statusMessage: 'Your profile has no account id.' })
  }
  if (!name) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Add your first and last name in Personal information to get your certificate.',
    })
  }

  // Owned (seller / landlord) passports only - not ones the user watches as a
  // buyer - and, for the switcher and the default, only ones actually claimed.
  const owned = (passports ?? []).filter(isOwnedPassport)
  // Newest claim first: the order the switcher lists them in, and the default
  // when no passport is asked for. Somebody who has just claimed a second
  // property means that one, not the one they claimed a year ago.
  const claims = newestClaimFirst(owned.filter(isClaimedPassport))

  const { passportId, format, email } = getQuery(event)
  let chosen: AnyRecord | undefined
  if (typeof passportId === 'string' && passportId) {
    // Matched against everything they own rather than just the settled claims:
    // the status guard below runs on the passport's own record, which is
    // fresher than this list in the moment right after a claim completes.
    chosen = owned.find((p) => p.id === passportId)
    if (!chosen) {
      throw createError({ statusCode: 404, statusMessage: 'That Passport is not one of yours.' })
    }
  } else {
    chosen = claims[0]
  }
  if (!chosen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Claim a property to get your Founding Homeowner certificate.',
    })
  }
  const selected = chosen

  const passport = (await api<AnyRecord>(`/passport/${selected.id}`).catch(() => null)) ?? selected
  // PENDING_PAYMENT is a draft row: KYC and HM Land Registry are done but the
  // owner-claim charge isn't, so there is no claim to certify yet.
  if ((passport.status ?? selected.status) === 'PENDING_PAYMENT') {
    throw createError({
      statusCode: 404,
      statusMessage: 'That claim is not finished yet, so it has no certificate.',
    })
  }

  // Only now, past every guard: this assigns a permanent, never-reused
  // Founding Homeowner number on first call and flips `isNew` (which gates the
  // "here's your certificate" email). Running it earlier - alongside the reads
  // above - burns a number and fires that flag for anyone who merely hits this
  // endpoint without a name or a finished claim, leaving holes in the sequence.
  // Running it beside the property read is fine: both are past the guards.
  //
  // The passport stores only the street and postcode; the town is on the
  // property record it was claimed from.
  const propertyId = passport.propertyId ?? selected.propertyId ?? passport.property?.id
  const [founder, fetchedProperty] = await Promise.all([
    getOrAssignFounderNumber(backendBase, auth, selected.id),
    propertyId ? api<AnyRecord>(`/property/${propertyId}`).catch(() => null) : null,
  ])
  const property: AnyRecord = fetchedProperty ?? passport.property ?? selected.property ?? {}

  // The passport's own street first; otherwise the property's lines, where a
  // flat or building name can sit in addressLine2.
  const addressLine1 = formatStreet(
    passport.addressLine1 ??
      selected.addressLine1 ??
      [property.addressLine1, property.addressLine2].filter(Boolean).join(', '),
  )
  const town = formatPlaceName(
    property.city ?? property.town ?? passport.city ?? passport.town ?? property.county ?? '',
  )
  const postcode = formatPostcode(passport.postcode ?? selected.postcode ?? property.postcode ?? '')
  const addressLine2 = [town, postcode].filter(Boolean).join(', ')

  // The day THIS property was claimed, read from the passport itself, so a
  // second property claimed months later is dated that day rather than the day
  // the user first joined. The passport's own record is tried before the
  // summary row from the list. If neither carries a date - an older record from
  // before the backend stored one - fall back to the day the founder number was
  // assigned, which is the only other date we have.
  const claimedAt = passportClaimDate(passport, selected) || founder.assignedAt

  const passportCode = formatPassportCode(passport)
  const resolvedLabel = [addressLine1, addressLine2].filter(Boolean).join(', ')

  // The switcher lists the settled claims, newest first. An explicitly asked-for
  // passport is prepended if it isn't among them yet - which is the case in the
  // moment right after a claim, where its own record already says it is paid for
  // but /profile/passports still has it as PENDING_PAYMENT. Without this the
  // dropdown would have no entry matching what is on screen.
  const listed = claims.some((p) => p.id === selected.id) ? claims : [selected, ...claims]

  // Every entry is labelled from its own list row: resolving each full address
  // means a request per property, and the street and postcode already name a UK
  // home. The selected one falls back to its resolved address only when its row
  // carries no address at all - otherwise it alone would show a town the rest of
  // the list can't, and gain one the moment it was picked.
  const optionLabel = (p: AnyRecord) => {
    const label = passportAddressLabel(p)
    const bare = !label || label === formatPassportCode(p)
    return bare && p.id === selected.id && resolvedLabel ? resolvedLabel : label
  }

  const details = {
    name: formatCertificateName(name),
    founderNumber: founder.number,
    founderNumberLabel: formatFounderNumber(founder.number),
    addressLine1,
    addressLine2,
    claimedAt,
    claimedLabel: formatCertificateDate(claimedAt),
    // When THIS PROPERTY's founder number was assigned - never moves once
    // set. A second claimed property gets its own founderSince, from its
    // own certificate, not the first property's date.
    founderSince: founder.assignedAt,
    passportId: selected.id,
    passportCode,
    passportType: selected.type ?? null,
    propertyId: propertyId ?? null,
    // Every claim this user can be certified for, newest first, for the
    // property switcher on the certificate page. The selected one carries the
    // fully resolved address rather than the list row's partial one.
    passports: listed.map((p) => ({
      id: p.id as string,
      code: formatPassportCode(p),
      label: optionLabel(p),
      selected: p.id === selected.id,
    })),
  }

  setHeader(event, 'Cache-Control', 'private, no-store')

  // Email a copy at the moment it is earned: on the user's very first
  // certificate, and on each later claim, where the claim flow asks for it with
  // ?email=1. Plain views of the certificate page never set it, so refreshing
  // the page or switching property in the dropdown cannot re-send. What gets
  // rendered is the details above - this property's address and passport code -
  // so a second claim is emailed its own certificate, not the first one again.
  // Fire-and-forget: a failed email shouldn't break the page the user is
  // looking at right now, which already has its copy.
  if (founder.isNew || email === '1') {
    const image = await renderCertificate(details)
    $fetch(`${backendBase}/profile/founder-number/email`, {
      method: 'POST',
      headers: { Authorization: auth },
      body: { imageBase64: image.toString('base64') },
    }).catch((err) => {
      console.error('[certificate] founder email send failed:', err?.data?.message ?? err?.message ?? err)
    })
    if (format !== 'json') {
      setHeader(event, 'Content-Type', 'image/jpeg')
      return image
    }
  }

  if (format === 'json') return details

  const image = await renderCertificate(details)
  setHeader(event, 'Content-Type', 'image/jpeg')
  return image
})
