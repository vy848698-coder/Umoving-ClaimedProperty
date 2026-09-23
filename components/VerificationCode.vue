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
  max-width: 548px;
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
  font-size: 16px;
  font-weight: 700;
  color: #00a19a;
  padding: 0;
  margin-bottom: 34px;
}
.otp-back svg {
  width: 17px;
  height: 17px;
}
.otp-back:hover {
  color: #00857f;
}

/* Heading */
.otp-title {
  font-size: clamp(34px, 4vw, 50px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
  color: #231d45;
  margin: 0 0 14px;
}
.otp-subtitle {
  font-size: 17px;
  font-weight: 500;
  color: #5d5878;
  line-height: 1.6;
  margin: 0 0 22px;
}
.otp-email-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin: 0 0 36px;
}
.otp-email {
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 600;
  color: #4d4868;
  font-size: 16px;
}
.otp-email-divider {
  width: 1px;
  height: 22px;
  background: rgba(35, 29, 69, 0.16);
  flex-shrink: 0;
}
.otp-edit-email {
  font-family: inherit;
  font-size: 15px;
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
  margin-bottom: 28px;
}

.otp-error {
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  margin: -14px 0 20px;
}

/* Continue */
.otp-continue {
  width: 100%;
  height: 60px;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 17px;
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
  margin-top: 26px;
  font-size: 15px;
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
  font-size: 15px;
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
  margin: 10px 0 0;
  font-size: 13.5px;
  font-weight: 500;
  color: #8d89a0;
}

/* Short desktop / laptop windows - see pages/onboarding/verification.vue.
   Every vertical gap, the code boxes and the button scale with window height
   so the form fits one screen without scrolling. */
@media (min-width: 901px) and (max-height: 820px),
  (min-width: 701px) and (orientation: landscape) and (max-height: 820px) {
  .otp-back { margin-bottom: clamp(14px, 3.4vh, 34px); }
  .otp-title { margin-bottom: clamp(8px, 1.6vh, 14px); }
  .otp-subtitle {
    font-size: 16px;
    line-height: 1.55;
    margin-bottom: clamp(10px, 2.2vh, 22px);
  }
  .otp-email-row { margin-bottom: clamp(16px, 3.6vh, 36px); }
  .otp-fields { margin-bottom: clamp(14px, 2.8vh, 28px); }
  .otp-fields :deep(.code-input__field) { max-width: clamp(52px, 10.5vh, 80px); }
  /* Smaller boxes still span the full row, edge to edge with the button. */
  .otp-fields :deep(.code-input__fields) { justify-content: space-between; }
  .otp-continue { height: clamp(48px, 8vh, 60px); }
  .otp-resend { margin-top: clamp(12px, 2.6vh, 26px); }
  .otp-spam-note { margin-top: clamp(4px, 1vh, 10px); }
}

@media (max-width: 600px) {
  .otp-back { font-size: 15px; margin-bottom: 20px; }
  .otp-title { font-size: 28px; margin-bottom: 10px; }
  .otp-subtitle { font-size: 15px; margin-bottom: 16px; }
  .otp-email-row { gap: 10px; margin-bottom: 26px; }
  .otp-email { font-size: 15px; }
  .otp-email-divider { height: 18px; }
  .otp-edit-email { font-size: 14px; }
  .otp-fields { margin-bottom: 22px; }
  .otp-continue { height: 54px; font-size: 16px; }
  .otp-resend { margin-top: 20px; font-size: 14px; }
  .otp-spam-note { font-size: 12.5px; }
}
</style>
