<template>
  <div class="sac">
    <img class="sac-img" src="/dashboard-art/searchHouse.png" alt="" />
    <div class="sac-body">
      <div class="sac-eyebrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Selected address
      </div>
      <div class="sac-line1">{{ line1 }}</div>
      <div v-if="line2" class="sac-line2">{{ line2 }}</div>
    </div>
    <button v-if="!readonly" type="button" class="sac-change" @click="emit('change')">Change</button>
  </div>
</template>

<script setup lang="ts">
import { toTitleCase } from '~/utils/form-helpres'

// The address the user picked on either claim page, shown back to them before
// they commit to claiming it.
const props = defineProps<{
  property: {
    addressLine1?: string | null
    city?: string | null
    postcode?: string | null
  }
  // Display only (e.g. the claim page's side rail, mid-verification).
  readonly?: boolean
}>()
const emit = defineEmits<{ (e: 'change'): void }>()

const line1 = computed(() => toTitleCase(props.property.addressLine1 ?? '') || '—')
const line2 = computed(() =>
  [
    props.property.city ? toTitleCase(props.property.city) : null,
    props.property.postcode?.toUpperCase(),
  ]
    .filter(Boolean)
    .join(', '),
)
</script>

<style scoped>
.sac {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px 12px 12px;
  border-radius: 18px;
  background: linear-gradient(160deg, #ffffff 0%, #f2fbf9 100%);
  border: 1px solid rgba(0, 161, 154, 0.32);
  box-shadow: 0 12px 28px rgba(0, 161, 154, 0.12);
  text-align: left;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sac-img {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  object-fit: contain;
}

.sac-body {
  flex: 1;
  min-width: 0;
}

.sac-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #00857f;
}
.sac-eyebrow svg {
  width: 12px;
  height: 12px;
}

.sac-line1 {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sac-line2 {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  color: #5b6d89;
}

.sac-change {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #d8e3ee;
  background: #fff;
  color: #00857f;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}
.sac-change:hover {
  border-color: rgba(0, 161, 154, 0.45);
  background: #f2fbf9;
}

@media (max-width: 420px) {
  .sac-img {
    width: 56px;
    height: 56px;
  }
}
</style>
