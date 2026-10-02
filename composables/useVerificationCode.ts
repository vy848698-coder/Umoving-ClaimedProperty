import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth, storeTokens } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'
import { setSessionFlag } from '~/composables/useSessionFlag'
import { consumeOnboardingAction, markJourney } from '~/utils/appFlow'

export const useVerificationCode = () => {
  const { verifyOtp, requestOtp, register } = useAuth()
  const { email, setPendingSignup, resolvePendingSignup } = useSession()

  const verificationCode = ref<string>('')
  const isLoading = ref<boolean>(false)
  const resendCooldown = ref<number>(60)
  const error = ref<string>('')

  let cooldownTimer: ReturnType<typeof setInterval> | null = null

  const startCooldown = (seconds = 60) => {
    resendCooldown.value = seconds
    if (cooldownTimer) clearInterval(cooldownTimer)
    cooldownTimer = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownTimer!)
        cooldownTimer = null
      }
    }, 1000)
  }

  onMounted(() => startCooldown(60))
  onUnmounted(() => { if (cooldownTimer) clearInterval(cooldownTimer) })

  const isCodeComplete = computed<boolean>(() => verificationCode.value.length === 6)
  const canResend = computed<boolean>(() => resendCooldown.value === 0)

  const resendText = computed<string>(() => {
    if (resendCooldown.value > 0) {
      const minutes = Math.floor(resendCooldown.value / 60)
      const seconds = resendCooldown.value % 60
      return `Resend code in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return 'Resend code'
  })

  const handleNumberInput = (number: string): void => {
    if (verificationCode.value.length < 6) verificationCode.value += number
  }

  const handleBackspace = (): void => {
    verificationCode.value = verificationCode.value.slice(0, -1)
  }

  const handleCodeComplete = (code: string): void => {
    verificationCode.value = code
    verifyCode()
  }

  // useState persists across SPA navigations; sessionStorage covers page refreshes
  const resolveEmail = (): string => {
    if (email.value) return email.value
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('umu-pending-email')
      if (stored) {
        email.value = stored
        return stored
      }
    }
    return ''
  }

  const parseApiError = (err: any): string => {
    const msg = err?.data?.message ?? err?.response?._data?.message
    if (Array.isArray(msg)) return msg.join('. ')
    return msg || 'Verification failed. Please check your code and try again.'
  }

  const verifyCode = async (): Promise<void> => {
    if (!isCodeComplete.value) return

    const resolvedEmail = resolveEmail()
    if (!resolvedEmail) {
      error.value = 'Session expired. Please go back and enter your email again.'
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      await verifyOtp(resolvedEmail, verificationCode.value)

      const resolvedPendingSignup = resolvePendingSignup()
      if (resolvedPendingSignup) {
        const { firstName, lastName, phone, postcode, password } = resolvedPendingSignup
        const regRes: any = await register({
          email: resolvedEmail,
          firstName,
          ...(lastName ? { lastName } : {}),
          ...(phone ? { phone } : {}),
          ...(postcode ? { postcode } : {}),
          password,
        })
        storeTokens(regRes)
        setSessionFlag()
        sessionStorage.removeItem('umu-pending-email')
        setPendingSignup(null)

        // Which onboarding journey this signup came from - stashed by
        // /founding-homeowners's ?action= query param (client request,
        // 2026-09-29). 'claim-property' skips preferences/welcome entirely;
        // 'join-umu' (also the default, e.g. a direct /signup bookmark)
        // goes to the "what would you like to do now" fork instead.
        const onboardingAction = consumeOnboardingAction()
        // Remembered permanently (not just for this one redirect) so a
        // later plain sign-in on this browser lands in the right place too
        // (client feedback, 2026-09-30) - see resolvePostAuthPath.
        markJourney(onboardingAction)
        await navigateTo(
          onboardingAction === 'claim-property'
            ? '/claim'
            : '/onboarding/next-steps',
        )
      } else {
        // No pending signup on file (e.g. a stale/expired verification
        // session) — there's nothing left to register, so send them back
        // to start a fresh signup rather than a dead legacy page.
        await navigateTo('/onboarding/signup')
      }
    } catch (err: any) {
      error.value = parseApiError(err)
      verificationCode.value = ''
    } finally {
      isLoading.value = false
    }
  }

  const resendCode = async (): Promise<void> => {
    if (!canResend.value) return
    const resolvedEmail = resolveEmail()
    try {
      await requestOtp(resolvedEmail)
      verificationCode.value = ''
      error.value = ''
      startCooldown(60)
    } catch (err) {
      console.error('Failed to resend code:', err)
    }
  }

  const goBack = (): void => {
    window.history.back()
  }

  return {
    email,
    verificationCode,
    isLoading,
    error,
    isCodeComplete,
    canResend,
    resendText,
    handleNumberInput,
    handleBackspace,
    handleCodeComplete,
    verifyCode,
    resendCode,
    goBack,
  }
}
