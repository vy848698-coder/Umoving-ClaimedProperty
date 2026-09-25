<template>
  <div class="claim-root">
    <div class="cl-ambient cl-ambient-a" />
    <div class="cl-ambient cl-ambient-b" />
    <div class="cl-mesh" />

    <!-- ── Web nav ──────────────────────────────────────────────────── -->
    <header class="hsw-nav">
      <div class="hsw-shell hsw-nav-inner">
        <button class="hsw-brand" type="button" @click="navigateTo(FLOW_HOME)">
          <img src="/op-icons/logo.png" alt="" class="hsw-brand-logo" />
          <span>umovingu</span>
        </button>
        <div class="hsw-actions">
          <button class="hsw-back" type="button" @click="navigateTo(FLOW_HOME)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Exit
          </button>
          <PassportNavButton />
          <ProfileMenu />
        </div>
      </div>
    </header>

    <main class="hsw-shell claim-main" :class="{ 'claim-main--search': step === 'search' }">
      <!-- ── Page header: back, step title and the journey tracker ── -->
      <div class="claim-top">
      <div class="claim-head">
        <button class="cl-back" type="button" aria-label="Back" @click="onBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="claim-head-text">
          <div class="claim-head-title">{{ topbarTitle }}</div>
          <div class="claim-head-sub">{{ topbarSub }}</div>
        </div>
      </div>
      <ClaimStepTracker :current="claimStage" class="claim-tracker" />
      </div>

      <div class="claim-layout">
        <section class="claim-panel">

    <!-- ════════════════════════════ SEARCH ════════════════════════════ -->
    <div v-if="step === 'search'" class="cl-screen">
      <div class="cl-hero">
        <div class="cl-hero-ic"><img src="/dashboard-art/searchHouse.png" alt="" /></div>
        <h1 class="cl-h1">Which property are you claiming?</h1>
        <p class="cl-body">
          Enter your postcode and select your address. We'll verify ownership via
          HM Land Registry.
        </p>
      </div>

      <div class="cl-field-wrap">
        <div class="cl-field-label">Postcode or address</div>
        <SelectedAddressCard
          v-if="selectedProperty"
          :property="selectedProperty"
          @change="clearSelection"
        />
        <template v-else>
          <PropertySearchInput
            placeholder="e.g. SK7 4BL"
            variant="light"
            @select="onPropertySelect"
          />
          <AddressHelp />
        </template>
      </div>

      <div class="cl-lock-note">
        <div class="cl-lock-ic"><img src="/build/padlock.png" alt="" /></div>
        <div class="cl-lock-body">
          We verify ownership via
          <strong>HM Land Registry</strong>. Your details are encrypted and never sold.
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ CONFIRM ════════════════════════════ -->
    <div v-else-if="step === 'confirm'" class="cl-screen">
      <div class="cl-hero">
        <div class="cl-hero-ic"><img src="/build/lrTitleBank.png" alt="" /></div>
        <h1 class="cl-h1">Is this your property?</h1>
        <p class="cl-body">Check these details match the property you own.</p>
      </div>

      <div class="cl-navy-card">
        <div class="cl-navy-glow" />
        <img class="cl-navy-img" src="/dashboard-art/searchHouse-left.png" alt="" />
        <div class="cl-navy-eyebrow">Found on Land Registry</div>
        <div class="cl-navy-addr1">{{ toTitleCase(selectedProperty?.addressLine1) || 'Address not available' }}</div>
        <div class="cl-navy-addr2">
          {{ [toTitleCase(selectedProperty?.city), selectedProperty?.postcode?.toUpperCase()].filter(Boolean).join(', ') }}
        </div>
        <div class="cl-tile-grid">
          <div class="cl-tile">
            <div class="cl-tile-l">Tenure</div>
            <div class="cl-tile-v">{{ tenureDisplay }}</div>
          </div>
          <div class="cl-tile">
            <div class="cl-tile-l">Title number</div>
            <div class="cl-tile-v">{{ titleDisplay }}</div>
          </div>
          <div class="cl-tile">
            <div class="cl-tile-l">Type</div>
            <div class="cl-tile-v">{{ typeDisplay }}</div>
          </div>
          <div class="cl-tile">
            <div class="cl-tile-l">Registered</div>
            <div class="cl-tile-v">{{ registeredDisplay }}</div>
          </div>
        </div>
      </div>

      <div class="cl-info-pale">
        <div class="cl-sec-ic" aria-hidden="true"><img src="/build/idCard.png" alt="" /></div>
        <div class="cl-info-body">
          Next we'll verify <strong>your identity</strong> to confirm you're
          the registered owner. Takes about 2 minutes.
        </div>
      </div>

      <div class="cl-link-center" @click="step = 'search'">
        Not the right property? Search again
      </div>

      <div v-if="verificationError" class="cl-err-banner">
        {{ verificationError }}
        <button class="cl-err-retry" @click="confirmProperty">Retry</button>
      </div>
    </div>

    <!-- ════════════════════════════ OWNER-CLAIM PAYMENT ════════════════════════════ -->
    <div v-else-if="step === 'payment'" class="cl-screen">
      <div class="cl-owned">
        <img src="/build/lrTitleBank.png" alt="" class="cl-owned-illus" />
        <div>
          <div class="cl-owned-t">Before we verify your ownership</div>
          <div class="cl-owned-s">{{ claimPriceReason }}</div>
        </div>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-eyebrow cl-mb-sm">What this fee covers</div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="cl-body" style="margin: 0" v-html="claimPriceExplainer" />
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-lrf-rows">
          <div class="cl-lrf-row">
            <span class="cl-lrf-l">Verification fee</span>
            <span class="cl-lrf-v">{{ claimPriceDisplay }}</span>
          </div>
        </div>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-eyebrow cl-mb-sm">Card details</div>
        <div id="claim-stripe-card-element" class="cl-stripe-box" />
      </div>

      <div v-if="paymentError" class="cl-err-banner" role="alert">
        <span>{{ paymentError }}</span>
      </div>

      <button
        class="cl-btn-brand cl-w-full"
        :disabled="paymentLoading || !cardReady"
        @click="payClaimFee"
      >
        <span v-if="paymentLoading" class="cl-btn-spinner" />
        <template v-else>Pay {{ claimPriceDisplay }} securely →</template>
      </button>
    </div>

    <!-- ════════════════════════════ KYC EXPLAINER ════════════════════════════ -->
    <div v-else-if="step === 'kyc-explainer'" class="cl-screen cl-center-col">
      <div class="cl-hero">
        <div class="cl-hero-ic"><img src="/build/idBadge.png" alt="" /></div>
        <h1 class="cl-h1">Verify your identity</h1>
        <p class="cl-body">
          We need to confirm who you are before we check ownership. Takes around
          2 minutes, and it is done once only.
        </p>
      </div>

      <div class="cl-card cl-text-l cl-mb-sm">
        <div class="cl-eyebrow">What's involved</div>
        <div class="cl-row-list">
          <div class="cl-step-row">
            <div class="cl-step-ic"><img src="/build/idCard.png" alt="" /></div>
            <div>
              <div class="cl-step-t">Photo ID</div>
              <div class="cl-step-s">Passport or driving licence</div>
            </div>
          </div>
          <div class="cl-step-row">
            <div class="cl-step-ic"><img src="/build/cameraFront.png" alt="" /></div>
            <div>
              <div class="cl-step-t">Liveness check</div>
              <div class="cl-step-s">Quick selfie to confirm it's you</div>
            </div>
          </div>
          <div class="cl-step-row">
            <div class="cl-step-ic"><img src="/build/shield.png" alt="" /></div>
            <div>
              <div class="cl-step-t">AML screening</div>
              <div class="cl-step-s">Automatic check, takes seconds</div>
            </div>
          </div>
        </div>
      </div>

      <div class="cl-card-pale cl-text-l">
        <div class="cl-pale-row">
          <div class="cl-pale-ic"><img src="/buyer-profile-icon/stopwatch.png" alt="" /></div>
          <div>
            <div class="cl-pale-t">Usually under 2 minutes</div>
            <div class="cl-pale-s">
              Powered by Persona, used by major UK fintechs.
            </div>
          </div>
        </div>
      </div>

      <!-- Polling state — shown after the user opens the Persona hosted flow -->
      <div v-if="personaPolling || personaInquiryId" class="cl-info-pale" style="margin-top: 14px;">
        <div class="cl-info-ic">
          <img :src="personaPolling ? '/buyer-profile-icon/stopwatch.png' : '/build/idCard.png'" alt="" />
        </div>
        <div class="cl-info-body">
          <template v-if="personaPolling">
            Verification is open in a new tab. We'll continue automatically as
            soon as Persona finishes.
          </template>
          <template v-else>
            Finished in the verification tab? Tap <strong>Check now</strong>.
          </template>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              type="button"
              class="cl-err-retry"
              :disabled="personaCheckingNow"
              @click="checkPersonaNow"
            >
              {{ personaCheckingNow ? 'Checking…' : 'Check now' }}
            </button>
            <button
              v-if="!personaPolling"
              type="button"
              class="cl-err-retry"
              style="background: transparent; color: #1f7a66;"
              @click="runPolling"
            >
              Resume auto-check
            </button>
          </div>
        </div>
      </div>

      <!-- Persona error banner -->
      <div v-if="personaError" class="cl-err-banner" style="margin-top: 12px;">
        {{ personaError }}
        <button class="cl-err-retry" @click="startPersonaKyc">Retry</button>
      </div>
    </div>

    <!-- ════════════════════════════ KYC VERIFIED ════════════════════════════ -->
    <div v-else-if="step === 'kyc-verified'" class="cl-screen cl-center-col">
      <div class="cl-hero cl-hero--celebrate">
        <img src="/build/bigCheckHero.png" alt="" class="cl-hero-img" />
        <h1 class="cl-h1">Identity verified!</h1>
        <p class="cl-body">
          You've passed identity and anti-money-laundering checks. Now let's
          confirm you own the property with HM Land Registry.
        </p>
      </div>
      <div class="cl-pill-row">
        <span class="cl-pill-good">✓ ID validated</span>
        <span class="cl-pill-good">✓ Liveness passed</span>
        <span class="cl-pill-good">✓ AML clear</span>
      </div>

      <div class="cl-card-pale cl-text-l cl-w-full">
        <div class="cl-pale-row">
          <div class="cl-pale-ic"><img src="/build/dvsBank.png" alt="" /></div>
          <div>
            <div class="cl-pale-t">Next: Land Registry check</div>
            <div class="cl-pale-s">
              We confirm ownership matches your verified identity.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ LR SEARCHING ════════════════════════════ -->
    <div v-else-if="step === 'lr-searching'" class="cl-screen cl-center-col">
      <div class="cl-lr-pulse-wrap">
        <div class="cl-lr-pulse" />
        <div class="cl-lr-pulse cl-lr-pulse--late" />
        <div class="cl-lr-inner"><img src="/build/lrTitleBank.png" alt="" /></div>
      </div>
      <div class="cl-hero">
        <h1 class="cl-h1">Searching HM Land Registry</h1>
        <p class="cl-body">
          Checking the official register for<br />
          <strong>{{ lrAddressDisplay }}</strong>
        </p>
      </div>

      <div class="cl-card cl-lr-card cl-w-full">
        <div class="cl-lr-bar">
          <span :style="{ width: `${(Math.min(lrStep, lrChecks.length) / lrChecks.length) * 100}%` }" />
        </div>
        <div class="cl-lr-steps">
          <div
            v-for="(label, i) in lrChecks"
            :key="label"
            class="cl-lr-step"
            :class="{ 'cl-lr-step-done': lrStep > i, 'cl-lr-step-active': lrStep === i }"
          >
            <div class="cl-lr-dot">
              <svg v-if="lrStep > i" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span v-else-if="lrStep === i" class="cl-lr-spin" />
            </div>
            {{ label }}
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ LR FAILED ════════════════════════════ -->
    <div v-else-if="step === 'lr-failed'" class="cl-screen cl-center-col">
      <div class="cl-lr-pulse-wrap">
        <div class="cl-lr-inner cl-lr-inner--fail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
      </div>
      <h1 class="cl-h1" style="text-align: center">Ownership not confirmed</h1>
      <p class="cl-body" style="text-align: center; max-width: 420px">
        {{
          lrErrorMessage ||
          'HM Land Registry could not confirm you own this property.'
        }}
      </p>

      <div
        v-if="
          lrResult?.status === 'ADDITIONAL_INFO_NEEDED' ||
          lrResult?.matchResult === 'NO_MATCHES'
        "
        class="cl-card cl-mb-sm cl-w-full"
        style="max-width: 420px"
      >
        <div class="cl-eyebrow cl-mb-sm">What HM Land Registry returned</div>
        <div class="cl-lrf-rows">
          <div v-if="lrResult?.titleNumber" class="cl-lrf-row">
            <span class="cl-lrf-l">Title number</span>
            <span class="cl-lrf-v">{{ lrResult.titleNumber }}</span>
          </div>
          <div v-if="lrResult?.matchResult" class="cl-lrf-row">
            <span class="cl-lrf-l">Match result</span>
            <span class="cl-lrf-v">{{ lrResult.matchResult }}</span>
          </div>
          <div v-if="lrResult?.historical" class="cl-lrf-row">
            <span class="cl-lrf-l">Status</span>
            <span class="cl-lrf-v">Historical proprietor</span>
          </div>
        </div>
      </div>

      <div class="cl-w-full cl-fail-actions">
        <button class="cl-btn-ghost" @click="step = 'search'">
          Try another property
        </button>
        <button class="cl-btn-brand" @click="runLrSearch()">
          Retry
        </button>
      </div>
    </div>

    <!-- ════════════════════════════ LR FOUND ════════════════════════════ -->
    <div v-else-if="step === 'lr-found'" class="cl-screen">
      <div class="cl-hero">
        <div class="cl-hero-ic cl-hero-ic--success"><img src="/build/ownershipCheck.png" alt="" /></div>
        <h1 class="cl-h1">Ownership verified</h1>
        <p class="cl-body">
          Your verified name matches the HM Land Registry record for
          <strong>{{ lrAddressDisplay }}</strong>.
        </p>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-lrf-head">
          <span class="cl-lrf-head-ic"><img src="/build/lrTitleBank.png" alt="" /></span>
          <span class="cl-eyebrow" style="margin: 0;">Land Registry title data</span>
        </div>
        <div class="cl-lrf-rows">
          <div class="cl-lrf-row">
            <span class="cl-lrf-rowhead">
              <span class="cl-lrf-row-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
              </span>
              <span class="cl-lrf-l">Title number</span>
            </span>
            <span class="cl-lrf-v">{{ titleDisplay }}</span>
          </div>
          <div class="cl-lrf-row">
            <span class="cl-lrf-rowhead">
              <span class="cl-lrf-row-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              </span>
              <span class="cl-lrf-l">Tenure</span>
            </span>
            <span class="cl-lrf-v">{{ tenureDisplay }}</span>
          </div>
          <div class="cl-lrf-row">
            <span class="cl-lrf-rowhead">
              <span class="cl-lrf-row-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </span>
              <span class="cl-lrf-l">Proprietor</span>
            </span>
            <span class="cl-lrf-v cl-lrf-v-good">✓ {{ proprietorDisplay }}</span>
          </div>
          <div class="cl-lrf-row">
            <span class="cl-lrf-rowhead">
              <span class="cl-lrf-row-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </span>
              <span class="cl-lrf-l">Registered</span>
            </span>
            <span class="cl-lrf-v">{{ registeredDisplay }}</span>
          </div>
          <div class="cl-lrf-row cl-lrf-row-last">
            <span class="cl-lrf-rowhead">
              <span class="cl-lrf-row-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
              <span class="cl-lrf-l">Charges</span>
            </span>
            <span class="cl-lrf-v">Not available</span>
          </div>
        </div>
      </div>

      <div class="cl-ready cl-mb-sm">
        <img class="cl-ready-img" :src="readyPassport.image" :alt="readyPassport.title" />
        <div class="cl-ready-text">
          <div class="cl-ready-t">{{ readyPassport.title }}</div>
          <div class="cl-ready-s">
            {{ proprietorDisplay }} is confirmed as the owner. Issue your Passport
            to start building its record.
          </div>
        </div>
      </div>

      <div v-if="issueError" class="cl-err-banner">
        <span>{{ issueError }}</span>
        <button v-if="!needsPhone" class="cl-err-retry" @click="issuePassport">Retry</button>
      </div>

      <!-- The backend can refuse to issue until the account has a phone
           number (it is optional at sign-up), so collect it right here. -->
      <div v-if="needsPhone" class="cl-card cl-mb-sm">
        <div class="cl-eyebrow cl-mb-xs">Add your mobile number</div>
        <p class="cl-body cl-mb-md">
          We need a mobile number on your account before we can issue your Passport.
        </p>
        <PhoneInput v-model="phoneInput" />
        <div v-if="phoneError" class="cl-err-banner" style="margin-top: 12px;">{{ phoneError }}</div>
        <button
          class="cl-err-retry"
          style="margin-top: 12px;"
          :disabled="phoneSaving || issueLoading"
          @click="savePhoneAndIssue"
        >
          {{ phoneSaving || issueLoading ? 'Saving…' : 'Save number and issue Passport' }}
        </button>
      </div>
    </div>

          <!-- Inline CTA (desktop — replaces the mobile fixed action bar) -->
          <div v-if="showCta" class="cl-cta-inline">
            <button
              class="cl-btn-brand"
              :disabled="ctaDisabled"
              @click="onPrimary"
            >
              <span v-if="ctaLoading" class="cl-btn-spinner" />
              {{ ctaLabel }}
            </button>
          </div>

        </section>

        <!-- Reassurance rail — the property being claimed, then why it's safe -->
        <aside class="claim-aside">
          <div v-if="selectedProperty && step !== 'search'" class="claim-aside-prop">
            <SelectedAddressCard :property="selectedProperty" readonly />
          </div>
          <div class="claim-aside-card">
            <div class="claim-aside-eyebrow">Why this is safe</div>
            <ul class="claim-aside-list">
              <li>
                <span class="claim-aside-ic"><img src="/build/dvsBank.png" alt="" /></span>
                <div>
                  <div class="claim-aside-t">HM Land Registry</div>
                  <p>Ownership verified against the official register.</p>
                </div>
              </li>
              <li>
                <span class="claim-aside-ic"><img src="/build/idCard.png" alt="" /></span>
                <div>
                  <div class="claim-aside-t">Identity by Persona</div>
                  <p>Bank-grade ID &amp; liveness checks, used by major UK fintechs.</p>
                </div>
              </li>
              <li>
                <span class="claim-aside-ic"><img src="/build/shield.png" alt="" /></span>
                <div>
                  <div class="claim-aside-t">Encrypted &amp; private</div>
                  <p>Your documents are encrypted and never sold.</p>
                </div>
              </li>
            </ul>
            <div class="claim-aside-trust">
              <span><img src="/build/padlock.png" alt="" />Encrypted</span>
              <span><img src="/build/lrTitleBank.png" alt="" />HM Land Registry</span>
              <span><img src="/build/shield.png" alt="" />Never sold</span>
            </div>
          </div>
        </aside>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import type { Stripe, StripeCardElement } from '@stripe/stripe-js'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'
