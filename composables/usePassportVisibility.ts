// Real Private/Public passport-level toggle ("Manage visibility", client
// History handoff, 2026-09-25, section 7) — standalone from this app's
// share-link review flow (ShareReviewDrawer), and from the buyer-marketplace
// publish concept the other two frontends use (deliberately removed from
// this app). See backend passport.service.ts's getPublicVisibility /
// setPublicVisibility for why this is a separate field.
export const usePassportVisibility = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  interface VisibilityState {
    id: string
    publicVisibility: boolean
    publicVisibilitySetAt: string | null
  }

  const getVisibility = (passportId: string): Promise<VisibilityState> =>
    $fetch(`${base}/passport/${passportId}/visibility`, {
      headers: getHeaders(),
    })

  const setVisibility = (passportId: string, isPublic: boolean): Promise<VisibilityState> =>
    $fetch(`${base}/passport/${passportId}/visibility`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: { isPublic },
    })

  return { getVisibility, setVisibility }
}
