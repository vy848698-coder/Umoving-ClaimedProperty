<template>
  <button
    v-if="signedIn"
    type="button"
    class="pn-btn"
    :class="{ active: onCollection }"
    :aria-current="onCollection ? 'page' : undefined"
    @click="open"
  >
    Passport
  </button>
</template>

<script setup lang="ts">
// Navbar entry to the passport collection (pages/passport/collections.vue):
// every passport the user has claimed, seller or landlord.
const COLLECTION_PATH = '/passport/collections'

const route = useRoute()

// Resolved after mount — localStorage does not exist during SSR.
const signedIn = ref(false)

const onCollection = computed(() => route.path.startsWith('/passport/collections'))

function open() {
  if (!onCollection.value) navigateTo(COLLECTION_PATH)
}

onMounted(() => {
  try {
    signedIn.value = !!localStorage.getItem('token')
  } catch {
    signedIn.value = false
  }
})
</script>

<style scoped>
/* Text-only twin of the nav's "Claim Passport" button (.ppn-cta) and the
   Profile button: 42px, 11px corners, #00a19a, teal glow, lift on hover. */
.pn-btn {
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
.pn-btn:hover {
  transform: translateY(-1px);
  background: #00857f;
}
/* On the collection page itself: the darker teal, no lift. */
.pn-btn.active {
  background: #00857f;
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.28),
    0 10px 22px rgba(0, 161, 154, 0.26);
}
.pn-btn.active:hover {
  transform: none;
}
.pn-btn:focus-visible {
  outline: 2px solid #00a19a;
  outline-offset: 2px;
}

@media (max-width: 520px) {
  .pn-btn {
    padding: 0 14px;
  }
}
</style>