import PhoneInput from '~/components/form/PhoneInput.vue'
import ProfileMenu from '~/components/core/ProfileMenu.vue'
import PassportNavButton from '~/components/core/PassportNavButton.vue'
import ClaimStepTracker from '~/components/claim/ClaimStepTracker.vue'
import SelectedAddressCard from '~/components/claim/SelectedAddressCard.vue'
import AddressHelp from '~/components/claim/AddressHelp.vue'
import { toTitleCase } from '~/utils/form-helpres'
import { FLOW_HOME } from '~/utils/appFlow'
import { CLAIM_STEPS } from '~/utils/claimSteps'
definePageMeta({ middleware: 'auth' })

type ClaimStep =
  | 'search'
  | 'confirm'
  | 'payment'
  | 'kyc-explainer'
  | 'kyc-verified'
  | 'lr-searching'
  | 'lr-failed'
  | 'lr-found'

import { useFounderCelebration } from '~/composables/useFounderCelebration'

const route = useRoute()
const config = useRuntimeConfig()

// Every claim issues a Seller Passport. The drawer that used to ask seller vs
// landlord here has been removed: the user pays, verifies, issues, and lands on
// their Seller Passport without being asked to pick a type.
const PASSPORT_TYPE = 'seller' as const

// The Founding Homeowner congrats modal itself now lives on the Passport
// page (pages/passportview/[id].vue) - it appears a beat after landing
// there rather than blocking this page's redirect. See issuePassport()
// below and useFounderCelebration for the handoff.
const { setPending: setPendingFounderCelebration } = useFounderCelebration()
const issuedPassportPath = ref('')
// The certificate is per property, so the modal links to this claim's one.
const issuedCertificatePath = ref('/certificate')

