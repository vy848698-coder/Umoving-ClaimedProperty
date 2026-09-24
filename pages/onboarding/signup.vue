<template>
  <div class="signup-split">
    <!-- ── Left brand panel (light) ── -->
    <aside class="signup-aside">
      <div class="signup-aside-top">
        <div class="signup-logo">
          <span class="signup-logo-mark"><img src="/op-icons/logo.png" alt="umu" /></span>
          <strong>umovingu</strong>
        </div>
        <p class="signup-tagline">A simpler way to own your home.</p>
      </div>

      <div class="signup-aside-body">
        <!-- Artwork leads, then the copy reads down from it in one column. -->
        <img
          src="/op-icons/landing/homeScoreCard.png"
          alt=""
          class="signup-house-illus"
        />

        <p class="signup-eyebrow">Create your account</p>
        <!-- The space before the break is trimmed at end of line on desktop and
             survives when the phone rules hide the <br>, so the line reflows to
             "Start with your home." rather than running the words together. -->
        <h1 class="signup-welcome">Start with <br />your home<span class="signup-q">.</span></h1>
        <p class="signup-welcome-sub">
          A few details and you're in, then claim the property that's already yours.
        </p>

        <!-- What the account actually gets them. The old numbered steps only
             described the form they are already looking at. -->
        <ul class="signup-points">
          <li>
            <span class="signup-point-k" aria-hidden="true"></span>
            <p><b>Ownership verified</b> against HM Land Registry, not self-declared.</p>
          </li>
          <li>
            <span class="signup-point-k" aria-hidden="true"></span>
            <p><b>Free to create.</b> You only pay when you claim a property.</p>
          </li>
          <li>
            <span class="signup-point-k" aria-hidden="true"></span>
            <p><b>Yours to control.</b> Nothing is shared without your say-so.</p>
          </li>
        </ul>
      </div>

      <p class="signup-aside-foot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        End-to-end encrypted. Your data stays yours.
      </p>
    </aside>

    <!-- ── Right form panel (light) ── -->
    <main class="signup-main">
      <div class="signup-main-inner">
        <div class="signup-form-head">
          <h2 class="signup-form-title">Create your account</h2>
          <p class="signup-form-sub">Start with your home. It takes about a minute.</p>
        </div>

        <form class="auth-form signup-panel" @submit.prevent="handleSubmit">

          <div v-if="formError" class="error-banner">{{ formError }}</div>

          <!-- Email -->
          <div class="form-field">
            <label class="form-label">Email address</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input v-model="form.email" type="email" placeholder="you@example.com" class="form-input with-icon" autocomplete="email" />
            </div>
          </div>

          <!-- Password -->
          <div class="form-field">
            <label class="form-label">Password</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="At least 8 characters" class="form-input with-icon with-action" autocomplete="new-password" />
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

          <!-- Full name -->
          <div class="form-field">
            <label class="form-label">Full name</label>
            <div class="form-input-wrap">
              <span class="form-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input v-model="form.fullName" type="text" placeholder="Jane Smith" class="form-input with-icon" autocomplete="name" />
            </div>
          </div>

          <!-- Mobile (optional) -->
          <div class="form-field optional">
            <label class="form-label">Mobile number <span class="opt">optional</span></label>
            <PhoneInput v-model="form.mobile" />
            <div class="form-help">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>We only text you about <strong>your Passport</strong>, never marketing.</span>
            </div>
          </div>

          <!-- Postcode (optional) -->
          <div class="form-field optional">
            <label class="form-label">Postcode <span class="opt">optional</span></label>
            <div v-if="selectedAddress" class="address-selected-row">
              <div class="address-selected-body">
                <div class="address-selected-line1">{{ selectedAddress.line1 }}</div>
                <div class="address-selected-line2">{{ selectedAddress.line2 }}</div>
              </div>
              <button type="button" class="address-edit-btn" @click="editAddress">Edit</button>
            </div>
            <PropertySearchInput
              v-else
              placeholder="CV5 6AJ"
              variant="light"
              :postcode-fallback="true"
              @select="onAddressSelect"
            />
            <div class="postcode-prompt">
              <div class="postcode-prompt-h">Ready for when you claim your home</div>
              <div class="postcode-prompt-text">Add your postcode now and it's saved to your account for your Property Passport claim. You can skip this and add it later.</div>
            </div>
          </div>

          <!-- Marketing opt-in -->
          <label class="checkbox-row">
            <span class="checkbox-box" :class="{ checked: form.marketingOptIn }">
              <input v-model="form.marketingOptIn" type="checkbox" hidden />
            </span>
            <span class="checkbox-text">Email me occasional product updates and tips. No spam, and you can unsubscribe in one tap.</span>
          </label>

          <button type="submit" class="btn-primary btn-primary--futuristic" :disabled="isLoading">
            <span v-if="isLoading" class="spinner" />
            {{ isLoading ? 'Creating account…' : 'Create account' }}
          </button>

          <div class="terms-text">
            By continuing you agree to our
            <NuxtLink to="/legal/terms" target="_blank">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/legal/privacy" target="_blank">Privacy Policy</NuxtLink>.
          </div>
        </form>

        <div class="signup-divider"><span>already with us?</span></div>

        <div class="auth-footer signup-footer">
          Already have an account? <NuxtLink to="/onboarding/signin">Sign in</NuxtLink>
        </div>
      </div>
    </main>

    <TermsModal
      :show="showTermsModal"
      @update:show="showTermsModal = $event"
      @accept="showTermsModal = false"
      @close="showTermsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'
