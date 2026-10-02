<template>
  <!-- "Own a home?" Founding Homeowner promo (client prototype,
       signin/signup/claim, 2026-09-26). Compact variant (signin/signup,
       untouched since 2026-09-27 per client sign-off) uses
       founder-certificate.png (client-cropped from server/assets/
       certificate/certimage.png) + founder-seal.png as separate layered
       images. Hero variant (claim page, founding-homeowners landing) uses
       founder-certificate-sample.png instead - the client's sample render,
       which already bakes in the seal, background wash and paper tilt as
       one image. Text stays real HTML (not baked into the art) for
       accessibility, so a translation or copy tweak never needs a
       re-crop. -->
  <div v-if="variant === 'compact'" class="fp-compact">
    <div class="fp-compact-art">
      <img
        src="/founder/founder-certificate.png"
        alt="Founding Homeowner Certificate"
        class="fp-compact-cert"
      />
      <img src="/founder/founder-seal.png" alt="" class="fp-compact-seal" />
    </div>
    <div class="fp-compact-body">
      <p class="fp-compact-kicker">Own a home?</p>
      <p class="fp-compact-title">{{ title }}</p>
      <NuxtLink :to="ctaTo" class="fp-compact-link">
        {{ ctaText }}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </NuxtLink>
    </div>
  </div>

  <!-- Borderless, full-bleed hero (client prototype, 2026-09-26; enlarged
       + switched to the client's sample certificate render, 2026-09-28) -
       no card/box behind the copy or the art; the "What your Founder
       status gives you" benefits list moved out to the claim page's own
       aside, since the prototype places it beside the search card, not
       attached to this hero band. founder-certificate-sample.png already
       has the seal, the background wash and the paper's own tilt baked
       in, so it's a single image here - no separate seal overlay. -->
  <section v-else class="fp-hero">
    <div class="fp-hero-copy">
      <p class="fp-hero-kicker">Founding Homeowners</p>
      <h2 class="fp-hero-title">{{ title }}</h2>
      <p class="fp-hero-lede">{{ body }}</p>
    </div>
    <div class="fp-hero-art">
      <img
        src="/founder/founder-certificate-sample.png"
        alt="Founding Homeowner Certificate"
        class="fp-hero-cert"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "compact" | "hero";
    title?: string;
    body?: string;
    ctaText?: string;
    ctaTo?: string;
  }>(),
  {
    variant: "compact",
    title: "Join the million and change the face of home buying and selling.",
    body: "",
    ctaText: "Explore Founding Homeowners",
    ctaTo: "/claim",
  },
);
</script>

<style scoped>
/* ── Compact (signin / signup aside) ─────────────────────────────────
   No card/box/border — the prototype floats the art and copy directly
   on the panel background, flush to its left edge, full width. ── */
.fp-compact {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.fp-compact-art {
  position: relative;
  width: 148px;
  height: 116px;
  flex-shrink: 0;
}
.fp-compact-cert {
  position: absolute;
  left: 0;
  top: 8px;
  width: 150px;
  height: auto;
  border-radius: 6px;
  transform: rotate(-8deg);
  box-shadow: 0 6px 16px rgba(20, 30, 60, 0.2);
}
.fp-compact-seal {
  position: absolute;
  right: 2px;
  bottom: -2px;
  width: 65px;
  height: 65px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(138, 95, 10, 0.4));
}

.fp-compact-body {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.fp-compact-kicker {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #e07a1f;
}
.fp-compact-title {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.35;
  color: #231d45;
}
.fp-compact-link {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: #00857f;
  text-decoration: underline;
}
.fp-compact-link:hover {
  text-decoration: none;
}
.fp-compact-link svg {
  width: 14px;
  height: 14px;
}

/* ── Hero (claim page) ─────────────────────────────────────────────
   No card/box/border - full-bleed band matching the prototype, copy on
   the left, the certificate + seal bleeding off the right edge over a
   soft radial wash. Negative margin-bottom lets the step tracker that
   follows this component overlap the art's lower edge, matching the
   prototype (client feedback, 2026-09-26). ── */
.fp-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 40px;
  padding: 24px 0 0;
  margin-bottom: -46px;
}

.fp-hero-copy {
  position: relative;
  z-index: 1;
  max-width: 640px;
}
.fp-hero-kicker {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #00857f;
}
.fp-hero-title {
  margin: 0;
  font-size: clamp(34px, 4.4vw, 50px);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #231d45;
  line-height: 1.08;
}
.fp-hero-lede {
  margin: 20px 0 0;
  max-width: 54ch;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.6;
  color: #5b6d89;
}

/* Enlarged (client feedback, 2026-09-28) - the sample certificate render
   already has the seal, background wash and paper tilt baked in, so this
   is just one image, sized generously to anchor the hero. */
.fp-hero-art {
  position: relative;
  z-index: 1;
  width: 560px;
  flex-shrink: 0;
}
/* No shadow/border/radius (client feedback, 2026-09-28) - the sample
   render's own soft-edged background wash already fades into the page,
   so a card frame around it just drew a second, competing edge. */
.fp-hero-cert {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 1100px) {
  .fp-hero-art {
    width: 440px;
  }
}
@media (max-width: 900px) {
  .fp-hero {
    grid-template-columns: 1fr;
    padding-bottom: 0;
  }
  .fp-hero-art {
    width: 100%;
    max-width: 480px;
    justify-self: center;
  }
}
@media (max-width: 520px) {
  .fp-compact {
    flex-direction: column;
    align-items: flex-start;
  }
  .fp-hero-benefits {
    grid-template-columns: 1fr;
  }
}
</style>
