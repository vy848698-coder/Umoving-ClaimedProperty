import { FLOW_HOME } from '~/utils/appFlow'

// Redirect already-signed-in users away from the sign-in / sign-up pages to
// the claim flow.
//
// TWO checks, in order:
//
// 1. `umu_has_session` — a small, non-secret flag cookie (see
//    composables/useSessionFlag.ts), set alongside the real JWT at every
//    login/signup and cleared at logout. Unlike localStorage, a cookie rides
//    along with the initial request, so useCookie() can read it during SSR —
//    meaning a signed-in visitor gets a real HTTP redirect before any auth
//    page HTML is sent, with no flash. The cookie grants no privilege on its
//    own: if it is stale, middleware/auth.ts on /claim clears it and sends
//    the browser back to sign-in.
//
// 2. The client-only localStorage check, kept as the fallback for a user who
//    has a valid token but no cookie yet (plugins/session-flag-sync.client.ts
//    backfills it on their next app load either way).
//
//    `external: true` (a full page navigation) is deliberate on this path:
//    an in-app hop can swap in the destination component before its scoped
//    CSS chunk has loaded, giving an unstyled first paint.
export default defineNuxtRouteMiddleware(() => {
  const sessionFlag = useCookie('umu_has_session')
  if (sessionFlag.value) {
    return navigateTo(FLOW_HOME, { replace: true })
  }

  if (import.meta.server) return

  let token: string | null = null
  try {
    token = localStorage.getItem('token')
  } catch {
    return
  }
  if (!token) return

  return navigateTo(FLOW_HOME, { replace: true, external: true })
})
