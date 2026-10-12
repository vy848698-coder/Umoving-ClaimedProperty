import { useAuth } from '~/composables/useAuth'
import { SIGNIN_PATH } from '~/utils/appFlow'

// Same sign-out as the (now hidden) profile page: tell the backend (via
// useAuth().logout(), which revokes the httpOnly refresh-token cookie),
// then clear account-scoped caches, whatever the network does.
export function useSignOut() {
  const { logout } = useAuth()
  const signingOut = ref(false)

  const signOut = async () => {
    if (signingOut.value) return
    signingOut.value = true
    try {
      await logout()
    } finally {
      localStorage.removeItem('redirectAfterLogin')
      localStorage.removeItem('umu_role')
      signingOut.value = false
      await navigateTo(`${SIGNIN_PATH}?reason=logout`, { replace: true })
    }
  }

  return { signOut, signingOut }
}
