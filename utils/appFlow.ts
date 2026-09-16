// The app is scoped down to a single journey:
//
//   sign in ─────────────────────────────────────────────────┐
//                                                            ├─> /claim ─> /claim/:id ─> Passport
//   sign up ─> verify email ─> preferences ─> welcome ───────┘
//
// plus the two profile pages reachable from the navbar's Profile menu.
// Every other page still exists in the repo but is unreachable: the global
// middleware (middleware/flow.global.ts) sends any route not listed below back
// into the journey. To bring a page back, add its pattern here.

export const FLOW_HOME = '/claim'
export const SIGNIN_PATH = '/onboarding/signin'

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
]

const PUBLIC_ROUTES: RegExp[] = [
  /^\/onboarding\/(signin|signup|verification|create-account|preferences|welcome)$/,
  /^\/auth\/(google|apple)\/callback$/,
  // Linked from the sign-up form's terms line and from Settings.
  /^\/legal\/(terms|privacy|cookies)$/,
  // PWA navigateFallback target.
  /^\/offline$/,
]

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
// the old app such as /dashboard, falls back to the claim start.
export function resolvePostAuthPath(stored?: string | null): string {
  if (!stored || !stored.startsWith('/') || stored.startsWith('//')) return FLOW_HOME
  const clean = normalise(stored)
  return APP_ROUTES.some((re) => re.test(clean)) ? stored : FLOW_HOME
}
