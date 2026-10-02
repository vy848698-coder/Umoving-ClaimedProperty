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
      <div class="mb-hero">
        <div class="mb-hero-copy">
          <p class="mb-eyebrow">Welcome to Umovingu</p>
          <h1>You're part of Umovingu.</h1>
          <p class="mb-sub">
            Your interests are saved. We're opening more ways to understand and
            share property information in stages.
          </p>

          <div class="mb-interests">
            <span class="mb-interests-label">Your interests</span>
            <span v-for="label in interestLabels" :key="label" class="mb-chip">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ label }}
            </span>
            <NuxtLink to="/onboarding/interests" class="mb-edit-link">
              Edit interests →
            </NuxtLink>
          </div>
        </div>

        <div class="mb-hero-art">
          <span class="mb-fleck mb-fleck-a" aria-hidden="true"></span>
          <span class="mb-fleck mb-fleck-b" aria-hidden="true"></span>
          <span class="mb-fleck mb-fleck-c" aria-hidden="true"></span>
          <img
            src="/op-icons/passport-covers/property_passport_teal_tilted_left_on_tile.png"
            alt="Property Passport"
          />
        </div>
      </div>

      <div class="mb-cards">
        <section class="mb-card">
          <img
            src="/op-icons/passport-covers/property_passport_teal_tilted_left_on_tile_sm.png"
            alt=""
          />
          <h3>How Property Passports work</h3>
          <p>
            See how Property Passports help make property information clearer,
            easier to share and more useful.
          </p>
          <NuxtLink
            to="/onboarding/passport-story"
            class="jn-btn jn-btn--solid"
          >
            Learn more
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </section>

        <section class="mb-card">
          <img src="/onboarding-journey/toggles.png" alt="" />
          <h3>Update your interests</h3>
          <p>
            You can change your interests at any time to get more relevant
            features as we release them.
          </p>
          <NuxtLink to="/onboarding/interests" class="jn-btn jn-btn--solid">
            Manage Interests
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </section>

        <section class="mb-card">
          <img src="/onboarding-journey/coin-house.png" alt="" />
          <h3>Own a property?</h3>
          <p>
            If you own a home, you can create a Property Passport to secure your
            information and unlock useful features.
          </p>
          <NuxtLink to="/claim" class="jn-btn jn-btn--solid">
            Start a claim
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </section>
      </div>

      <div class="mb-trust">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        You choose what to share.
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProfileMenu from "~/components/core/ProfileMenu.vue";
import { FLOW_HOME } from "~/utils/appFlow";
import { loadInterests, INTEREST_OPTIONS } from "~/composables/useInterests";

definePageMeta({
  middleware: "auth",
  title: "You're part of Umovingu",
});

const saved = loadInterests();
const interestLabels = computed(() => {
  const ids = new Set(saved?.interestIds ?? []);
  return INTEREST_OPTIONS.filter((o) => ids.has(o.id)).map((o) => o.label);
});
</script>

<style scoped>
.jn-root {
  min-height: 100dvh;
  color: #231d45;
  background: #fefcfa;
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Inter,
    system-ui,
    sans-serif;
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
  padding: 48px 0 80px;
}

.mb-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 32px;
}

.mb-eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #00857f;
}
.mb-hero-copy h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #231d45;
  line-height: 1.1;
}
.mb-sub {
  margin: 16px 0 0;
  max-width: 46ch;
  font-size: 15.5px;
  color: #8b90b3;
  font-weight: 500;
  line-height: 1.6;
}

.mb-interests {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #eef0f5;
  border-radius: 16px;
}
.mb-interests-label {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  margin-right: 4px;
}
.mb-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f0fdfa;
  color: #00857f;
  font-size: 13px;
  font-weight: 700;
}
.mb-chip svg {
  width: 13px;
  height: 13px;
}
.mb-edit-link {
  margin-left: auto;
  font-size: 13.5px;
  font-weight: 800;
  color: #00857f;
  text-decoration: none;
}
.mb-edit-link:hover {
  text-decoration: underline;
}

.mb-hero-art {
  position: relative;
  display: flex;
  justify-content: center;
}
.mb-hero-art img {
  width: 100%;
  max-width: 320px;
  height: auto;
}
.mb-fleck {
  position: absolute;
  width: 20px;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(135deg, #f4c76b, #d4a840);
}
.mb-fleck-a {
  top: 8%;
  right: 8%;
  transform: rotate(35deg);
}
.mb-fleck-b {
  top: 42%;
  right: -2%;
  transform: rotate(-20deg);
}
.mb-fleck-c {
  top: 18%;
  left: 6%;
  transform: rotate(60deg);
}

.mb-cards {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.mb-card {
  padding: 30px 26px;
  background: #fff;
  border: 1px solid #eef0f5;
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(17, 52, 88, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.mb-card img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0 auto 16px;
}
.mb-card h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
}
.mb-card p {
  margin: 0 0 20px;
  font-size: 13.5px;
  color: #8b90b3;
  line-height: 1.55;
}
/* Button pinned to the bottom regardless of how much text sits above it,
   so all three cards' buttons land on the same baseline (client feedback,
   2026-09-29: "the middle one looks a little up"). */
.mb-card .jn-btn {
  margin-top: auto;
}

.jn-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.jn-btn svg {
  width: 16px;
  height: 16px;
}
.jn-btn--solid {
  border: 0;
  background: linear-gradient(135deg, #00a19a 0%, #00b8ae 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(0, 161, 154, 0.26);
}
.jn-btn--solid:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(0, 161, 154, 0.32);
}

.mb-trust {
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #9aa0bd;
}
.mb-trust svg {
  width: 16px;
  height: 16px;
  color: #00a19a;
}

@media (max-width: 900px) {
  .mb-hero {
    grid-template-columns: 1fr;
  }
  .mb-hero-art {
    order: -1;
  }
  .mb-cards {
    grid-template-columns: 1fr;
  }
  .mb-edit-link {
    margin-left: 0;
    width: 100%;
  }
}
</style>
