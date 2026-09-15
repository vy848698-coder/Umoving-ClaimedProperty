<template>
  <div v-if="signedIn" ref="rootEl" class="pm-root">
    <button
      type="button"
      class="pm-trigger"
      :class="{ open }"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      aria-label="Profile menu"
      :title="displayName || email || 'Account'"
      @click="open = !open"
    >
      <span class="pm-label">Profile</span>
      <svg class="pm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <div v-if="open" class="pm-menu" role="menu">
      <div v-if="displayName || email" class="pm-head">
        <strong>{{ displayName || 'Your account' }}</strong>
        <span v-if="email">{{ email }}</span>
      </div>

      <button
        v-for="item in items"
        :key="item.path"
        type="button"
        role="menuitem"
        class="pm-card"
        :class="{ active: route.path === item.path }"
        @click="go(item.path)"
      >
        <span class="pm-card-img"><img :src="item.image" alt="" loading="lazy" /></span>
        <span class="pm-card-text">
          <span class="pm-card-title">{{ item.label }}</span>
          <span class="pm-card-desc">{{ item.description }}</span>
        </span>
      </button>

      <div class="pm-sep" />

      <button
        type="button"
        role="menuitem"
        class="pm-item pm-item--danger"
        :disabled="signingOut"
        @click="signOut"
      >
        <span class="pm-item-ic" v-html="signOutIcon" />
        {{ signingOut ? 'Signing out…' : 'Sign out' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSignOut } from '~/composables/useSignOut'

// Account menu for signed-in screens. Personal information and Settings are
// the only profile pages this app exposes (see utils/appFlow.ts), so they are
// the only destinations offered.
// Same artwork and copy as the profile hub's cards (public/profile new icon).
const items = [
  {
    label: 'Your Personal Information',
    description: 'Manage how we know and communicate with you.',
    path: '/profile/personal-information',
    image: '/profile%20new%20icon/personalInfomation.jpeg',
  },
  {
    label: 'Founding Homeowner certificate',
    description: 'View and download your certificate.',
    path: '/certificate',
    image: '/build/umu-passport-sm.png',
  },
  {
    label: 'Settings',
    description: 'Customize your experience, privacy, and account security.',
    path: '/profile/settings',
    image: '/profile%20new%20icon/settings.jpeg',
  },
]
const signOutIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>'

const route = useRoute()
const config = useRuntimeConfig()
const { signOut, signingOut } = useSignOut()

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
// Resolved after mount — localStorage does not exist during SSR.
const signedIn = ref(false)
const displayName = ref('')
const email = ref('')

function go(path: string) {
  open.value = false
  if (route.path !== path) navigateTo(path)
}

function onDocPointer(e: PointerEvent) {
  if (open.value && rootEl.value && !rootEl.value.contains(e.target as Node)) {
    open.value = false
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(async () => {
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onKey)

  let token: string | null = null
  try {
    token = localStorage.getItem('token')
  } catch {
    token = null
  }
  if (!token) return
  signedIn.value = true

  try {
    const p = await $fetch<any>(`${config.public.apiBase}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    displayName.value = [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim()
    email.value = p?.email ?? ''
  } catch {
    // Initials fall back to "U".
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKey)
})

watch(
  () => route.path,
  () => {
    open.value = false
  },
)
</script>

<style scoped>
.pm-root {
  position: relative;
  display: inline-flex;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Text-only twin of the nav's "Claim Passport" button (.ppn-cta) and the
   Passport button: 42px, 11px corners, #00a19a, 15px / 800, teal glow. */
.pm-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: 11px;
  background: #00a19a;
  color: #fff;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.26);
  transition: transform 0.18s, background 0.18s;
}
.pm-trigger:hover {
  transform: translateY(-1px);
  background: #00857f;
}
/* Menu open: darker teal with an inner ring, like the Passport button on its own page. */
.pm-trigger.open {
  transform: none;
  background: #00857f;
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.28),
    0 10px 22px rgba(0, 161, 154, 0.26);
}
.pm-trigger:focus-visible {
  outline: 2px solid #00a19a;
  outline-offset: 2px;
}

/* Dropdown cue: sits after the label and flips while the menu is open. The
   right padding is trimmed so the button stays optically centred. */
.pm-trigger:has(.pm-chev) {
  gap: 7px;
  padding: 0 15px 0 20px;
}
.pm-chev {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  opacity: 0.9;
  transition: transform 0.2s ease;
}
.pm-trigger.open .pm-chev {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: reduce) {
  .pm-chev {
    transition: none;
  }
}

@media (max-width: 520px) {
  .pm-trigger,
  .pm-trigger:has(.pm-chev) {
    padding: 0 12px 0 14px;
  }
}

.pm-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 6px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(35, 29, 69, 0.08);
  box-shadow: 0 18px 40px rgba(35, 29, 69, 0.16);
}

.pm-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid #eef2f6;
}
.pm-head strong {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.pm-head span {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pm-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  margin-bottom: 4px;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.pm-card:hover {
  border-color: rgba(0, 161, 154, 0.35);
  box-shadow: 0 6px 16px rgba(35, 29, 69, 0.08);
}
.pm-card.active {
  border-color: rgba(0, 161, 154, 0.45);
  background: rgba(0, 161, 154, 0.06);
}
.pm-card-img {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f6f8;
}
.pm-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pm-card-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.pm-card-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.25;
}
.pm-card-desc {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.35;
}

.pm-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #231d45;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.pm-item:hover {
  background: rgba(0, 161, 154, 0.08);
}
.pm-item.active {
  color: #00857f;
  background: rgba(0, 161, 154, 0.1);
}
.pm-item:disabled {
  opacity: 0.6;
  cursor: default;
}
.pm-item--danger {
  color: #b42318;
}
.pm-item--danger:hover {
  background: rgba(180, 35, 24, 0.07);
}

.pm-item-ic {
  width: 18px;
  height: 18px;
  display: inline-flex;
  flex-shrink: 0;
}
.pm-item-ic :deep(svg) {
  width: 18px;
  height: 18px;
}

.pm-sep {
  height: 1px;
  margin: 4px 6px;
  background: #eef2f6;
}
</style>
