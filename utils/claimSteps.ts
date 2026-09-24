// The four stages of claiming a property, shared by the claim start page's
// "What happens next" panel and the step tracker on both claim pages, so the
// journey is described (and counted) the same way everywhere.
export interface ClaimStepInfo {
  title: string
  short: string
  text: string
  image: string
}

export const CLAIM_STEPS: ClaimStepInfo[] = [
  {
    title: 'Find your property',
    short: 'Find property',
    text: 'Search your postcode and pick your exact address.',
    // Same house render the selected-address card uses
    // (components/claim/SelectedAddressCard.vue), so the property is drawn the
    // same way everywhere in the claim journey.
    image: '/dashboard-art/searchHouse.png',
  },
  {
    title: 'Verify your identity',
    short: 'Verify identity',
    text: 'A quick photo ID and selfie check, done once only.',
    image: '/build/idCard.png',
  },
  {
    title: 'Confirm ownership',
    short: 'Confirm ownership',
    text: 'We match you to the owner on the HM Land Registry title.',
    image: '/build/lrTitleBank.png',
  },
  {
    title: 'Get your Property Passport',
    short: 'Get Passport',
    text: 'Your Passport is issued, ready to build and share.',
    // The real Passport cover render, so the last step shows the thing the
    // user is actually being given. Left-facing, so it turns back toward the
    // steps before it. A 440px copy of property_passport_teal_tilted_left_on_tile.png
    // - the original is 1MB for an icon drawn at ~64px.
    image: '/op-icons/passport-covers/property_passport_teal_tilted_left_on_tile_sm.png',
  },
]
