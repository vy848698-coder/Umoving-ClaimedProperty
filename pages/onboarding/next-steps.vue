<template>
  <div class="jn-root">
    <header class="jn-nav">
      <div class="jn-shell jn-nav-inner">
        <button class="jn-brand" type="button" @click="navigateTo(FLOW_HOME)">
          <img src="/op-icons/logo.png" alt="" class="jn-brand-logo" />
          <span>umovingu</span>
        </button>
        <div class="jn-actions">
          <ProfileMenu />
        </div>
      </div>
    </header>

    <main class="jn-shell jn-main">
      <div class="jn-head">
        <h1>What would you like to do now?</h1>
        <p>Choose a starting point. You can explore more at any time.</p>
      </div>

      <div class="jn-cards">
        <section class="jn-card">
          <img src="/dashboard-art/searchHouse.png" alt="" class="jn-card-ic" />
          <h2>Claim a property I own</h2>
          <p>Verify ownership and start its Property Passport.</p>
          <NuxtLink to="/claim" class="jn-btn jn-btn--solid">
            Start a claim
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </section>

        <section class="jn-card">
          <img src="/op-icons/misc/exploreProperty.png" alt="" class="jn-card-ic" />
          <h2>Explore what's coming</h2>
          <p>Tell us what interests you and stay close to what we build next.</p>
          <NuxtLink to="/onboarding/interests" class="jn-btn jn-btn--outline">
            Tell us what interests you
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </section>
      </div>

      <div class="jn-founder">
        <span class="jn-founder-rule" aria-hidden="true"></span>
        <img src="/founder/founder-seal.png" alt="" class="jn-founder-seal" />
        <div class="jn-founder-body">
          <p class="jn-founder-kicker">Own a home?</p>
          <p>Verified homeowners may be eligible to join the Founding Homeowners movement.</p>
        </div>
        <span class="jn-founder-rule" aria-hidden="true"></span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import ProfileMenu from '~/components/core/ProfileMenu.vue'
import { FLOW_HOME } from '~/utils/appFlow'

definePageMeta({
  middleware: 'auth',
  title: 'What would you like to do now?',
})
</script>

<style scoped>
.jn-root {
  min-height: 100dvh;
  color: #231d45;
  background: #fefcfa;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.jn-shell {
  width: min(1100px, calc(100% - 48px));
  margin: 0 auto;
}

.jn-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(254, 252, 250, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(35, 29, 69, 0.07);
}
.jn-nav-inner {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.jn-brand {
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0d1835;
  cursor: pointer;
  font-size: 20px;
  font-weight: 800;
  font-family: inherit;
}
.jn-brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.jn-main {
  padding: 56px 0 80px;
  text-align: center;
}

.jn-head h1 {
  margin: 0 0 12px;
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #231d45;
  line-height: 1.1;
}
.jn-head p {
  margin: 0;
  font-size: 16px;
  color: #8b90b3;
  font-weight: 500;
}

.jn-cards {
  margin-top: 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  text-align: left;
}

.jn-card {
  padding: 36px 32px;
  background: #fff;
  border: 1px solid #eef0f5;
  border-radius: 22px;
  box-shadow: 0 18px 44px rgba(17, 52, 88, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.jn-card-ic {
  width: 128px;
  height: 128px;
  object-fit: contain;
  margin-bottom: 20px;
}

.jn-card h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
}
.jn-card p {
  margin: 0 0 24px;
  font-size: 14.5px;
  color: #8b90b3;
  line-height: 1.55;
}

.jn-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.jn-btn svg { width: 17px; height: 17px; }
.jn-btn--solid {
  border: 0;
  background: linear-gradient(135deg, #00a19a 0%, #00b8ae 100%);
  color: #fff;
  box-shadow: 0 12px 26px rgba(0, 161, 154, 0.28);
}
.jn-btn--solid:hover { transform: translateY(-1px); box-shadow: 0 16px 30px rgba(0, 161, 154, 0.34); }
.jn-btn--outline {
  border: 1.5px solid #00a19a;
  background: #fff;
  color: #00857f;
}
.jn-btn--outline:hover { background: #f0fdfa; }

.jn-founder {
  margin-top: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}
.jn-founder-rule {
  flex: 1;
  max-width: 140px;
  height: 1px;
  background: repeating-linear-gradient(-45deg, #e0a53a 0 3px, transparent 3px 8px);
}
.jn-founder-seal {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex-shrink: 0;
}
.jn-founder-body {
  text-align: left;
  max-width: 340px;
}
.jn-founder-kicker {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 800;
  color: #e07a1f;
}
.jn-founder-body p:last-child {
  margin: 0;
  font-size: 14px;
  color: #6b6783;
  line-height: 1.5;
}

/* Bigger on desktop (client feedback, 2026-10-01 - was sized for mobile
   even on a wide screen). */
@media (min-width: 1200px) {
  .jn-founder { margin-top: 72px; gap: 26px; }
  .jn-founder-rule { max-width: 200px; }
  .jn-founder-seal { width: 80px; height: 80px; }
  .jn-founder-body { max-width: 440px; }
  .jn-founder-kicker { font-size: 19px; }
  .jn-founder-body p:last-child { font-size: 17px; }
}

@media (max-width: 760px) {
  .jn-cards { grid-template-columns: 1fr; }
  .jn-founder { flex-direction: column; gap: 12px; text-align: center; }
  .jn-founder-rule { display: none; }
  .jn-founder-body { text-align: center; }
}
</style>