import { toTitleCase } from '~/utils/form-helpres'
import PhoneInput from '~/components/form/PhoneInput.vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'
import TermsModal from '~/components/modals/TermsModal.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({
  title: 'Create Account | UmovingU',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const { requestOtp } = useAuth()
const { email, setPendingSignup } = useSession()

const form = reactive({
  fullName: '',
  email: '',
  mobile: '',
  postcode: '',
  password: '',
  marketingOptIn: false,
})

const showPassword = ref(false)
const formError = ref('')
const isLoading = ref(false)
const showTermsModal = ref(false)

const selectedAddress = ref<{ id: number; line1: string; line2: string; postcode?: string } | null>(null)

const onAddressSelect = (property: any) => {
  const pc = property.postcode?.toUpperCase()
  // Postcode-only pick (postcodes.io fallback — no property in our dataset).
  if (property.postcodeOnly || !property.addressLine1) {
    selectedAddress.value = {
      id: 1,
      line1: pc ?? '',
      line2: 'Postcode',
      postcode: pc,
    }
    form.postcode = pc ?? ''
    return
  }
  selectedAddress.value = {
    id: 1,
    line1: toTitleCase(property.addressLine1 ?? ''),
    line2: [property.city ? toTitleCase(property.city) : null, pc]
      .filter(Boolean)
      .join(', '),
    postcode: pc,
  }
  form.postcode = selectedAddress.value.postcode ?? selectedAddress.value.line1
}

const editAddress = () => {
  selectedAddress.value = null
  form.postcode = ''
}

const parseApiError = (err: any): string => {
  const msg = err?.data?.message
  if (Array.isArray(msg)) return msg.join('. ')
  return msg || 'Something went wrong. Please try again.'
}

