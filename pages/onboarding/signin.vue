<template>
  <div class="signin-split">
    <!-- ── Left brand panel (light) ── -->
    <aside class="signin-aside">
      <div class="signin-aside-top">
        <div class="signin-logo">
          <span class="signin-logo-mark"><img src="/op-icons/logo.png" alt="umu" /></span>
          <strong>umovingu</strong>
        </div>
        <p class="signin-tagline">You own the home. Own its story.</p>
      </div>

      <div class="signin-aside-body">
        <h1 class="signin-welcome">{{ heroTitle }}</h1>
        <p class="signin-welcome-sub">Good to see you again. Your Property Passport is right where you left it.</p>

        <img src="/op-icons/passport-covers/seller_tilted_right_on_tile.png" alt="Property Passport" class="signin-passport-illus" />
      </div>

      <p class="signin-aside-foot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        End-to-end encrypted. Your data stays yours.
      </p>
    </aside>

    <!-- ── Right form panel (light) ── -->
    <main class="signin-main">
      <div class="signin-main-inner">

    <!-- ── Sign-in / forgot-password (entry) / verify code / new password ── -->
    <template v-if="resetStep !== 'sent' && resetStep !== 'success'">
      <div class="signin-shell">
        <section class="signin-panel-wrap">
          <!-- Logout / session toast -->
          <div
            v-if="bannerMessage && resetStep === 'idle'"
            class="logged-out-toast"
            :class="bannerReason === 'logout' ? 'logged-out-toast--teal' : 'logged-out-toast--yellow'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ bannerMessage }}
          </div>

          <div class="signin-form-head">
            <h2 class="signin-form-title">{{ formTitle }}</h2>
            <p class="signin-form-sub">{{ formSub }}</p>
          </div>

          <form class="auth-form signin-panel" @submit.prevent="onPrimary">

            <!-- ── Sign in ── -->
            <template v-if="resetStep === 'idle'">
              <div class="form-field">
                <label class="form-label">Email address</label>
                <div class="form-input-wrap">
                  <span class="form-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input v-model="emailInput" type="email" placeholder="you@example.com" class="form-input with-icon" autocomplete="email" />
                </div>
              </div>

              <div class="form-field">
                <label class="form-label">Password</label>
                <div class="form-input-wrap">
                  <span class="form-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    v-model="passwordInput"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Your password"
                    class="form-input with-icon with-action"
                    autocomplete="current-password"
                  />
                  <button type="button" class="form-input-action" @click="showPassword = !showPassword">
                    <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="loginError" class="error-banner">{{ loginError }}</div>

              <button type="submit" class="btn-primary btn-primary--futuristic" :disabled="loginLoading">
                <span v-if="loginLoading" class="spinner" />
                {{ loginLoading ? 'Signing in…' : 'Sign in' }}
              </button>

              <button type="button" class="btn-text" @click="startForgotPassword">Forgot password?</button>
            </template>

            <!-- ── Forgot password: enter email ── -->
            <template v-else-if="resetStep === 'email'">
              <div class="form-field">
                <label class="form-label">Email address</label>
                <div class="form-input-wrap">
                  <span class="form-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input v-model="resetEmail" type="email" placeholder="you@example.com" class="form-input with-icon" autocomplete="email" />
                </div>
              </div>

              <div v-if="resetError" class="error-banner">{{ resetError }}</div>

              <button type="submit" class="btn-primary btn-primary--futuristic" :disabled="resetLoading">
                <span v-if="resetLoading" class="spinner" />
                {{ resetLoading ? 'Sending…' : 'Send reset code' }}
              </button>

              <button type="button" class="btn-text" @click="resetStep = 'idle'">Back to sign in</button>
            </template>

            <!-- ── Forgot password: verify code ── -->
            <template v-else-if="resetStep === 'otp'">
              <p class="reset-helper-text">
                We sent a 6-digit code to<br>
                <strong>{{ resetEmail }}</strong>
              </p>

              <div class="otp-boxes">
                <input
                  v-for="(_, i) in otpDigits"
                  :key="i"
                  :ref="el => { if (el) otpRefs[i] = el as HTMLInputElement }"
                  v-model="otpDigits[i]"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="otp-box"
                  @input="onOtpInput(i)"
                  @keydown.backspace="onOtpBackspace(i)"
                  @paste.prevent="onOtpPaste($event)"
                />
              </div>

              <div v-if="resetError" class="error-banner">{{ resetError }}</div>

              <button type="submit" class="btn-primary btn-primary--futuristic" :disabled="resetLoading || otpValue.length < 6">
                <span v-if="resetLoading" class="spinner" />
                {{ resetLoading ? 'Verifying…' : 'Verify code' }}
              </button>

              <button v-if="resendCountdown > 0" type="button" class="btn-text" disabled>
                Resend code in {{ resendCountdown }}s
              </button>
              <button v-else type="button" class="btn-text" @click="handleForgotPassword">Resend code</button>
            </template>

            <!-- ── Forgot password: new password ── -->
            <template v-else-if="resetStep === 'newPassword'">
              <div class="form-field">
                <label class="form-label">New password</label>
                <div class="form-input-wrap">
                  <span class="form-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    v-model="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="New password"
                    class="form-input with-icon with-action"
                  />
                  <button type="button" class="form-input-action" @click="showNewPassword = !showNewPassword">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-field">
                <label class="form-label">Confirm new password</label>
                <div class="form-input-wrap">
                  <span class="form-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirm new password"
                    class="form-input with-icon with-action"
                  />
                  <button type="button" class="form-input-action" @click="showConfirmPassword = !showConfirmPassword">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="newPassword" class="password-strength">
                <div class="strength-bars">
                  <div v-for="n in 4" :key="n" class="strength-bar" :style="{ background: n <= passwordStrength ? strengthBg : '#eef0f6' }" />
                </div>
                <p :style="{ color: strengthColor }">{{ strengthLabel }}</p>
              </div>

              <div v-if="resetError" class="error-banner">{{ resetError }}</div>

              <button type="submit" class="btn-primary btn-primary--futuristic" :disabled="resetLoading || !passwordsMatch">
                <span v-if="resetLoading" class="spinner" />
                {{ resetLoading ? 'Updating…' : 'Update password' }}
              </button>
            </template>
          </form>

          <div v-if="resetStep === 'idle'" class="signin-divider"><span>new to UMU?</span></div>

          <div v-if="resetStep === 'idle'" class="auth-footer signin-footer">
            New to Umovingu? <NuxtLink to="/onboarding/signup">Create an account.</NuxtLink>
          </div>
        </section>
      </div>
    </template>

    <!-- ── Reset code sent — confirmation panel (prototype "forgot-sent") ── -->
    <template v-else-if="resetStep === 'sent'">
      <div class="confirm-state confirm-state--futuristic">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div class="confirm-h">Check your email</div>
        <div class="confirm-sub">
          We've sent a password reset code to<br><strong>{{ resetEmail }}</strong>.<br><br>
          It should arrive in a minute or two. Check your spam folder if you can't see it.
        </div>
        <button class="btn-primary" @click="resetStep = 'otp'">Enter the code</button>
        <button type="button" class="btn-text" @click="handleForgotPassword">Didn't get it? Resend</button>
      </div>
    </template>

    <!-- ── Reset success ── -->
    <template v-else-if="resetStep === 'success'">
      <div class="confirm-state confirm-state--futuristic">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div class="confirm-h">Password updated!</div>
        <div class="confirm-sub">
          Your password has been changed successfully.<br>
          You can now sign in with your new password.
        </div>
        <button class="btn-primary" @click="resetStep = 'idle'">Back to sign in</button>
      </div>
    </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { setSessionFlag } from '~/composables/useSessionFlag'
