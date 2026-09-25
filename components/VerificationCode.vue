<template>
  <div class="otp-form">
    <!-- Back -->
    <button class="otp-back" type="button" @click="goBack">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back
    </button>

    <h1 class="otp-title">Enter your code</h1>
    <p class="otp-subtitle">
      Enter the 6-digit verification code sent to your email address.
    </p>
    <div v-if="email" class="otp-email-row">
      <span class="otp-email">{{ email }}</span>
      <span class="otp-email-divider" aria-hidden="true"></span>
      <button type="button" class="otp-edit-email" @click="goBack">Edit email</button>
    </div>

    <!-- Code Input -->
    <div class="otp-fields">
      <CodeInput
        v-model="verificationCode"
        @complete="handleCodeComplete"
      />
    </div>

    <!-- Error -->
    <p v-if="error" class="otp-error">{{ error }}</p>

    <!-- Continue -->
    <button
      class="otp-continue"
      :disabled="!isCodeComplete || isLoading"
      @click="verifyCode"
    >
      {{ isLoading ? 'Verifying…' : 'Continue' }}
      <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>

    <!-- Resend -->
    <div class="otp-resend">
      <span class="otp-resend-lead">Didn't get the code?</span>
      <button
        v-if="canResend"
        type="button"
        class="otp-resend-btn"
        @click="resendCode"
      >
        Resend code
      </button>
      <span v-else class="otp-resend-timer">{{ resendText }}</span>
    </div>
    <p class="otp-spam-note">Check your spam or junk folder too.</p>
  </div>
</template>

<script setup lang="ts">
import { useVerificationCode } from '../composables/useVerificationCode'
import CodeInput from './verification/CodeInput.vue'

const {
  email,
  verificationCode,
  isLoading,
  error,
  isCodeComplete,
  canResend,
  resendText,
  handleCodeComplete,
  verifyCode,
  resendCode,
  goBack,
} = useVerificationCode()
</script>

<style scoped>
.otp-form {
  width: 100%;
  font-family:
    'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Inter, sans-serif;
}

/* Back */
.otp-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #00a19a;
  padding: 0;
  margin-bottom: 24px;
}
.otp-back svg {
  width: 17px;
  height: 17px;
}
.otp-back:hover {
  color: #00857f;
}

/* Heading - the same form-title scale as sign-up and sign-in; the page's
   big headline lives in the brand panel. */
.otp-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.15;
  color: #231d45;
  margin: 0 0 8px;
}
.otp-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
  margin: 0 0 16px;
}
.otp-email-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 26px;
}
.otp-email {
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 600;
  color: #4d4868;
  font-size: 14.5px;
}
.otp-email-divider {
  width: 1px;
  height: 18px;
  background: rgba(35, 29, 69, 0.16);
  flex-shrink: 0;
}
.otp-edit-email {
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.otp-edit-email:hover {
  color: #00857f;
}

/* Fields */
.otp-fields {
  margin-bottom: 22px;
}
/* Six boxes span the form's full width, edge to edge with the button. */
.otp-fields :deep(.code-input__fields) { gap: 12px; justify-content: space-between; }

.otp-error {
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  margin: -14px 0 20px;
}

/* Continue */
.otp-continue {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: #00a19a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.16s;
  box-shadow: 0 12px 26px rgba(0, 161, 154, 0.26);
}
.otp-continue svg {
  width: 18px;
  height: 18px;
}
.otp-continue:hover:not(:disabled) {
  background: #00b6ae;
  transform: translateY(-1px);
}
.otp-continue:disabled {
  background: #e7e6ef;
  color: #a7a4b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* Resend */
.otp-resend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 8px;
  margin-top: 22px;
  font-size: 14px;
}
.otp-resend-lead {
  font-weight: 500;
  color: #5d5878;
}
.otp-resend-timer {
  font-weight: 600;
  color: #4d4868;
  font-variant-numeric: tabular-nums;
}
.otp-resend-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.otp-resend-btn:hover {
  color: #00857f;
}

.otp-spam-note {
  text-align: center;
  margin: 8px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  color: #8d89a0;
}

/* Short laptop windows - see pages/onboarding/verification.vue. Below 730px
   tall the desktop zoom is 1, so vh is safe: the gaps and the button shrink
   with the window so the form fits one screen. */
@media (min-width: 881px) and (max-height: 729px) {
  .otp-back { margin-bottom: clamp(12px, 3.2vh, 24px); }
  .otp-subtitle { margin-bottom: clamp(10px, 2.2vh, 16px); }
  .otp-email-row { margin-bottom: clamp(14px, 3.4vh, 26px); }
  .otp-fields { margin-bottom: clamp(12px, 2.8vh, 22px); }
  .otp-continue { height: clamp(46px, 8vh, 54px); }
  .otp-resend { margin-top: clamp(12px, 2.8vh, 22px); }
}

@media (max-width: 600px) {
  .otp-back { margin-bottom: 18px; }
  .otp-title { font-size: 24px; letter-spacing: -0.6px; }
  .otp-subtitle { font-size: 13.5px; }
  .otp-email-row { gap: 10px; margin-bottom: 22px; }
  .otp-fields :deep(.code-input__fields) { gap: 8px; }
  .otp-continue { height: 52px; font-size: 15.5px; }
  .otp-resend { margin-top: 18px; }
}
</style>
