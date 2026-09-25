<template>
  <!-- Same two-panel shell as sign-up / sign-in: a full-height brand panel on
       the left, the form panel on the right, both running to the screen edge
       so a big monitor is filled rather than showing a boxed column. -->
  <div class="otp-split">
    <!-- ── Left brand panel ── -->
    <aside class="otp-aside">
      <div class="otp-aside-top">
        <div class="otp-logo">
          <span class="otp-logo-mark"><img src="/op-icons/logo.png" alt="umu" /></span>
          <strong>umovingu</strong>
        </div>
        <p class="otp-tagline">You own the home. Own its story.</p>
      </div>

      <div class="otp-aside-body">
        <div class="otp-illus">
          <img src="/email_verification.png" alt="" class="otp-illus-img" />
        </div>
        <p class="otp-eyebrow">One more step</p>
        <h1 class="otp-headline">Check your email<span class="otp-dot">.</span></h1>
        <p class="otp-sub">We've sent a six-digit code to your inbox.</p>
      </div>

      <p class="otp-aside-foot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        End-to-end encrypted. Your data stays yours.
      </p>
    </aside>

    <!-- ── Right form panel ── -->
    <main class="otp-main">
      <div class="otp-main-inner">
        <VerificationCode />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import VerificationCode from '@/components/VerificationCode.vue'

if (typeof definePageMeta === 'function') {
  definePageMeta({
    title: 'Email Verification | UmovingU',
  })
}
</script>

<style scoped>
/* ── Split-screen layout (mirrors pages/onboarding/signup.vue) ── */
.otp-split {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: 'Plus Jakarta Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #231d45;
}

/* ── Left brand panel ── */
.otp-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  background:
    radial-gradient(620px 460px at 50% 40%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 66%),
    radial-gradient(circle at 90% 95%, rgba(0, 161, 154, 0.08) 0%, rgba(0, 161, 154, 0) 42%),
    linear-gradient(170deg, #f7f7f4 0%, #fbfbf9 42%, #f8faf9 100%);
  overflow: hidden;
  min-width: 0;
}
/* Hairline between the two panels, as on sign-up. */
.otp-aside::after {
  content: '';
  position: absolute;
  inset: 0 0 0 auto;
  width: 1px;
  background: linear-gradient(180deg, rgba(35, 29, 69, 0) 0%, rgba(35, 29, 69, 0.08) 22%, rgba(35, 29, 69, 0.08) 78%, rgba(35, 29, 69, 0) 100%);
}
.otp-aside-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
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
  text-align: right;
  white-space: nowrap;
}

/* The envelope leads, centred above the copy - the same column as sign-up's
   house and headline. */
.otp-aside-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin-inline: auto;
  text-align: center;
  /* Sits a little above the true middle, level with the form's weight. The
     vh is divided by the desktop zoom, which would otherwise multiply it. */
  padding-bottom: calc(4.5vh / var(--desk-zoom, 1));
}

