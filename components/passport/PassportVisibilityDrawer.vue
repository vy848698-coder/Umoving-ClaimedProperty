<template>
  <BaseDrawer v-model="isOpen" title="Passport visibility">
    <div class="pv">
      <div class="pv-current">
        Current setting: <strong>{{ current ? 'Public' : 'Private' }}</strong>.
        Sharing with a named person is separate from publishing the passport.
      </div>

      <label class="pv-option" :class="{ 'pv-option--active': selected === false }">
        <input type="radio" name="pv-visibility" :checked="selected === false" @change="selected = false" />
        <span>
          <b>Private</b>
          <small>Only you and people you explicitly invite can see the information you choose to share.</small>
        </span>
      </label>

      <label class="pv-option" :class="{ 'pv-option--active': selected === true }">
        <input type="radio" name="pv-visibility" :checked="selected === true" @change="selected = true" />
        <span>
          <b>Public passport</b>
          <small>Publish the documents and answers you've marked "Published" in your Vault. Everything else stays private.</small>
        </span>
      </label>

      <div v-if="selected" class="pv-preview">
        <div class="pv-preview-h">What would be public</div>
        <div v-if="loading" class="pv-preview-state">Loading…</div>
        <template v-else>
          <div v-for="d in publicDocs" :key="d.id" class="pv-preview-row">
            <Icon name="i-lucide-file-text" class="pv-preview-ic" />
            {{ d.title }}
          </div>
          <p v-if="!publicDocs.length" class="pv-preview-empty">
            Nothing is marked "Published" in your Vault yet — going public now
            would show your passport with no documents or answers attached.
          </p>
          <p class="pv-preview-note">
            Manage which items are "Published" from your Vault before confirming.
          </p>
        </template>
      </div>

      <p v-if="error" class="pv-error">{{ error }}</p>
      <p v-if="result" class="pv-result">{{ result }}</p>
    </div>

    <template #footer>
      <button class="pv-cta" :disabled="saving || selected === current" @click="save">
        {{ saving ? 'Saving…' : 'Save visibility' }}
      </button>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import { usePassportVisibility } from '~/composables/usePassportVisibility'
import { useVaultDocuments } from '~/composables/useVaultDocuments'

const props = defineProps({
  show: { type: Boolean, default: false },
  passportId: { type: String, required: true },
})
const emit = defineEmits(['update:show', 'saved'])

const { getVisibility, setVisibility } = usePassportVisibility()
const { getPassportVault } = useVaultDocuments()

const isOpen = ref(props.show)
watch(() => props.show, (v) => { isOpen.value = v; if (v) load() })
watch(isOpen, (v) => emit('update:show', v))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const result = ref('')
// Owner's standing state vs. the radio choice they're previewing — kept
// separate so switching the radio to preview "what would be public" never
// silently changes anything until Save is pressed.
const current = ref(false)
const selected = ref(false)
const publicDocs = ref([])

async function load() {
  loading.value = true
  error.value = ''
  result.value = ''
  try {
    const [visibility, vault] = await Promise.all([
      getVisibility(props.passportId),
      getPassportVault(props.passportId),
    ])
    current.value = !!visibility.publicVisibility
    selected.value = current.value
    publicDocs.value = [...(vault.homeRecords ?? []), ...(vault.personalDocuments ?? [])].filter(
      (d) => d.accessLevel === 'PUBLISHED',
    )
  } catch (e) {
    error.value = e?.data?.message || 'Could not load your current visibility.'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (selected.value === current.value) return
  saving.value = true
  error.value = ''
  result.value = ''
  try {
    const updated = await setVisibility(props.passportId, selected.value)
    current.value = !!updated.publicVisibility
    result.value = current.value
      ? 'Your passport is now public.'
      : 'Your passport is now private.'
    emit('saved', current.value)
  } catch (e) {
    error.value = e?.data?.message || 'Could not update your visibility. Try again.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.pv { padding: 4px; display: grid; gap: 14px; }

.pv-current {
  font-size: 13px;
  line-height: 1.45;
  color: #5b6d89;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
}
.pv-current strong { color: #0d1835; }

.pv-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.pv-option:hover { border-color: #b9d4e6; }
.pv-option--active {
  border-color: #00a19a;
  background: #f0fdfa;
}
.pv-option input { margin-top: 3px; accent-color: #00a19a; }
.pv-option b { display: block; font-size: 14px; font-weight: 800; color: #0d1835; }
.pv-option small { display: block; margin-top: 2px; font-size: 12.5px; line-height: 1.4; color: #5b6d89; }

.pv-preview {
  padding: 14px;
  background: #fff8ea;
  border: 1px solid #f0e2bd;
  border-radius: 12px;
}
.pv-preview-h {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a5f0a;
  margin-bottom: 8px;
}
.pv-preview-state { font-size: 13px; color: #6b6783; }
.pv-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13.5px;
  color: #231d45;
  border-bottom: 1px solid rgba(138, 95, 10, 0.12);
}
.pv-preview-row:last-of-type { border-bottom: 0; }
.pv-preview-ic { width: 15px; height: 15px; flex-shrink: 0; color: #8a5f0a; }
.pv-preview-empty {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #8a5f0a;
}
.pv-preview-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: #8a8467;
}

.pv-error { margin: 0; font-size: 13px; color: #b42318; }
.pv-result { margin: 0; font-size: 13px; color: #00857f; font-weight: 700; }

.pv-cta {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 12px;
  background: #00857f;
  color: #fff;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.18s, opacity 0.18s;
}
.pv-cta:hover:not(:disabled) { background: #00736e; }
.pv-cta:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
