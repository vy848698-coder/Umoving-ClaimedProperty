// "What brings you to Umovingu?" answers (client request, 2026-09-29).
// Persisted to the backend (POST/GET /profile/interests, 2026-09-30 —
// also fires the "we've got your interest"/"interests updated"
// confirmation email) with localStorage as a same-tab fallback/cache so
// the picker can pre-fill instantly without waiting on the network.
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

function getAuthHeaders() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function cacheLocally(answer: InterestsAnswer): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answer))
  } catch {
    // Best-effort — private mode / full storage shouldn't block the flow.
  }
}

// Synchronous, localStorage-only — used for an instant pre-fill while
// fetchInterests() resolves in the background.
export function loadInterests(): InterestsAnswer | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Source of truth — call this on page load once a token exists so a
// user's saved interests follow them across devices.
export async function fetchInterests(): Promise<InterestsAnswer | null> {
  const config = useRuntimeConfig()
  try {
    const data = await $fetch<{
      interestIds: string[]
      areas: string[]
      emailOptIn: boolean
    } | null>(`${config.public.apiBase}/profile/interests`, {
      headers: getAuthHeaders(),
    })
    if (!data) return null
    const answer: InterestsAnswer = {
      interestIds: data.interestIds,
      areas: data.areas,
      emailOptIn: data.emailOptIn,
    }
    cacheLocally(answer)
    return answer
  } catch {
    return loadInterests()
  }
}

export async function saveInterests(answer: InterestsAnswer): Promise<void> {
  cacheLocally(answer)
  const config = useRuntimeConfig()
  await $fetch(`${config.public.apiBase}/profile/interests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: answer,
  })
}