const readyPassport = {
  image: '/build/umu-passport-sm.png',
  title: 'Your Property Passport is ready',
}
const base = config.public.apiBase as string

const propertyId = route.params.id as string
const step = ref<ClaimStep>('search')
const selectedProperty = ref<any>(null)

// LR state
const lrStep = ref(0)
const lrChecks = [
  'Address matched to title number',
  'Title register retrieved',
  'Proprietor matched to your identity',
]

// Verification / issue errors
const verificationError = ref('')
const verifyLoading = ref(false)
const issueError = ref('')
const issueLoading = ref(false)

// Phone fallback for an issue refused for want of a phone number.
const needsPhone = computed(() => issueError.value.toLowerCase().includes('phone'))
const phoneInput = ref('')
const phoneSaving = ref(false)
const phoneError = ref('')

async function savePhoneAndIssue() {
  phoneError.value = ''
  if (phoneInput.value.replace(/\D/g, '').length < 7) {
    phoneError.value = 'Please enter a valid mobile number.'
    return
  }
  phoneSaving.value = true
  try {
    await $fetch(`${base}/profile/me`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { phone: phoneInput.value },
    })
  } catch (e: any) {
    phoneError.value =
      e?.data?.message || 'Could not save your number. Please try again.'
    return
  } finally {
    phoneSaving.value = false
  }
  await issuePassport()
}

// Profile (for proprietor name)
const userFullName = ref<string>('')

// ── Helpers ──────────────────────────────────────────────────
function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}
function authHeaders() {
  return {
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  }
}

async function loadProperty() {
  if (!propertyId || propertyId === 'new') return
  try {
    const data = await $fetch<any>(`${base}/property/${propertyId}`)
    if (data && data.id) {
      selectedProperty.value = data
      step.value = 'confirm'
    }
  } catch {
    // Property not found — remain on search step
  }
}

