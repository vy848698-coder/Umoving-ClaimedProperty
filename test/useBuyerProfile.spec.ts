import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBuyerProfile } from '../composables/useBuyerProfile'
import { setToken } from '../composables/useAuthToken'

describe('useBuyerProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setToken('jwt-123')
  })

  it('getBuyerProfile returns null instead of throwing when the user has none yet', async () => {
    ;(globalThis as any).$fetch.mockRejectedValue({ statusCode: 404 })
    const { getBuyerProfile } = useBuyerProfile()

    expect(await getBuyerProfile()).toBeNull()
  })

  it('signProfile posts the signature payload and returns the updated profile', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ id: 'bp-1', signedName: 'A Buyer' })
    const { signProfile } = useBuyerProfile()

    const result = await signProfile({ signedName: 'A Buyer' })

    expect(result.signedName).toBe('A Buyer')
    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/buyer-profile/sign'),
      expect.objectContaining({ method: 'POST', body: { signedName: 'A Buyer' } }),
    )
  })

  it('clearSignature hits the dedicated clear endpoint, not a generic update', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ id: 'bp-1', signedName: null })
    const { clearSignature } = useBuyerProfile()

    await clearSignature()

    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/buyer-profile/sign/clear'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('createShare sends the recipient/scope/expiry payload', async () => {
    const share = { id: 'sh-1', token: 'tok', expiresAt: '2026-12-01' }
    ;(globalThis as any).$fetch.mockResolvedValue(share)
    const { createShare } = useBuyerProfile()

    const result = await createShare({ recipientEmail: 'agent@example.com', expiresInDays: 7 })

    expect(result).toEqual(share)
    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/buyer-profile/shares'),
      expect.objectContaining({ method: 'POST', body: { recipientEmail: 'agent@example.com', expiresInDays: 7 } }),
    )
  })

  it('listShares returns an empty array (not an error) if the call fails', async () => {
    ;(globalThis as any).$fetch.mockRejectedValue(new Error('network'))
    const { listShares } = useBuyerProfile()

    expect(await listShares()).toEqual([])
  })

  it('revokeShare calls the revoke sub-route for the specific share id', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ id: 'sh-1', revokedAt: '2026-11-16' })
    const { revokeShare } = useBuyerProfile()

    await revokeShare('sh-1')

    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/buyer-profile/shares/sh-1/revoke'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('getPublicShare reads by token with no auth header (public route)', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ tier: 'VERIFIED' })
    const { getPublicShare } = useBuyerProfile()

    await getPublicShare('public-tok')

    const [url, opts] = (globalThis as any).$fetch.mock.calls[0]
    expect(url).toContain('/buyer-profile/public/public-tok')
    expect(opts).toBeUndefined()
  })
})
