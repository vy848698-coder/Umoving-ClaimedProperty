import { FLOW_HOME, SIGNIN_PATH, isFlowRoute } from '~/utils/appFlow'

// Hides every page outside the sign-in / sign-up / claim journey (see
// utils/appFlow.ts). Global middleware runs before page middleware, so a
// hidden route is redirected here before auth.ts or guest.ts ever see it —
// which also means auth.ts can only ever stash a claim-flow path as
// redirectAfterLogin.
//
// Signed-in visitors go to the claim start, everyone else to sign-in. On the
// server only the umu_has_session routing-hint cookie is visible; if it turns
// out to be stale, auth.ts on /claim clears it and sends the browser to
// sign-in, so there is no redirect loop.
export default defineNuxtRouteMiddleware((to) => {
  if (isFlowRoute(to.path)) return

  let signedIn = false
  if (import.meta.server) {
    signedIn = !!useCookie('umu_has_session').value
  } else {
    try {
      signedIn = !!localStorage.getItem('token')
    } catch {
      signedIn = false
    }
  }

  return navigateTo(signedIn ? FLOW_HOME : SIGNIN_PATH, { replace: true })
})
