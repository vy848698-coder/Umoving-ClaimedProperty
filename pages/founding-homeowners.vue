<template>
  <div class="cl-root">
    <!-- ── Web nav ──────────────────────────────────────────────────── -->
    <header class="hsw-nav">
      <div class="hsw-shell hsw-nav-inner">
        <button class="hsw-brand" type="button" @click="navigateTo('/')">
          <img src="/op-icons/logo.png" alt="" class="hsw-brand-logo" />
          <span>umovingu</span>
        </button>
        <!-- <div class="hsw-actions">
          <NuxtLink to="/onboarding/signin" class="fh-nav-signin"
            >Sign in</NuxtLink
          >
          <NuxtLink to="/onboarding/signup" class="fh-nav-signup"
            >Create account</NuxtLink
          >
        </div> -->
      </div>
    </header>

    <main class="hsw-shell clw-main">
      <!-- Founding Homeowners hero - same component and copy as the claim
           page (client request, 2026-09-28): this page is the pre-claim
           entry point, so the step tracker and property search don't
           belong here yet. -->
      <FounderPromo
        variant="hero"
        title="Join the million and change the face of home buying and selling."
        body="Create your free account, claim your home, build its Property Passport and join the first million homeowners shaping a better property network for everyone."
      />

      <div class="clw-layout">
        <!-- Create account / sign in -->
        <section class="clw-card fh-cta-card">
          <h2 class="cl-h2">Ready to become a Founding Homeowner?</h2>
          <p class="cl-body">
            Create your free account to claim your home, build its Property
            Passport, and secure your place among the first million homeowners.
          </p>

          <div class="fh-cta-actions">
            <NuxtLink to="/onboarding/signup" class="cl-continue">
              Create your free account
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
            <NuxtLink to="/onboarding/signin" class="fh-signin-link">
              Already have an account? <span>Sign in</span>
            </NuxtLink>
          </div>

          <div class="fh-fee-note">
            <div class="cl-lock-ic">
              <img src="/build/padlock.png" alt="" />
            </div>
            <div class="fh-fee-body">
              <p class="fh-fee-title">No hidden fees. Ever.</p>
              <p>
                Your UMU account and Property Passport are free for life. We
                only pass on costs where a third party charges us for a
                service.
              </p>
              <p>
                Claiming your property requires a one-off
                <strong>£19.99 ownership verification fee</strong>, covering
                the checks needed to confirm that the property is yours. UMU
                does not add a markup.
              </p>
            </div>
          </div>
        </section>

        <!-- What your Founder status gives you (unchanged from the claim
             page - same benefits, same 3D icon set) -->
        <aside class="clw-aside">
          <div class="clw-aside-card">
            <h3 class="clw-aside-title">What your Founder status gives you</h3>
            <ul class="clw-benefits">
              <li v-for="b in FOUNDER_BENEFITS" :key="b.title">
                <span class="clw-benefit-ic"
                  ><img :src="b.image" alt=""
                /></span>
                <div>
                  <div class="clw-step-h">{{ b.title }}</div>
                  <p>{{ b.text }}</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import FounderPromo from "~/components/core/FounderPromo.vue";

definePageMeta({
  title: "Become a Founding Homeowner",
  // Now the site's landing page for signed-out visitors (client request,
  // 2026-09-28 — see utils/appFlow.ts LANDING_PATH). An already-signed-in
  // visitor lands here too (deep link, bookmark, etc.) and should go
  // straight into their claim flow instead, same as signin/signup.
  middleware: "guest",
});

// Same list the claim page shows in its aside - same 3D-render icon style
// used throughout the claim journey.
const FOUNDER_BENEFITS = [
  {
    image: "/dashboard-art/passportBadge.png",
    title: "Your Property Passport, free for life",
    text: "Build, store and share your home's record. We only pass on third-party costs where they apply.",
  },
  {
    image: "/homescore-icon/wrench.png",
    title: "New UMU tools, free for life",
    text: "First access to core tools we build together. External costs are separate.",
  },
  {
    image: "/build/people.png",
    title: "A real voice",
    text: "Vote on priorities and help shape a better way to buy and sell.",
  },
  {
    image: "/op-icons/rewards/stampTool.png",
    title: "A permanent Founder Number",
    text: "Your certificate marks your place among the first million. More to come.",
  },
];
</script>

<style scoped>
/* ── Web canvas ───────────────────────────────────────────────────── */
.cl-root {
  --brand: #00a19a;
  --brand-pale: #f0fdfa;
  --brand-soft: #99f6e4;
  --brand-dark: #007d78;
  --navy: #231d45;
  --ink: #1a1a2e;
  --ink-soft: #4a4a6a;
  --ink-faint: #9090a8;
  --line: #dbe7f5;
  --color-border: #e7ecf2;
  min-height: 100dvh;
  color: var(--navy);
  background: #f3f2ef;
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Inter,
    system-ui,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
  position: relative;
}

