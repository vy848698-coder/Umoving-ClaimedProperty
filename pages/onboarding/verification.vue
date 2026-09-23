<template>
  <div class="otp-page">
    <!-- Same lockup as sign-in / sign-up: bare mark + wordmark, tagline right. -->
    <header class="otp-header">
      <div class="otp-logo">
        <span class="otp-logo-mark"><img src="/op-icons/logo.png" alt="umu" /></span>
        <strong>umovingu</strong>
      </div>
      <p class="otp-tagline">A simpler way to own your home.</p>
    </header>

    <div class="otp-split">
      <!-- ── Left: message + illustration ── -->
      <section class="otp-aside">
        <p class="otp-eyebrow">One more step</p>
        <h1 class="otp-headline">Check your<br /> email<span class="otp-dot">.</span></h1>
        <p class="otp-sub">We've sent a six-digit code to your inbox.</p>

        <div class="otp-illus">
          <img src="/email_verification.png" alt="" class="otp-illus-img" />
        </div>
      </section>

      <!-- ── Right: code form ── -->
      <main class="otp-main">
        <VerificationCode />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import VerificationCode from '@/components/VerificationCode.vue'

if (typeof definePageMeta === 'function') {
  definePageMeta({
    title: 'Email Verification - UmovingU',
  })
}
</script>

<style scoped>
.otp-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  font-family: 'Plus Jakarta Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #231d45;
  background:
    radial-gradient(700px 520px at 24% 62%, rgba(0, 161, 154, 0.05) 0%, rgba(0, 161, 154, 0) 70%),
    linear-gradient(180deg, #fcfcfb 0%, #fafaf8 100%);
}

/* ── Header ── */
.otp-header {
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 36px 56px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.otp-logo { display: inline-flex; align-items: center; gap: 13px; }
.otp-logo-mark { display: grid; place-items: center; flex-shrink: 0; }
.otp-logo-mark img { width: 42px; height: 42px; display: block; }
.otp-logo strong {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #231d45;
}
.otp-tagline {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #8d89a0;
  white-space: nowrap;
}

/* ── Two columns, split by a hairline ── */
.otp-split {
  flex: 1;
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 40px 56px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  column-gap: clamp(40px, 6vw, 88px);
  align-items: center;
}
.otp-split::before {
  content: '';
  grid-column: 2;
  grid-row: 1;
  align-self: stretch;
  background: linear-gradient(180deg, rgba(0, 161, 154, 0) 0%, rgba(0, 161, 154, 0.22) 20%, rgba(0, 161, 154, 0.22) 80%, rgba(0, 161, 154, 0) 100%);
}
.otp-aside { grid-column: 1; grid-row: 1; min-width: 0; padding-left: clamp(0px, 3vw, 40px); }
.otp-main { grid-column: 3; grid-row: 1; min-width: 0; display: flex; }

/* ── Left copy ── */
.otp-eyebrow {
  margin: 0 0 18px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  color: #00a19a;
}
.otp-headline {
  margin: 0;
  font-size: clamp(46px, 5.2vw, 68px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #231d45;
}
.otp-dot { color: #00a19a; }
.otp-sub {
  margin: 20px 0 0;
  font-size: 19px;
  line-height: 1.5;
  color: #4d4868;
  max-width: 34ch;
}

/* The artwork is on an opaque white square and carries its own teal shadow.
   Multiply drops the white into the page background so only the envelope
   shows - no box, no second shadow. */
.otp-illus {
  position: relative;
  width: min(420px, 100%);
  margin: 12px 0 0 clamp(-24px, -1.5vw, 0px);
}
/* The mask trims the artwork's own ground shadow, so a soft teal pool goes
   back under the envelope. */
.otp-illus::before {
  content: '';
  position: absolute;
  left: 16%;
  right: 20%;
  top: 66%;
  height: 22%;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0, 161, 154, 0.2), rgba(0, 161, 154, 0));
  filter: blur(6px);
}
.otp-illus-img {
  display: block;
  width: 100%;
  height: auto;
  position: relative;
  object-fit: contain;
  mix-blend-mode: multiply;
  /* Its outer border is pure white (gone under multiply), but inside that a
     faint teal glow stops at a hard rectangle - x 7-92%, y 10-90% - which
     read as a square behind the envelope. Each side fades out over that
     band and is fully opaque again before the artwork starts (envelope and
     sparks sit within x 14-86%, y 14-82%). */
  -webkit-mask-image:
    linear-gradient(to right, transparent 7%, #000 14%, #000 86%, transparent 92%),
    linear-gradient(to bottom, transparent 8%, #000 11%, #000 83%, transparent 90%);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to right, transparent 7%, #000 14%, #000 86%, transparent 92%),
    linear-gradient(to bottom, transparent 8%, #000 11%, #000 83%, transparent 90%);
  mask-composite: intersect;
}

/* ── Tablet and below: one column, message above the form ── */
@media (max-width: 900px) {
  .otp-header { padding: 28px 28px 0; }
  .otp-split {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto;
    row-gap: 32px;
    padding: 28px 28px 48px;
    align-items: start;
    /* The page is full height; without this the two rows split the spare
       height between them and left a gap above the form. */
    align-content: start;
    width: min(560px, 100%);
  }
  .otp-split::before { display: none; }
  .otp-aside {
    grid-column: 1;
    grid-row: 1;
    padding: 0 0 28px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 16px;
    align-items: center;
    border-bottom: 1px solid rgba(0, 161, 154, 0.18);
  }
  .otp-eyebrow,
  .otp-headline,
  .otp-sub { grid-column: 1; }
  .otp-illus {
    grid-column: 2;
    grid-row: 1 / span 3;
    width: 170px;
    margin: 0 -10px 0 0;
  }
  .otp-headline { font-size: clamp(36px, 7vw, 48px); }
  .otp-sub { font-size: 16px; margin-top: 12px; }
  .otp-main { grid-column: 1; grid-row: 2; }
}

/* ── Phones ── */
@media (max-width: 600px) {
  .otp-header { padding: 20px 20px 0; }
  .otp-logo { gap: 10px; }
  .otp-logo-mark img { width: 34px; height: 34px; }
  .otp-logo strong { font-size: 20px; }
  .otp-tagline { display: none; }
  .otp-split { padding: 22px 20px 40px; row-gap: 24px; }
  .otp-aside { padding-bottom: 22px; }
  .otp-eyebrow { font-size: 11px; letter-spacing: 1.8px; margin-bottom: 10px; }
  .otp-headline { font-size: clamp(28px, 8.4vw, 34px); line-height: 1.05; }
  .otp-sub { font-size: 14px; margin-top: 8px; }
  .otp-illus { width: 118px; }
}

@media (max-width: 380px) {
  .otp-header { padding: 16px 16px 0; }
  .otp-split { padding: 18px 16px 36px; }
  .otp-illus { width: 100px; }
}
</style>