const handleSubmit = async () => {
  formError.value = ''

  const cleanEmail = form.email.trim().toLowerCase()

  if (!form.fullName.trim()) {
    formError.value = 'Please enter your full name.'
    return
  }
  if (!cleanEmail) {
    formError.value = 'Please enter your email address.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    formError.value = 'Please enter a valid email address.'
    return
  }
  if (form.password.length < 8) {
    formError.value = 'Password must be at least 8 characters.'
    return
  }

  const parts = form.fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')

  isLoading.value = true
  try {
    const { exists } = await $fetch<{ exists: boolean }>(
      `${config.public.apiBase}/auth/check-email`,
      { method: 'POST', body: { email: cleanEmail } },
    )

    if (exists) {
      formError.value = 'An account with this email already exists.'
      return
    }

    setPendingSignup({
      firstName,
      lastName,
      phone: form.mobile,
      postcode: form.postcode,
      password: form.password,
    })

    email.value = cleanEmail
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('umu-pending-email', cleanEmail)
    }

    await requestOtp(cleanEmail)
    await navigateTo('/onboarding/verification')
  } catch (err: any) {
    formError.value = parseApiError(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ── Split-screen layout ── */
.signup-split {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Plus Jakarta Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #231d45;
}

/* ── Left brand panel (light) ── */
.signup-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  color: #231d45;
  background:
    /* A soft light where the artwork sits, so the house has something to
       stand on instead of flat cream, and the teal wash at the far corner. */
    radial-gradient(620px 460px at 22% 34%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 66%),
    radial-gradient(circle at 90% 95%, rgba(0, 161, 154, 0.08) 0%, rgba(0, 161, 154, 0) 42%),
    linear-gradient(170deg, #f7f7f4 0%, #fbfbf9 42%, #f8faf9 100%);
  overflow: hidden;
  min-width: 0;
}
/* Hairline between the two panels - without it the cream and the form grey
   meet with nothing to separate them. */
.signup-aside::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  width: 1px;
  background: linear-gradient(180deg, rgba(35, 29, 69, 0) 0%, rgba(35, 29, 69, 0.08) 22%, rgba(35, 29, 69, 0.08) 78%, rgba(35, 29, 69, 0) 100%);
}
.signup-aside-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.signup-logo { display: inline-flex; align-items: center; gap: 13px; }
/* The mark carries its own shape, so the ring around it only added weight
   and a second circle next to the wordmark. */
.signup-logo-mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.signup-logo-mark img { width: 42px; height: 42px; display: block; }
.signup-logo strong {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #231d45;
}
.signup-tagline {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #8d89a0;
  text-align: right;
  white-space: nowrap;
}

.signup-aside-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 500px;
  /* Centres inside a slightly shorter box, so the whole column sits above the
     true middle - level with the form's own weight rather than below it. */
  padding-bottom: 4.5vh;
}

