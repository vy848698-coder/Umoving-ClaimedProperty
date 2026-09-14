// Address tidying for printed documents (the Founding Homeowner certificate).
// Backend property records can arrive in capitals ("COVENTRY", "10 MELLOWSHIP
// ROAD"); these helpers set them the way a Royal Mail address is written.

// Joining words in UK place names: Stoke-on-Trent, Newcastle upon Tyne,
// Weston-super-Mare. Lowercase unless they start the name.
const PLACE_JOINERS = new Set(['on', 'upon', 'under', 'in', 'by', 'the', 'super', 'le', 'en', 'cum', 'next', 'with', 'de', 'sur'])

const squash = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim()

// Title-cases text only when it is all capitals or all lowercase; anything with
// mixed case already carries someone's intended spelling and is kept.
function titleCase(raw: unknown, joiners: Set<string> | null): string {
  const text = squash(raw)
  const letters = text.replace(/[^\p{L}]/gu, '')
  if (!letters) return text
  if (letters !== letters.toUpperCase() && letters !== letters.toLowerCase()) return text

  let index = 0
  // A word is letters/digits with any apostrophe parts ("bishop's").
  return text.toLowerCase().replace(/[\p{L}\d]+(?:['’]\p{L}+)*/gu, (word) => {
    const first = index++ === 0
    if (!first && joiners?.has(word)) return word
    // House numbers with a letter suffix: "2a" -> "2A".
    if (/^\d+\p{L}$/u.test(word)) return word.toUpperCase()
    return word.replace(/^\p{L}/u, (ch) => ch.toUpperCase())
  })
}

// Property records write the house number as "100, Barkers Butts Lane"; an
// address is printed "100 Barkers Butts Lane" - including after a flat or
// building name ("Flat 3, 10, Mellowship Road" -> "Flat 3, 10 Mellowship Road").
export const formatStreet = (raw: unknown) =>
  titleCase(raw, null).replace(/(^|,\s*)(\d+\p{L}?(?:-\d+\p{L}?)?),\s*/gu, '$1$2 ')

export const formatPlaceName = (raw: unknown) => titleCase(raw, PLACE_JOINERS)

// "cv57by" -> "CV5 7BY". The inward code is always the last three characters.
export function formatPostcode(raw: unknown): string {
  const compact = String(raw ?? '').replace(/\s+/g, '').toUpperCase()
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact
}
