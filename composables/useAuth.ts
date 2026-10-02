// Access tokens are now short-lived (1h — see backend auth.module.ts) and
// paired with a long-lived, server-revocable refresh token. Any response
// shape that includes { token, refreshToken } should be persisted via
// storeTokens() so refreshAccessToken()/logout() below can find them
// (security review follow-up, 2026-09-25).
export const storeTokens = (res: { token?: string; refreshToken?: string }) => {
  if (res.token) localStorage.setItem('token', res.token)
  if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')

    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Exchanges the stored refresh token for a new access+refresh pair and
  // persists both. Throws if there's no refresh token or the backend
  // rejects it (expired/revoked/reused) — callers should treat that as
  // "fully signed out" and clear local state / redirect to sign-in.
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token available')
    const res: any = await $fetch(`${base}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken },
    })
    storeTokens(res)
    return res.token as string
  }

  // Best-effort server-side revocation of the refresh token, then clears
  // local storage regardless of whether the network call succeeds — a user
  // clicking "sign out" should always end up signed out locally even if
  // they're offline or the backend call fails.
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      await $fetch(`${base}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
        body: { refreshToken },
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
      body: data,
    })
  }

  const login = (email: string, password: string) => {
    return $fetch(`${base}/auth/login`, {
      method: 'POST',
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


