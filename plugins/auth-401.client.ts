// Global, best-effort 401 handler (security review 2026-10-19). Every
// composable builds its own Authorization header and calls the global
// $fetch directly — there was no single place that reacted to an expired/
// invalid token, just a handful of ad-hoc per-page checks. This doesn't
// change request behaviour or introduce a new auth model: it only adds a
// response interceptor to the one shared $fetch instance every composable
// already uses, so any 401 from the backend (not just the ones a specific
// page happened to check for) clears the stale token and sends the user
// back to sign-in instead of leaving a half-broken page on screen.
//
// Deliberately narrow: only acts on 401 (unauthenticated — the token
// itself is bad), never on 403 (authenticated but not permitted), which
// a page may legitimately want to handle differently (e.g. "you don't
// have access to this property" vs "please sign in again"). Skips the
// auth endpoints themselves so a failed login/OTP attempt doesn't bounce
// the user through a redirect loop.
import { clearSessionFlag } from '~/composables/useSessionFlag'

const SKIP_PATHS = ['/auth/login', '/auth/request-otp', '/auth/verify-otp', '/auth/register', '/auth/refresh']

export default defineNuxtPlugin(() => {
  const original = globalThis.$fetch
  if (!original || typeof (original as any).create !== 'function') return

  globalThis.$fetch = original.create({
    onResponseError({ request, options, response }) {
      if (response?.status !== 401) return
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? ''
      if (SKIP_PATHS.some((p) => url.includes(p))) return

      // Only react to requests that went out signed in. This checks the
      // request's own header rather than localStorage: on an expired session
      // auth-refresh.client.ts clears the dead token at boot, usually before
      // the page's first request comes back 401, so "no token left" doesn't
      // mean "already handled".
      if (!new Headers(options?.headers as HeadersInit).has('authorization')) return

      try {
        localStorage.removeItem('token')
      } catch {
        // Storage blocked - still clear the cookie and redirect below.
      }
      // The SSR routing-hint cookie has to go with the token, or guest.ts on
      // sign-in still sees it and bounces us to /claim, where auth.ts finally
      // clears it and does a full reload back to sign-in.
      clearSessionFlag()
      const route = useRoute()
      if (route.path.startsWith('/onboarding/signin')) return
      navigateTo('/onboarding/signin?reason=session', { replace: true })
    },
  })
})
