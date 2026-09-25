<template>
  <div class="ct-root">
    <FlowHeader />

    <main class="ct-main">
      <div class="ct-head">
        <p class="ct-kicker">Founding Homeowner</p>
        <h1>{{ headline }}</h1>
        <p class="ct-lede">{{ lede }}</p>
      </div>

      <div v-if="loading" class="ct-state" aria-live="polite">
        <span class="ct-spinner" />
        {{ justClaimed ? 'One moment, preparing your Founding Homeowner certificate…' : 'Preparing your certificate…' }}
      </div>

      <div v-else-if="error" class="ct-state ct-state--error" role="alert">
        <strong>We couldn't show your certificate</strong>
        <span>{{ error }}</span>
        <button type="button" class="ct-btn ct-btn--ghost" @click="load()">Try again</button>
      </div>

      <template v-else-if="imageUrl">
        <div class="ct-actions">
          <!-- Only worth showing once there is something to switch between.
               Each claimed property has its own certificate: same founder
               number, that property's address and passport code. -->
          <div v-if="options.length > 1" class="ct-switch">
            <div class="ct-switch-label">
              <span>Certificate for</span>
              <span class="ct-switch-count">{{ options.length }} properties</span>
            </div>
            <div class="ct-switch-field">
              <span class="ct-switch-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 10.5 12 4l8 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <select id="ct-property" class="ct-switch-select" :value="activeId" @change="onSwitch">
                <option v-for="option in options" :key="option.id" :value="option.id">
                  {{ option.label }}{{ option.code ? ` · ${option.code}` : '' }}
                </option>
              </select>
              <span class="ct-switch-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          <div class="ct-actions-row">
            <dl v-if="details" class="ct-facts">
              <div>
                <dt>Founder number</dt>
                <dd>{{ details.founderNumberLabel }}</dd>
              </div>
              <div>
                <dt>Property</dt>
                <dd>{{ [details.addressLine1, details.addressLine2].filter(Boolean).join(', ') }}</dd>
              </div>
              <div v-if="details.passportCode">
                <dt>Passport</dt>
                <dd>{{ details.passportCode }}</dd>
              </div>
              <div>
                <dt>Claimed</dt>
                <dd>{{ details.claimedLabel }}</dd>
              </div>
            </dl>
            <div class="ct-btn-row">
              <a class="ct-btn" :class="{ 'ct-btn--ghost': nextPath }" :href="imageUrl" :download="fileName">
                Download certificate
              </a>
              <button v-if="nextPath" type="button" class="ct-btn" @click="continueOn">
                Continue to your Passport →
              </button>
            </div>
          </div>
        </div>

        <figure class="ct-figure">
          <img :src="imageUrl" :alt="`Founding Homeowner certificate for ${details?.name ?? 'you'}`" />
        </figure>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import FlowHeader from '~/components/core/FlowHeader.vue'

definePageMeta({ middleware: 'auth' })

interface CertificatePassport {
  id: string
  code: string
  label: string
  selected: boolean
}

interface CertificateDetails {
  name: string
  founderNumberLabel: string
  addressLine1: string
  addressLine2: string
  // The day this property was claimed - each certificate carries its own.
  claimedLabel: string
  passportId: string
  passportCode: string
  // Every claimed property, newest first - a user can claim more than one.
  passports: CertificatePassport[]
}

const route = useRoute()
const router = useRouter()

// Reached right after a successful claim (see pages/claim/[id].vue's
// issuePassport()), which routes here with ?justClaimed=1&next=<passport
// path> instead of straight to the passport - the "you're a Founding
// Homeowner" moment the client asked for, before the normal passport view.
const justClaimed = computed(() => route.query.justClaimed === '1')
const nextPath = computed(() => {
  const next = route.query.next
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : ''
})
function continueOn() {
  router.replace(nextPath.value)
}

// Which claim this certificate is for. Absent means "the newest one", which is
// what the endpoint picks - so arriving from the Profile menu after a second
// claim shows the second property, not the first one for ever.
const requestedId = computed(() => {
  const id = route.query.passportId
  return typeof id === 'string' && id ? id : ''
})

const loading = ref(true)
const error = ref('')
const imageUrl = ref('')
const details = ref<CertificateDetails | null>(null)

const options = computed(() => details.value?.passports ?? [])
const activeId = computed(() => details.value?.passportId ?? requestedId.value)
const multiple = computed(() => options.value.length > 1)

const headline = computed(() => {
  if (!justClaimed.value) return 'Your certificate'
  // The "first 1,000,000" welcome belongs to the claim that made them a
  // Founding Homeowner. On a later property they already are one.
  return multiple.value
    ? 'Your certificate for this property'
    : 'You did it! Welcome to the first 1,000,000'
})

const lede = computed(() => {
  if (justClaimed.value) {
    return multiple.value
      ? "Your new Passport is claimed, and this certificate now carries its address. We've emailed you a copy."
      : "You're officially a Founding Homeowner. We've also emailed you a copy of this certificate."
  }
  return multiple.value
    ? 'Built from your profile and the property you pick below, each dated the day you claimed it. Your founder number stays the same for every one.'
    : 'Built from your profile and your claimed property, so it always shows your current name.'
})

