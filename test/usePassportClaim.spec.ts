import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePassportClaim } from '../composables/usePassportClaim'
import { setToken, clearToken } from '../composables/useAuthToken'

describe('usePassportClaim', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    setToken('jwt-123')
  })

  it('getPassportStatus falls back to a safe "no passport" shape instead of throwing', async () => {
    ;(globalThis as any).$fetch.mockRejectedValue(new Error('500'))
    const { getPassportStatus } = usePassportClaim()

    const result = await getPassportStatus('prop-1')

    expect(result).toEqual({
      hasPassport: false,
      passportId: null,
      isOwner: false,
      isCollaborator: false,
    })
  })

  it('getPassportStatus returns the real status and sends the bearer token', async () => {
    const status = { hasPassport: true, passportId: 'pp-1', isOwner: true, isCollaborator: false }
    ;(globalThis as any).$fetch.mockResolvedValue(status)
    const { getPassportStatus } = usePassportClaim()

    const result = await getPassportStatus('prop-1')

    expect(result).toEqual(status)
    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/property/prop-1/passport-status'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt-123' }) }),
    )
  })

  it('claimPassport creates a property-linked claim with the right body shape', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ passportId: 'pp-2', status: 'PENDING_PAYMENT' })
    const { claimPassport } = usePassportClaim()

    const result = await claimPassport('prop-2', '1 Main St', 'AB1 2CD', { type: 'seller' })

    expect(result.status).toBe('PENDING_PAYMENT')
    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/passport/create'),
      expect.objectContaining({
        method: 'POST',
        body: { propertyId: 'prop-2', addressLine1: '1 Main St', postcode: 'AB1 2CD', type: 'seller' },
      }),
    )
  })

  it('createClaimPaymentIntent sends the passportId and returns the client secret', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ clientSecret: 'cs_1', paymentId: 'pay_1', amount: 4900 })
    const { createClaimPaymentIntent } = usePassportClaim()

    const result = await createClaimPaymentIntent('pp-2')

    expect(result.clientSecret).toBe('cs_1')
    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payment/create-claim-intent'),
      expect.objectContaining({ body: { passportId: 'pp-2' } }),
    )
  })

  it('setPassportType posts the chosen type after HMLR verification', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ passportId: 'pp-2', status: 'IN_PROGRESS' })
    const { setPassportType } = usePassportClaim()

    await setPassportType('pp-2', 'landlord', true)

    expect((globalThis as any).$fetch).toHaveBeenCalledWith(
      expect.stringContaining('/passport/pp-2/set-type'),
      expect.objectContaining({ body: { type: 'landlord', isHmo: true } }),
    )
  })

  it('activatePassport and unlockPassport hit their own distinct endpoints', async () => {
    ;(globalThis as any).$fetch.mockResolvedValue({ passportId: 'pp-2' })
    const { activatePassport, unlockPassport } = usePassportClaim()

    await activatePassport('pp-2')
    await unlockPassport('pp-2')

    const calls = (globalThis as any).$fetch.mock.calls.map((c: any[]) => c[0])
    expect(calls.some((c: string) => c.includes('/passport/pp-2/activate'))).toBe(true)
    expect(calls.some((c: string) => c.includes('/passport/pp-2/buyer-unlock'))).toBe(true)
  })
})
