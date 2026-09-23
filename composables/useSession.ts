export interface PendingSignup {
  firstName: string
  lastName: string
  phone: string
  postcode: string
  password: string
}

const PENDING_SIGNUP_KEY = 'umu-pending-signup'

export const useSession = () => {
  const email = useState<string>('umu-email', () => '')
  const pendingSignup = useState<PendingSignup | null>(
    'umu-pending-signup',
    () => null,
  )

  // useState is in-memory only — it doesn't survive a hard reload/remount
  // the way sessionStorage-backed `email` does (see resolveEmail() in
  // useVerificationCode.ts). Mirroring writes here means any caller that
  // sets pendingSignup automatically gets the same persistence email
  // already has, instead of each page having to remember to do it.
  const setPendingSignup = (value: PendingSignup | null) => {
    pendingSignup.value = value
    if (typeof sessionStorage === 'undefined') return
    if (value) {
      sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(value))
    } else {
      sessionStorage.removeItem(PENDING_SIGNUP_KEY)
    }
  }

  const resolvePendingSignup = (): PendingSignup | null => {
    if (pendingSignup.value) return pendingSignup.value
    if (typeof sessionStorage === 'undefined') return null
    const stored = sessionStorage.getItem(PENDING_SIGNUP_KEY)
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored) as PendingSignup
      pendingSignup.value = parsed
      return parsed
    } catch {
      return null
    }
  }

  return { email, pendingSignup, setPendingSignup, resolvePendingSignup }
}