async function loadProfile() {
  try {
    const p = await $fetch<any>(`${base}/profile/me`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
    const n = [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim()
    userFullName.value = n || p?.email || 'Property owner'
  } catch {
    userFullName.value = 'Property owner'
  }
}

onMounted(async () => {
  // The passport-type drawer is not shown here any more: it opens once
  // ownership is verified, right before issuing (see the step watcher).
  await Promise.all([loadProperty(), loadProfile()])
})

// ── Topbar logic ──────────────────────────────────────────────
const showCta = computed(
  () => !['lr-searching', 'lr-failed', 'payment'].includes(step.value),
)

// `stage` is the step of the overall journey (utils/claimSteps.ts) each screen
// belongs to, so the tracker keeps counting from the claim start page instead
// of restarting per sub-flow. Stage 4 (the Passport) is the page we hand off to.
const stepMeta: Record<ClaimStep, { title: string; stage: number }> = {
  search: { title: 'Find your property', stage: 1 },
  confirm: { title: 'Confirm property', stage: 1 },
  payment: { title: 'Verification fee', stage: 1 },
  'kyc-explainer': { title: 'Verify identity', stage: 2 },
  'kyc-verified': { title: 'Identity verified', stage: 3 },
  'lr-searching': { title: 'Searching Land Registry', stage: 3 },
  'lr-failed': { title: 'Ownership not confirmed', stage: 3 },
  'lr-found': { title: 'Ownership confirmed', stage: 3 },
}
const topbarTitle = computed(() => stepMeta[step.value].title)
const claimStage = computed(() => stepMeta[step.value].stage)
const topbarSub = computed(
  () => `Step ${claimStage.value} of ${CLAIM_STEPS.length} · ${CLAIM_STEPS[claimStage.value - 1]?.short ?? ''}`,
)

// ── Display fields (from selectedProperty) ─────────────────────
const tenureDisplay = computed(
  () => selectedProperty.value?.tenure || 'Not available',
)
const titleDisplay = computed(
  () => selectedProperty.value?.titleNumber || 'Not available',
)
const typeDisplay = computed(
  () => selectedProperty.value?.propertyType || 'Not available',
)
const registeredDisplay = computed(() => {
  const d = selectedProperty.value?.createdAt
  if (!d) return 'Not available'
  try {
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  } catch {
    return 'Not available'
  }
})
const proprietorDisplay = computed(
  () => userFullName.value || 'Property owner',
)
const lrAddressDisplay = computed(() => {
  const a1 = selectedProperty.value?.addressLine1 || 'your property'
  const pc = selectedProperty.value?.postcode || ''
  return pc ? `${a1}, ${pc}` : a1
})

// ── Search step ───────────────────────────────────────────────
function onPropertySelect(p: any) {
  selectedProperty.value = p
}
function clearSelection() {
  selectedProperty.value = null
}

// ── Back button ───────────────────────────────────────────────
function onBack() {
  switch (step.value) {
    case 'search':
      navigateTo(FLOW_HOME)
      return
    case 'confirm':
      step.value = 'search'
      return
    case 'payment':
      // Payment now runs right after 'confirm' (before KYC/HMLR), so
      // that's the only step before it in this order.
      step.value = 'confirm'
      return
    case 'kyc-explainer':
      step.value = 'confirm'
      return
    case 'kyc-verified':
      step.value = 'confirm'
      return
    case 'lr-found':
      // An already-verified user never saw the identity screens, so back
      // returns to the property they confirmed.
      step.value = kycAlreadyApproved.value ? 'confirm' : 'kyc-verified'
      return
    default:
      navigateTo(FLOW_HOME)
  }
}

// ── CTA label / action per step ───────────────────────────────
const ctaLabel = computed(() => {
  switch (step.value) {
    case 'search':
      return 'Confirm address →'
    case 'confirm':
      return verifyLoading.value ? 'Starting…' : 'Yes, this is my property →'
    case 'kyc-explainer':
      return personaPolling.value ? 'Verifying…' : 'Start identity check →'
    case 'kyc-verified':
      return 'Verify property ownership →'
    case 'lr-found':
      return issueLoading.value ? 'Issuing…' : 'Issue my Passport →'
    default:
      return 'Continue →'
  }
})
const ctaDisabled = computed(() => {
  if (verifyLoading.value || issueLoading.value || personaPolling.value) return true
  switch (step.value) {
    case 'search':
      return !selectedProperty.value
    default:
      return false
  }
})
const ctaLoading = computed(
  () => verifyLoading.value || issueLoading.value || personaPolling.value,
)

function onPrimary() {
  switch (step.value) {
    case 'search':
      step.value = 'confirm'
      return
    case 'confirm':
      confirmProperty()
      return
    case 'kyc-explainer':
      // Real Persona flow — opens hosted page in a new tab and polls for completion.
      startPersonaKyc()
      return
    case 'kyc-verified':
      step.value = 'lr-searching'
      return
    case 'lr-found':
      issuePassport()
      return
  }
}

// ── confirm → start-verification → create the (unpaid) claim → pay ─────
// Payment happens BEFORE KYC/HM Land Registry run, matching the mobile
// app: we don't want to incur either cost on a user who confirms then
// never pays. The KYC-explainer / HMLR-search steps happen once
// payClaimFee() below confirms the Stripe charge succeeded.
async function confirmProperty() {
  verificationError.value = ''
  const pId = selectedProperty.value?.id
  if (!pId) {
    step.value = 'kyc-explainer'
    return
  }
  verifyLoading.value = true
  try {
    await $fetch(
      `${base}/property/${pId}/start-verification`,
      { method: 'POST', headers: authHeaders() },
    )

    // No passport type yet — that's asked once HM Land Registry verifies
    // ownership (see the 'lr-found' step further down). The backend
    // creates this as an untyped PENDING_PAYMENT record.
    const { claimPassport } = usePassportClaim()
    const res = await claimPassport(
      pId,
      selectedProperty.value?.addressLine1 ?? '',
      selectedProperty.value?.postcode ?? '',
    )
    const passportId = res.passportId
    if (!passportId) throw new Error('Passport could not be created')

    if (res.status === 'PENDING_PAYMENT') {
      claimPassportId.value = passportId
      await openPaymentStep(passportId)
      return
    }

    // Already active — a resumed or previously-completed claim on this
    // property. No fresh payment or verification needed.
    await navigateTo(`/passportview/${passportId}`, { replace: true })
  } catch (e: any) {
    verificationError.value =
      e?.data?.message || 'Could not start verification. Please try again.'
  } finally {
    verifyLoading.value = false
  }
}

// ── Owner-claim payment (Stripe) ────────────────────────────────
const claimPassportId = ref<string | null>(null)
const claimClientSecret = ref('')
const claimAmountPence = ref<number | null>(null)
const paymentError = ref('')
const paymentLoading = ref(false)
const cardReady = ref(false)
let stripeInstance: Stripe | null = null
let cardElement: StripeCardElement | null = null

const claimPriceDisplay = computed(() =>
  claimAmountPence.value != null
    ? `£${(claimAmountPence.value / 100).toFixed(2)}`
    : '',
)
// The backend picks the tier — infer which one just from the amount (the
// three tiers are all distinct: £8.99 KYC-only, £12.99 HMLR-only, £19.99
// both) so the copy explains what's being charged without duplicating the
// pricing logic.
const claimPriceTier = computed<'kyc' | 'hmlr' | 'both' | ''>(() => {
  const amount = claimAmountPence.value
  if (amount == null) return ''
  if (amount <= 899) return 'kyc'
  if (amount <= 1299) return 'hmlr'
  return 'both'
})

const claimPriceReason = computed(() => {
  switch (claimPriceTier.value) {
    case 'kyc':
      return 'Identity verification (KYC)'
    case 'hmlr':
      return 'HM Land Registry ownership check'
    case 'both':
      return 'Identity verification (KYC) and HM Land Registry ownership check'
    default:
      return ''
  }
})

// Wraps the two fee-covering terms in a highlighted span - the copy below
// is authored here (never user input), so v-html on it is safe.
const KYC_TERM = '<span class="cl-fee-term">KYC</span>'
const HMLR_TERM = '<span class="cl-fee-term">HM Land Registry</span>'

// The polite, spelled-out explanation shown under "What this fee covers" -
// different from claimPriceReason (the short subheading) because a
// partial-fee claim needs to say *why* it's cheaper: which check the user
// already has on file, not just which one is left.
const claimPriceExplainer = computed(() => {
  switch (claimPriceTier.value) {
    case 'kyc':
      return `Your ${HMLR_TERM} ownership check for this property is already on file from an earlier attempt, so this fee only covers your identity verification (${KYC_TERM}).`
    case 'hmlr':
      return `Your identity has already been verified, so this fee only covers the ${HMLR_TERM} ownership check for this property.`
    case 'both':
      return `Identity checks and ${HMLR_TERM} ownership lookups cost us real money per property, so we ask for this one-off fee upfront: identity verification (${KYC_TERM}) and the ${HMLR_TERM} ownership check. Once it's paid, we'll run those checks next.`
    default:
      return ''
  }
})

async function openPaymentStep(passportId: string) {
  paymentError.value = ''
  step.value = 'payment'
  try {
    const { createClaimPaymentIntent } = usePassportClaim()
    const { clientSecret, amount } = await createClaimPaymentIntent(passportId)
    claimClientSecret.value = clientSecret
    claimAmountPence.value = amount
    await nextTick()
    await mountClaimStripe()
  } catch (e: any) {
    paymentError.value =
      e?.data?.message ||
      e?.message ||
      'Could not start payment. Please try again.'
  }
}

async function mountClaimStripe() {
  if (stripeInstance) return
  const { loadStripe } = await import('@stripe/stripe-js')
  stripeInstance = await loadStripe(config.public.stripeKey as string)
  if (!stripeInstance) return

  const elements = stripeInstance.elements()
  cardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#1a1a1a',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#e53e3e' },
    },
  })
  const mountEl = document.getElementById('claim-stripe-card-element')
  if (mountEl) {
    cardElement.mount(mountEl)
    cardElement.on('change', (e) => {
      paymentError.value = e.error?.message ?? ''
      cardReady.value = e.complete
    })
  }
}

async function payClaimFee() {
  if (
    !stripeInstance ||
    !cardElement ||
    !claimClientSecret.value ||
    !claimPassportId.value
  ) {
    paymentError.value = 'Card form not ready. Please try again.'
    return
  }
  paymentLoading.value = true
  paymentError.value = ''
  try {
    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
      claimClientSecret.value,
      { payment_method: { card: cardElement } },
    )
    if (error) {
      paymentError.value = error.message ?? 'Payment failed. Please try again.'
      return
    }
    if (paymentIntent?.status !== 'succeeded') {
      paymentError.value = 'Payment not completed. Please try again.'
      return
    }

    // Payment's confirmed — the passport stays PENDING_PAYMENT until
    // activatePassport() (called from issuePassport, once HM Land Registry
    // comes back VERIFIED below) also sees KYC approved. A user whose KYC
    // was already approved before this claim skips both identity screens
    // and goes straight to the HMLR check; everyone else gets the Persona
    // explainer.
    try {
      const { getKycStatus } = useKyc()
      const r = await getKycStatus()
      if (r.status === 'approved') {
        skipToLandRegistry()
        return
      }
    } catch {
      // If status lookup fails, fall through to the explainer screen.
    }
    step.value = 'kyc-explainer'
  } catch (e: any) {
    paymentError.value =
      e?.data?.message ||
      e?.message ||
      'Could not confirm payment. Please try again.'
  } finally {
    paymentLoading.value = false
  }
}

// ── Persona KYC: open hosted flow + poll until settled ──────────
const personaError = ref('')
const personaPolling = ref(false)
const personaInquiryId = ref<string | null>(null)
const personaCheckingNow = ref(false)
let personaAbort: AbortController | null = null

// True when the user's identity was approved before this claim started. The
// "Identity verified!" screen only celebrates a check done just now, so an
// already-verified user goes straight to the Land Registry search instead.
const kycAlreadyApproved = ref(false)
function skipToLandRegistry() {
  kycAlreadyApproved.value = true
  step.value = 'lr-searching'
}

async function startPersonaKyc() {
  personaError.value = ''
  personaPolling.value = true
  const { startKyc } = useKyc()
  try {
    const start = await startKyc()
    if (start.alreadyVerified || start.status === 'approved') {
      personaPolling.value = false
      skipToLandRegistry()
      return
    }
    if (!start.hostedUrl) {
      personaError.value = 'Could not open the verification page.'
      personaPolling.value = false
      return
    }
    personaInquiryId.value = start.inquiryId
    // Open the hosted flow in a new tab. Persona handles ID upload,
    // liveness + AML inside their UI; we just wait for the result.
    const w = window.open(start.hostedUrl, '_blank', 'noopener')
    if (!w) {
      // Still start polling even though the tab didn't open automatically -
      // the inquiry already exists on Persona's side, so if the user opens
      // the verification link another way (or already has it open from a
      // prior attempt), auto-check picks the result up without them having
      // to find and tap "Resume auto-check" themselves.
      personaError.value =
        'Pop-ups blocked. Allow pop-ups for this site and try again, or open the verification link manually.'
    }
    runPolling()
  } catch (e: any) {
    personaError.value =
      e?.data?.message || e?.message || 'Verification could not start.'
    personaPolling.value = false
  }
}

async function runPolling() {
  const { pollUntilSettled } = useKyc()
  personaError.value = ''
  personaPolling.value = true
  personaAbort?.abort()
  personaAbort = new AbortController()
  try {
    const finalStatus = await pollUntilSettled({
      intervalMs: 3000,
      maxAttempts: 100, // ≈ 5 minutes at 3s each
      signal: personaAbort.signal,
    })
    if (finalStatus === 'approved') {
      step.value = 'kyc-verified'
      personaError.value = ''
    } else if (finalStatus === 'declined' || finalStatus === 'failed') {
      personaError.value =
        'Identity verification failed. Please retry or contact support.'
    } else if (finalStatus === 'needs_review') {
      personaError.value =
        "Your details need a manual review. We'll email you when it's done."
    }
  } catch (e: any) {
    if (e?.message === 'timeout') {
      personaError.value =
        "We're still waiting for the verification result. If you've finished, tap \"Check now\"."
    } else if (e?.message !== 'Polling aborted') {
      personaError.value =
        e?.data?.message || e?.message || 'Could not check status.'
    }
  } finally {
    personaPolling.value = false
  }
}

