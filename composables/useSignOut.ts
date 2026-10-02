import { clearSessionFlag } from '~/composables/useSessionFlag'
import { SIGNIN_PATH } from '~/utils/appFlow'

// Same sign-out as the (now hidden) profile page: tell the backend, then clear
// the token, the routing-hint cookie and account-scoped caches, whatever the
// network does.
export function useSignOut() {
  const config = useRuntimeConfig()
  const signingOut = ref(false)

  const signOut = async () => {
    if (signingOut.value) return
    signingOut.value = true
    try {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      if (token) {
        // Passing refreshToken lets the backend actually revoke it — without
        // this, a captured refresh token would still work after "signing
        // out" (security review follow-up, 2026-09-25).
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { refreshToken },
        }).catch(() => {})
      }
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('redirectAfterLogin')
      localStorage.removeItem('umu_role')
      clearSessionFlag()
      signingOut.value = false
      await navigateTo(`${SIGNIN_PATH}?reason=logout`, { replace: true })
    }
  }

  return { signOut, signingOut }
}
