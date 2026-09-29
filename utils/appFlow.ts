// The app is scoped down to a couple of journeys, entered from the
// marketing site via /founding-homeowners?action=claim-property or
// ?action=join-umu (client request, 2026-09-29):
//
//   founding-homeowners ─┬─ create account ─┬─ (claim-property) ──────────────────────> /claim ─> /claim/:id ─> Passport
//                        └─ sign in ────────┘  (join-umu / no action) ─> next-steps ─┬─> /claim (Start a claim)
//                                                                                     └─> interests ─> member ─┬─> passport-story
//                                                                                                              └─> /claim
//
// plus the two profile pages reachable from the navbar's Profile menu.
// Every other page still exists in the repo but is unreachable: the global
// middleware (middleware/flow.global.ts) sends any route not listed below back
// into the journey. To bring a page back, add its pattern here.

export const FLOW_HOME = '/claim'
export const SIGNIN_PATH = '/onboarding/signin'
// Public entry point for a signed-out visitor landing on any route outside
// the flow (including "/" itself - see flow.global.ts) — client request,
// 2026-09-28. Kept distinct from SIGNIN_PATH: a protected app route still
// bounces straight to sign-in (middleware/auth.ts), only the generic
// "you're not in the flow at all" fallback changed.
export const LANDING_PATH = '/founding-homeowners'
// Account hub for a member who hasn't necessarily claimed a property yet -
// the "join-umu" journey's landing spot (client request, 2026-09-29). A
// signed-in visitor re-arriving at LANDING_PATH from the marketing site
// lands here (middleware/founding-guest.ts) instead of straight into /claim.
export const MEMBER_HOME = '/onboarding/member'

// Signed-in screens — also the only valid "return here after sign-in" targets.
const APP_ROUTES: RegExp[] = [
  /^\/claim(\/[^/]+)?$/,
  // Passport collection - every passport the user has claimed, opened from the
  // navbar's Passport button. /passport itself only redirects there.
  /^\/passport(\/collections)?$/,
  // Seller Passport and the pages that build it section by section. The
  // landlord view is deliberately not listed - this app only issues Seller
  // Passports, so /passportview/landlord/:id is unreachable.
  /^\/passportview\/(steps\/tasks\/[^/]+|steps\/[^/]+|[^/]+)$/,
  /^\/profile\/(personal-information|settings)$/,
  // Founding Homeowner certificate, from the Profile menu.
  /^\/certificate$/,
  // "Join UMU" journey (client request, 2026-09-29): the post-signup fork
  // ("What would you like to do now?"), the interests picker, the account
  // hub, and the Passport explainer reached from it.
  /^\/onboarding\/(next-steps|interests|member|passport-story)$/,
]

const PUBLIC_ROUTES: RegExp[] = [
  /^\/onboarding\/(signin|signup|verification|preferences|welcome)$/,
  // Pre-signup Founding Homeowners landing page (client request, 2026-09-28) -
  // same claim-page layout, minus the tracker/search, offering Create
  // account / Sign in instead.
  /^\/founding-homeowners$/,
  /^\/auth\/(google|apple)\/callback$/,
  // Linked from the sign-up form's terms line and from Settings.
  /^\/legal\/(terms|privacy|cookies)$/,
  // PWA navigateFallback target.
  /^\/offline$/,
]

// Which onboarding journey a signed-out visitor is on, captured from
// /founding-homeowners?action=... and carried through signup/verification
// via sessionStorage (same pattern as the pending-signup email in
// useSession.ts) since that's a multi-page-load gap useState can't bridge
// on its own for a fresh tab. 'claim-property' skips preferences/welcome
// straight to /claim; anything else (including no action at all, e.g. a
// direct /onboarding/signup bookmark) takes the "join-umu" fork to
// /onboarding/next-steps (client request, 2026-09-29).
export type OnboardingAction = 'claim-property' | 'join-umu'
const ONBOARDING_ACTION_KEY = 'umu-onboarding-action'

export function stashOnboardingAction(action: string | null | undefined): void {
  if (typeof sessionStorage === 'undefined') return
  if (action === 'claim-property' || action === 'join-umu') {
    sessionStorage.setItem(ONBOARDING_ACTION_KEY, action)
  }
}

// Reads and clears in one go — the action should only ever steer the one
// post-verification redirect, not linger and affect some later signup.
export function consumeOnboardingAction(): OnboardingAction {
  if (typeof sessionStorage === 'undefined') return 'join-umu'
  const stored = sessionStorage.getItem(ONBOARDING_ACTION_KEY)
  sessionStorage.removeItem(ONBOARDING_ACTION_KEY)
  return stored === 'claim-property' ? 'claim-property' : 'join-umu'
}

// Which journey this account was created through, remembered permanently
// (localStorage, not sessionStorage - unlike the action above, this must
// survive a sign-out) so a later plain sign-in lands in the right place
// too, not just the one redirect straight after verification (client
// feedback, 2026-09-30: "user does logout and login back... I thought it
// will redirect to the member page"). Same per-browser limitation as the
// interests picker's storage - it doesn't follow the account to another
// device without a backend field.
const JOURNEY_KEY = 'umu-journey'

export function markJourney(action: OnboardingAction): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(JOURNEY_KEY, action)
  } catch {
    // Best-effort — private mode / full storage just falls back to /claim.
  }
}

function getJourney(): OnboardingAction | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const stored = localStorage.getItem(JOURNEY_KEY)
    return stored === 'claim-property' || stored === 'join-umu' ? stored : null
  } catch {
    return null
  }
}

function normalise(path: string): string {
  const bare = path.split(/[?#]/)[0] ?? ''
  return bare.length > 1 ? bare.replace(/\/+$/, '') : bare
}

export function isFlowRoute(path: string): boolean {
  const clean = normalise(path)
  return [...APP_ROUTES, ...PUBLIC_ROUTES].some((re) => re.test(clean))
}

// Where to land after signing in / finishing onboarding. A stored return path
// (redirectAfterLogin, an OAuth `next`) is honoured only when it points at a
// signed-in screen of this app — anything else, including stale paths saved by
// the old app such as /dashboard, falls back to FLOW_HOME, unless this browser
// was marked as a "join-umu" journey (markJourney/getJourney above), in which
// case that fallback is MEMBER_HOME instead (client feedback, 2026-09-30).
export function resolvePostAuthPath(stored?: string | null): string {
  if (stored && stored.startsWith('/') && !stored.startsWith('//')) {
    const clean = normalise(stored)
    if (APP_ROUTES.some((re) => re.test(clean))) return stored
  }
  return getJourney() === 'join-umu' ? MEMBER_HOME : FLOW_HOME
}
