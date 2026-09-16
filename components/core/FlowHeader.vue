<template>
  <header class="fh-nav">
    <div class="fh-inner">
      <button class="fh-brand" type="button" @click="navigateTo(FLOW_HOME)">
        <img src="/op-icons/logo.png" alt="" class="fh-brand-logo" />
        <span>umovingu</span>
      </button>
      <div class="fh-actions">
        <button class="fh-back" type="button" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span class="fh-back-label">Back</span>
        </button>
        <PassportNavButton />
        <ProfileMenu />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ProfileMenu from '~/components/core/ProfileMenu.vue'
import PassportNavButton from '~/components/core/PassportNavButton.vue'
import { FLOW_HOME } from '~/utils/appFlow'

// Header for the profile pages: brand, Back, and the account menu — no app
// navigation, since the rest of the app is hidden (see utils/appFlow.ts).
const goBack = useGoBack(FLOW_HOME)
</script>

<style scoped>
.fh-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(243, 242, 239, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(35, 29, 69, 0.07);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.fh-inner {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fh-brand {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0d1835;
  cursor: pointer;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
  font-family: inherit;
}
.fh-brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.fh-brand-beta {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #00857f;
  background: rgba(0, 161, 154, 0.1);
  border: 1px solid rgba(0, 161, 154, 0.3);
  border-radius: 6px;
  padding: 2px 7px;
  margin-left: 2px;
}

.fh-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.fh-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 42px;
  padding: 0 14px;
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
.fh-back:hover {
  border-color: #bfd1e4;
  background: #f8fbff;
}
.fh-back svg {
  width: 15px;
  height: 15px;
}

@media (max-width: 640px) {
  .fh-inner {
    width: calc(100% - 32px);
    min-height: 58px;
  }
  .fh-brand-beta {
    display: none;
  }
}

/* At phone widths, Back + Passport + Profile no longer fit alongside the
   full wordmark - the "umovingu" text and the "Back" label were overflowing
   the header and getting clipped off the right edge (Profile unreachable).
   Icon-only brand + icon-only Back recovers the ~90px needed. */
@media (max-width: 480px) {
  /* Hidden visually but kept in the accessibility tree — the wordmark is the
     only name this button has, so display:none would leave it unlabelled. */
  .fh-brand span:not(.fh-brand-beta) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* Down to the bare mark both of these shrink below a comfortable tap, so
     they get an explicit box matching the buttons beside them. */
  .fh-brand {
    gap: 0;
    min-width: 42px;
    min-height: 42px;
    justify-content: center;
    margin-left: -8px;
  }
  .fh-back {
    width: 42px;
    padding: 0;
    gap: 0;
    justify-content: center;
  }
  .fh-back-label {
    display: none;
  }
  .fh-actions {
    gap: 8px;
  }
}
</style>