.otp-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: #00a19a;
}
.otp-headline {
  margin: 8px 0 0;
  font-size: clamp(40px, 4.2vw, 58px);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.03em;
  color: #231d45;
}
.otp-dot { color: #00a19a; }
.otp-sub {
  margin: 15px auto 0;
  font-size: 18px;
  line-height: 1.52;
  color: #635f7b;
  max-width: 32ch;
}

/* The artwork is on an opaque white square and carries its own teal shadow.
   Multiply drops the white into the panel so only the envelope shows. */
.otp-illus {
  --illus-w: 300px;
  position: relative;
  width: var(--illus-w);
  /* The image's top and bottom ~10% are empty; pulling the margins in by
     that much keeps the gap to the eyebrow the size it looks. */
  margin: calc(var(--illus-w) * -0.1) auto calc(var(--illus-w) * -0.04);
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
  animation: otp-glow 6s ease-in-out infinite;
}
.otp-illus-img {
  display: block;
  width: 100%;
  height: auto;
  position: relative;
  object-fit: contain;
  mix-blend-mode: multiply;
  animation: otp-float 6s ease-in-out infinite;
  /* Inside the white border a faint teal glow stops at a hard rectangle -
     x 7-92%, y 10-90% - which read as a square behind the envelope. Each side
     fades out over that band and is opaque again before the artwork starts
     (envelope and sparks sit within x 14-86%, y 14-82%). */
  -webkit-mask-image:
    linear-gradient(to right, transparent 7%, #000 14%, #000 86%, transparent 92%),
    linear-gradient(to bottom, transparent 8%, #000 11%, #000 83%, transparent 90%);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to right, transparent 7%, #000 14%, #000 86%, transparent 92%),
    linear-gradient(to bottom, transparent 8%, #000 11%, #000 83%, transparent 90%);
  mask-composite: intersect;
}

/* A slow drift - the envelope lifts, its shadow thins - so the page feels
   like it is waiting on the email rather than static. */
@keyframes otp-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes otp-glow {
  0%, 100% { opacity: 1; transform: scaleX(1); }
  50% { opacity: 0.7; transform: scaleX(0.92); }
}
@media (prefers-reduced-motion: reduce) {
  .otp-illus::before,
  .otp-illus-img { animation: none; }
}

.otp-aside-foot {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 28px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #9490a3;
}
.otp-aside-foot svg { width: 15px; height: 15px; flex-shrink: 0; }

/* ── Right form panel ── */
.otp-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: #f3f2ef;
  min-width: 0;
}
.otp-main-inner { width: 100%; max-width: 420px; min-width: 0; }

/* Split layout on a narrow window: no room for the tagline beside the logo. */
@media (min-width: 881px) and (max-width: 1099px) {
  .otp-tagline { display: none; }
}

/* ── Big screens ── same as sign-up: scale each content block by the shared
   desktop factor (never the full-height panels, since zoom also multiplies
   vh) and let the brand panel's side padding grow with the screen. */
@media (min-width: 1536px) {
  .otp-aside-top,
  .otp-aside-body,
  .otp-aside-foot,
  .otp-main-inner { zoom: var(--desk-zoom); }
  .otp-aside { padding: 40px clamp(48px, 5.5vw, 150px); }
  .otp-main { padding-inline: clamp(40px, 5vw, 140px); }
}

/* ── Short laptop windows ── a 1366x768 laptop leaves ~600px once the
   browser chrome is gone. Below 730px tall the desktop zoom is always 1, so
   vh is safe here: the envelope and the gaps shrink with the window and the
   page fits one screen. */
@media (min-width: 881px) and (max-height: 729px) {
  .otp-aside { padding-top: clamp(20px, 5vh, 40px); padding-bottom: clamp(20px, 5vh, 40px); }
  .otp-illus { --illus-w: clamp(210px, 44vh, 300px); }
  .otp-headline { font-size: clamp(38px, 7.4vh, 54px); }
  .otp-main { padding-top: 24px; padding-bottom: 24px; }
}

/* ── Stacked: phones and tablets ──
   The brand panel becomes a header band above the form, as on sign-up. The
   envelope moves beside the headline so the band stays short and the code
   boxes are near the top of the screen. */
@media (max-width: 880px) {
  .otp-split {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .otp-aside { padding: 28px 28px 30px; }
  .otp-aside::after {
    inset: auto 0 0 0;
    width: auto;
    height: 1px;
    background: linear-gradient(90deg, rgba(0, 161, 154, 0) 0%, rgba(0, 161, 154, 0.2) 20%, rgba(0, 161, 154, 0.2) 80%, rgba(0, 161, 154, 0) 100%);
  }
  .otp-aside-top,
  .otp-aside-body {
    width: 100%;
    max-width: 460px;
    margin-inline: auto;
  }
  .otp-aside-top { margin-bottom: 22px; }
  .otp-aside-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 16px;
    align-items: center;
    text-align: left;
    padding-bottom: 0;
  }
  .otp-eyebrow,
  .otp-headline,
  .otp-sub { grid-column: 1; }
  .otp-illus {
    --illus-w: 150px;
    grid-column: 2;
    grid-row: 1 / span 3;
    /* The envelope ends ~14% short of the image's edge, so the image hangs
       past the column by that much. */
    margin: 0 calc(var(--illus-w) * -0.14) 0 0;
  }
  /* One line beside the envelope, as the desktop headline is. */
  .otp-headline { font-size: clamp(28px, 4.4vw, 36px); margin-top: 10px; white-space: nowrap; }
  .otp-sub { font-size: 16px; margin: 12px 0 0; max-width: none; }
  .otp-aside-foot { display: none; }
  .otp-main { align-items: flex-start; padding: 32px 28px 48px; }
  .otp-main-inner { max-width: 460px; }
}

/* ── Phones ── */
@media (max-width: 600px) {
  .otp-aside { padding: 20px 20px 22px; }
  .otp-aside-top { margin-bottom: 16px; }
  .otp-logo { gap: 10px; }
  .otp-logo-mark img { width: 34px; height: 34px; }
  .otp-logo strong { font-size: 20px; }
  .otp-tagline { display: none; }
  .otp-eyebrow { font-size: 11px; letter-spacing: 1.5px; }
  .otp-headline { font-size: clamp(26px, 7.6vw, 30px); margin-top: 6px; line-height: 1.05; white-space: normal; }
  .otp-sub { font-size: 14px; margin-top: 8px; }
  .otp-illus { --illus-w: 118px; }
  .otp-main { padding: 24px 20px 40px; }
}

@media (max-width: 380px) {
  .otp-aside { padding: 16px 16px 18px; }
  .otp-main { padding: 20px 16px 36px; }
  .otp-illus { --illus-w: 100px; }
}
</style>
