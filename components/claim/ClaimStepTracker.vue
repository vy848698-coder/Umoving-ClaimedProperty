<template>
  <ol class="cst" :aria-label="`Step ${current} of ${CLAIM_STEPS.length}`">
    <li
      v-for="(s, i) in CLAIM_STEPS"
      :key="s.title"
      class="cst-step"
      :class="{ done: i + 1 < current, current: i + 1 === current }"
      :aria-current="i + 1 === current ? 'step' : undefined"
    >
      <span class="cst-ic">
        <img :src="s.image" alt="" />
        <span class="cst-badge">
          <svg v-if="i + 1 < current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <template v-else>{{ i + 1 }}</template>
        </span>
      </span>
      <span class="cst-label">{{ s.short }}</span>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { CLAIM_STEPS } from '~/utils/claimSteps'

// One tracker for the whole claim journey (see utils/claimSteps.ts), so the
// step count carries on from /claim into /claim/:id instead of restarting.
defineProps<{ current: number }>()
</script>

<style scoped>
.cst {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.cst-step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* Connector from the previous step's icon to this one. */
.cst-step:not(:first-child)::before {
  content: '';
  position: absolute;
  top: 31px;
  left: calc(-50% + 40px);
  right: calc(50% + 40px);
  height: 3px;
  border-radius: 3px;
  background: #dbe7f5;
}
.cst-step.done::before,
.cst-step.current::before {
  background: linear-gradient(90deg, #00a19a, #4dd4ce);
}

.cst-ic {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1px solid #e7ecf2;
  box-shadow: 0 6px 16px rgba(17, 52, 88, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
}
/* The artwork is detailed 3D render, so it is given most of the tile and only
   lightly dulled when the step is still ahead - the old 0.55 opacity over a
   0.35 grayscale washed the houses out until they were hard to make out. */
.cst-ic img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  opacity: 0.82;
  filter: grayscale(0.12);
  transition: opacity 0.2s, filter 0.2s;
}
.cst-step.done .cst-ic img,
.cst-step.current .cst-ic img {
  opacity: 1;
  filter: none;
}
.cst-step.current .cst-ic {
  border-color: rgba(0, 161, 154, 0.55);
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.14);
}

.cst-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #c9d6e2;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  border: 2px solid #fff;
}
.cst-badge svg {
  width: 11px;
  height: 11px;
}
.cst-step.done .cst-badge,
.cst-step.current .cst-badge {
  background: #00a19a;
}

.cst-label {
  font-size: 12px;
  font-weight: 700;
  color: #8a94a6;
  text-align: center;
  line-height: 1.3;
}
.cst-step.done .cst-label {
  color: #4a5570;
}
.cst-step.current .cst-label {
  color: #00857f;
  font-weight: 800;
}

@media (max-width: 560px) {
  .cst-ic {
    width: 52px;
    height: 52px;
    border-radius: 15px;
  }
  .cst-ic img {
    width: 40px;
    height: 40px;
  }
  .cst-step:not(:first-child)::before {
    top: 25px;
    left: calc(-50% + 33px);
    right: calc(50% + 33px);
  }
  .cst-label {
    font-size: 11px;
  }
}
</style>