// Switching property re-requests everything, so the image and the facts can
// never be left showing a different claim from the one selected.
function onSwitch(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  if (!id || id === activeId.value) return
  // The just-claimed welcome and its "continue to your Passport" button belong
  // to the claim that was arrived with, so they don't survive a switch.
  router.replace({ query: { passportId: id } })
  load(id)
}

const fileName = computed(() => {
  const num = details.value?.founderNumberLabel.replace('#', '') ?? 'certificate'
  // Without the passport code, every property a user claims would download over
  // the last one - same founder number, same file name.
  const code = details.value?.passportCode?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? ''
  return `umovingu-founding-homeowner-${num}${code ? `-${code}` : ''}.jpg`
})

function revoke() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = ''
}

async function load(passportId = requestedId.value) {
  loading.value = true
  error.value = ''
  revoke()
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    // Both requests name the same passport, so the picture can never be of one
    // property while the facts beside it describe another. Details first: that
    // request assigns the founder number, so the image never races it.
    const query = passportId ? { passportId } : {}
    details.value = await $fetch<CertificateDetails>('/api/certificate/me', {
      headers,
      query: { ...query, format: 'json' },
    })
    const blob = await $fetch<Blob>('/api/certificate/me', {
      headers,
      // Whatever the details came back for - so an absent passportId resolves
      // to the same newest claim in both requests even if one is claimed in
      // between.
      query: { passportId: details.value.passportId },
      responseType: 'blob',
    })
    imageUrl.value = URL.createObjectURL(blob)
  } catch (err: any) {
    error.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      'Check your connection and try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
onBeforeUnmount(revoke)
</script>

<style scoped>
.ct-root {
  min-height: 100dvh;
  background: #f3f2ef;
  color: #231d45;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.ct-main {
  width: min(980px, calc(100% - 32px));
  margin: 0 auto;
  padding-block: 32px 64px;
  display: grid;
  gap: 20px;
}

.ct-head {
  display: grid;
  gap: 6px;
}
.ct-kicker {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #00857f;
}
.ct-head h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0d1835;
}
.ct-lede {
  margin: 0;
  max-width: 60ch;
  color: #5b6d89;
  font-size: 14.5px;
}

.ct-actions {
  display: grid;
  gap: 14px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
}

.ct-actions-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ct-switch {
  display: grid;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eef1f5;
}
.ct-switch-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8a94a6;
}
.ct-switch-count {
  color: #00857f;
  letter-spacing: 0.06em;
}

.ct-switch-field {
  position: relative;
  max-width: 460px;
  display: flex;
  align-items: center;
  height: 48px;
  border: 1px solid #d8e3ee;
  border-radius: 12px;
  background: #fbfdff;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}
.ct-switch-field:hover {
  border-color: #b9d4e6;
  background: #fff;
}
.ct-switch-field:focus-within {
  border-color: #00a19a;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.14);
}

.ct-switch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 14px;
  color: #00857f;
  flex-shrink: 0;
}
.ct-switch-icon svg {
  width: 100%;
  height: 100%;
}

.ct-switch-select {
  appearance: none;
  -webkit-appearance: none;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 38px 0 10px;
  border: 0;
  background: transparent;
  color: #0d1835;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.ct-switch-select:focus-visible {
  outline: none;
}

.ct-switch-chevron {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #8a94a6;
  pointer-events: none;
}
.ct-switch-chevron svg {
  width: 100%;
  height: 100%;
}

.ct-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ct-facts {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
}
.ct-facts div {
  display: grid;
  gap: 2px;
}
.ct-facts dt {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8a94a6;
}
.ct-facts dd {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0d1835;
  font-variant-numeric: tabular-nums;
}

.ct-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  background: #00857f;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.18s;
}
.ct-btn:hover {
  background: #00736e;
}
.ct-btn:focus-visible {
  outline: 2px solid #00a19a;
  outline-offset: 2px;
}
.ct-btn--ghost {
  background: #fff;
  color: #0c2342;
  border: 1px solid #d8e3ee;
}
.ct-btn--ghost:hover {
  background: #f8fbff;
}

.ct-figure {
  margin: 0;
  background: #fff;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  padding: 12px;
}
.ct-figure img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.ct-state {
  display: grid;
  justify-items: start;
  gap: 8px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  color: #5b6d89;
  font-size: 14px;
}
.ct-state strong {
  color: #0d1835;
  font-size: 15px;
}
.ct-state--error {
  border-color: rgba(180, 35, 24, 0.25);
}

.ct-spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2.5px solid rgba(0, 133, 127, 0.2);
  border-top-color: #00857f;
  animation: ct-spin 0.8s linear infinite;
}
@keyframes ct-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ct-spinner {
    animation-duration: 2.4s;
  }
}
/* Big screens - scale the centred column by the shared desktop factor. */
@media (min-width: 1536px) {
  .ct-main { zoom: var(--desk-zoom); }
}
</style>
