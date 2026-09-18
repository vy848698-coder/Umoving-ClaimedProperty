import { formatPlaceName, formatPostcode, formatStreet } from './address'

// Choosing which claimed property a Founding Homeowner certificate is for.
//
// A user can claim more than one property, so a certificate is per passport,
// not per user: the address and the passport code both come from whichever
// claim is being looked at, and are re-resolved on every request. Only the
// founder number and the date it was assigned are per user - handed out once
// and kept for good, whatever is claimed later.
//
// /profile/passports returns every passport the user is attached to, any type,
// most-recently-visited first.

export type PassportRecord = Record<string, any>

// A passport the user owns (seller / landlord), not one they only watch as a
// buyer.
export function isOwnedPassport(p: PassportRecord | null | undefined): boolean {
  return Boolean(p?.id) && p?.type !== 'BUYER'
}

// Owned *and* actually claimed. PENDING_PAYMENT is a draft row that exists
// after KYC + HM Land Registry but before the owner-claim charge, with no
// seeded sections yet - certifying one would certify a claim that isn't
// complete.
export function isClaimedPassport(p: PassportRecord | null | undefined): boolean {
  return isOwnedPassport(p) && p?.status !== 'PENDING_PAYMENT'
}

// Date fields a passport can carry for the moment it was claimed, best first.
// `createdAt` is last and is not quite the same thing - it is when the row was
// opened rather than when the claim completed - but the claim flow creates the
// row and finishes the claim in one sitting, so in practice it is the same day,
// and it is the only one of these the backend is known to always send.
const CLAIM_DATE_KEYS = ['claimedAt', 'activatedAt', 'completedAt', 'createdAt'] as const

function toTime(value: unknown): number | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime()
  if (typeof value !== 'string' || !value.trim()) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function claimedTime(p: PassportRecord): number | null {
  for (const key of CLAIM_DATE_KEYS) {
    const time = toTime(p?.[key])
    if (time !== null) return time
  }
  return null
}

// The day a property was claimed, as an ISO string, for the date printed on
// that property's certificate. Each record is tried in full before the next, so
// the passport's own detail wins over the summary row from the list. Returns ''
// when none of them carries a usable date - the caller decides what to fall
// back to.
export function passportClaimDate(
  ...records: Array<PassportRecord | null | undefined>
): string {
  for (const record of records) {
    if (!record) continue
    const time = claimedTime(record)
    if (time !== null) return new Date(time).toISOString()
  }
  return ''
}

// Newest claim first. If every row carries a date we sort on it; if any row is
// missing one we keep the list's own order instead, which is already
// most-recent-first - mixing the two would order dated and undated rows
// against each other on nothing.
export function newestClaimFirst<T extends PassportRecord>(rows: T[]): T[] {
  const times = rows.map(claimedTime)
  if (times.some((t) => t === null)) return [...rows]
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => times[b.i]! - times[a.i]! || a.i - b.i)
    .map((entry) => entry.row)
}

// The passport code shown on the certificate page. The backend may carry its
// own human reference; when it doesn't, derive a stable one from the id so two
// claims by the same user never read as the same passport.
export function formatPassportCode(p: PassportRecord | null | undefined): string {
  const given = p?.reference ?? p?.code ?? p?.passportCode
  if (typeof given === 'string' && given.trim()) return given.trim().toUpperCase()
  const compact = String(p?.id ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return compact ? `UMU-${compact.slice(-6)}` : ''
}

// One line for the property switcher, built from the list row alone - the full
// address needs the property record behind the passport, which is a request
// each and not worth it just to label a dropdown. The selected entry gets its
// resolved address swapped in by the endpoint.
export function passportAddressLabel(p: PassportRecord): string {
  const property: PassportRecord = p?.property ?? {}
  const line1 = formatStreet(
    p?.addressLine1 ??
      [property.addressLine1, property.addressLine2].filter(Boolean).join(', '),
  )
  const town = formatPlaceName(
    p?.city ?? p?.town ?? property.city ?? property.town ?? property.county ?? '',
  )
  const postcode = formatPostcode(p?.postcode ?? property.postcode ?? '')
  const parts = [line1, town, postcode].filter(Boolean)
  if (parts.length) return parts.join(', ')
  // Some list rows carry only a pre-joined `address` string.
  return formatStreet(p?.address ?? '') || formatPassportCode(p)
}
