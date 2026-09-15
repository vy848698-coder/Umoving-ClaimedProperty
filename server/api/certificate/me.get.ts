import { createError, getHeader, getQuery, setHeader } from 'h3'

// The signed-in user's Founding Homeowner certificate, built from live data:
//   name     - their current profile name (so a name change shows straight away)
//   property - the address of their first claimed Passport, or ?passportId=
//   date     - the day the certificate was first issued (kept for good)
//   number   - their founder number, assigned on first request and kept for good
//
// Requires the user's own bearer token; everything is read from the backend
// with it, so nobody can render someone else's certificate.
// ?format=json returns the details instead of the image.

type AnyRecord = Record<string, any>

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization')
  if (!auth || !/^Bearer\s+\S+/.test(auth) || /^Bearer\s+(null|undefined)$/.test(auth)) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to view your certificate.' })
  }

  const { backendBase } = useRuntimeConfig(event)
  const api = <T>(path: string) =>
    $fetch<T>(`${backendBase}${path}`, { headers: { Authorization: auth } })

  const profile = await api<AnyRecord>('/profile/me').catch((err) => {
    const status = err?.statusCode ?? err?.response?.status
    throw createError(
      status === 401 || status === 403
        ? { statusCode: 401, statusMessage: 'Your session has expired. Sign in again.' }
        : { statusCode: 502, statusMessage: 'Could not load your profile. Try again in a moment.' },
    )
  })

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

  // Owned (seller / landlord) passports only - not ones the user watches as a buyer.
  const passports = (await api<AnyRecord[]>('/profile/passports').catch(() => [])) ?? []
  const owned = passports.filter((p) => p?.id && p?.type !== 'BUYER')

  const { passportId, format } = getQuery(event)
  let chosen: AnyRecord | undefined
  if (typeof passportId === 'string' && passportId) {
    chosen = owned.find((p) => p.id === passportId)
    if (!chosen) {
      throw createError({ statusCode: 404, statusMessage: 'That Passport is not one of yours.' })
    }
  } else {
    // The founding claim is the first one. The list comes back most-recently
    // visited first, so without dates the last entry is the oldest.
    const time = (p: AnyRecord) => Date.parse(p.createdAt ?? p.claimedAt ?? '') || Infinity
    chosen = [...owned].reverse().sort((a, b) => time(a) - time(b))[0]
  }
  if (!chosen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Claim a property to get your Founding Homeowner certificate.',
    })
  }

  const passport = (await api<AnyRecord>(`/passport/${chosen.id}`).catch(() => null)) ?? chosen
  // The passport stores only the street and postcode; the town is on the
  // property record it was claimed from.
  const propertyId = passport.propertyId ?? chosen.propertyId ?? passport.property?.id
  const property: AnyRecord =
    (propertyId ? await api<AnyRecord>(`/property/${propertyId}`).catch(() => null) : null) ??
    passport.property ??
    chosen.property ??
    {}
  // The passport's own street first; otherwise the property's lines, where a
  // flat or building name can sit in addressLine2.
  const addressLine1 = formatStreet(
    passport.addressLine1 ??
      chosen.addressLine1 ??
      [property.addressLine1, property.addressLine2].filter(Boolean).join(', '),
  )
  const town = formatPlaceName(
    property.city ?? property.town ?? passport.city ?? passport.town ?? property.county ?? '',
  )
  const postcode = formatPostcode(passport.postcode ?? chosen.postcode ?? property.postcode ?? '')
  const addressLine2 = [town, postcode].filter(Boolean).join(', ')

  const founder = await getOrAssignFounderNumber(backendBase, auth)
  // The day the certificate was first issued - today on the first request,
  // then fixed for good. Passport records can be created long before the claim,
  // so their createdAt showed the wrong day.
  const joinedAt = founder.assignedAt

  const details = {
    name: formatCertificateName(name),
    founderNumber: founder.number,
    founderNumberLabel: formatFounderNumber(founder.number),
    addressLine1,
    addressLine2,
    joinedAt,
    joinedLabel: formatJoinedDate(joinedAt),
    passportId: chosen.id,
    passportType: chosen.type ?? null,
  }

  setHeader(event, 'Cache-Control', 'private, no-store')

  // First-ever request for this user: this is the moment they're actually
  // becoming a Founding Homeowner, so email them a copy now rather than
  // waiting for them to notice the certificate exists under the Profile
  // menu. Every later view of this page (isNew: false) skips this - no
  // re-send on refresh. Fire-and-forget: a failed email shouldn't break
  // the page the user is looking at right now, which already has its copy.
  if (founder.isNew) {
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