.signup-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #00a19a;
}
.signup-welcome {
  margin: 8px 0 0;
  font-size: clamp(46px, 4.7vw, 62px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing:-.03em;
  color: #231d45;
}
.signup-q { color: #00a19a; }
.signup-welcome-sub {
  margin: 15px 0 0;
  font-size: 18px;
  line-height: 1.52;
  color: #635f7b;
  max-width: 32ch;
}

/* Leads the panel. Pulled left of the text column so it sits against the
   panel edge rather than floating in the middle of its own margin, and up
   towards the logo so the two read as the top of one column. */
.signup-house-illus {
  width: 288px;
  height: auto;
  display: block;
  margin: -18px 0 16px -22px;
  object-fit: contain;
  filter: drop-shadow(0 22px 30px rgba(35, 29, 69, 0.16));
}

/* What the account gets them, on hairlines so the list reads as one block
   with no gaps between the rows to fall through. */
.signup-points {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: grid;
}
.signup-points li {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 14px 0;
  border-top: 1px solid rgba(35, 29, 69, 0.09);
}
.signup-points li:last-child { border-bottom: 1px solid rgba(35, 29, 69, 0.09); }
/* A small rotated square - a marker, not a bullet. */
.signup-point-k {
  width: 5px;
  height: 5px;
  margin-top: 8px;
  flex-shrink: 0;
  background: #00a19a;
  transform: rotate(45deg);
}
.signup-points p {
  margin: 0;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.45;
  color: #4a4560;
}
.signup-points b { color: #231d45; font-weight: 800; }

.signup-aside-foot {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 28px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #9490a3;
}
.signup-aside-foot svg { width: 15px; height: 15px; flex-shrink: 0; }

/* ── Right form panel ── */
.signup-main {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 40px;
  background: #f3f2ef;
  overflow-y: auto;
  /* Grid items default to min-width:auto, so a wide child would stretch this
     track past the viewport; the app shell clips overflow-x, so that shows up
     as cut-off content rather than a scrollbar. */
  min-width: 0;
}
.signup-main-inner { width: 100%; max-width: 420px; min-width: 0; }

.signup-form-head { margin-bottom: 24px; }
.signup-form-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #231d45;
}
.signup-form-sub {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6b6783;
}

/* Plain form (strip the futuristic card chrome) */
.signup-panel {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  backdrop-filter: none;
}

/* Form fields */
.auth-form { padding: 0; }
.form-field { margin-bottom: 18px; }
.form-field.optional .form-label { color: #231d45; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 8px;
}
.form-label .opt {
  font-size: 12px;
  font-weight: 600;
  color: #a39fb2;
  margin-left: 6px;
}
.form-input-wrap { position: relative; }
.form-input {
  width: 100%;
  background: #fcfcfb;
  border: 1.5px solid #e3e1ea;
  border-radius: 12px;
  padding: 15px 14px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  color: #231d45;
  transition: all 0.15s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  background: #fff;
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
.form-input::placeholder { color: #a39fb2; font-weight: 500; }
.form-input.with-icon { padding-left: 42px; }
.form-input.with-action { padding-right: 48px; }
.form-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #a39fb2;
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
  color: #a39fb2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-input-action:hover { color: #00857f; }
.form-input-action svg { width: 16px; height: 16px; }

.form-help {
  font-size: 12px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 7px;
  line-height: 1.45;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.form-help svg { width: 13px; height: 13px; color: #00a19a; flex-shrink: 0; margin-top: 2px; }
.form-help strong { color: #231d45; font-weight: 800; }

/* PhoneInput */
:deep(.phone-field) {
  background: #fcfcfb;
  border: 1.5px solid #e3e1ea;
  border-radius: 12px;
  height: 52px;
}
:deep(.phone-field--focused) {
  background: #fff;
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
:deep(.number-input) { font-size: 14.5px; color: #231d45; font-weight: 600; }
:deep(.number-input::placeholder) { color: #a39fb2; }
:deep(.country-dial) { color: #231d45; }

/* Postcode prompt callout — teal box */
.postcode-prompt {
  background: #e9f7f5;
  border: 1px solid #c3e7e2;
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: 10px;
}
.postcode-prompt-h {
  font-size: 14px;
  font-weight: 800;
  color: #00857f;
  margin-bottom: 5px;
}
.postcode-prompt-text {
  font-size: 13px;
  font-weight: 500;
  color: #5a7470;
  line-height: 1.5;
}

/* Selected address pill */
.address-selected-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #e9f7f5;
  border: 1.5px solid #c3e7e2;
  border-radius: 12px;
  padding: 13px 14px;
}
.address-selected-body { flex: 1; min-width: 0; }
.address-selected-line1 {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.address-selected-line2 { font-size: 12px; color: #5a7470; margin-top: 2px; }
.address-edit-btn {
  background: transparent;
  border: none;
  font-size: 12.5px;
  font-weight: 800;
  color: #00857f;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
}

/* Marketing checkbox */
.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 18px;
  cursor: pointer;
}
.checkbox-box {
  width: 18px;
  height: 18px;
  border: 1.5px solid #cfccd8;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.15s;
}
.checkbox-box.checked { background: #00a19a; border-color: #00a19a; }
.checkbox-box.checked::after {
  content: '';
  width: 9px;
  height: 5px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translate(1px, -1px);
}
.checkbox-text {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
}

/* Primary button — solid teal */
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
  transition: all 0.18s;
  margin-top: 22px;
}
.btn-primary--futuristic {
  background: #00a19a;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.22);
}
.btn-primary:hover,
.btn-primary--futuristic:hover { background: #00857f; }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.terms-text {
  font-size: 12.5px;
  font-weight: 500;
  color: #a39fb2;
  text-align: center;
  line-height: 1.55;
  margin-top: 16px;
}
.terms-text a { color: #6b6783; font-weight: 800; cursor: pointer; }
.terms-text a:hover { color: #231d45; }

/* Divider */
.signup-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0 6px;
  color: #a39fb2;
  font-size: 12px;
}
.signup-divider::before,
.signup-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #dddbe4;
}
.signup-divider span { padding: 0 14px; }

.signup-footer,
.auth-footer {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b6783;
  padding: 8px 0 0;
}
.signup-footer a,
.auth-footer a {
  color: #00a19a;
  font-weight: 800;
  text-decoration: none;
}
.signup-footer a:hover,
.auth-footer a:hover { color: #00857f; }

.error-banner {
  margin-bottom: 16px;
  padding: 12px 14px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  color: #be123c;
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

/* ── Responsive: stack to single column ── */
/* ── Responsive: stack to single column ──
   Stacked, the brand panel is a header band above the form rather than a
   second full screen — at 320px the full-size panel ran ~1180px, putting the
   first field almost two screens down. Its content is trimmed in steps, and
   the hero and form share one centred column so they line up. */
@media (max-width: 880px) {
  .signup-split {
    grid-template-columns: 1fr;
    /* Band sized to content, form panel fills the rest of the viewport. */
    grid-template-rows: auto 1fr;
  }
  .signup-aside { padding: 28px 28px 32px; }
  .signup-aside-top,
  .signup-aside-body,
  .signup-aside-foot {
    width: 100%;
    max-width: 460px;
    margin-inline: auto;
  }
  .signup-aside-top { margin-bottom: 20px; }
  /* Top-aligned in the stacked band, so the upward bias the desktop column
     needs would only add dead space above the footnote here. */
  .signup-aside-body { justify-content: flex-start; padding-bottom: 0; }
  .signup-aside-foot { display: flex; margin-top: 20px; }
  .signup-welcome { font-size: clamp(34px, 8vw, 46px); }
  .signup-house-illus {
    width: 190px;
    margin: 0 0 14px -12px;
  }
  .signup-welcome-sub { max-width: none; font-size: 16.5px; }
  .signup-points { margin-top: 18px; }
  .signup-points li { padding: 11px 0; }
  .signup-main { padding: 32px 24px 48px; }
  .signup-main-inner { max-width: 460px; }
}

/* Phones — the brand panel collapses to a compact header. */
@media (max-width: 600px) {
  .signup-aside { padding: 20px 20px 22px; }
  .signup-aside-top { margin-bottom: 18px; }
  .signup-logo { gap: 10px; }
  .signup-logo-mark img { width: 34px; height: 34px; }
  .signup-logo strong { font-size: 20px; }
  .signup-tagline { display: none; }
  /* The band is a compact header at this size, so it keeps only what the
     form itself doesn't already say: the artwork stays (small - it is the
     panel's only visual), the three points go, since the first field is
     right underneath and shouldn't be pushed down a screen. */
  .signup-house-illus { width: 116px; margin: 0 0 10px -6px; }
  .signup-points { display: none; }

  .signup-eyebrow { font-size: 11px; letter-spacing: 1.5px; }
  .signup-welcome {
    font-size: clamp(25px, 7.4vw, 31px);
    line-height: 1.08;
  }
  /* "Start with / your home." is hard-wrapped for the desktop column; at this
     size it should wrap on its own. */
  .signup-welcome br { display: none; }
  .signup-welcome-sub { margin-top: 8px; font-size: 13.5px; line-height: 1.5; max-width: none; }

  .signup-aside-foot { margin-top: 14px; font-size: 12px; gap: 7px; }

  .signup-main { padding: 26px 20px 40px; }
  .signup-form-head { margin-bottom: 18px; }
  .signup-form-title { font-size: 23px; letter-spacing: -0.6px; }
  .signup-form-sub { font-size: 13.5px; }
  .form-field { margin-bottom: 15px; }
  /* 16px is the floor that stops iOS Safari zooming the page in on focus. */
  .form-input { padding: 14px 13px; font-size: 16px; }
  .form-input.with-icon { padding-left: 40px; }
}

/* Smallest phones (320px class). */
@media (max-width: 380px) {
  .signup-aside { padding: 16px 16px 18px; }
  .signup-main { padding: 22px 16px 36px; }
  .signup-welcome { font-size: 24px; }
  .signup-welcome-sub { font-size: 13px; }
  .signup-house-illus { width: 100px; }
  .signup-form-title { font-size: 21px; }
}
</style>
