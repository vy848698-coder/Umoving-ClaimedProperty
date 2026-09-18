// Hands the "you just claimed a Founding Homeowner certificate" celebration
// off from the claim flow to the Passport page it redirects to, so the
// FoundingMemberModal appears a beat after the user actually lands on their
// Passport rather than blocking the redirect itself. sessionStorage (not a
// query param) keeps the URL clean and self-clears on tab close; the entry
// is also deleted the moment it's read, so a refresh of the Passport page
// never re-shows it.

export interface FounderCelebration {
  passportId: string
  numberLabel: string | null
  certificatePath: string
  firstClaim: boolean
}

const STORAGE_KEY = 'umu:founderCelebration'

export function useFounderCelebration() {
  function setPending(data: FounderCelebration) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Private browsing / storage disabled - the celebration just won't
      // show. Not worth failing the claim over.
    }
  }

  // Only returns (and clears) the entry if it matches this passport - a
  // stale entry from an abandoned claim on a different property must never
  // surface on the wrong Passport page.
  function takePending(passportId: string): FounderCelebration | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      sessionStorage.removeItem(STORAGE_KEY)
      const parsed = JSON.parse(raw) as FounderCelebration
      return parsed?.passportId === passportId ? parsed : null
    } catch {
      return null
    }
  }

  return { setPending, takePending }
}
