import { vi } from 'vitest'
import { getToken, setToken, clearToken } from '../composables/useAuthToken'

// Nuxt auto-imports composables/utils as globals at build time - these
// stubs recreate that for tests, which run outside the Nuxt compiler.
// Token helpers are stubbed straight to the real useAuthToken.ts module
// (not a separate fake store) so tests and app code share one source of
// truth for what "logged in" means.
;(globalThis as any).getToken = getToken
;(globalThis as any).setToken = setToken
;(globalThis as any).clearToken = clearToken

;(globalThis as any).$fetch = vi.fn()

;(globalThis as any).useRuntimeConfig = () => ({
  public: { apiBase: 'https://api.test.umovingu.io' },
})
