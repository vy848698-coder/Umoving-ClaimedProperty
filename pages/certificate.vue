<template>
  <div class="ct-root">
    <FlowHeader />

    <main class="ct-main">
      <div class="ct-head">
        <p class="ct-kicker">Founding Homeowner</p>
        <h1>Your certificate</h1>
        <p class="ct-lede">
          Built from your profile and your claimed property, so it always shows
          your current name.
        </p>
      </div>

      <div v-if="loading" class="ct-state" aria-live="polite">
        <span class="ct-spinner" />
        Preparing your certificate…
      </div>

      <div v-else-if="error" class="ct-state ct-state--error" role="alert">
        <strong>We couldn't show your certificate</strong>
        <span>{{ error }}</span>
        <button type="button" class="ct-btn ct-btn--ghost" @click="load">Try again</button>
      </div>

      <template v-else-if="imageUrl">
        <div class="ct-actions">
          <dl v-if="details" class="ct-facts">
            <div>
              <dt>Founder number</dt>
              <dd>{{ details.founderNumberLabel }}</dd>
            </div>
            <div>
              <dt>Property</dt>
              <dd>{{ [details.addressLine1, details.addressLine2].filter(Boolean).join(', ') }}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{{ details.joinedLabel }}</dd>
            </div>
          </dl>
          <a class="ct-btn" :href="imageUrl" :download="fileName">Download certificate</a>
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

interface CertificateDetails {
  name: string
  founderNumberLabel: string
  addressLine1: string
  addressLine2: string
  joinedLabel: string
}

const loading = ref(true)
const error = ref('')
const imageUrl = ref('')
const details = ref<CertificateDetails | null>(null)

const fileName = computed(() => {
  const num = details.value?.founderNumberLabel.replace('#', '') ?? 'certificate'
  return `umovingu-founding-homeowner-${num}.jpg`
})

function revoke() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = ''
}

async function load() {
  loading.value = true
  error.value = ''
  revoke()
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    // Details first: this assigns the founder number, so the image request
    // that follows never races it.
    details.value = await $fetch<CertificateDetails>('/api/certificate/me', {
      headers,
      query: { format: 'json' },
    })
    const blob = await $fetch<Blob>('/api/certificate/me', { headers, responseType: 'blob' })
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

onMounted(load)
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
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
</style>
