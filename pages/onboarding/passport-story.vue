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
      <NuxtLink to="/onboarding/member" class="ps-back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </NuxtLink>

      <div class="ps-hero">
        <div class="ps-hero-copy">
          <h1>A home's story, all in one place.</h1>
          <p>
            A Property Passport brings useful information about a home together.
            Its owner can add details and choose what to share.
          </p>
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

      <div class="ps-steps">
        <section class="ps-step">
          <span class="ps-step-num">01</span>
          <img src="/onboarding-journey/documents-magnifier.png" alt="" />
          <h3>Start with what we know</h3>
          <p>Useful property information in one place.</p>
        </section>
        <section class="ps-step">
          <span class="ps-step-num">02</span>
          <img src="/onboarding-journey/folder-documents.png" alt="" />
          <h3>Add your home's details</h3>
          <p>Keep documents and answers together.</p>
        </section>
        <section class="ps-step">
          <span class="ps-step-num">03</span>
          <img src="/onboarding-journey/toggles.png" alt="" />
          <h3>Choose what to share</h3>
          <p>
            Keep personal files private. Share selected details when you're
            ready.
          </p>
        </section>
      </div>

      <div class="ps-lock">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Your private documents stay private unless you choose to share them.
      </div>

      <div class="ps-actions">
        <NuxtLink to="/claim" class="jn-btn jn-btn--solid">
          Own a property? Start a claim
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
        <NuxtLink to="/onboarding/member" class="jn-btn jn-btn--outline">
          Back
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import ProfileMenu from "~/components/core/ProfileMenu.vue";
import { FLOW_HOME } from "~/utils/appFlow";

definePageMeta({
  middleware: "auth",
  title: "A home's story, all in one place",
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
  padding: 40px 0 80px;
}

.ps-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  color: #00a19a;
  text-decoration: none;
  margin-bottom: 28px;
}
.ps-back svg {
  width: 17px;
  height: 17px;
}

.ps-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 32px;
}
.ps-hero-copy h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #231d45;
  line-height: 1.1;
}
.ps-hero-copy p {
  margin: 16px 0 0;
  max-width: 46ch;
  font-size: 15.5px;
  color: #8b90b3;
  font-weight: 500;
  line-height: 1.6;
}

.mb-hero-art {
  position: relative;
  display: flex;
  justify-content: center;
}
.mb-hero-art img {
  width: 100%;
  max-width: 300px;
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

.ps-steps {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.ps-step {
  position: relative;
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
/* Sits beside the icon, vertically centered on it, not stacked above it
   (client feedback, 2026-09-29: "the number is on left and the image in
   center"). Positioned off the icon's own height (top padding + half the
   icon's 120px) rather than the icon, so it tracks if that size changes. */
.ps-step-num {
  position: absolute;
  top: 50px;
  left: 26px;
  transform: translateY(-50%);
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0fdfa;
  color: #00857f;
  font-size: 13px;
  font-weight: 800;
}
.ps-step img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  display: block;
  margin: 0 auto 16px;
}
.ps-step h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
}
.ps-step p {
  margin: 0;
  font-size: 13.5px;
  color: #8b90b3;
  line-height: 1.55;
}

.ps-lock {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  background: #f0fdfa;
  border: 1px solid #cceeea;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #00625d;
  text-align: center;
}
.ps-lock svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #00a19a;
}

.ps-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 14px;
}

.jn-btn {
  height: 52px;
  padding: 0 24px;
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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}
.jn-btn svg {
  width: 17px;
  height: 17px;
}
.jn-btn--solid {
  border: 0;
  background: linear-gradient(135deg, #00a19a 0%, #00b8ae 100%);
  color: #fff;
  box-shadow: 0 12px 26px rgba(0, 161, 154, 0.28);
}
.jn-btn--solid:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(0, 161, 154, 0.34);
}
.jn-btn--outline {
  border: 1.5px solid #d8e3ee;
  background: #fff;
  color: #231d45;
}
.jn-btn--outline:hover {
  background: #f8fbff;
}

@media (max-width: 900px) {
  .ps-hero {
    grid-template-columns: 1fr;
  }
  .mb-hero-art {
    order: -1;
  }
  .ps-steps {
    grid-template-columns: 1fr;
  }
  .ps-actions {
    flex-direction: column;
  }
}
</style>