// Manual "I'm done — check now" button. Hits /kyc/status once and acts on it.
async function checkPersonaNow() {
  if (personaCheckingNow.value) return
  personaCheckingNow.value = true
  personaError.value = ''
  try {
    const { getKycStatus } = useKyc()
    const r = await getKycStatus()
    if (r.status === 'approved') {
      personaAbort?.abort()
      step.value = 'kyc-verified'
    } else if (r.status === 'declined' || r.status === 'failed') {
      personaError.value =
        'Identity verification failed. Please retry or contact support.'
    } else if (r.status === 'needs_review') {
      personaError.value =
        "Your details need a manual review. We'll email you when it's done."
    } else if (r.status === 'pending') {
      personaError.value =
        "We can't see your result yet. Persona usually takes a few seconds, so try again in a moment."
    } else {
      personaError.value = "We haven't received a verification result yet."
    }
  } catch (e: any) {
    personaError.value = e?.data?.message || e?.message || 'Could not check status.'
  } finally {
    personaCheckingNow.value = false
  }
}

onBeforeUnmount(() => personaAbort?.abort())

// ── LR searching animation → lr-found ─────────────────────────
watch(
  () => step.value,
  (s) => {
    if (s === 'lr-searching') runLrSearch()
  },
)
// Set by the real Business Gateway Online Owner Verification call below.
interface LrCheckResult {
  status: 'VERIFIED' | 'ADDITIONAL_INFO_NEEDED' | 'FAILED' | 'IN_PROGRESS'
  matchResult?: string
  titleNumber?: string
  historical?: boolean
  rejection?: { reason?: string; code?: string }
  acknowledgement?: { expectedResponseDateTime?: string }
}
const lrResult = ref<LrCheckResult | null>(null)
const lrErrorMessage = ref('')

async function runLrSearch() {
  lrStep.value = 0
  lrResult.value = null
  lrErrorMessage.value = ''
  const pId = selectedProperty.value?.id
  if (!pId) {
    lrErrorMessage.value = 'No property selected.'
    step.value = 'lr-failed'
    return
  }

  // Animate the first two pacing steps while the real call is in flight so
  // the user never sees an idle spinner — deliberately slower than the real
  // call most of the time; if HMLR is faster we still let the user see the
  // address-matched / register-retrieved beats.
  const animation = (async () => {
    await new Promise((r) => setTimeout(r, 700))
    if (step.value === 'lr-searching') lrStep.value = 1
    await new Promise((r) => setTimeout(r, 800))
    if (step.value === 'lr-searching') lrStep.value = 2
  })()

  // Real Business Gateway Online Owner Verification call.
  let result: LrCheckResult
  try {
    result = await $fetch<LrCheckResult>(
      `${base}/property/${pId}/land-registry-check`,
      { method: 'POST', headers: authHeaders() },
    )
  } catch (e: any) {
    lrErrorMessage.value =
      e?.data?.message ||
      e?.message ||
      "We couldn't reach HM Land Registry. Please try again."
    step.value = 'lr-failed'
    return
  }

  // Make sure the animation has at least played its first two beats so the
  // UI doesn't snap straight to the result.
  await animation
  lrResult.value = result

  if (result.status === 'VERIFIED') {
    lrStep.value = 3
    await new Promise((r) => setTimeout(r, 500))
    if (step.value === 'lr-searching') step.value = 'lr-found'
    return
  }

  lrErrorMessage.value = describeLrFailure(result)
  step.value = 'lr-failed'
}

function describeLrFailure(lr: LrCheckResult): string {
  if (lr.status === 'IN_PROGRESS') {
    const eta = lr.acknowledgement?.expectedResponseDateTime
    return (
      "HM Land Registry is currently out of service hours, so we've queued " +
      'your ownership check' +
      (eta ? ` (expected back by ${eta})` : '') +
      '. Please try again shortly.'
    )
  }
  if (lr.status === 'ADDITIONAL_INFO_NEEDED') {
    if (lr.matchResult === 'MULTIPLE_MATCHES') {
      return (
        'HM Land Registry returned multiple possible titles for this ' +
        'address. Please contact support so we can confirm the right one.'
      )
    }
    if (lr.historical) {
      return (
        'HM Land Registry shows your name on this title historically, but ' +
        "you're no longer listed as the current owner. If you've recently " +
        "sold or transferred this property, that's expected."
      )
    }
    return (
      "We found a partial match against HM Land Registry but couldn't " +
      'fully confirm ownership. Double-check the name on your profile ' +
      'matches the name on the title deeds, then try again.'
    )
  }
  if (lr.status === 'FAILED') {
    if (lr.rejection?.code === 'bg.postcode.invalid') {
      return "HM Land Registry didn't accept the property postcode. Please correct it on the property and try again."
    }
    if (lr.rejection?.code === 'bg.properties.nopropertyfound') {
      return "HM Land Registry couldn't find a title at this address. Double-check the address details."
    }
    if (lr.rejection?.reason) {
      return `HM Land Registry rejected the check: ${lr.rejection.reason}`
    }
    if (lr.matchResult === 'NO_MATCHES') {
      return (
        "Your name doesn't match the registered owner of this property on " +
        'HM Land Registry. If this is wrong (e.g. you bought it recently ' +
        "and the register hasn't updated), please contact support."
      )
    }
    return 'HM Land Registry could not confirm your ownership of this property. Please contact support.'
  }
  return 'Ownership check did not succeed. Please try again.'
}

// ── lr-found → pick a type, set it, activate the already-paid passport,
//    then navigate ──────────────────────────────────────────────────
// The passport was already created and paid for back in confirmProperty() /
// payClaimFee() above (payment runs BEFORE this point). This confirms HM
// Land Registry came back VERIFIED, sets the seller/landlord choice (asked
// for the first time only now — see the step watcher above), then seeds
// the passport's sections.
async function issuePassport() {
  issueError.value = ''
  issueLoading.value = true
  try {
    // HM Land Registry verification already ran during the lr-searching
    // step — runLrSearch() blocks the user from reaching here unless the
    // verdict was VERIFIED. Belt-and-braces guard in case state got out of
    // sync (e.g. via deep-link / back-nav).
    if (lrResult.value?.status !== 'VERIFIED') {
      issueError.value =
        'Ownership has not been verified against HM Land Registry yet.'
      return
    }
    if (!claimPassportId.value) {
      issueError.value =
        'Something went wrong with your claim. Please start again.'
      return
    }
    const { setPassportType, activatePassport } = usePassportClaim()
    await setPassportType(claimPassportId.value, PASSPORT_TYPE, false)
    await activatePassport(claimPassportId.value)
    const passportId = claimPassportId.value

    issuedPassportPath.value = `/passportview/${passportId}`
    issuedCertificatePath.value = `/certificate?passportId=${encodeURIComponent(passportId)}`

    // Assigns (or reads) the founder number and emails the certificate in the
    // background, reusing the exact same endpoint the Certificate page itself
    // calls. Two things matter here:
    //   passportId - the certificate is per property, so it has to name the
    //                passport that was just claimed rather than let the
    //                endpoint guess; a second claim otherwise certifies the
    //                first property's address and passport code.
    //   email=1    - every completed claim earns its own emailed certificate,
    //                not just the first one. Only this flow sets it, so
    //                viewing the certificate page never re-sends.
    // Non-fatal: a failure here (e.g. no name on the profile yet) shouldn't
    // block the claim that already succeeded - just skip the celebration and go
    // straight to the passport.
    try {
      const details = await $fetch<{
        founderNumberLabel: string
        passports: unknown[]
      }>('/api/certificate/me', {
        headers: authHeaders(),
        query: { passportId, format: 'json', email: '1' },
      })
      setPendingFounderCelebration({
        passportId,
        numberLabel: details.founderNumberLabel,
        certificatePath: issuedCertificatePath.value,
        // More than one claimed property means they were already a
        // Founding Homeowner before this one, so the welcome is worded
        // differently.
        firstClaim: (details.passports?.length ?? 1) <= 1,
      })
    } catch (err) {
      console.error('[claim] founder certificate details fetch failed:', err)
    } finally {
      await navigateTo(issuedPassportPath.value, { replace: true })
    }
  } catch (e: any) {
    issueError.value =
      e?.data?.message ||
      e?.message ||
      'Could not issue your Passport. Please try again.'
  } finally {
    issueLoading.value = false
  }
}
</script>

<style scoped>
.claim-root {
  min-height: 100dvh;
  background: #f3f2ef;
  padding-bottom: 0;
  color: #231d45;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  /* Clip sideways only (the ambient blobs overhang) — clipping vertically
     cut the address-search dropdown off at the bottom of the page. `clip`
     rather than `hidden` keeps the sticky nav working. */
  overflow-x: clip;
  position: relative;
}

.cl-ambient,
.cl-mesh {
  display: none;
  pointer-events: none;
  position: fixed;
}

.cl-ambient {
  border-radius: 999px;
  filter: blur(48px);
  opacity: 0.16;
}

.cl-ambient-a {
  width: 300px;
  height: 300px;
  left: -100px;
  top: 120px;
  background: #00a19a;
}

.cl-ambient-b {
  width: 320px;
  height: 320px;
  right: -120px;
  top: 160px;
  background: #5a4cf0;
}

