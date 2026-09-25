<template>
  <BaseDrawer v-model="isOpen" title="Review your Passport">
    <div class="share-review">
      <div v-if="loading" class="share-review-state">Loading what's included…</div>

      <template v-else>
        <div class="share-review-included">
          <div class="share-review-h">
            <span class="share-review-h-ic">✓</span>
            Included in this share
          </div>
          <p class="share-review-h-s">These items will be visible to whoever gets this link.</p>

          <label
            v-for="d in allDocs"
            :key="d.id"
            class="share-review-row"
          >
            <input type="checkbox" :checked="selected.has(d.id)" @change="toggle(d.id)" />
            <span class="share-review-row-body">
              <span class="share-review-row-t">{{ d.title }}</span>
              <span class="share-review-row-s">{{ d.uploadedAt }}</span>
            </span>
          </label>

          <p v-if="!allDocs.length" class="share-review-empty">
            No documents are set to be included when you share — only your
            Passport answers will be shared.
          </p>
        </div>

        <p v-if="error" class="share-review-error">{{ error }}</p>

        <p class="share-review-note">
          Only the items checked above will be shared. Everything else stays
          in your Vault.
        </p>
      </template>
    </div>

    <template #footer>
      <button class="share-review-cta" :disabled="loading || confirming" @click="confirm">
        {{ confirming ? 'Sharing…' : 'Share Passport' }}
      </button>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import { useVaultDocuments } from '~/composables/useVaultDocuments'

const props = defineProps({
  show: { type: Boolean, default: false },
  passportId: { type: String, required: true },
})
const emit = defineEmits(['update:show', 'confirm'])

const { getSharePreview } = useVaultDocuments()

const isOpen = ref(props.show)
watch(() => props.show, (v) => { isOpen.value = v; if (v) load() })
watch(isOpen, (v) => emit('update:show', v))

const loading = ref(false)
const confirming = ref(false)
const error = ref('')
const homeRecords = ref([])
const personalDocuments = ref([])
const selected = ref(new Set())

const allDocs = computed(() => [...homeRecords.value, ...personalDocuments.value])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const preview = await getSharePreview(props.passportId)
    homeRecords.value = preview.homeRecords ?? []
    personalDocuments.value = preview.personalDocuments ?? []
    // Every included document starts checked - the owner
    // un-checks anything they don't want included in *this* send.
    selected.value = new Set(allDocs.value.map((d) => d.id))
  } catch (e) {
    error.value = e?.data?.message || 'Could not load what would be shared.'
  } finally {
    loading.value = false
  }
}

function toggle(id) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

function confirm() {
  emit('confirm', Array.from(selected.value))
}

defineExpose({ setConfirming: (v) => { confirming.value = v }, setError: (msg) => { error.value = msg } })
</script>

<style scoped>
.share-review { padding: 4px; }
.share-review-state { font-size: 13.5px; color: #6b6783; padding: 20px 0; }

.share-review-h {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 800;
  color: #15803d;
}
.share-review-h-ic {
  width: 20px; height: 20px; border-radius: 50%;
  background: #15803d; color: #fff; font-size: 11px;
  display: grid; place-items: center; flex-shrink: 0;
}
.share-review-h-s { font-size: 12.5px; color: #6b6783; margin: 4px 0 14px; }

.share-review-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 4px;
  border-bottom: 1px solid #f1f0f6;
  cursor: pointer;
}
.share-review-row:last-child { border-bottom: none; }
.share-review-row input { accent-color: #00a19a; }
.share-review-row-body { display: flex; flex-direction: column; }
.share-review-row-t { font-size: 13.5px; font-weight: 700; color: #231d45; }
.share-review-row-s { font-size: 11.5px; color: #9c98ad; margin-top: 1px; }

.share-review-empty { font-size: 12.5px; color: #6b6783; padding: 8px 0; }

.share-review-note {
  margin-top: 18px;
  font-size: 12px;
  color: #9c98ad;
  line-height: 1.5;
}

.share-review-error {
  margin-top: 12px;
  font-size: 13px;
  color: #dc2626;
}

.share-review-cta {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}
.share-review-cta:disabled { opacity: 0.6; cursor: not-allowed; }
.share-review-cta:hover:not(:disabled) { background: #00857f; }
</style>
