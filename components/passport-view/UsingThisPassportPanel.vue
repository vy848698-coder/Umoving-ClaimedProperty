<template>
  <div class="utpp-wrap">
    <!-- First-time full panel. Shown once per viewer (not per passport —
         client guidance, 2026-10-05: "I wouldn't keep throwing a big
         notice at them"), then collapses to the small reopenable link
         below for every passport after that. This is UMU's own guidance
         for anyone viewing shared property information (buyer, tenant,
         landlord, solicitor, lender…) — deliberately not named "Notes for
         Buyers" so it doesn't assume who's reading it, and deliberately
         not reproducing the TA6 buyer notes (see ownership-notes rewrite,
         2026-10-05, for the same reasoning on the owner side). -->
    <section v-if="!dismissed" class="utpp-panel">
      <h3 class="utpp-title">Before you rely on this information</h3>

      <p class="utpp-body">
        This Property Passport brings together information provided by the
        owner, supporting documents and other property information
        available to UMU.
      </p>
      <p class="utpp-body">
        It is designed to help you understand the property and identify
        anything you may want to investigate further.
      </p>
      <p class="utpp-body">
        The owner can only answer from what they know and the information
        available to them. Some matters may pre-date their ownership.
      </p>
      <p class="utpp-body utpp-body--strong">
        Important information should still be checked through the
        appropriate survey, searches and professional advice before you
        make a legal commitment.
      </p>

      <ul class="utpp-points">
        <li>
          <div class="utpp-point-t">Check what matters to you</div>
          <p>Ask questions where anything is unclear.</p>
        </li>
        <li>
          <div class="utpp-point-t">Use the evidence</div>
          <p>Look at supporting documents and verified information where available.</p>
        </li>
        <li>
          <div class="utpp-point-t">Get professional advice</div>
          <p>Your solicitor, conveyancer or surveyor should check anything you intend to rely on.</p>
        </li>
      </ul>

      <button class="utpp-btn" type="button" @click="dismiss">
        Got it — view the Property Passport
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </section>

    <!-- Small reopenable link, once the viewer has seen the panel once. -->
    <button v-else class="utpp-reopen" type="button" @click="dismissed = false">
      <span class="utpp-reopen-ic">ⓘ</span> Using this Property Passport
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Per-viewer, not per-passport — a browser-local convenience, never
// something the server needs to know or that has to sync across devices.
const STORAGE_KEY = 'umu_using_passport_seen'

const hasSeenBefore = (() => {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
})()

const dismissed = ref(hasSeenBefore)

function dismiss() {
  dismissed.value = true
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Private browsing / blocked storage — fine, it just re-shows next visit.
  }
}
</script>

<style scoped>
.utpp-wrap {
  margin-bottom: 20px;
}

.utpp-panel {
  background: linear-gradient(140deg, #f2faf8 0%, #edf8ff 100%);
  border: 1px solid #cfe9e5;
  border-radius: 20px;
  padding: 24px 26px;
}

.utpp-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
}

.utpp-body {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.utpp-body:last-of-type {
  margin-bottom: 18px;
}
.utpp-body--strong {
  color: #231d45;
  font-weight: 700;
}

.utpp-points {
  list-style: none;
  margin: 0 0 20px;
  padding: 16px 0 0;
  border-top: 1px solid rgba(35, 29, 69, 0.08);
  display: grid;
  gap: 14px;
}
.utpp-point-t {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.utpp-points p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.utpp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  padding: 13px 20px;
  background: #00a19a;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.26);
  transition: background 0.15s ease, transform 0.15s ease;
}
.utpp-btn:hover {
  background: #00857f;
  transform: translateY(-1px);
}
.utpp-btn svg {
  width: 16px;
  height: 16px;
}

.utpp-reopen {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #00857f;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
}
.utpp-reopen:hover {
  text-decoration: underline;
}
.utpp-reopen-ic {
  font-size: 13px;
}

@media (max-width: 600px) {
  .utpp-panel {
    padding: 20px 18px;
    border-radius: 16px;
  }
}
</style>