.cl-mesh {
  inset: 0;
  opacity: 0.02;
  background-image:
    linear-gradient(rgba(18, 42, 72, 0.8) 1px, transparent 1px),
    linear-gradient(90deg, rgba(18, 42, 72, 0.8) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(180deg, #000, transparent 86%);
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

.hsw-brand-beta {
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

.hsw-links {
  display: flex;
  gap: 6px;
}

.hsw-links button {
  border: 0;
  background: transparent;
  color: #475a7b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 10px;
  white-space: nowrap;
  font-family: inherit;
  transition: background 0.18s, color 0.18s;
}

.hsw-links button:hover {
  color: #0c2342;
  background: rgba(0, 161, 154, 0.08);
}

.hsw-links button.active {
  color: #00857f;
  background: rgba(0, 161, 154, 0.1);
  box-shadow: inset 0 0 0 1px rgba(0, 161, 154, 0.24);
}

.hsw-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hsw-back {
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

.hsw-back:hover {
  border-color: #bfd1e4;
  background: #f8fbff;
}

.hsw-back svg {
  width: 15px;
  height: 15px;
}

/* ── Desktop wizard canvas ────────────────────────────────────────── */
.claim-main {
  padding-top: 40px;
  padding-bottom: 56px;
  display: flex;
  flex-direction: column;
}
/* Room below the address search so its suggestions can scroll fully into
   view instead of being squeezed against the bottom of the page. */
.claim-main--search {
  padding-bottom: 220px;
}

/* Page header — title + progress span the full canvas width */
.claim-head {
  display: flex;
  align-items: center;
  gap: 16px;
  width: min(100%, 1040px);
  margin: 0 auto 26px;
}
.claim-head-text {
  min-width: 160px;
}
.claim-head-title {
  font-size: 20px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
}
.claim-head-sub {
  font-size: 12.5px;
  color: #6b6783;
  font-weight: 700;
  margin-top: 2px;
}
.claim-tracker {
  width: min(100%, 1040px);
  margin: -8px auto 28px;
}

/* Two-column layout: framed panel + reassurance rail */
.claim-layout {
  width: min(100%, 1040px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: start;
}
.claim-panel {
  position: relative;
  background: #fff;
  border: 1px solid rgba(174, 201, 231, 0.5);
  border-radius: 22px;
  padding: 38px 34px 28px;
  box-shadow:
    0 18px 44px rgba(17, 52, 88, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}
/* Brand accent along the top edge (no overflow clipping — the address
   search dropdown opens inside this panel). */
.claim-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  height: 4px;
  border-radius: 22px 22px 0 0;
  background: linear-gradient(90deg, #00a19a 0%, #4dd4ce 55%, #8b7cf6 100%);
}
.claim-aside-prop {
  margin-bottom: 16px;
}

/* Reassurance rail */
.claim-aside {
  position: sticky;
  top: 90px;
}
.claim-aside-card {
  padding: 24px 22px;
  border: 1px solid rgba(231, 236, 242, 0.9);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 14px 34px rgba(17, 52, 88, 0.06);
}
.claim-aside-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}
.claim-aside-list {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: grid;
  gap: 16px;
}
.claim-aside-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.claim-aside-ic {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  display: grid;
  place-items: center;
  font-size: 17px;
}
.claim-aside-t {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.claim-aside-list p {
  margin: 0;
  font-size: 12.5px;
  color: #6b6783;
  line-height: 1.5;
}
.claim-aside-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #eef2f6;
}
.claim-aside-trust span {
  font-size: 11.5px;
  font-weight: 700;
  color: #4a5570;
  background: #f6fafd;
  border: 1px solid #e7ecf2;
  padding: 6px 10px;
  border-radius: 999px;
}

/* Inline CTA sits at the foot of the panel (no more mobile fixed bar) */
.cl-cta-inline {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid #eef2f7;
}
.cl-cta-inline .cl-btn-brand {
  width: 100%;
}

/* ── Topbar ─────────────────────────────────────────── */
.cl-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 620px);
  margin: 0 auto;
  border: 1px solid rgba(187, 211, 235, 0.58);
  border-radius: 20px;
  background: rgba(249, 252, 255, 0.92);
  box-shadow:
    0 12px 28px rgba(17, 52, 88, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  padding: 14px 18px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
  gap: 8px;
}
.cl-back {
  /* 40px so the only back affordance on the page clears a thumb. */
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid #ececef;
  background: #fff;
  font-size: 22px;
  line-height: 1;
  color: #231d45;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.cl-back:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(35, 29, 69, 0.12);
}
.cl-back svg {
  width: 18px;
  height: 18px;
}
.cl-top-text { flex: 1; text-align: center; }
.cl-top-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
}
.cl-top-sub {
  font-size: 11px;
  color: #6b6783;
  font-weight: 700;
  margin-top: 2px;
}
.cl-spacer { width: 32px; }

.cl-prog-strip {
  width: min(100%, 620px);
  margin: 8px auto 0;
  border-radius: 100px;
  height: 4px;
  background: #ececef;
  overflow: hidden;
}
.cl-prog-strip span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #3dbda3);
  transition: width 0.35s ease;
}

/* ── Screen ─────────────────────────────────────────── */
.cl-screen {
  width: 100%;
  margin: 0;
  padding: 0;
  animation: cl-step-enter 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.cl-screen > * {
  animation: cl-rise-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.cl-screen > *:nth-child(1) { animation-delay: 0.03s; }
.cl-screen > *:nth-child(2) { animation-delay: 0.06s; }
.cl-screen > *:nth-child(3) { animation-delay: 0.09s; }
.cl-screen > *:nth-child(4) { animation-delay: 0.12s; }
.cl-screen > *:nth-child(5) { animation-delay: 0.15s; }
.cl-screen > *:nth-child(6) { animation-delay: 0.18s; }

@keyframes cl-step-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cl-rise-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.cl-center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.cl-center-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 8px;
  text-align: center;
  min-height: 440px;
}

.cl-icon-square {
  width: 64px;
  height: 64px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  font-size: 30px;
  box-shadow:
    0 10px 24px rgba(17, 52, 88, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.cl-icon-square.cl-icon-lg {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  font-size: 34px;
  margin-bottom: 20px;
}

.cl-h1 {
  font-size: 26px;
  font-weight: 800;
  color: #231d45;
  margin: 0 0 8px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Step hero — centred illustration, title and lede shared by every step */
.cl-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
}
.cl-hero .cl-body {
  max-width: 470px;
  margin: 0;
  font-size: 15px;
}
.cl-hero .cl-body strong {
  color: #231d45;
}
.cl-hero-ic {
  width: 88px;
  height: 88px;
  margin-bottom: 18px;
  border-radius: 26px;
  display: grid;
  place-items: center;
  background: linear-gradient(160deg, #ffffff 0%, #eefaf8 100%);
  border: 1px solid rgba(0, 161, 154, 0.2);
  box-shadow:
    0 0 0 8px rgba(0, 161, 154, 0.06),
    0 14px 30px rgba(0, 161, 154, 0.16);
  animation: cl-hero-float 4s ease-in-out infinite;
}
.cl-hero-ic img {
  width: 62px;
  height: 62px;
  object-fit: contain;
}
.cl-hero-ic--success {
  box-shadow:
    0 0 0 8px rgba(0, 161, 154, 0.12),
    0 16px 34px rgba(0, 161, 154, 0.28);
}
.cl-hero--celebrate .cl-hero-img {
  margin-bottom: 8px;
}
@keyframes cl-hero-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.cl-h2 {
  font-size: 21px;
  font-weight: 800;
  color: #231d45;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}
.cl-body {
  font-size: 14px;
  color: #6b6783;
  line-height: 1.55;
  margin: 0 0 14px;
}
.cl-fee-term {
  font-weight: 800;
  color: #00857f;
  background: rgba(0, 161, 154, 0.1);
  padding: 1px 6px;
  border-radius: 6px;
  white-space: nowrap;
}
.cl-center { text-align: center; }
.cl-mb-xs { margin-bottom: 8px; }
.cl-mb-sm { margin-bottom: 14px; }
.cl-mb-md { margin-bottom: 18px; }
.cl-mb-lg { margin-bottom: 24px; }
.cl-w-full { width: 100%; }
.cl-text-l { text-align: left; }

/* ── Field ─────────────────────────────────────────── */
.cl-field-wrap { margin-bottom: 14px; }

/* Keep the open address suggestions above everything that follows the field.
   The lock note (still transformed by its entrance animation) and the
   disabled CTA (its opacity) each form their own stacking layer, which painted
   over the dropdown. */
.cl-screen { position: relative; z-index: 2; }
.cl-field-wrap { position: relative; z-index: 5; }
.cl-field-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

/* ── Selected address card ─────────────────────────── */
.cl-sel-card {
  background: linear-gradient(170deg, #fbfdff 0%, #f6f9ff 100%);
  border: 1px solid rgba(174, 201, 231, 0.52);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 14px;
  box-shadow:
    0 10px 24px rgba(17, 52, 88, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.cl-sel-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 30px rgba(17, 52, 88, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}
.cl-sel-eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: #1f7a66;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.cl-sel-line1 {
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
}
.cl-sel-line2 {
  font-size: 13px;
  color: #475569;
}
.cl-sel-change {
  font-size: 12px;
  color: #00a19a;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

/* ── Lock note ─────────────────────────────────────── */
.cl-lock-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 14px;
}
.cl-lock-ic { font-size: 18px; }
.cl-lock-body {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}
.cl-lock-body strong { color: #231d45; }

/* ── Confirm card (light) ─────────────────────────────── */
.cl-navy-card {
  background: #fff;
  border: 1.5px solid #bfe6e1;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 161, 154, 0.1);
}
.cl-navy-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.14), transparent 70%);
  border-radius: 50%;
}
.cl-navy-img {
  position: absolute;
  right: 14px;
  top: 10px;
  width: 86px;
  height: 86px;
  object-fit: contain;
  filter: drop-shadow(0 10px 16px rgba(35, 29, 69, 0.16));
}
.cl-navy-eyebrow,
.cl-navy-addr1,
.cl-navy-addr2 {
  padding-right: 100px;
}
.cl-navy-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9c98ad;
  margin-bottom: 6px;
  position: relative;
}
.cl-navy-addr1 {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 4px;
  position: relative;
}
.cl-navy-addr2 {
  font-size: 13px;
  color: #6b6783;
  margin-bottom: 16px;
  position: relative;
}
.cl-tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  position: relative;
}
.cl-tile {
  background: #f4fbfa;
  border-radius: 10px;
  padding: 10px 12px;
}
.cl-tile-l {
  font-size: 10px;
  color: #9c98ad;
  margin-bottom: 3px;
}
.cl-tile-v {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}

/* ── Info pale ─────────────────────────────────────── */
.cl-info-pale {
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cl-info-ic { font-size: 20px; flex-shrink: 0; }
.cl-sec-ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  background: #e3f5f1;
  border: 1px solid #c7ebe5;
  color: #00857f;
  display: grid;
  place-items: center;
}
.cl-sec-ic svg { width: 20px; height: 20px; }
.cl-sec-ic { background: #fff; }
.cl-sec-ic img { width: 30px; height: 30px; object-fit: contain; }
.cl-info-body {
  font-size: 13.5px;
  color: #3f5063;
  line-height: 1.55;
  font-weight: 500;
  letter-spacing: -0.005em;
}
.cl-info-body strong { color: #16233f; font-weight: 700; }

.cl-link-center {
  text-align: center;
  font-size: 12px;
  color: #00a19a;
  font-weight: 700;
  cursor: pointer;
  padding: 10px;
  transition: color 0.15s ease, transform 0.15s ease;
}
.cl-link-center:hover {
  color: #0f8f88;
  transform: translateY(-1px);
}

/* ── Card ──────────────────────────────────────────── */
.cl-card {
  background: #fff;
  border: 1px solid rgba(174, 201, 231, 0.52);
  border-radius: 18px;
  padding: 16px;
  box-shadow:
    0 10px 24px rgba(17, 52, 88, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.cl-card-pale {
  background: linear-gradient(140deg, #f2faf8 0%, #edf8ff 100%);
  border: 1px solid #e5f4f2;
  border-radius: 14px;
  padding: 14px;
}
.cl-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.cl-row-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.cl-gap-sm { gap: 11px; }

.cl-step-row {
  display: flex;
  align-items: center;
  gap: 13px;
}
.cl-step-ic {
  width: 48px;
  height: 48px;
  background: #fff;
  border: 1px solid #e7ecf2;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(17, 52, 88, 0.06);
}
.cl-step-t {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
}
.cl-step-s {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}

.cl-pale-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cl-pale-ic { font-size: 28px; flex-shrink: 0; }
.cl-pale-ic-sm { font-size: 18px; flex-shrink: 0; }
.cl-pale-t {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  margin-bottom: 3px;
}
.cl-pale-s {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

/* ── KYC ID upload slots ───────────────────────────── */
.cl-slot-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}
.cl-slot {
  height: 120px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.cl-slot-front {
  border: 2px dashed #cff4f2;
  background: #f1f9f4;
}
.cl-slot-back {
  border: 2px dashed #e5e7eb;
  background: #f8fafc;
}
.cl-slot-filled {
  border: 2px solid #00a19a !important;
  background: #fff !important;
}
.cl-slot-ic { font-size: 32px; }
.cl-slot-ic-muted { opacity: 0.4; }
.cl-slot-text {
  font-size: 13px;
  font-weight: 600;
  color: #1f7a66;
}
.cl-slot-text-muted { color: #94a3b8; }
.cl-slot-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cl-slot-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  background: #00a19a;
  color: #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.cl-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cl-pill {
  background: #f1f5f9;
  color: #475569;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cl-pill-good {
  background: rgba(0, 161, 154, 0.1);
  color: #00766f;
  border: 1px solid rgba(0, 161, 154, 0.24);
  font-size: 12px;
  font-weight: 800;
  padding: 5px 11px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ── Liveness ─────────────────────────────────────── */
.cl-live-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 24px;
}
.cl-live-svg {
  position: absolute;
  inset: 0;
}
.cl-live-ring {
  transform: rotate(-90deg);
  transform-origin: 80px 80px;
  animation: clLiveRing 2s ease-in-out infinite alternate;
}
@keyframes clLiveRing {
  from { stroke-dashoffset: 464; }
  to { stroke-dashoffset: 116; }
}
.cl-live-inner {
  position: absolute;
  inset: 12px;
  background: #f1f9f4;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 60px;
}

.cl-num-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #231d45;
}
.cl-num {
  width: 26px;
  height: 26px;
  background: #00a19a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── AML ─────────────────────────────────────────── */
.cl-aml-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cl-aml-label {
  font-size: 13px;
  color: #231d45;
  font-weight: 600;
}

/* ── KYC Verified ─────────────────────────────────── */
.cl-big-check {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #1f7a66, #00a19a);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 24px;
  box-shadow: 0 12px 36px rgba(0, 161, 154, 0.35);
}
.cl-pill-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 28px;
}

/* ── LR searching ─────────────────────────────────── */
.cl-lr-pulse-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 6px auto 26px;
}
.cl-lr-pulse {
  position: absolute;
  inset: 0;
  background: rgba(0, 161, 154, 0.18);
  border-radius: 50%;
  animation: clLrPulse 1.8s ease-out infinite;
}
.cl-lr-pulse--late {
  animation-delay: 0.9s;
}
@keyframes clLrPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
.cl-lr-inner {
  position: absolute;
  inset: 16px;
  background: #fff;
  border: 3px solid #00a19a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.cl-lr-inner--fail {
  background: #fef2f2;
  border-color: #f3b4b4;
  color: #c2410c;
}
.cl-lr-inner--fail svg {
  width: 40px;
  height: 40px;
}
.cl-fail-actions {
  max-width: 420px;
  display: flex;
  gap: 10px;
}
.cl-fail-actions > button {
  flex: 1;
  white-space: nowrap;
}
/* Two nowrap labels no longer fit side by side on a narrow phone. */
@media (max-width: 440px) {
  .cl-fail-actions {
    flex-direction: column-reverse;
  }
}
.cl-lr-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}
.cl-lr-card {
  text-align: left;
  padding: 18px;
}
.cl-lr-bar {
  height: 6px;
  margin-bottom: 16px;
  border-radius: 99px;
  background: #e8eef5;
  overflow: hidden;
}
.cl-lr-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #4dd4ce);
  transition: width 0.5s ease;
}
.cl-lr-step-active {
  color: #231d45;
  font-weight: 700;
}
.cl-lr-step-active .cl-lr-dot {
  background: rgba(0, 161, 154, 0.14);
}
.cl-lr-spin {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 161, 154, 0.3);
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: cl-spin 0.7s linear infinite;
}
.cl-lr-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #94a3b8;
  transition: color 0.3s;
}
.cl-lr-step-done {
  color: #231d45;
  font-weight: 600;
}
.cl-lr-dot {
  width: 22px;
  height: 22px;
  background: #e5e7eb;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: background 0.3s;
}
.cl-lr-step-done .cl-lr-dot {
  background: #00a19a;
}

/* ── LR Found ─────────────────────────────────────── */
.cl-lrf-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #1f7a66, #00a19a);
  border-radius: 16px;
  margin-bottom: 18px;
  color: #fff;
  box-shadow: 0 12px 28px rgba(0, 161, 154, 0.28);
}
.cl-lrf-banner-ic {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  flex-shrink: 0;
}
.cl-lrf-banner-t {
  font-size: 14px;
  font-weight: 700;
}
.cl-lrf-banner-s {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
}
.cl-lrf-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cl-lrf-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13.5px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef2f7;
}
.cl-lrf-row-last { border-bottom: none; padding-bottom: 0; }
.cl-lrf-l { color: #94a3b8; }
.cl-lrf-v { font-weight: 700; color: #231d45; }
.cl-lrf-v-good { color: #00857f; }

/* "Your Passport is ready" — the payoff card above the Issue button */
.cl-ready {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(140deg, #effaf8 0%, #eef5ff 100%);
  border: 1px solid rgba(0, 161, 154, 0.28);
  box-shadow: 0 12px 28px rgba(0, 161, 154, 0.12);
  text-align: left;
}
/* Portrait book artwork (umu-passport.png is ~5:7), so size it as one rather
   than squashing it into a square. */
.cl-ready-img {
  width: 46px;
  height: 64px;
  flex-shrink: 0;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(0, 110, 104, 0.25));
}
.cl-ready-text {
  flex: 1;
  min-width: 0;
}
.cl-ready-t {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 3px;
}
.cl-ready-s {
  font-size: 12.5px;
  line-height: 1.5;
  color: #4a5570;
}
.cl-big-tick {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.cl-big-tick img { width: 46px; height: 46px; object-fit: contain; }

/* ── Errors ──────────────────────────────────────── */
.cl-err-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cl-err-retry {
  background: #b91c1c;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease;
}
.cl-err-retry:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.cl-err-link {
  background: #00a19a;
  color: #fff;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.cl-err-link:hover {
  background: #00a19a;
}

/* ── Bottom CTA bar ──────────────────────────────── */
.cl-cta-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: rgba(249, 252, 255, 0.92);
  border-top: 1px solid rgba(174, 201, 231, 0.45);
  backdrop-filter: blur(8px);
  z-index: 30;
}
.cl-btn-brand {
  width: min(100%, 620px);
  padding: 14px 18px;
  background: linear-gradient(135deg, #00a19a 0%, #00b6ae 60%, #0f8f88 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.3);
  transition: opacity 0.15s, filter 0.15s, transform 0.15s;
}
.cl-btn-brand:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-1px);
}
.cl-btn-brand:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cl-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cl-spin 0.7s linear infinite;
}
@keyframes cl-spin { to { transform: rotate(360deg); } }
.cl-btn-ghost {
  width: min(100%, 620px);
  padding: 14px 18px;
  background: #fff;
  color: #231d45;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}
.cl-btn-ghost:hover {
  border-color: #d1d5db;
}
.cl-owned {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 4px 0 24px;
}
.cl-owned-illus {
  width: 84px;
  height: 84px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 8px 16px rgba(0, 110, 104, 0.18));
}
.cl-owned-t {
  font-size: 1.35rem;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.cl-owned-s {
  font-size: 0.875rem;
  color: #75757c;
  font-weight: 500;
  margin-top: 3px;
}
.cl-stripe-box {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}
.cl-stripe-box:focus-within {
  border-color: #00a19a;
}

@media (prefers-reduced-motion: reduce) {
  .cl-screen,
  .cl-screen > *,
  .cl-hero-ic,
  .cl-lr-pulse,
  .cl-card,
  .cl-card-pale,
  .cl-sel-card,
  .cl-link-center,
  .cl-err-retry,
  .cl-btn-brand {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}

/* Big screens - scale the nav row and main column by the shared desktop
   factor, as on the claim start page. */
@media (min-width: 1536px) {
  .hsw-shell { zoom: var(--desk-zoom); }
}

/* Desktop. At its phone-first spacing a step ran ~1150px tall, so on a
   monitor - where the column above is also scaled up - the primary button
   sat a screen or more below the fold. Here the title and the tracker share
   one row, the columns line up with the navbar edges, the hero is tighter,
   and the button sticks to the bottom of the window whenever the panel runs
   past it. */
@media (min-width: 981px) {
  .claim-main {
    padding-top: 28px;
    padding-bottom: 40px;
  }
  .claim-top {
    display: flex;
    align-items: center;
    gap: 48px;
    margin-bottom: 24px;
  }
  .claim-head {
    width: auto;
    flex-shrink: 0;
    margin: 0;
  }
  .claim-head-text {
    min-width: 190px;
  }
  .claim-tracker {
    flex: 1;
    width: auto;
    max-width: 660px;
    margin: 0 0 0 auto;
  }
  .claim-layout {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 32px;
  }
  .claim-panel {
    padding: 30px 34px 0;
  }
  .claim-aside {
    top: 86px;
  }
  .cl-hero {
    margin-bottom: 20px;
  }
  .cl-hero-ic {
    width: 76px;
    height: 76px;
    border-radius: 23px;
    margin-bottom: 14px;
  }
  .cl-hero-ic img {
    width: 54px;
    height: 54px;
  }
  .cl-hero-img {
    width: 120px;
    height: 120px;
    margin-bottom: 12px;
  }
  .cl-cta-inline {
    position: sticky;
    bottom: 0;
    z-index: 3;
    margin: 22px -34px 0;
    padding: 16px 34px 26px;
    background: #fff;
    border-radius: 0 0 22px 22px;
    box-shadow: 0 -12px 22px -18px rgba(17, 52, 88, 0.35);
  }
  /* Steps without the button still need the panel's bottom padding. */
  .claim-panel > .cl-screen:last-child {
    padding-bottom: 28px;
  }
}

@media (max-width: 980px) {
  .claim-layout {
    /* minmax(0, 1fr), not 1fr: a grid column's default minimum is its
       content's min-content width, so the selected address card - image,
       address and Change button on one row - pushed this column past the
       screen on small phones and was clipped instead of shrinking. */
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }

  .claim-aside {
    position: static;
    top: auto;
  }
}

@media (max-width: 899px) {
  .hsw-links {
    display: none;
  }

  .hsw-shell {
    width: calc(100% - 32px);
  }

  .hsw-nav-inner {
    min-height: 58px;
  }
}

@media (max-width: 700px) {
  .claim-head {
    flex-wrap: wrap;
  }

  .claim-head-prog {
    flex-basis: 100%;
  }

  .claim-panel {
    padding: 22px 16px 20px;
    border-radius: 18px;
  }

  .cl-h1 {
    font-size: 22px;
  }

  .cl-h2 {
    font-size: 19px;
  }

  .cl-btn-brand {
    width: 100%;
  }
}

/* ── Build-folder illustrated icons (replace emoji placeholders) ──── */
.cl-icon-square img { width: 40px; height: 40px; object-fit: contain; }
.cl-icon-square.cl-icon-lg img { width: 46px; height: 46px; }
.cl-step-ic img { width: 34px; height: 34px; object-fit: contain; }
.cl-slot-ic img { width: 44px; height: 44px; object-fit: contain; }
.cl-slot-ic-muted img { opacity: 0.5; }
.cl-pill img { width: 15px; height: 15px; object-fit: contain; }
.cl-pale-ic img { width: 36px; height: 36px; object-fit: contain; }

/* 3D illustrations that replaced the old emoji glyphs */
.cl-icon-square { background: #fff; overflow: hidden; }
.cl-icon-square img { width: 52px; height: 52px; }
.cl-icon-square.cl-icon-lg img { width: 52px; height: 52px; }
.cl-lock-ic { width: 22px; height: 22px; flex-shrink: 0; }
.cl-lock-ic img,
.cl-pale-ic-sm img { width: 22px; height: 22px; object-fit: contain; display: block; }
.cl-info-ic img { width: 28px; height: 28px; object-fit: contain; display: block; }
.cl-live-inner img { width: 64%; height: 64%; object-fit: contain; }
.cl-lr-inner img { width: 70%; height: 70%; object-fit: contain; }
.claim-aside-trust span { display: inline-flex; align-items: center; gap: 6px; }
.claim-aside-trust span img { width: 16px; height: 16px; object-fit: contain; }
.claim-aside-ic img { width: 32px; height: 32px; object-fit: contain; }

/* Identity-verified hero illustration (standalone, with its own sparkles) */
.cl-hero-img {
  width: 148px;
  height: 148px;
  object-fit: contain;
  margin-bottom: 18px;
}
.cl-lrf-banner-ic img { width: 28px; height: 28px; object-fit: contain; }

/* Land Registry title-data: header bank icon + per-row line icons */
.cl-lrf-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.cl-lrf-head-ic {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  flex-shrink: 0;
  background: #f1f9f4;
  display: grid;
  place-items: center;
}
.cl-lrf-head-ic img { width: 18px; height: 18px; object-fit: contain; }
.cl-lrf-rowhead {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.cl-lrf-row-ic {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  background: #f4f7fb;
  color: #64748b;
  display: grid;
  place-items: center;
}
.cl-lrf-row-ic svg { width: 15px; height: 15px; }

/* ── Navbar on small screens ──────────────────────────────────────────
   Scoped deliberately. These rules used to live in assets/css/main.css,
   which never reaches the production bundle — verified against a real
   .output build, where none of that file's content ships, its @font-face
   included. So the phone sizing worked in dev and silently did nothing on
   the deployed site.

   At full size this row is wider than any phone: the wordmark plus every
   action button. The app shell clips overflow-x, so the right-hand button
   was sliced off the screen rather than producing a scrollbar. */
@media (max-width: 700px) {
  .hsw-nav-inner { gap: 12px; }
  .hsw-brand { font-size: 17px; gap: 8px; min-width: 0; }
  .hsw-brand-logo { width: 26px; height: 26px; }
  .hsw-actions { gap: 8px; min-width: 0; }
}

/* The "Exit"/"Back" button drops to its chevron. font-size:0 hides the bare
   text node while leaving it as the button's accessible name. */
@media (max-width: 560px) {
  .hsw-back {
    font-size: 0;
    gap: 0;
    width: 42px;
    padding: 0;
    justify-content: center;
    flex-shrink: 0;
  }
  .hsw-back svg { width: 17px; height: 17px; flex-shrink: 0; }
}

/* Below this the wordmark cannot sit beside the buttons, so the mark carries
   the brand alone. Hidden visually rather than display:none — it is the only
   name this button has. */
@media (max-width: 440px) {
  .hsw-brand > span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .hsw-brand {
    gap: 0;
    min-width: 42px;
    min-height: 42px;
    justify-content: center;
    margin-left: -8px;
  }
}

@media (max-width: 400px) {
  .hsw-tour { width: 40px; height: 40px; font-size: 15px; }
}
</style>
