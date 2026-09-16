<template>
  <div class="address-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <div class="address-input">
      <input
        :placeholder="question.placeholder || 'Start typing address...'"
        v-model="text"
        @input="onInput"
        class="text-field"
      />
      <button class="btn" @click="$emit('update', text)">Find URN</button>
    </div>

    <p v-if="prefilled" class="address-hint">
      Filled in from your Passport — edit it if this isn't right.
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: String, default: '' },
  // The address held on the passport record, passed down from the task page.
  // Used only to seed an empty field: a saved answer always wins, because the
  // seller may have corrected it.
  propertyAddress: { type: String, default: '' },
})
const emit = defineEmits(['update'])

const text = ref(props.answer || '')
// Whether what's in the box came from the passport rather than the seller, so
// the hint below is only shown when it is actually theirs to check.
const prefilled = ref(false)

// The address arrives asynchronously (the task page fetches it on mount), so
// this has to react to it landing rather than read it once on setup.
function seedFromProperty() {
  if (text.value) return
  const addr = (props.propertyAddress || '').trim()
  if (!addr) return
  text.value = addr
  prefilled.value = true
  // Emit so the answer is recorded without the seller having to touch the
  // field — filling the box but leaving it unsaved would defeat the point.
  emit('update', addr)
}

watch(() => props.propertyAddress, seedFromProperty, { immediate: true })

watch(
  () => props.answer,
  (v) => {
    // A saved answer always replaces a seeded value.
    if (v) {
      text.value = v
      prefilled.value = false
    } else {
      text.value = ''
      seedFromProperty()
    }
  },
)

const onInput = () => {
  // Once the seller edits it, it is their answer, not ours.
  prefilled.value = false
  emit('update', text.value)
}
</script>

<style scoped>
.address-input {
  display: flex;
  gap: 8px;
  align-items: center;
}
.text-field {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  background: #00a19a;
  color: white;
  border: none;
}
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
.address-hint {
  margin: 8px 0 0;
  font-size: 12.5px;
  color: #6b6783;
}
</style>
