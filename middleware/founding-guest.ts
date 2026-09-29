import { MEMBER_HOME } from '~/utils/appFlow'

// Same "already signed in? get out of here" check as middleware/guest.ts
// (used on signin/signup), but for /founding-homeowners specifically: a
// signed-in visitor arriving here again from the marketing site's "Claim my
// property" / "Join UMU" links (client request, 2026-09-29) lands on their
// account hub (MEMBER_HOME) instead of straight into the claim flow, so they
// can choose what to do next rather than being dropped into a form.
export default defineNuxtRouteMiddleware(() => {
  const sessionFlag = useCookie('umu_has_session')
  if (sessionFlag.value) {
    return navigateTo(MEMBER_HOME, { replace: true })
  }

  if (import.meta.server) return

  let token: string | null = null
  try {
    token = localStorage.getItem('token')
  } catch {
    return
  }
  if (!token) return

  return navigateTo(MEMBER_HOME, { replace: true, external: true })
})