/* ── Web nav ───────────────────────────── */
.hsw-shell {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hsw-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(243, 242, 239, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(35, 29, 69, 0.07);
}

.hsw-nav-inner {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.hsw-brand {
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

.hsw-brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.hsw-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.fh-nav-signin {
  height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 10px;
  color: #0c2342;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.18s;
}
.fh-nav-signin:hover {
  background: rgba(0, 161, 154, 0.08);
}

.fh-nav-signup {
  height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 0 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a 0%, #00b8ae 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(0, 161, 154, 0.26);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.fh-nav-signup:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 161, 154, 0.32);
}

/* ── Page ─────────────────────────────────────────────────────────── */
.clw-main {
  padding: 48px 0 96px;
}

.cl-continue {
  width: fit-content;
  padding: 10px 20px;
  margin: auto;
  margin-top: 6px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #00a19a 0%, #00b8ae 100%);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(0, 161, 154, 0.28);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.cl-continue:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(0, 161, 154, 0.34);
}
.cl-continue svg {
  width: 17px;
  height: 17px;
}

/* ── Two-column layout ────────────────────────────────────────────── */
.clw-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 36px;
  margin-top: 100px;
  align-items: start;
}

/* ── Create account / sign in ─────────────────────────────────────────
   No card/box/border (client feedback, 2026-09-28) - sits directly on the
   page background like the FounderPromo hero above it, not boxed in. */
.clw-card {
  padding: 4px 0 0;
}

.fh-cta-card {
  text-align: center;
  display: grid;
  justify-items: center;
  animation: fh-rise 0.6s ease both;
}

@keyframes fh-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .fh-cta-card {
    animation: none;
  }
}

.cl-h2 {
  font-size: 26px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
  margin: 0 0 10px;
  line-height: 1.2;
}

.cl-body {
  font-size: 15px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0 0 24px;
  max-width: 42ch;
}

.fh-cta-actions {
  width: 100%;
  display: grid;
  gap: 14px;
  margin-bottom: 20px;
}

.fh-signin-link {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink-soft);
  text-decoration: none;
}
.fh-signin-link span {
  color: #00857f;
  text-decoration: underline;
}
.fh-signin-link:hover span {
  text-decoration: none;
}

.cl-lock-ic {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}
.cl-lock-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* "No hidden fees. Ever." (client + ChatGPT copy, 2026-09-28) - the fee
   disclosure block, shown before account creation so the £19.99 claim fee
   is never a surprise later. */
.fh-fee-note {
  width: 100%;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  text-align: left;
  padding: 16px 18px;
  background: #f2faf8;
  border: 1px solid #cceeea;
  border-radius: 14px;
}

.fh-fee-body p {
  margin: 0 0 8px;
  font-size: 12.5px;
  color: var(--ink-soft);
  line-height: 1.55;
}
.fh-fee-body p:last-child {
  margin-bottom: 0;
}
.fh-fee-body strong {
  color: var(--ink);
}

.fh-fee-body p.fh-fee-title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 6px;
}

/* ── What your Founder status gives you ──────────────────────────────
   Identical to the claim page's aside. */
.clw-aside {
  position: sticky;
  top: 90px;
}

/* No card/box/border (client feedback, 2026-09-28) - matches the CTA
   column's padding so both headings align on the same top line. */
.clw-aside-card {
  padding: 4px 0 0;
}

.clw-aside-title {
  margin: 0 0 18px;
  font-size: 17px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.01em;
}

.clw-benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 20px;
}

.clw-benefits li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.clw-benefit-ic {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #f0fdfa;
}
.clw-benefit-ic img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.clw-step-h {
  font-size: 14.5px;
  font-weight: 800;
  color: #1a1535;
  margin-bottom: 3px;
}

.clw-benefits p {
  margin: 0;
  font-size: 13px;
  color: #6b6783;
  line-height: 1.5;
}

/* ── Big screens ──────────────────────────────────────────────────── */
@media (min-width: 1367px) {
  .hsw-shell {
    zoom: var(--wide-zoom, 1);
  }
}

/* ── Responsive ───────────────────────────────────────────────────── */
@media (max-width: 980px) {
  .clw-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
  .clw-aside {
    position: static;
    top: auto;
  }
}

@media (max-width: 899px) {
  .hsw-shell {
    width: calc(100% - 32px);
  }
  .hsw-nav-inner {
    min-height: 58px;
  }
  .clw-main {
    padding-top: 32px;
    padding-bottom: 72px;
  }
}

@media (max-width: 640px) {
  .hsw-shell {
    width: calc(100% - 24px);
  }
  .cl-h2 {
    font-size: 23px;
  }
}

@media (max-width: 440px) {
  .fh-nav-signin {
    padding: 0 10px;
    font-size: 13px;
  }
  .fh-nav-signup {
    padding: 0 12px;
    font-size: 13px;
  }
}
</style>
