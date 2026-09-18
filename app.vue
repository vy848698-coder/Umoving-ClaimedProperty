<template>
  <div class="app">
    <NuxtPage />

    <!-- Toast — mounted once here (not per-page). showToast() is a global
         reactive singleton (useCustomToast.ts), but nothing rendered it
         outside the handful of pages that happen to include <Toast>
         locally themselves - every other showToast() call in the app
         silently did nothing. Global mount here is what lets claim/[id].vue
         surface a non-blocking warning when ownership verification or
         passport activation fails without blocking the user's flow. -->
    <Toast
      :is-visible="toastState.isVisible"
      :message="toastState.message"
      :icon="toastState.icon"
      :icon-emoji="toastState.iconEmoji"
      :duration="toastState.duration"
      @close="hideToast"
    />
  </div>
</template>

<script setup>
// SplashScreen disabled across the app per request.
// Component file kept at ~/components/core/SplashScreen.vue if it needs to
// be re-enabled later — just re-add the import and <SplashScreen /> tag.
//
// The passport-stamp celebration (rewards/PassportAchievement.vue) used to
// be mounted here too. This website (unlike the app, which keeps its own
// separate copy) no longer shows it - only its own Founding Homeowner
// certificate celebration remains, which lives on the Passport page itself
// rather than globally here.
import Toast from '~/components/ui/Toast.vue'
import { useAppToast } from '~/composables/useCustomToast'

const { toastState, hideToast } = useAppToast()

// Global app configuration
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>
<style scoped>
.app {
  @apply min-h-dvh flex flex-col;
  /* `clip` blocks horizontal overflow without creating a scroll container,
     which `overflow-x: hidden` does — that would break the sticky navbars
     on the pages inside this wrapper. */
  overflow-x: clip;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>
