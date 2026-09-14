<template>
  <button
    v-if="signedIn"
    type="button"
    class="pn-btn"
    :class="{ active: onCollection }"
    :aria-current="onCollection ? 'page' : undefined"
    :title="countLabel"
    @click="open"
  >
    <img src="/build/umu-passport-sm.png" alt="" class="pn-book" />
    <span class="pn-label">Passport</span>
    <span v-if="count > 0" class="pn-count" :aria-label="countLabel">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
// Navbar entry to the passport collection (pages/passport/collections.vue):
// every passport the user has claimed, seller or landlord. The badge counts
// them so a newly claimed property is visibly "in there".
const COLLECTION_PATH = '/passport/collections'

const route = useRoute()
const config = useRuntimeConfig()

// Resolved after mount — localStorage does not exist during SSR.
const signedIn = ref(false)
const count = ref(0)

const onCollection = computed(() => route.path.startsWith('/passport/collections'))
const countLabel = computed(() =>
  count.value === 1 ? '1 Passport' : `${count.value} Passports`,
)

function open() {
  if (!onCollection.value) navigateTo(COLLECTION_PATH)
}

async function loadCount() {
  let token: string | null = null
  try {
    token = localStorage.getItem('token')
  } catch {
    token = null
  }
  if (!token) return
  signedIn.value = true

  try {
    // Every passport the user owns, any type - the same list the collection
    // page is built from.
    const passports = await $fetch<unknown[]>(`${config.public.apiBase}/profile/passports`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    count.value = Array.isArray(passports) ? passports.length : 0
  } catch {
    // Button still works without the badge.
  }
}

onMounted(loadCount)
// Claiming navigates straight to the new passport, so refresh on route
// changes to pick it up.
watch(() => route.path, loadCount)
</script>

<style scoped>
/* Same 42px / 10px-corner outline as the nav's Back button. */
.pn-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 12px 0 10px;
  border-radius: 10px;
  border: 1px solid #d8e3ee;
  background: #fff;
  color: #0c2342;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}
.pn-btn:hover {
  border-color: #9fd6d1;
  background: #f6fbfb;
}
.pn-btn.active {
  border-color: rgba(0, 133, 127, 0.45);
  background: rgba(0, 161, 154, 0.08);
  color: #00665f;
}
.pn-btn:focus-visible {
  outline: 2px solid #00a19a;
  outline-offset: 2px;
}

.pn-book {
  width: 17px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

.pn-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 6px;
  display: inline-grid;
  place-items: center;
  background: #00857f;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

/* Phones: book + count only, so the nav row fits. */
@media (max-width: 520px) {
  .pn-label {
    display: none;
  }
  .pn-btn {
    padding: 0 8px;
  }
}
</style>
