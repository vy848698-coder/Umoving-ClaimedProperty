// "What brings you to Umovingu?" answers (client request, 2026-09-29).
// Stored client-side only for now — there's no backend field for this
// interest-picker shape yet (it's a different, simpler question set from
// the existing role + buy/sell preferences at POST /profile/preferences).
// If this needs to survive a device switch or show up for admins, it needs
// a real backend endpoint — flagged, not built here since this pass is
// website-integration-only.
const STORAGE_KEY = 'umu-interests'

export interface InterestsAnswer {
  interestIds: string[]
  // Multiple towns/cities/postcodes, same shape as preferences.vue's
  // location chip-picker (client feedback, 2026-09-29: "should allow user
  // to select multiple from the list, just like on preferences").
  areas: string[]
  emailOptIn: boolean
}

// Shared between the picker (onboarding/interests.vue) and the account hub
// (onboarding/member.vue, which shows the saved choices as chips).
export const INTEREST_OPTIONS = [
  { id: 'buying', label: 'Buying a home', image: '/dashboard-art/searchHouse.png' },
  { id: 'renting', label: 'Renting a home', image: '/onboarding-journey/renting.png' },
  { id: 'owning', label: 'Owning a home', image: '/dashboard-art/searchHouse.png' },
  { id: 'letting', label: 'Letting a property', image: '/onboarding-journey/letting.png' },
  { id: 'understanding', label: 'Understanding homes and Passports', image: '/onboarding-journey/understanding-passports.png' },
  { id: 'exploring', label: 'Just exploring', image: '/onboarding-journey/exploring.png' },
]

export function loadInterests(): InterestsAnswer | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveInterests(answer: InterestsAnswer): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answer))
  } catch {
    // Best-effort — private mode / full storage shouldn't block the flow.
  }
}
