// Silently keeps the access token alive while the app is open. Access
// tokens are now short-lived (1h — see backend auth.module.ts), paired with
// a long-lived, revocable refresh token (security review follow-up,
// 2026-09-25). Without this, a user mid-session would start getting 401s
// an hour in with no visible cause. This plugin does two things:
//   1. On boot, if a refresh token exists, proactively swap it for a fresh
//      access token — covers the case where the app was closed for a while
//      and the stored access token has already expired.
//   2. While the app stays open, refreshes again every 45 minutes (comfortably
//      inside the 1h access-token lifetime) so an active session never hits
//      the expiry cliff.
// Deliberately best-effort: if refresh fails (token expired/revoked/reused),
// we clear local tokens and let the existing per-request 401 handling in
// each page/composable send the user back to sign-in as it already does —
// this plugin doesn't introduce new error-handling paths, just delays the
// need for them.
import { useAuth, clearTokens } from '~/composables/useAuth'

const REFRESH_INTERVAL_MS = 45 * 60 * 1000

export default defineNuxtPlugin(() => {
  let refreshToken: string | null = null
  try {
    refreshToken = localStorage.getItem('refreshToken')
  } catch {
    // Private mode / blocked site data — nothing to keep alive.
    return
  }
  if (!refreshToken) return

  const { refreshAccessToken } = useAuth()

  const tryRefresh = async () => {
    try {
      await refreshAccessToken()
    } catch {
      // Refresh token is dead (expired/revoked/reused) — clear local state
      // so the next authenticated request's existing 401 handling takes
      // over cleanly instead of retrying a token we know is invalid.
      clearTokens()
    }
  }

  tryRefresh()
  setInterval(tryRefresh, REFRESH_INTERVAL_MS)
})
