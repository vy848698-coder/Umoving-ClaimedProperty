<template>
  <div class="address-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <!-- The property was claimed, so the address / UPRN / title number are
         already known and won't change - shown read-only for confirmation
         rather than as an editable field. -->
    <div class="addr-confirm">
      <div class="addr-confirm-line">{{ displayAddress || 'Address on file' }}</div>
      <div class="uprn-panel">
        <div class="uprn-panel-h">From HM Land Registry &amp; Ordnance Survey</div>
        <template v-if="hasKnownRefs">
          <div v-if="facts.uprn" class="uprn-row">
            <span class="uprn-label">UPRN</span>
            <span class="uprn-val">{{ facts.uprn }}</span>
          </div>
          <div v-if="facts.titleNumber" class="uprn-row">
            <span class="uprn-label">Title number</span>
            <span class="uprn-val">{{ facts.titleNumber }}</span>
          </div>
          <div v-if="facts.propertyType" class="uprn-row">
            <span class="uprn-label">Type</span>
            <span class="uprn-val">{{ facts.propertyType }}</span>
          </div>
        </template>
        <div v-else class="uprn-empty">
          UPRN and title number are still being confirmed. We'll add them
          once the property has been through Land Registry lookup.
        </div>
      </div>
      <p class="addr-confirm-note">
        Something not right? Your solicitor can correct the record during the
        transaction.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: String, default: '' },
  propertyFacts: { type: Object, default: null },
})
const emit = defineEmits(['update'])

const facts = computed(() => props.propertyFacts || {})

const knownAddress = computed(() => {
  const f = facts.value
  return [f.addressLine1, f.city, f.postcode].filter(Boolean).join(', ')
})

// Prefer what's already saved as the answer; fall back to the known
// property address.
const displayAddress = computed(() => props.answer?.trim() || knownAddress.value)

const hasKnownRefs = computed(
  () => !!(facts.value.uprn || facts.value.titleNumber || facts.value.propertyType),
)

// Record the confirmed address as the answer so the question counts as
// answered (there's nothing for the user to type). Never clobber an
// existing answer.
function syncAnswer() {
  if (!props.answer?.trim() && knownAddress.value) {
    emit('update', knownAddress.value)
  }
}
onMounted(syncAnswer)
watch(knownAddress, syncAnswer)
</script>

<style scoped>
/* Read-only confirmation card, in the question card's palette. */
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #231d45;
}
.addr-confirm-line {
  font-size: 17px;
  font-weight: 800;
  line-height: 1.35;
  color: #231d45;
  margin-bottom: 12px;
  overflow-wrap: anywhere;
}
.uprn-panel {
  padding: 14px 16px;
  background: rgba(0, 161, 154, 0.06);
  border: 1px solid rgba(0, 161, 154, 0.18);
  border-radius: 14px;
}
.uprn-panel-h {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #00857f;
  margin-bottom: 8px;
}
.uprn-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 5px 0;
  font-size: 14px;
}
.uprn-row + .uprn-row {
  border-top: 1px solid rgba(0, 161, 154, 0.12);
}
.uprn-label {
  font-weight: 600;
  color: #5a5570;
}
.uprn-val {
  font-weight: 800;
  color: #231d45;
  font-variant-numeric: tabular-nums;
  text-align: right;
  overflow-wrap: anywhere;
}
.uprn-empty {
  font-size: 13px;
  color: #5a5570;
  line-height: 1.5;
}
.addr-confirm-note {
  font-size: 12.5px;
  color: #8b8799;
  line-height: 1.5;
  margin: 12px 0 0;
}
</style>
