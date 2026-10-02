<template>
  <div class="jn-root">
    <header class="jn-nav">
      <div class="jn-shell jn-nav-inner">
        <button class="jn-brand" type="button" @click="navigateTo(FLOW_HOME)">
          <img src="/op-icons/logo.png" alt="" class="jn-brand-logo" />
          <span>umovingu</span>
        </button>
        <div class="jn-actions">
          <ProfileMenu />
        </div>
      </div>
    </header>

    <main class="jn-shell jn-main">
      <button type="button" class="in-back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div class="jn-head">
        <h1>What brings you to Umovingu?</h1>
        <p>Choose as many as you like. You can change these later.</p>
      </div>

      <div class="in-grid">
        <button
          v-for="opt in INTEREST_OPTIONS"
          :key="opt.id"
          type="button"
          class="in-card"
          :class="{ selected: selected.has(opt.id) }"
          @click="toggle(opt.id)"
        >
          <span class="in-check" aria-hidden="true">
            <svg v-if="selected.has(opt.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <img :src="opt.image" alt="" class="in-card-ic" />
          <span class="in-card-label">{{ opt.label }}</span>
        </button>
      </div>

      <div class="in-field">
        <label class="in-field-label" for="in-area">Area of interest <span>(optional)</span></label>
        <div class="in-field-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <input
            id="in-area"
            v-model="areaInput"
            type="text"
            placeholder="Town, city or postcode"
            @input="onAreaInput"
            @keydown.enter.prevent="commitAreaFreeText"
            @keydown.backspace="onAreaBackspace"
            @focus="areaDropdownOpen = areaSuggestions.length > 0"
          />
        </div>

        <div v-if="areaDropdownOpen && areaSuggestions.length" class="in-area-drop">
          <div
            v-for="s in areaSuggestions"
            :key="s.kind + s.value"
            class="in-area-drop-item"
            @mousedown.prevent="addArea(s.value)"
          >
            <span class="in-area-drop-ic">{{ s.kind === 'postcode' ? '📮' : '🏙️' }}</span>
            <span class="in-area-drop-text">
              <strong>{{ s.value }}</strong>
              <span v-if="s.sub" class="in-area-drop-sub">{{ s.sub }}</span>
            </span>
          </div>
        </div>

        <div v-if="areas.length" class="in-area-chips">
          <button
            v-for="(loc, i) in areas"
            :key="loc"
            type="button"
            class="in-area-chip"
            @click="removeArea(i)"
          >
            {{ loc }} <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>

      <div class="in-footer">
        <label class="in-checkbox">
          <input v-model="emailOptIn" type="checkbox" />
          <span class="in-checkbox-box"></span>
          <span class="in-checkbox-text">
            Email me when features related to my interests become available.
            <small>You can change this at any time.</small>
          </span>
        </label>

        <button type="button" class="jn-btn jn-btn--solid in-save" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save my interests' }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ProfileMenu from '~/components/core/ProfileMenu.vue'
import { FLOW_HOME } from '~/utils/appFlow'
import { saveInterests, loadInterests, fetchInterests, INTEREST_OPTIONS } from '~/composables/useInterests'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({
  middleware: 'auth',
  title: 'What brings you to Umovingu?',
})

const router = useRouter()
const { showToast } = useAppToast()
const existing = loadInterests()
const selected = ref<Set<string>>(new Set(existing?.interestIds ?? []))
const areas = ref<string[]>(existing?.areas ?? [])
const emailOptIn = ref(existing?.emailOptIn ?? false)
const saving = ref(false)

// Local cache pre-fills instantly; refresh from the backend in case the
// user last saved on a different device.
onMounted(async () => {
  const remote = await fetchInterests()
  if (remote) {
    selected.value = new Set(remote.interestIds)
    areas.value = remote.areas
    emailOptIn.value = remote.emailOptIn
  }
})

function toggle(id: string) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function goBack() {
  router.back()
}

// Town/city/postcode multi-select, same postcodes.io-backed chip picker as
// preferences.vue's location question (client feedback, 2026-09-29).
interface AreaSuggestion {
  kind: 'postcode' | 'place'
  value: string
  sub?: string
}
const areaInput = ref('')
const areaSuggestions = ref<AreaSuggestion[]>([])
const areaDropdownOpen = ref(false)
let areaDebounce: ReturnType<typeof setTimeout> | null = null

function onAreaInput() {
  if (areaDebounce) clearTimeout(areaDebounce)
  const q = areaInput.value.trim()
  if (q.length < 2) {
    areaSuggestions.value = []
    areaDropdownOpen.value = false
    return
  }
  areaDebounce = setTimeout(() => fetchAreaSuggestions(q), 250)
}