import { resolvePostAuthPath } from '~/utils/appFlow'

definePageMeta({
  title: 'Sign In | UmovingU',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const { login } = useAuth()
const route = useRoute()

// ── Hero copy depending on step
type ResetStep = 'idle' | 'email' | 'sent' | 'otp' | 'newPassword' | 'success'
const resetStep = ref<ResetStep>('idle')

const heroTitle = computed(() => {
  if (resetStep.value === 'idle') return 'Welcome back.'
  if (resetStep.value === 'email') return 'No worries.'
  if (resetStep.value === 'otp') return 'Check your email.'
  if (resetStep.value === 'newPassword') return 'Choose a strong one.'
  return ''
})

// Heading shown above the form (right panel)
const formTitle = computed(() => {
  if (resetStep.value === 'idle') return 'Sign in'
  if (resetStep.value === 'email') return 'Reset your password'
  if (resetStep.value === 'otp') return 'Verify the code'
  if (resetStep.value === 'newPassword') return 'Set a new password'
  return ''
})
const formSub = computed(() => {
  if (resetStep.value === 'idle') return 'Pick up where you left off.'
  if (resetStep.value === 'email') return "Enter your email and we'll send you a code to set a new password."
  if (resetStep.value === 'otp') return 'Enter the 6-digit code we just sent you.'
  if (resetStep.value === 'newPassword') return 'At least 8 characters. Mix in a number for extra strength.'
  return ''
})

// Banner from query
const bannerReason = computed(() => route.query.reason as string | undefined)
const bannerMessage = computed(() => {
  if (bannerReason.value === 'logout') return "You've been signed out."
  if (bannerReason.value === 'session') return 'Your session has expired. Please sign in again.'
  return ''
})

// Sign in
const emailInput = ref('')
const passwordInput = ref('')
const showPassword = ref(false)
const loginError = ref('')
const loginLoading = ref(false)

const redirectAfterAuth = async () => {
  // Existing users go straight to claiming a property (or back to the claim
  // step they were bounced from).
  const redirectPath = resolvePostAuthPath(localStorage.getItem('redirectAfterLogin'))
  localStorage.removeItem('redirectAfterLogin')
  // replace: true — sign-in is a detour, not a page the user should ever land
  // back on by pressing back.
  await navigateTo(redirectPath, { replace: true })
}

const handleLogin = async () => {
  loginError.value = ''
  loginLoading.value = true
  try {
    const response: any = await login(emailInput.value, passwordInput.value)
    localStorage.setItem('token', response.token)
    setSessionFlag()
    await redirectAfterAuth()
  } catch {
    loginError.value = 'Incorrect email or password. Please try again.'
  } finally {
    loginLoading.value = false
  }
}

// Forgot password
const resetEmail = ref('')
const resetToken = ref('')
const resetError = ref('')
const resetLoading = ref(false)

const startForgotPassword = () => {
  resetEmail.value = emailInput.value
  resetError.value = ''
  resetStep.value = 'email'
}

// OTP
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const otpValue = computed(() => otpDigits.value.join(''))

const onOtpInput = (index: number) => {
  const val = otpDigits.value[index]
  if (val && index < 5) otpRefs.value[index + 1]?.focus()
}
const onOtpBackspace = (index: number) => {
  if (!otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    otpRefs.value[index - 1]?.focus()
  }
}
const onOtpPaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? ''
  text.split('').forEach((ch, i) => { otpDigits.value[i] = ch })
  otpRefs.value[Math.min(text.length, 5)]?.focus()
}

const resendCountdown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null
const startResendCountdown = () => {
  resendCountdown.value = 60
  resendTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

const handleForgotPassword = async () => {
  if (!resetEmail.value) return
  resetError.value = ''
  resetLoading.value = true
  try {
    await $fetch(`${config.public.apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: { email: resetEmail.value },
    })
    otpDigits.value = ['', '', '', '', '', '']
    resetStep.value = 'sent'
    startResendCountdown()
  } catch {
    resetError.value = 'Something went wrong. Please try again.'
  } finally {
    resetLoading.value = false
  }
}

const handleVerifyResetOtp = async () => {
  if (otpValue.value.length < 6) return
  resetError.value = ''
  resetLoading.value = true
  try {
    const res: any = await $fetch(`${config.public.apiBase}/auth/verify-reset-otp`, {
      method: 'POST',
      body: { email: resetEmail.value, code: otpValue.value },
    })
    resetToken.value = res.resetToken
    newPassword.value = ''
    confirmPassword.value = ''
    resetStep.value = 'newPassword'
  } catch {
    resetError.value = 'Invalid or expired code. Please try again.'
  } finally {
    resetLoading.value = false
  }
}

// New password
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordsMatch = computed(() => newPassword.value.length >= 8 && newPassword.value === confirmPassword.value)

const passwordStrength = computed(() => {
  const p = newPassword.value
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
const strengthBg = computed(() => {
  if (passwordStrength.value <= 1) return '#ef4444'
  if (passwordStrength.value === 2) return '#f59e0b'
  if (passwordStrength.value === 3) return '#3b82f6'
  return '#00a19a'
})
const strengthColor = strengthBg
const strengthLabel = computed(() => {
  if (passwordStrength.value <= 1) return 'Weak'
  if (passwordStrength.value === 2) return 'Fair'
  if (passwordStrength.value === 3) return 'Good'
  return 'Strong'
})

const handleResetPassword = async () => {
  if (!passwordsMatch.value) {
    resetError.value = 'Passwords do not match.'
    return
  }
  resetError.value = ''
  resetLoading.value = true
  try {
    await $fetch(`${config.public.apiBase}/auth/reset-password`, {
      method: 'POST',
      body: { resetToken: resetToken.value, newPassword: newPassword.value },
    })
    resetStep.value = 'success'
  } catch {
    resetError.value = 'Failed to update password. The reset link may have expired.'
  } finally {
    resetLoading.value = false
  }
}

// Single submit handler — dispatches based on step
const onPrimary = () => {
  if (resetStep.value === 'idle') return handleLogin()
  if (resetStep.value === 'email') return handleForgotPassword()
  if (resetStep.value === 'otp') return handleVerifyResetOtp()
  if (resetStep.value === 'newPassword') return handleResetPassword()
}
</script>

<style scoped>
/* ── Split-screen layout ── */
.signin-split {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Plus Jakarta Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #231d45;
}

/* ── Left brand panel (light) ── */
.signin-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  color: #231d45;
  background:
    /* A soft light where the home card sits, over a faint vertical wash and
       the teal corner glow - matches the sign-up panel. */
    radial-gradient(620px 460px at 22% 44%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 66%),
    radial-gradient(circle at 90% 95%, rgba(0, 161, 154, 0.08) 0%, rgba(0, 161, 154, 0) 42%),
    linear-gradient(170deg, #f7f7f4 0%, #fbfbf9 42%, #f8faf9 100%);
  overflow: hidden;
  min-width: 0;
}
/* Hairline between the two panels - without it the cream and the form grey
   meet with nothing to separate them. */
.signin-aside::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  width: 1px;
  background: linear-gradient(180deg, rgba(35, 29, 69, 0) 0%, rgba(35, 29, 69, 0.08) 22%, rgba(35, 29, 69, 0.08) 78%, rgba(35, 29, 69, 0) 100%);
}

.signin-aside-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

/* Same lockup as sign-up and verification: the mark plus the wordmark. */
.signin-logo {
  display: inline-flex;
  align-items: center;
  gap: 13px;
}
.signin-logo-mark { display: grid; place-items: center; flex-shrink: 0; }
.signin-logo-mark img { width: 42px; height: 42px; display: block; }
.signin-logo strong {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #231d45;
}
.signin-tagline {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #8d89a0;
  text-align: right;
  white-space: nowrap;
}

.signin-aside-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  text-align: center;
  /* Centred between the logo row and the footnote. From 1200px it becomes a
     two-column grid (copy + passport); see the min-width: 1200px block. */
}

.signin-welcome {
  margin: 0;
  font-size: clamp(46px, 4.7vw, 62px);
  font-weight: 800;
  line-height: 0.97;
  letter-spacing: -0.035em;
  color: #231d45;
}
.signin-welcome-sub {
  margin: 15px auto 0;
  font-size: 18px;
  line-height: 1.52;
  color: #635f7b;
  max-width: 32ch;
}

/* Real 3D render, already tilted right with its own tile/shadow baked in -
   no CSS transform needed. */
.signin-passport-illus {
  width: 100%;
  max-width: 260px;
  height: auto;
  display: block;
  margin: 32px auto 0;
  object-fit: contain;
}

/* Side by side: one centred column across the whole brand panel - the
   heading on one line, the subline under it, the passport centred below.
   The render is ~1:1.22 portrait, so at a fixed size it made the column
   taller than a laptop window and shoved the heading up against the logo.
   Its width is what the window height leaves after the logo row, heading,
   subline, footnote and breathing room (~340px plus the panel padding), capped at 300px. Inside
   the zoomed body every length is multiplied by --desk-zoom, so vh is
   divided back out. */
@media (min-width: 881px) {
  .signin-aside-body {
    align-items: center;
    text-align: center;
    max-width: none;
    /* 32px more above than below: the group sits a little under the
       middle, clear of the logo row. The form gets the same 32px (below). */
    padding: calc(clamp(8px, 3vh, 32px) + 32px) 0 clamp(8px, 3vh, 32px);
  }
  /* The heading leads - clearly bigger than the subline under it. */
  .signin-welcome { font-size: clamp(48px, 5.3vw, 74px); }
  .signin-welcome-sub { margin: 12px auto 0; max-width: 36ch; font-size: 16px; line-height: 1.5; }
  .signin-passport-illus {
    max-width: none;
    width: clamp(120px, calc(((100vh - 80px) / var(--desk-zoom, 1) - 376px) / 1.22), 300px);
    margin: clamp(14px, 3.5vh, 32px) auto 0;
  }
}

/* Side by side, the brand column centres its hero between the logo row
   (~66px) and the footnote (~46px), which puts that centre ~10px below the
   panel's middle. The form centred in the plain panel therefore sat ~10px
   high next to it (more on big screens, where both are zoomed). The extra
   top padding (20px for that, plus the 32px the hero is lowered by) -
   zoomed like the rows it mirrors - puts the two
   centres on one line. */
@media (min-width: 881px) {
  .signin-split .signin-main {
    padding-top: calc(48px + 52px * var(--desk-zoom, 1));
    padding-bottom: 48px;
  }
}
/* Short laptop windows: the form (~505px) plus 48px above and below ran just
   past a ~600px browser window and the page scrolled by a few pixels. */
@media (min-width: 881px) and (max-height: 700px) {
  .signin-split .signin-main {
    /* 32px for the shorter footnote row here, plus the 24px the hero is
       lowered by (see below). */
    padding-top: calc(28px + 56px * var(--desk-zoom, 1));
    padding-bottom: 28px;
  }
  /* The brand column tightens too, so on a laptop-height window the
     passport keeps a good size instead of shrinking to a thumbnail. */
  .signin-split .signin-aside { padding-block: 24px; }
  .signin-split .signin-aside-body { padding: 24px 0 0; }
  .signin-split .signin-welcome { font-size: clamp(48px, 4.6vw, 60px); }
  .signin-split .signin-welcome-sub { margin-top: 8px; font-size: 15px; }
  .signin-split .signin-aside-foot { margin-top: 16px; }
  .signin-split .signin-passport-illus {
    width: clamp(120px, calc((100vh / var(--desk-zoom, 1) - 330px) / 1.22), 300px);
    margin-top: 12px;
  }
}
/* Very short windows (a browser that isn't maximised, or with a bookmarks
   bar and devtools open): the form itself is taller than the window, so the
   page scrolled and cut its heading off. Its vertical rhythm tightens so it
   still fits in one screen - nothing is hidden, only the gaps shrink. */
@media (min-width: 881px) and (max-height: 620px) {
  .signin-split .signin-main {
    padding-top: calc(14px + 56px * var(--desk-zoom, 1));
    padding-bottom: 14px;
  }
  .signin-split .signin-form-head { margin-bottom: 14px; }
  .signin-split .signin-form-title { font-size: 25px; }
  .signin-split .signin-form-sub { margin-top: 4px; }
  .signin-split .signin-panel-wrap .form-field { margin-bottom: 12px; }
  .signin-split .signin-panel-wrap .form-label { margin-bottom: 6px; }
  .signin-split .signin-panel-wrap .form-input { padding-block: 11px; }
  .signin-split .signin-panel .btn-primary--futuristic { padding-block: 13px; }
  .signin-split .signin-panel .btn-text { padding-block: 6px; margin-top: 4px; }
  .signin-split .signin-divider { margin: 12px 0 2px; }
  .signin-split .logged-out-toast { margin-bottom: 14px; }
}

.signin-aside-foot {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 28px 0 0;
  font-size: 12.5px;
  font-weight: 600;
  color: #9490a3;
}
.signin-aside-foot svg { width: 14px; height: 14px; flex-shrink: 0; }

/* ── Right form panel ── */
.signin-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: #f3f2ef;
  /* Grid items default to min-width:auto, so a wide child (the 6-box OTP row)
     stretched this track past the viewport. The app shell clips overflow-x, so
     that showed up as cut-off content rather than a scrollbar. */
  min-width: 0;
}
.signin-main-inner {
  width: 100%;
  max-width: 420px;
  /* As a flex item this defaults to min-width:auto, so any wide child (the
     6-box OTP row) would push the column past the screen instead of letting
     the child shrink. */
  min-width: 0;
}

.signin-shell { width: 100%; }
.signin-panel-wrap { width: 100%; }

/* Reuse the plain panel/form look — strip the card chrome. Needs to outrank
   the later `.auth-form` rule, whose 24px side padding was indenting every
   field relative to the panel heading above it. */
.signin-panel-wrap .signin-panel {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  backdrop-filter: none;
}

.signin-form-head { margin-bottom: 24px; }
.signin-form-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #231d45;
}
.signin-form-sub {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6b6783;
}

/* Logout / session toast */
.logged-out-toast {
  margin: 0 0 24px;
  padding: 13px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}
.signin-panel-wrap .logged-out-toast--teal {
  background: #e9f7f5;
  border: 1px solid #c3e7e2;
  color: #00857f;
}

/* Inputs */
.signin-panel-wrap .form-input {
  background: #fcfcfb;
  border: 1.5px solid #e3e1ea;
  border-radius: 12px;
  padding: 15px 14px;
  font-size: 14.5px;
  color: #231d45;
}
.signin-panel-wrap .form-input.with-icon { padding-left: 42px; }
.signin-panel-wrap .form-input::placeholder { color: #a39fb2; font-weight: 500; }
.signin-panel-wrap .form-input:focus {
  background: #fff;
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
.signin-panel-wrap .form-input-icon,
.signin-panel-wrap .form-input-action { color: #a39fb2; }
.signin-panel-wrap .form-label {
  color: #231d45;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 8px;
}
.signin-panel-wrap .form-field { margin-bottom: 18px; }

/* Solid teal primary button */
.signin-panel .btn-primary--futuristic {
  position: relative;
  overflow: hidden;
  background: #00a19a;
  border-radius: 14px;
  padding: 17px 18px;
  font-size: 15.5px;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.22);
  margin-top: 4px;
}
.signin-panel .btn-primary--futuristic::before { display: none; }
.signin-panel .btn-primary--futuristic:hover { background: #00857f; }

/* Forgot password link */
.signin-panel .btn-text {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.signin-panel .btn-text:hover { color: #00857f; }

/* Divider */
.signin-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 22px 0 6px;
  color: #a39fb2;
  font-size: 12px;
}
.signin-divider::before,
.signin-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dddbe4;
}
.signin-divider span { padding: 0 14px; }

.signin-footer {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b6783;
  padding: 8px 0 0;
}
.signin-footer a {
  color: #00a19a;
  font-weight: 800;
  text-decoration: none;
}
.signin-footer a:hover { color: #00857f; }

/* Confirm states reuse the right panel look */
.confirm-state--futuristic {
  min-height: auto;
  background: transparent;
}
.confirm-state--futuristic .confirm-icon {
  background: #e9f7f5;
  border-color: #bfe6e1;
  color: #00a19a;
}
.confirm-state--futuristic .confirm-h,
.confirm-state--futuristic .confirm-sub strong { color: #231d45; }
.confirm-state--futuristic .confirm-sub { color: #6b6783; }


/* Logged-out / session toast */
.logged-out-toast {
  margin: 6px 24px 18px 3px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.logged-out-toast svg { width: 14px; height: 14px; flex-shrink: 0; }
.logged-out-toast--teal {
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  color: #007e78;
}
.logged-out-toast--yellow {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #92400e;
}

/* Form */
.auth-form { padding: 22px 24px 18px; }
.form-field { margin-bottom: 18px; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  margin-bottom: 8px;
}
.form-input-wrap { position: relative; }
.form-input {
  width: 100%;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  padding: 15px 14px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  color: #231d45;
  letter-spacing: -0.1px;
  transition: all 0.15s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.10);
}
.form-input::placeholder { color: #9c98ad; font-weight: 500; }
.form-input.with-icon { padding-left: 40px; }
.form-input.with-action { padding-right: 48px; }
.form-input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #9c98ad;
  pointer-events: none;
}
.form-input-icon svg { width: 16px; height: 16px; display: block; }
.form-input-action {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #9c98ad;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-input-action svg { width: 16px; height: 16px; }

/* Reset helper text above OTP */
.reset-helper-text {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  margin: 0 0 18px;
  line-height: 1.55;
  text-align: center;
}
.reset-helper-text strong { color: #231d45; font-weight: 800; }

/* OTP */
.otp-boxes {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 18px;
}
/* Six fixed 46px boxes plus gaps came to 326px, wider than a 320px screen's
   content box. They flex down instead and cap at their design size. */
.otp-box {
  flex: 1 1 0;
  min-width: 0;
  max-width: 46px;
  height: 54px;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  color: #231d45;
  background: #fff;
  outline: none;
  font-family: inherit;
}
.otp-box:focus {
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.10);
}

/* Password strength */
.password-strength { margin-bottom: 14px; }
.strength-bars {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}
.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 999px;
  transition: background 0.2s;
}
.password-strength p {
  font-size: 12px;
  margin: 0;
  font-weight: 700;
}

/* Buttons */
.btn-primary {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 800;
  padding: 17px 18px;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
  transition: all 0.18s;
  margin-top: 8px;
}
.btn-primary:hover { background: #00b6ae; }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-text {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  padding: 10px;
  margin: 8px auto 0;
  display: block;
  letter-spacing: -0.05px;
}
.btn-text:hover { color: #231d45; }
.btn-text:disabled { opacity: 0.65; cursor: not-allowed; }

/* Confirm state — used for "sent" and "success" */
.confirm-state {
  padding: 28px 24px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.confirm-icon {
  width: 64px;
  height: 64px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 50%;
  margin: 8px auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00a19a;
}
.confirm-icon svg { width: 28px; height: 28px; }
.confirm-h {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}
.confirm-sub {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
  margin-bottom: 22px;
  letter-spacing: -0.05px;
}
/* The address is echoed back here, so a long one has to wrap rather than
   push the panel wider than the screen. */
.confirm-sub strong { color: #231d45; font-weight: 800; overflow-wrap: anywhere; }
.confirm-state .btn-primary { width: 100%; max-width: 280px; }

/* Footer */
.auth-footer {
  font-size: 13px;
  font-weight: 600;
  color: #6b6783;
  text-align: center;
  padding: 16px 24px 24px;
  letter-spacing: -0.05px;
}
.auth-footer a {
  color: #00a19a;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}
.auth-footer a:hover { color: #0d928b; }

.error-banner {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  line-height: 1.5;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }



/* ── Big screens ──
   Scale each content block by the shared desktop factor rather than the
   full-height columns, and let the brand column's side padding grow with the
   screen so the scaled hero sits in the panel instead of hugging its edge. */
@media (min-width: 1536px) {
  .signin-aside-top,
  .signin-aside-body,
  .signin-aside-foot,
  .signin-main-inner { zoom: var(--desk-zoom); }
  .signin-aside { padding: 40px clamp(48px, 5.5vw, 150px); }
  .signin-main { padding-inline: clamp(40px, 5vw, 140px); }
}

/* ── Responsive: stack to single column ──
   Stacked, the brand panel is a header band above the form, not a second
   half-screen. Its content is trimmed step by step so the form's heading and
   first field stay on the fold — on a 640px-tall phone the full-size panel
   pushed them clean off the screen. */
@media (max-width: 880px) {
  .signin-split {
    grid-template-columns: 1fr;
    /* Brand band sized to its content, form panel takes the rest of the
       viewport so short states still paint to the bottom edge. */
    grid-template-rows: auto 1fr;
  }
  .signin-aside { padding: 28px 28px 32px; }
  /* Stacked, the hero and the form share one centred column so they line up on
     the same left edge instead of drifting apart on tablet widths. */
  .signin-aside-top,
  .signin-aside-body,
  .signin-aside-foot {
    width: 100%;
    max-width: 460px;
    margin-inline: auto;
  }
  .signin-aside-top { margin-bottom: 20px; }
  /* Top-aligned in the stacked band, so the upward bias the desktop column
     needs would only add dead space above the footnote here. */
  .signin-aside-body { justify-content: flex-start; padding-bottom: 0; }
  .signin-aside-foot { display: flex; margin-top: 20px; }
  .signin-welcome { font-size: clamp(34px, 8vw, 46px); letter-spacing: -0.03em; }
  .signin-welcome-sub { margin-top: 14px; max-width: none; font-size: 16.5px; }
  .signin-passport-illus { max-width: 220px; margin-top: 24px; }
  .signin-main { padding: 32px 24px 48px; }
  .signin-main-inner { max-width: 460px; }
}

/* Phones — the brand panel collapses to a compact header. */
@media (max-width: 600px) {
  .signin-aside { padding: 20px 20px 22px; }
  .signin-aside-top { margin-bottom: 18px; }
  .signin-logo { gap: 10px; }
  .signin-logo-mark img { width: 34px; height: 34px; }
  .signin-logo strong { font-size: 20px; }
  .signin-tagline { display: none; }

  .signin-welcome {
    font-size: clamp(25px, 7.4vw, 31px);
    line-height: 1.08;
    letter-spacing: -0.025em;
  }
  .signin-welcome-sub { margin-top: 8px; font-size: 13.5px; line-height: 1.5; }

  .signin-passport-illus { max-width: 124px; margin-top: 14px; }
  .signin-aside-foot { margin-top: 16px; font-size: 12px; gap: 7px; }

  .signin-main { padding: 26px 20px 40px; }
  .signin-form-head { margin-bottom: 18px; }
  .signin-form-title { font-size: 23px; letter-spacing: -0.6px; }
  .signin-form-sub { font-size: 13.5px; }
  .signin-panel-wrap .form-field { margin-bottom: 14px; }
  /* 16px is the floor that stops iOS Safari zooming the page in on focus. */
  .signin-panel-wrap .form-input { padding: 14px 13px; font-size: 16px; }
  .signin-panel-wrap .form-input.with-icon { padding-left: 40px; }
  .signin-panel .btn-primary--futuristic { padding: 16px 18px; font-size: 15px; }
  .logged-out-toast { margin-bottom: 18px; padding: 11px 14px; }
}

/* Smallest phones (320px class). */
@media (max-width: 380px) {
  .signin-aside { padding: 16px 16px 18px; }
  .signin-main { padding: 22px 16px 36px; }
  .signin-welcome { font-size: 24px; }
  .signin-welcome-sub { font-size: 13px; }
  .signin-passport-illus { max-width: 108px; }
  .signin-form-title { font-size: 21px; }
  .otp-boxes { gap: 6px; }
  .otp-box { height: 50px; font-size: 20px; }
}
</style>
