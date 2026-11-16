import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../composables/useAuth'
import { getToken, clearToken, setToken } from '../composables/useAuthToken'

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    clearToken()
  })

  it('requestOtp posts the email with no auth header required', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ message: 'sent' })
    const { requestOtp } = useAuth()
    await requestOtp('a@b.com')

    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/request-otp'),
      expect.objectContaining({ method: 'POST', body: { email: 'a@b.com' } }),
    )
  })

  it('verifyOtp sends credentials include and the integration app slug header', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ token: 'jwt-123' })
    const { verifyOtp } = useAuth()
    await verifyOtp('a@b.com', '123456')

    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/verify-otp'),
      expect.objectContaining({
        credentials: 'include',
        headers: { 'X-Umu-App': 'integration' },
        body: { email: 'a@b.com', code: '123456' },
      }),
    )
  })

  it('login tags requests with the integration app slug so the refresh cookie stays scoped to this app', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ token: 'jwt-123' })
    const { login } = useAuth()
    await login('a@b.com', 'pw')

    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ headers: { 'X-Umu-App': 'integration' } }),
    )
  })

  it('register propagates a validation error instead of swallowing it', async () => {
    ;(globalThis as any).$fetch.mockRejectedValue({ statusCode: 400, message: 'Email already in use' })
    const { register } = useAuth()

    await expect(
      register({ email: 'a@b.com', password: 'pw', firstName: 'A' }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('refreshAccessToken exchanges the httpOnly cookie and stores the new access token', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ token: 'fresh-jwt' })
    const { refreshAccessToken } = useAuth()

    const result = await refreshAccessToken()

    expect(result).toBe('fresh-jwt')
    expect(getToken()).toBe('fresh-jwt')
  })

  it('refreshAccessToken throws (does not silently succeed) when the cookie is missing/expired', async () => {
    ;(globalThis as any).$fetch.mockRejectedValue({ statusCode: 401 })
    const { refreshAccessToken } = useAuth()

    await expect(refreshAccessToken()).rejects.toMatchObject({ statusCode: 401 })
  })

  it('logout clears the local token even when the revocation call fails', async () => {
    setToken('jwt-123')
    ;(globalThis as any).$fetch.mockRejectedValue(new Error('network down'))
    const { logout } = useAuth()

    await logout()

    expect(getToken()).toBeNull()
  })
})
