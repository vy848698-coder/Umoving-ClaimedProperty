// Access tokens are short-lived (1h — see backend auth.module.ts). The
// refresh token used to travel alongside it in this same response and get
// written to localStorage too - it's now set directly by the backend as an
// httpOnly cookie (auth hardening, 12 Oct 2026, see backend
// src/auth/refresh-cookie.ts) and never appears in a JSON response or in
// JS-readable storage at all, so storeTokens only ever has `token` to save.
export const storeTokens = (res: { token?: string }) => {
  if (res.token) localStorage.setItem('token', res.token)
}

export const clearTokens = () => {
  localStorage.removeItem('token')
  // Stale key from before the refresh token moved to an httpOnly cookie -
  // harmless to remove defensively, nothing should still be writing it.
  localStorage.removeItem('refreshToken')
}

// Identifies this app to the backend so the refresh-token cookie it sets
// is scoped to THIS app's own /auth/refresh/integration path, keeping this
// app's session independent of umu-mobile-webapp/umu-website-new even
// though all three currently share one backend.
const APP_SLUG = 'integration'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')

    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Exchanges the httpOnly refresh-token cookie (set at login/verify-otp/
  // register below) for a fresh access token - the cookie rides along
  // automatically via credentials: 'include', never touched by this JS.
  // Throws if there's no valid cookie or the backend rejects it (expired/
  // revoked/reused) — callers should treat that as "fully signed out" and
  // clear local state / redirect to sign-in.
  const refreshAccessToken = async () => {
    const res: any = await $fetch(`${base}/auth/refresh/${APP_SLUG}`, {
      method: 'POST',
      credentials: 'include',
    })
    storeTokens(res)
    return res.token as string
  }

  // Best-effort server-side revocation (reads the refresh-token cookie, no
  // body needed), then clears local storage regardless of whether the
  // network call succeeds — a user clicking "sign out" should always end
  // up signed out locally even if they're offline or the backend call fails.
  const logout = async () => {
    try {
      await $fetch(`${base}/auth/logout/${APP_SLUG}`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
      })
    } catch {
      // Ignore — we still clear local tokens below.
    } finally {
      clearTokens()
    }
  }

  const requestOtp = (email: string) => {
    return $fetch(`${base}/auth/request-otp`, {
      method: 'POST',
      body: { email },
    })
  }

  const verifyOtp = (email: string, code: string) => {
    return $fetch(`${base}/auth/verify-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Umu-App': APP_SLUG },
      body: { email, code },
    })
  }

  const register = (data: {
    email: string
    password: string
    firstName: string
    lastName?: string
    phone?: string
    dob?: string
    postcode?: string
    gender?: string
  }) => {
    return $fetch(`${base}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Umu-App': APP_SLUG },
      body: data,
    })
  }

  const login = (email: string, password: string) => {
    return $fetch(`${base}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Umu-App': APP_SLUG },
      body: { email, password },
    })
  }

  // Google/Apple OAuth were removed from the backend entirely (no
  // /auth/google, /auth/apple, or /auth/apple/mock routes exist) — OTP +
  // email/password are the only supported auth methods. The functions that
  // used to live here, plus their two server-route/page counterparts under
  // server/routes/auth/** and pages/auth/**, were dead code that round-
  // tripped a real backend JWT through a URL query string on redirect,
  // which is a token-leak vector (browser history / server logs) — removed
  // rather than left as a landmine for if OAuth is ever reintroduced
  // (security review follow-up, 2026-09-25).

  return {
    requestOtp,
    verifyOtp,
    register,
    login,
    logout,
    refreshAccessToken,
  }
}