async function fetchAreaSuggestions(q: string) {
  const results: AreaSuggestion[] = []
  try {
    if (/^[A-Za-z]{1,2}\d/.test(q)) {
      const r: any = await $fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(q)}/autocomplete`,
      )
      for (const pc of (r?.result ?? []).slice(0, 6)) {
        results.push({ kind: 'postcode', value: String(pc).toUpperCase() })
      }
    }
    const places: any = await $fetch(
      `https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=6`,
    )
    for (const p of places?.result ?? []) {
      const name = p.name_1 || p.name
      if (!name) continue
      results.push({
        kind: 'place',
        value: name,
        sub: p.county_unitary || p.region || p.country,
      })
    }
  } catch {
    // Best-effort — leave whatever was collected before the failure.
  }

  const seen = new Set<string>()
  areaSuggestions.value = results
    .filter((r) => {
      const key = r.value.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
  areaDropdownOpen.value = areaSuggestions.value.length > 0
}

function addArea(value: string) {
  const trimmed = value.trim()
  if (trimmed && !areas.value.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
    areas.value = [...areas.value, trimmed]
  }
  areaInput.value = ''
  areaSuggestions.value = []
  areaDropdownOpen.value = false
}

function removeArea(index: number) {
  areas.value = areas.value.filter((_, i) => i !== index)
}

function commitAreaFreeText() {
  const first = areaSuggestions.value[0]
  addArea(first ? first.value : areaInput.value)
}

function onAreaBackspace(e: KeyboardEvent) {
  if (areaInput.value === '' && areas.value.length) {
    e.preventDefault()
    areas.value = areas.value.slice(0, -1)
  }
}

async function save() {
  saving.value = true
  try {
    await saveInterests({
      interestIds: Array.from(selected.value),
      areas: areas.value,
      emailOptIn: emailOptIn.value,
    })
    await navigateTo('/onboarding/member')
  } catch (err: any) {
    showToast({
      message:
        err?.data?.message || err?.message || "Couldn't save your interests. Please try again.",
      variant: 'error',
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.jn-root {
  min-height: 100dvh;
  color: #231d45;
  background: #fefcfa;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.jn-shell {
  width: min(1100px, calc(100% - 48px));
  margin: 0 auto;
}
.jn-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(254, 252, 250, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(35, 29, 69, 0.07);
}
.jn-nav-inner {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.jn-brand {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0d1835;
  cursor: pointer;
  font-size: 20px;
  font-weight: 800;
  font-family: inherit;
}
.jn-brand-logo { width: 28px; height: 28px; object-fit: contain; }

.jn-main { padding: 40px 0 80px; }

.in-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #00a19a;
  padding: 0;
  margin-bottom: 24px;
}
.in-back svg { width: 17px; height: 17px; }

.jn-head { text-align: center; }
.jn-head h1 {
  margin: 0 0 10px;
  font-size: clamp(28px, 3.6vw, 40px);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #231d45;
  line-height: 1.1;
}
.jn-head p {
  margin: 0;
  font-size: 16px;
  color: #8b90b3;
  font-weight: 500;
}

.in-grid {
  margin-top: 36px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.in-card {
  position: relative;
  padding: 28px 20px 24px;
  background: #fff;
  border: 1.5px solid #eef0f5;
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(17, 52, 88, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.in-card:hover { border-color: #b9e6e1; }
.in-card.selected {
  border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}

.in-check {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #d8e3ee;
  background: #fff;
  display: grid;
  place-items: center;
  color: #fff;
}
.in-card.selected .in-check {
  background: #00a19a;
  border-color: #00a19a;
}
.in-check svg { width: 13px; height: 13px; }

.in-card-ic { width: 108px; height: 108px; object-fit: contain; margin-bottom: 14px; }
.in-card-label { font-size: 15.5px; font-weight: 800; color: #231d45; line-height: 1.3; }

.in-field { margin-top: 32px; position: relative; }
.in-field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
}
.in-field-label span { font-weight: 500; color: #9aa0bd; }
.in-field-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: #fff;
}
.in-field-wrap svg { width: 18px; height: 18px; color: #9aa0bd; flex-shrink: 0; }
.in-field-wrap input {
  flex: 1;
  border: 0;
  outline: 0;
  font-family: inherit;
  font-size: 15px;
  color: #231d45;
  background: transparent;
}

.in-area-drop {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #cceeea;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.12);
  z-index: 30;
  max-height: 280px;
  overflow-y: auto;
}
.in-area-drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f1f6f5;
  transition: background 0.12s;
}
.in-area-drop-item:last-child { border-bottom: none; }
.in-area-drop-item:hover { background: #f2faf8; }
.in-area-drop-ic { font-size: 14px; flex-shrink: 0; }
.in-area-drop-text { display: flex; flex-direction: column; min-width: 0; }
.in-area-drop-text strong { font-size: 13px; font-weight: 700; color: #231d45; }
.in-area-drop-sub { font-size: 11px; color: #9aa0bd; margin-top: 1px; }

.in-area-chips {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.in-area-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
  background: #00a19a;
  border: 1.5px solid #00a19a;
  border-radius: 999px;
  padding: 8px 13px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.25);
}
.in-area-chip span { opacity: 0.8; }

.in-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}
.in-checkbox input { position: absolute; opacity: 0; width: 0; height: 0; }
.in-checkbox-box {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border: 1.5px solid #d8e3ee;
  border-radius: 6px;
  background: #fff;
  position: relative;
}
.in-checkbox input:checked + .in-checkbox-box {
  background: #00a19a;
  border-color: #00a19a;
}
.in-checkbox input:checked + .in-checkbox-box::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.in-checkbox-text {
  font-size: 14px;
  font-weight: 600;
  color: #4a4a6a;
}
.in-checkbox-text small {
  display: block;
  font-weight: 500;
  color: #9aa0bd;
  margin-top: 2px;
}

.in-footer {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.in-save { width: auto; padding: 0 26px; flex-shrink: 0; }

.jn-btn {
  height: 52px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.jn-btn svg { width: 17px; height: 17px; }
.jn-btn--solid {
  border: 0;
  background: linear-gradient(135deg, #00a19a 0%, #00b8ae 100%);
  color: #fff;
  box-shadow: 0 12px 26px rgba(0, 161, 154, 0.28);
}
.jn-btn--solid:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(0, 161, 154, 0.34); }
.jn-btn--solid:disabled { opacity: 0.75; cursor: default; }

@media (max-width: 900px) {
  .in-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .in-grid { grid-template-columns: 1fr; }
  .in-footer { flex-direction: column; align-items: stretch; }
  .in-save { width: 100%; }
}
</style>
