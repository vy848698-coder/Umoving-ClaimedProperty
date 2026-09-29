
<template>
  <div class="pi-shell">
    <FlowHeader />

    <main class="pi-body">
        <!-- Welcome hero banner -->
        <section class="pi-welcome">
          <button
            type="button"
            class="pi-avatar"
            aria-label="Edit profile picture"
            @click="isAvatarDrawerOpen = true"
          >
            <img
              v-if="avatarDisplayUrl"
              :src="avatarDisplayUrl"
              alt="Profile avatar"
              class="pi-avatar-img"
            />
            <span v-else>{{ initials }}</span>
            <div class="avatar-camera-mini">
              <Icon name="heroicons:camera-solid" class="avatar-camera-svg" />
            </div>
          </button>

          <div class="pi-welcome-text">
            <div class="pi-welcome-greet">Welcome back, {{ firstNameDisplay }}! <span class="pi-wave">👋</span></div>
            <h1 class="pi-welcome-title">Your Profile</h1>
            <p class="pi-welcome-sub">Manage your details, preferences and stay in control of your journey.</p>
          </div>

          <div class="pi-welcome-prog" aria-hidden="false">
            <div class="pi-wp-label">Profile completion</div>
            <div class="pi-wp-pct">{{ profileCompletion }}%</div>
            <div class="pic-track">
              <div class="pic-fill" :style="{ width: profileCompletion + '%' }" />
            </div>
            <p class="pi-wp-hint">Almost there! Complete a few more steps to get the most out of UmovingU.</p>
          </div>
        </section>

        <!-- Top grid: Personal Info (incl. current address) · Identity -->
        <div class="pi-grid">
          <!-- Personal Information card -->
          <section class="pi-card">
            <div class="pi-card-head">
              <div class="pi-card-titlewrap">
                <span class="pi-card-ic ic-art"><img src="/buyer-profile-icon/idCard.png" alt="" /></span>
                <h2 class="pi-card-title">Personal Information</h2>
              </div>
            </div>

            <div class="pi-fieldlist">
              <button
                v-for="(item, index) in contactDetails"
                :key="item.key"
                class="pi-field"
                :class="{ 'pi-field--locked': item.key === 'email' }"
                type="button"
                :disabled="item.key === 'email'"
                @click="item.key !== 'email' && openContactEditor(index)"
              >
                <span class="pi-field-ic ic-art"><img :src="contactArt[item.key]" alt="" /></span>
                <span class="pi-field-body">
                  <span class="pi-field-label">{{ item.label }}</span>
                  <span class="pi-field-value" :class="{ empty: !item.value }">
                    {{ item.value || `Add ${item.label.toLowerCase()}` }}
                  </span>
                </span>
                <!-- Email is set at signup and OTP-verified - changing it
                     here would leave the account pointing at an address
                     nobody confirmed owning it (client feedback,
                     2026-09-30). -->
                <Icon
                  :name="item.key === 'email' ? 'heroicons:lock-closed' : 'heroicons:pencil-square'"
                  class="pi-field-edit"
                />
              </button>

              <!-- Current address - folded in from the old "Property Journey"
                   card (client feedback, 2026-09-30): that card's own top
                   "Edit" button only ever opened this same address drawer
                   anyway, duplicating this row's own edit affordance. -->
              <button
                class="pi-field"
                type="button"
                @click="openAddressEditor((profile?.addresses ?? [])[0] ?? null)"
              >
                <span class="pi-field-ic ic-art"><img src="/op-icons/matched-buyers/pin.png" alt="" /></span>
                <span class="pi-field-body">
                  <span class="pi-field-label">Current address</span>
                  <span class="pi-field-value" :class="{ empty: !(profile?.addresses ?? []).length }">
                    {{ (profile?.addresses ?? []).length ? formatAddress(profile.addresses[0]) : 'Add current address' }}
                  </span>
                </span>
                <Icon name="heroicons:pencil-square" class="pi-field-edit" />
              </button>
            </div>

            <div class="pi-card-note">
              <img src="/build/padlock.png" alt="" class="pi-card-note-ic" />
              Your personal information is secure and private.
            </div>
          </section>

          <!-- Identity Verification card -->
          <section class="pi-card pi-card-verify">
            <div class="pi-card-head">
              <div class="pi-card-titlewrap">
                <span class="pi-card-ic ic-art"><img src="/build/shield.png" alt="" /></span>
                <h2 class="pi-card-title">Identity Verification</h2>
              </div>
            </div>

            <div class="pi-verify-body">
              <!-- The tick is the verified state's icon. Showing it above
                   "Not verified yet" read as though the check had passed —
                   only the badge's background changed between the two, and
                   those two greens are all but identical. -->
              <div class="pi-verify-badge" :class="{ done: profile?.isVerified }">
                <Icon
                  :name="profile?.isVerified ? 'heroicons:shield-check-solid' : 'heroicons:shield-exclamation'"
                  class="pi-verify-badge-ic"
                />
              </div>
              <div class="pi-verify-title">
                {{ profile?.isVerified ? 'Verified' : 'Not verified yet' }}
              </div>
              <p class="pi-verify-sub">
                {{ profile?.isVerified
                  ? 'Your identity has been verified by Onfido.'
                  : 'Available when you claim a property - identity verification happens as part of that process.' }}
              </p>
              <!-- Real link into the actual KYC flow (which only runs in the
                   context of claiming a property - client confirmed,
                   2026-09-30), not a dead disabled button. -->
              <NuxtLink v-if="!profile?.isVerified" to="/claim" class="pi-verify-btn">
                Claim a property
                <Icon name="heroicons:arrow-right" class="pi-verify-btn-ic" />
              </NuxtLink>
              <button v-else type="button" class="pi-verify-btn" disabled>
                Verified
              </button>
            </div>
          </section>

          <!-- Profile Completion - compact (client feedback, 2026-09-30:
               fold into this row as a third column instead of its own
               full-width row below). Ring first, checklist stacked under it,
               matching the vertical rhythm of the Identity card beside it. -->
          <section class="pi-card pi-card-completion">
            <div class="pi-card-head">
              <div class="pi-card-titlewrap">
                <span class="pi-card-ic ic-art"><img src="/build/bigCheckHero.png" alt="" /></span>
                <h2 class="pi-card-title">Profile Completion</h2>
              </div>
            </div>

            <div class="pi-ring-wrap">
              <div class="pi-ring" :style="ringStyle">
                <div class="pi-ring-inner">
                  <span class="pi-ring-pct">{{ profileCompletion }}%</span>
                  <span class="pi-ring-cap">Completed</span>
                </div>
              </div>
            </div>

            <div class="pi-checklist">
              <div
                v-for="step in completionSteps"
                :key="step.label"
                class="pi-check"
                :class="{ done: step.done }"
              >
                <img :src="step.art" alt="" class="pi-check-ic" />
                <span class="pi-check-label">{{ step.label }}</span>
                <span class="pi-check-state" :class="{ ok: step.done }">
                  <Icon v-if="step.done" name="heroicons:check-16-solid" />
                  <template v-else>·</template>
                </span>
              </div>
            </div>
          </section>
        </div>

        <div class="pi-footnote">
          <img src="/build/padlock.png" alt="" class="pi-footnote-ic" />
          Your data is encrypted and never shared with third parties.
        </div>
    </main>


    <!-- Contact Edit Drawer -->
    <BaseDrawer
      v-model="isContactDrawerOpen"
      :title="`Change ${contactEditLabel}`"
      :show-back-button="false"
    >
      <div class="pi-df-wrap">
        <p class="pi-df-note">The changes will reflect immediately.</p>
        <div
          v-if="contactDetails[activeContactIndex]?.key === 'phone'"
          class="pi-df"
        >
          <span class="pi-df-label">Phone number</span>
          <PhoneInput v-model="contactEditValue" />
          <p class="pi-df-hint">
            Select your country code, then enter your number without the leading
            0.
          </p>
        </div>
        <label v-else class="pi-df">
          <span class="pi-df-label">{{ contactEditLabel }}</span>
          <div class="pi-df-input">
            <Icon name="i-heroicons-pencil-square" class="pi-df-ic" />
            <input
              v-model="contactEditValue"
              :type="contactEditInputType"
              :placeholder="`Enter new ${contactEditLabel.toLowerCase()}`"
            />
          </div>
        </label>
      </div>
      <template #footer>
        <button
          type="button"
          class="drawer-cta"
          :disabled="saving"
          @click="saveContactEdit"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ saving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Address Edit Drawer -->
    <BaseDrawer
      v-model="isAddressDrawerOpen"
      :title="editingAddress?.id ? 'Edit address' : 'Add address'"
      :show-back-button="false"
    >
      <div class="pi-df-wrap">
        <label v-for="field in addressFields" :key="field.key" class="pi-df">
          <span class="pi-df-label">{{ field.label }}</span>
          <div class="pi-df-input">
            <input
              v-model="editingAddress[field.key]"
              :placeholder="field.label"
            />
          </div>
        </label>
      </div>
      <p v-if="addressError" class="pi-df-error">{{ addressError }}</p>
      <template #footer>
        <button
          type="button"
          class="drawer-cta"
          :disabled="saving"
          @click="saveAddress"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ saving ? 'Saving…' : 'Save address' }}</span>
        </button>
      </template>
    </BaseDrawer>

    <!-- Avatar Edit Drawer -->
    <BaseDrawer
      v-model="isAvatarDrawerOpen"
      title="Edit profile picture"
      :show-back-button="false"
    >
      <p class="text-[15px] leading-[24px] text-[#7f8084] mb-6">
        The changes will reflect immediately.
      </p>
      <div v-if="avatarPreview" class="mb-6 flex justify-center">
        <img
          :src="avatarPreview"
          alt="Preview"
          class="w-24 h-24 rounded-full object-cover border-4 border-[#00a19a]"
        />
      </div>
      <div class="space-y-3">
        <label class="avatar-pick-row">
          <div class="apr-content">
            <Icon name="i-heroicons-camera" class="w-5 h-5 text-[#0e2840]" />
            <span>Take picture</span>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-[#8a95a0]"
          />
          <!-- "user" is the real front-facing-camera capture hint (client
               feedback, 2026-09-30) - "camera" isn't a valid value, so it was
               silently falling back to a plain file picker on most browsers. -->
          <input
            type="file"
            accept="image/*"
            capture="user"
            class="sr-only"
            @change="onFileSelected"
          />
        </label>
        <label class="avatar-pick-row">
          <div class="apr-content">
            <Icon name="i-heroicons-photo" class="w-5 h-5 text-[#0e2840]" />
            <span>Upload from gallery</span>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-[#8a95a0]"
          />
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="onFileSelected"
          />
        </label>
      </div>
      <p v-if="avatarError" class="mt-4 text-center text-red-500 text-[13px]">
        {{ avatarError }}
      </p>
      <template #footer>
        <button
          v-if="avatarFile"
          type="button"
          class="drawer-cta"
          :disabled="avatarUploading"
          @click="saveAvatar"
        >
          <Icon name="i-heroicons-check" class="w-5 h-5" />
          <span>{{ avatarUploading ? 'Uploading…' : 'Save picture' }}</span>
        </button>
      </template>
    </BaseDrawer>

  </div>
</template>

<script setup>
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import PhoneInput from '@/components/form/PhoneInput.vue'
import FlowHeader from '~/components/core/FlowHeader.vue'
import { useAppToast } from '~/composables/useCustomToast'
definePageMeta({ title: 'Personal Information | UmovingU', middleware: 'auth' })

const {
  profile,
  fullName,
  uploadAvatar,
  fetchProfile,
  updateProfile,
  createAddress,
  updateAddress,
  deleteAddress,
} = useProfile()
const { showToast } = useAppToast()

onMounted(fetchProfile)

const saving = ref(false)

// Every save on this page was showing the same generic "Could not save"
// text no matter what actually went wrong, which made a real failure
// (e.g. an expired session - access tokens are now 1h, see
// useVerificationCode.ts/plugins/auth-refresh.client.ts) indistinguishable
// from, say, a network blip. This pulls out whatever real message is
// available and always logs the raw error so it's diagnosable from the
// browser console even when the UI text has to stay generic.
function describeApiError(err, fallback) {
  console.error('[personal-information]', err)
  const status = err?.status ?? err?.response?.status ?? err?.statusCode
  if (status === 401) return 'Your session has expired. Please sign in again.'
  const raw = err?.data?.message
  if (raw) return Array.isArray(raw) ? raw.join(' ') : raw
  if (err?.message && err.message !== 'Failed to fetch') return err.message
  return fallback
}

// ── Avatar ─────────────────────────────────────────────────────
const isAvatarDrawerOpen = ref(false)
const avatarFile = ref(null)
const avatarPreview = ref('')
const avatarUploading = ref(false)
const avatarError = ref('')

// The hero button's persistent display: the saved avatar once loaded,
// falling back to the local FileReader preview only while a new pick is
// staged-but-unsaved in the drawer. Previously bound to avatarPreview
// alone, which meant the button showed initials for anyone who already
// had an avatar (profile.avatarUrl was never read here), and reverted to
// initials the instant a save cleared the preview - looking exactly like
// the upload had silently failed even though it had succeeded
// (client feedback, 2026-09-30).
const avatarDisplayUrl = computed(() => avatarPreview.value || profile.value?.avatarUrl || '')

const onFileSelected = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarError.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const saveAvatar = async () => {
  if (!avatarFile.value) return
  avatarUploading.value = true
  avatarError.value = ''
  try {
    await uploadAvatar(avatarFile.value)
    isAvatarDrawerOpen.value = false
    avatarFile.value = null
    avatarPreview.value = ''
    showToast({ message: 'Profile picture updated.' })
  } catch (err) {
    avatarError.value = describeApiError(err, 'Upload failed. Please try again.')
  } finally {
    avatarUploading.value = false
  }
}

// ── Contact ─────────────────────────────────────────────────────
const contactDetails = computed(() => [
  { label: 'Full name', value: fullName.value, key: 'name' },
  { label: 'Email', value: profile.value?.email ?? '', key: 'email' },
  { label: 'Phone', value: profile.value?.phone ?? '', key: 'phone' },
])

// The 3D artwork the rest of the app uses, in place of flat glyphs.
const contactArt = {
  name: '/build/people.png',
  email: '/build/email.png',
  phone: '/build/phone.png',
}

const firstNameDisplay = computed(
  () => profile.value?.firstName || fullName.value?.split(' ')[0] || 'there',
)

const contactVisible = computed(() => profile.value?.contactVisible ?? true)
const toggleContactVisible = async () => {
  if (!profile.value) return
  await updateProfile({ contactVisible: !profile.value.contactVisible })
}

const isContactDrawerOpen = ref(false)
const activeContactIndex = ref(null)
const contactEditValue = ref('')

const contactEditLabel = computed(() => {
  if (activeContactIndex.value === null) return 'Value'
  return contactDetails.value[activeContactIndex.value]?.label ?? 'Value'
})
const contactEditInputType = computed(() => {
  const k = contactDetails.value[activeContactIndex.value ?? -1]?.key
  if (k === 'email') return 'email'
  if (k === 'phone') return 'tel'
  return 'text'
})

const openContactEditor = (index) => {
  activeContactIndex.value = index
  contactEditValue.value = contactDetails.value[index]?.value ?? ''
  isContactDrawerOpen.value = true
}

const saveContactEdit = async () => {
  if (activeContactIndex.value === null) return
  saving.value = true
  try {
    const key = contactDetails.value[activeContactIndex.value]?.key
    if (key === 'name') {
      const parts = contactEditValue.value.trim().split(/\s+/)
      await updateProfile({
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') || undefined,
      })
    } else if (key === 'phone') {
      await updateProfile({ phone: contactEditValue.value })
    }
    isContactDrawerOpen.value = false
    showToast({ message: 'Saved.' })
  } catch (err) {
    showToast({ message: describeApiError(err, 'Could not save. Try again.'), variant: 'error' })
  } finally {
    saving.value = false
  }
}

// ── Address ─────────────────────────────────────────────────────
// "Label" dropped from the form (client feedback, 2026-09-30) - with
// Property Journey gone, this row is always "the" current address, so
// there's nothing left for a label to distinguish. It's set automatically
// instead of shown as a free-text field a user could type the whole
// address into by mistake (which is exactly what was happening).
const isAddressDrawerOpen = ref(false)
const editingAddress = ref({})
const addressError = ref('')
const addressFields = [
  { key: 'line1', label: 'Address line 1 *' },
  { key: 'line2', label: 'Address line 2 (optional)' },
  { key: 'city', label: 'City' },
  { key: 'county', label: 'County' },
  { key: 'postcode', label: 'Postcode *' },
]

const formatAddress = (a) =>
  [a.line1, a.line2, a.city, a.county, a.postcode].filter(Boolean).join(', ')

const openAddressEditor = (addr) => {
  addressError.value = ''
  editingAddress.value = addr
    ? { ...addr }
    : { label: 'Current address', line1: '', postcode: '' }
  isAddressDrawerOpen.value = true
}

// The backend's DTO only checks these are strings, not that they're
// non-empty, so it happily accepts (and silently stores) a blank line1/
// postcode - which then reads back as a useless address. Enforced here
// instead, with a real inline message rather than a round trip.
const saveAddress = async () => {
  addressError.value = ''
  if (!editingAddress.value.line1?.trim() || !editingAddress.value.postcode?.trim()) {
    addressError.value = 'Address line 1 and postcode are required.'
    return
  }
  saving.value = true
  try {
    editingAddress.value.label ||= 'Current address'
    if (editingAddress.value.id)
      await updateAddress(editingAddress.value.id, editingAddress.value)
    else await createAddress(editingAddress.value)
    isAddressDrawerOpen.value = false
    showToast({ message: 'Address saved.' })
  } catch (err) {
    addressError.value = describeApiError(err, 'Could not save address. Try again.')
    showToast({ message: addressError.value, variant: 'error' })
  } finally {
    saving.value = false
  }
}
const handleDeleteAddress = async (id) => {
  await deleteAddress(id)
}

// ── Hero ────────────────────────────────────────────────────────
const initials = computed(() => {
  const f = profile.value?.firstName?.[0] ?? ''
  const l = profile.value?.lastName?.[0] ?? ''
  return (
    (f + l).toUpperCase() || (profile.value?.email?.[0] ?? '?').toUpperCase()
  )
})

// Each step reuses the same artwork as the card it sends you to, so the
// checklist and the cards above read as the same thing. profileCompletion
// is derived directly from this list (below) so the hero's % and the
// checklist can never drift apart the way they used to (the % used to
// check 6 fields while the checklist showed 7, company/solicitor among
// them - both now dropped from the profile page entirely, client feedback
// 2026-09-30).
const completionSteps = computed(() => [
  { label: 'Add full name', art: '/build/people.png', done: !!profile.value?.firstName },
  { label: 'Add email address', art: '/build/email.png', done: !!profile.value?.email },
  { label: 'Add phone number', art: '/build/phone.png', done: !!profile.value?.phone },
  { label: 'Add current address', art: '/op-icons/matched-buyers/pin.png', done: !!profile.value?.addresses?.length },
  { label: 'Verify your identity', art: '/build/shield.png', done: !!profile.value?.isVerified },
])

const profileCompletion = computed(() => {
  const steps = completionSteps.value
  return Math.round((steps.filter((s) => s.done).length / steps.length) * 100)
})

const ringStyle = computed(() => ({
  background: `conic-gradient(#00a19a ${profileCompletion.value * 3.6}deg, #e6eef2 0deg)`,
}))

</script>

<style scoped>
.pi-shell {
  --fx-aqua: #00a19a;
  --fx-blue: #2f9bdf;
  --fx-indigo: #4f4ff2;
  /* Unified brand color — solid teal, used across CTAs, avatar, toggles, popups */
  --fx-grad: #00a19a;
  --fx-text: #1f2b3f;
  --fx-muted: #6f8199;
  min-height: 100dvh;
  background: #f3f2ef;
  color: var(--fx-text);
  font-family: 'Plus Jakarta Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* match landing-page cream navbar on this page */
.pi-shell :deep(.bpnav) {
  background: rgba(243, 242, 239, 0.88);
  border-bottom: 1px solid rgba(40, 95, 150, 0.08);
}

/* Body */
.pi-body { width: min(1280px, calc(100% - 64px)); margin: 0 auto; padding: 32px 0 70px; }

/* ── Welcome hero banner ───────────────────────────────────────── */
.pi-welcome {
  display: grid;
  grid-template-columns: auto 1.6fr 1fr;
  align-items: center;
  gap: 28px;
  border-radius: 24px;
  padding: 26px 30px;
  margin-bottom: 26px;
  background: linear-gradient(120deg, #e8f7f2 0%, #eef3ff 55%, #f1ecfe 100%);
  border: 1px solid #e6eef8;
  box-shadow: 0 14px 38px rgba(15, 44, 76, 0.06);
}
.pi-welcome-greet { font-size: 15px; font-weight: 700; color: #2a4055; margin-bottom: 2px; }
.pi-wave { display: inline-block; }
.pi-welcome-title { font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #231d45; line-height: 1.1; margin-bottom: 6px; }
.pi-welcome-sub { font-size: 14px; color: #5f7488; line-height: 1.5; max-width: 320px; }
.pi-welcome-prog { min-width: 0; }
.pi-wp-label { font-size: 12.5px; font-weight: 700; color: #5f7488; margin-bottom: 4px; }
.pi-wp-pct { font-size: 30px; font-weight: 800; color: #00a19a; letter-spacing: -0.5px; line-height: 1; margin-bottom: 10px; }
.pi-wp-hint { font-size: 12px; color: #6f8398; line-height: 1.5; margin-top: 8px; }

/* ── Card grids ────────────────────────────────────────────────── */
.pi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-bottom: 22px; }

.pi-card {
  border-radius: 20px; background: #fff; border: 1px solid #e8eef5;
  box-shadow: 0 10px 30px rgba(15, 44, 76, 0.05); padding: 22px 22px 18px;
  display: flex; flex-direction: column;
}
.pi-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.pi-card-titlewrap { display: flex; align-items: center; gap: 11px; min-width: 0; }
.pi-card-ic { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pi-card-ic :deep(svg) { width: 20px; height: 20px; }
/* Chips that carry the 3D artwork instead of a flat glyph: the art needs a
   plain backdrop, so the chip drops its tint and keeps only a soft border.
   Two classes deep so it beats the tinted backgrounds on the base rules. */
.pi-card-ic.ic-art,
.pi-field-ic.ic-art { background: #fff; border: 1px solid #dfeae6; }
.pi-card-ic.ic-art img { width: 28px; height: 28px; object-fit: contain; }
.pi-field-ic.ic-art img { width: 25px; height: 25px; object-fit: contain; }
.pi-card-title { font-size: 16px; font-weight: 800; color: #231d45; letter-spacing: -0.3px; }
.pi-card-desc { font-size: 13px; color: #6f8398; line-height: 1.45; margin-bottom: 14px; }
.pi-card-desc.tight { margin: 2px 0 0; }

/* Field list (personal info) */
.pi-fieldlist { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.pi-field {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
  background: #f9fbfe; border: 1px solid #eef3f9; border-radius: 14px; padding: 11px 13px;
  cursor: pointer; font-family: inherit; transition: border-color 0.16s, background 0.16s;
}
.pi-field:hover { border-color: #cfe0f1; background: #f4f9ff; }
.pi-field--locked { cursor: default; }
.pi-field--locked:hover { border-color: #eef3f9; background: #f9fbfe; }
.pi-field-ic { width: 34px; height: 34px; border-radius: 10px; background: #eaf0ff; color: #5b6ef0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pi-field-ic :deep(svg) { width: 17px; height: 17px; }
.pi-field-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pi-field-label { font-size: 11px; font-weight: 700; color: #8195aa; }
.pi-field-value { font-size: 14px; font-weight: 700; color: #16314a; word-break: break-word; }
.pi-field-value.empty { color: #00a19a; }
.pi-field-edit { width: 16px; height: 16px; color: #9fb0c2; flex-shrink: 0; }

.pi-card-note {
  display: flex; align-items: center; gap: 8px; margin-top: 14px;
  font-size: 12px; font-weight: 600; color: #2f7d6f; background: #e9f6f1;
  border-radius: 11px; padding: 9px 12px;
}
.pi-card-note-ic { width: 22px; height: 22px; flex-shrink: 0; object-fit: contain; }

/* Identity verification */
.pi-card-verify { text-align: center; }
.pi-card-completion { text-align: center; }
.pi-verify-body { display: flex; flex-direction: column; align-items: center; flex: 1; justify-content: center; padding: 6px 0; }
/* Unverified is the "needs your attention" amber used by the Add pills above;
   green is reserved for the state that has actually passed. */
.pi-verify-badge { width: 76px; height: 76px; border-radius: 50%; background: #fdf3e0; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.pi-verify-badge-ic { width: 38px; height: 38px; color: #c98a1e; }
.pi-verify-badge.done { background: #d8f3e3; }
.pi-verify-badge.done .pi-verify-badge-ic { color: #18a558; }
.pi-verify-title { font-size: 17px; font-weight: 800; color: #231d45; margin-bottom: 6px; }
.pi-verify-sub { font-size: 12.5px; color: #6f8398; line-height: 1.5; max-width: 240px; margin-bottom: 16px; }
.pi-verify-btn {
  width: 100%; height: 46px; border-radius: 12px; border: none; cursor: pointer;
  background: var(--fx-grad); color: #fff; text-decoration: none;
  font-family: inherit; font-size: 14px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.26); transition: transform 0.2s, box-shadow 0.2s;
}
.pi-verify-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 26px rgba(0, 161, 154, 0.32); }
.pi-verify-btn:disabled { opacity: 0.6; cursor: default; }
.pi-verify-btn-ic { width: 15px; height: 15px; }

/* Profile completion checklist + ring */
/* Compact vertical stack - ring above checklist, both narrower than they
   used to be side-by-side, to fit as a third column beside Personal
   Information and Identity Verification (client feedback, 2026-09-30). */
.pi-checklist { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.pi-check { display: flex; align-items: center; gap: 8px; padding: 7px 2px; border-bottom: 1px solid #f0f4f8; }
.pi-check:last-child { border-bottom: none; }
.pi-check-ic { width: 18px; height: 18px; flex-shrink: 0; object-fit: contain; }
.pi-check-label { flex: 1; font-size: 12px; font-weight: 600; color: #3c5165; }
.pi-check.done .pi-check-label { color: #16314a; }
.pi-check-state { flex-shrink: 0; font-size: 13px; font-weight: 800; color: #cbd3da; }
.pi-check-state.ok { width: 18px; height: 18px; border-radius: 50%; background: #e3f5ec; color: #18a558; display: inline-flex; align-items: center; justify-content: center; }
.pi-check-state.ok :deep(svg) { width: 12px; height: 12px; }

.pi-ring-wrap { display: flex; justify-content: center; margin-bottom: 14px; }
.pi-ring { width: 110px; height: 110px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.pi-ring-inner { width: 84px; height: 84px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px #eef3f9; }
.pi-ring-pct { font-size: 21px; font-weight: 800; color: #00a19a; letter-spacing: -0.5px; }
.pi-ring-cap { font-size: 10px; font-weight: 700; color: #6f8398; }

.pi-footnote { display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: #8195aa; padding: 8px 0; }
.pi-footnote-ic { width: 22px; height: 22px; object-fit: contain; }

.pi-avatar {
  width: 96px; height: 96px; border-radius: 50%;
  background: var(--fx-grad);
  color: #fff; display: inline-flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 800; letter-spacing: 1px;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.26);
  position: relative; border: none; cursor: pointer; font-family: inherit; flex-shrink: 0;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s;
}
.pi-avatar:hover { transform: translateY(-2px); box-shadow: 0 14px 26px rgba(0, 161, 154, 0.32); }
.pi-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.avatar-camera-mini {
  position: absolute; bottom: -1px; right: -1px;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--fx-grad);
  color: #fff; border: 3px solid #fff;
  display: flex; align-items: center; justify-content: center;
}
.avatar-camera-svg { width: 14px; height: 14px; }

/* ── Drawer / popup form fields ────────────────────────────────── */
.pi-df-wrap { padding: 2px 0 4px; display: flex; flex-direction: column; gap: 16px; }
.pi-df-note { font-size: 14px; line-height: 22px; color: #7f8084; margin-bottom: 2px; }
.pi-df { display: block; }
.pi-df-label {
  display: block; font-size: 12.5px; font-weight: 700; color: #5f7488;
  letter-spacing: -0.1px; margin-bottom: 7px; padding-left: 2px;
}
.pi-df-input {
  height: 54px; border-radius: 14px; border: 1.5px solid #e6ecf2; background: #f9fbfd;
  display: flex; align-items: center; gap: 10px; padding: 0 16px;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
}
.pi-df-input:focus-within {
  border-color: #00a19a; background: #fff;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
.pi-df-ic { width: 18px; height: 18px; color: #9fb0c2; flex-shrink: 0; transition: color 0.18s; }
.pi-df-input:focus-within .pi-df-ic { color: #00a19a; }
.pi-df-input input {
  width: 100%; background: transparent; border: none; outline: none;
  font-family: inherit; font-size: 15px; font-weight: 600; color: #16314a;
}
.pi-df-input input::placeholder { color: #8a95a0; font-weight: 500; }
.pi-df-hint { margin-top: 7px; font-size: 12.5px; color: #8e8e93; padding-left: 2px; line-height: 1.45; }
.pi-df-error { margin: 10px 2px 0; font-size: 13px; font-weight: 600; color: #d9534f; }

/* Drawer CTA */
.drawer-cta {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  background: var(--fx-grad);
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  box-shadow: 0 14px 24px rgba(0, 161, 154, 0.28);
  transition:
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(0, 161, 154, 0.36);
  filter: saturate(1.04);
}
.drawer-cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-pick-row {
  width: 100%;
  height: 64px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dfe8f3;
  border-radius: 16px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(19, 51, 82, 0.06);
  transition:
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.avatar-pick-row:hover {
  transform: translateY(-2px);
  border-color: #b9d5ea;
  box-shadow: 0 14px 24px rgba(21, 58, 95, 0.12);
}
.apr-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #17314a;
  letter-spacing: -0.2px;
}

/* Big screens - scale the centred column by the shared desktop factor. */
@media (min-width: 1536px) {
  .pi-body { zoom: var(--desk-zoom); }
}

@media (max-width: 1180px) {
  /* Personal Information full-width, Identity + Completion share the row
     below it, rather than squeezing all three into one row too narrow
     for the checklist text. */
  .pi-grid { grid-template-columns: 1fr 1fr; }
  .pi-card:first-child { grid-column: 1 / -1; }
}
@media (max-width: 1000px) {
  .pi-body { padding: 28px 0 60px; }
  .pi-welcome { grid-template-columns: auto 1fr; row-gap: 22px; }
  .pi-welcome-prog { grid-column: 1 / -1; }
}
@media (max-width: 860px) {
  .pi-grid { grid-template-columns: 1fr; }
  .pi-card:first-child { grid-column: auto; }
}
@media (max-width: 760px) {
  .pi-body { width: calc(100% - 32px); padding: 24px 0 56px; }
  .pi-welcome { padding: 22px; gap: 18px; }
  .pi-welcome-title { font-size: 26px; }
  .pi-avatar { width: 80px; height: 80px; font-size: 27px; }
}
@media (max-width: 560px) {
  .pi-welcome { grid-template-columns: 1fr; text-align: center; justify-items: center; }
  .pi-welcome-sub { margin: 0 auto; }
}

@media (prefers-reduced-motion: reduce) {
  .pi-avatar,
  .pi-card,
  .pi-verify-btn,
  .drawer-cta,
  .avatar-pick-row {
    transition: none;
    animation: none;
  }
}
</style>
