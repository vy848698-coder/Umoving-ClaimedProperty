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
    image: '/build/houseWithPin.png',
  },
  {
    title: 'Verify your identity',
    short: 'Verify identity',
    text: 'A quick photo ID and selfie check — done once only.',
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
    image: '/build/passport.png',
  },
]
