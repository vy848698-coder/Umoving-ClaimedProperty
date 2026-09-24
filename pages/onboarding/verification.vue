<template>
  <div class="otp-page">
    <!-- Same lockup as sign-in / sign-up: bare mark + wordmark, tagline right. -->
    <header class="otp-header">
      <div class="otp-logo">
        <span class="otp-logo-mark"><img src="/op-icons/logo.png" alt="umu" /></span>
        <strong>umovingu</strong>
      </div>
      <p class="otp-tagline">You own the home. Own its story.</p>
    </header>

    <div class="otp-split">
      <!-- ── Left: message + illustration ── -->
      <section class="otp-aside">
        <p class="otp-eyebrow">One more step</p>
        <h1 class="otp-headline">Check your email<span class="otp-dot">.</span></h1>
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
    title: 'Email Verification | UmovingU',
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
  /* Both columns start on the same top line (eyebrow level with "Back",
     headline level with "Enter your code"); the pair is centred as one. */
  align-items: start;
  align-content: center;
}
.otp-split::before {
  content: '';
  grid-column: 2;
  grid-row: 1;
  align-self: stretch;
  background: linear-gradient(180deg, rgba(0, 161, 154, 0) 0%, rgba(0, 161, 154, 0.22) 20%, rgba(0, 161, 154, 0.22) 80%, rgba(0, 161, 154, 0) 100%);
}
/* No inset of its own: the copy starts on the same line as the logo above. */
.otp-aside { grid-column: 1; grid-row: 1; min-width: 0; }
.otp-main { grid-column: 3; grid-row: 1; min-width: 0; display: flex; }

/* ── Left copy ── */
/* Sized against the form opposite: the eyebrow takes the Back link's line
   height and gap, the headline and subline the form title's and subtitle's
   type, so the two columns read as one scale. */
.otp-eyebrow {
  margin: 0 0 34px;
  line-height: 24px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2.4px;
  text-transform: uppercase;
  color: #00a19a;
}
.otp-headline {
  margin: 0;
  font-size: clamp(34px, 4vw, 50px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: #231d45;
  /* One line, like the form title opposite, so the sublines level too. */
  white-space: nowrap;
}
.otp-dot { color: #00a19a; }
.otp-sub {
  margin: 14px 0 0;
  font-size: 17px;
  line-height: 1.6;
  color: #5d5878;
  max-width: 34ch;
}

/* The artwork is on an opaque white square and carries its own teal shadow.
   Multiply drops the white into the page background so only the envelope
   shows - no box, no second shadow. */
.otp-illus {
  /* Also bounded by viewport height, so on a short laptop screen the art
     shrinks rather than pushing the page into a scroll. */
  --illus-w: min(420px, 100%, 54vh);
  position: relative;
  width: var(--illus-w);
  /* The envelope starts ~13% in from the image's own edge; pulling the image
     back by that much puts the envelope on the text/logo line. */
  margin: 10px 0 calc(var(--illus-w) * -0.1) calc(var(--illus-w) * -0.13);
  /* (bottom: the lowest ~10% of the image is empty, so it takes no room) */
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

/* ── Short desktop / laptop windows ──
   With browser chrome a 1366x768 laptop leaves ~600px, and the page needed
   ~660 - the resend line fell below the fold. On side-by-side layouts the
   vertical rhythm scales with window height instead, so the whole page fits
   one screen. The eyebrow gap tracks the Back link's (VerificationCode.vue)
   so the two columns stay level. */
@media (min-width: 901px) and (max-height: 820px),
  (min-width: 701px) and (orientation: landscape) and (max-height: 820px) {
  .otp-header { padding-top: clamp(16px, 3.6vh, 36px); }
  .otp-logo-mark img { width: clamp(34px, 5.2vh, 42px); height: clamp(34px, 5.2vh, 42px); }
  .otp-split {
    padding-top: clamp(12px, 3vh, 40px);
    padding-bottom: clamp(12px, 3vh, 56px);
  }
  .otp-eyebrow { margin-bottom: clamp(14px, 3.4vh, 34px); }
  .otp-illus { --illus-w: min(420px, 100%, 52vh); }
}

/* Narrow landscape windows keep two columns with slimmer gutters. */
@media (max-width: 900px) and (orientation: landscape) {
  .otp-header { padding-left: 32px; padding-right: 32px; }
  .otp-split { padding-left: 32px; padding-right: 32px; column-gap: 40px; }
}

/* ── Portrait tablets and phones: one column, message above the form ──
   A landscape window keeps the two columns down to 700px - a narrow laptop
   window stacked would need scrolling for no gain. */
@media (max-width: 700px), (max-width: 900px) and (orientation: portrait) {
  /* Same centred column as the content below, so the logo keeps its line. */
  .otp-header { width: min(560px, 100%); padding: 28px 28px 0; }
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
    /* Same idea on the right: the envelope ends ~14% short of the image's
       edge, so the image hangs past the column by that much. */
    margin: 0 calc(170px * -0.14) 0 0;
  }
  .otp-eyebrow { margin-bottom: 14px; line-height: normal; }
  .otp-headline { white-space: normal; }
  .otp-headline { font-size: clamp(32px, 5.4vw, 40px); }
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
  .otp-headline { font-size: clamp(26px, 7.6vw, 30px); line-height: 1.05; }
  .otp-sub { font-size: 14px; margin-top: 8px; }
  .otp-illus { width: 118px; margin-right: calc(118px * -0.14); }
}

@media (max-width: 380px) {
  .otp-header { padding: 16px 16px 0; }
  .otp-split { padding: 18px 16px 36px; }
  .otp-illus { width: 100px; margin-right: calc(100px * -0.14); }
}
</style>
