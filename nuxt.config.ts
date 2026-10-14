// Local dev only: the backend's CORS allowlist doesn't include localhost:3000,
// so the browser blocks direct cross-origin calls to Railway. In dev we instead
// point apiBase at a same-origin path (`/__backend`) and let Nitro's dev server
// proxy it to the real backend — the browser makes a same-origin request, so CORS
// never applies. Production (Vercel) is unaffected: it keeps calling Railway
// directly via NUXT_PUBLIC_API_BASE (Vercel's origin IS in the allowlist).
const isDev = process.env.NODE_ENV !== 'production'
// AWS App Runner is this launch's production backend (Railway is UAT/demo
// only, per project decision). Falls back here only if NUXT_PROXY_TARGET
// (dev) / NUXT_PUBLIC_API_BASE (prod, below) is somehow unset - a forgotten
// env var should point at prod, not silently serve UAT data.
const proxyTarget =
  process.env.NUXT_PROXY_TARGET ||
  'https://ijfai9mgwj.eu-west-2.awsapprunner.com'
// What the CSP's connect-src/frame-src actually allow-list for API/file
// calls - mirrors the same NUXT_PUBLIC_API_BASE-first, AWS-fallback logic
// runtimeConfig.public.apiBase uses below, so the policy always matches
// whatever host the app is actually calling.
const BACKEND_ORIGIN = process.env.NUXT_PUBLIC_API_BASE || proxyTarget

export default defineNuxtConfig({
  devtools: { enabled: false },

  // Dev-only reverse proxy so local requests to `/__backend/**` are forwarded
  // to the real backend server-side (no CORS). Not included in the prod build.
  $development: {
    routeRules: {
      '/__backend/**': { proxy: `${proxyTarget}/**` },
    },
  },
  nitro: {
    // Certificate artwork and fonts live in server/assets/certificate, which
    // Nuxt bundles automatically as the `assets:server` storage mount.
    // Local dev keeps founder numbers in .data/founders. Production needs a
    // persistent `founders` mount (see server/utils/founderNumber.ts).
    devStorage: {
      founders: { driver: 'fs', base: './.data/founders' },
    },
    // @napi-rs/canvas ships its native binary alongside a data file it loads
    // at runtime (icudtl.dat) from a path next to the binary, not via JS
    // `require()` — Nitro's file-tracer only follows JS requires, so a
    // traced/bundled build silently drops icudtl.dat and the certificate
    // renderer hard-crashes in production ("SkIcuLoader: datafile missing",
    // "fatal error: check(fUnicode)") even though it works in dev, where the
    // package is loaded straight from node_modules. Marking it external
    // keeps the whole package as a real runtime dependency rather than
    // tracing it, but Nitro's own node_modules copy step for externals
    // still only picks up package.json + the .node binary — the hook below
    // copies icudtl.dat across explicitly for whichever platform package(s)
    // are actually installed (only one, matching the build/deploy OS).
    externals: {
      external: ['@napi-rs/canvas'],
    },
    // NB: the icudtl.dat copy that pairs with this deliberately does NOT live
    // in `nitro.hooks` — see the `nitro:init` hook near the bottom of this
    // file for why.
  },

  // @nuxt/icon provides the <Icon> component, used ~430 times across the app
  // (heroicons and lucide). It used to arrive as a dependency of @nuxt/ui;
  // when that was dropped, every one of those icons silently rendered nothing
  // - Vue logged "Failed to resolve component: Icon" and left an empty element
  // behind, which is why the green confirm circles had no tick in them. It is
  // registered directly here so it no longer depends on a UI library we don't
  // otherwise use.
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxt/icon', 'nuxt-security'],
  css: ['~/assets/css/main.css'],

  // Baseline security headers (security review, 13/14 Oct 2026 - this app
  // previously set none at all, so e.g. the £49 claim/payment flow could
  // be iframed by any third-party site for clickjacking).
  //
  // BACKEND_ORIGIN resolves to NUXT_PUBLIC_API_BASE at build time, same as
  // runtimeConfig.public.apiBase below - confirmed with the team (14 Oct
  // 2026) that Vercel's production value is actually
  // https://demo-umu-backend-production.up.railway.app, NOT the AWS App
  // Runner URL the surrounding proxyTarget comments describe as "this
  // launch's production backend" - that comment predates this check and
  // is stale (or the two disagree on which backend is actually live;
  // worth reconciling with whoever owns deploys). No hardcoded fallback
  // added here deliberately - if NUXT_PUBLIC_API_BASE is ever unset on
  // Vercel, apiBase itself already breaks the same way connect-src would,
  // so there's no good silent default to pick instead.
  //
  // CSP was audited resource-by-resource against this app's actual runtime
  // behaviour (not guessed) - see the directive-by-directive notes below.
  // script-src deliberately stays 'self' + 'unsafe-inline' rather than
  // nuxt-security's nonce+strict-dynamic default: this app has one known
  // inline script (the desk-zoom IIFE below) that isn't rendered through
  // Nuxt's own head management. Checked the rendered dev-server HTML and
  // confirmed nuxt-security's auto-nonce DOES reach it (every <script> tag
  // got a matching nonce attribute) - so nonce-based script-src is likely
  // safe, but switching to it still needs a real browser click-through
  // (Leaflet/Stripe's dynamically-inserted <script> tags under
  // 'strict-dynamic' is the one interaction this couldn't verify without
  // one), so 'unsafe-inline' stays for now as the conservative choice.
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        // unpkg: Leaflet is loaded at runtime (document.createElement),
        // not bundled - see SearchDrawer.vue / property/[id].vue /
        // property-full/[id].vue. js.stripe.com: @stripe/stripe-js's
        // loadStripe() injects this for the claim/buyer-unlock/tier-
        // upgrade payment flows.
        'script-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://js.stripe.com'],
        // Vue scoped <style> blocks compile to real stylesheets at build
        // time (style-src, not this), but dynamic :style="..." bindings
        // (66 files) render as inline style="..." attributes, which need
        // style-src-attr specifically - kept narrower than a blanket
        // style-src 'unsafe-inline'.
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://api.mapbox.com', 'https://unpkg.com'],
        'style-src-attr': ["'unsafe-inline'"],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        // data:: QR codes, inline SVG avatars/payment badges, signature-
        // pad export. blob:: buyer-profile/pdf.vue's URL.createObjectURL.
        // Street View images now go through this app's own backend
        // (proxiedStreetViewUrl, umu-backend) - no maps.googleapis.com
        // needed here any more.
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://api.mapbox.com',
          'https://api.os.uk',
          'https://*.tile.openstreetmap.org',
        ],
        // Mapbox GL JS and Leaflet both fetch tiles/styles via XHR/fetch,
        // not just <img> - same hosts as img-src, plus Mapbox's telemetry
        // endpoint and the backend API itself.
        'connect-src': [
          "'self'",
          BACKEND_ORIGIN,
          'https://api.stripe.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://api.os.uk',
          'https://*.tile.openstreetmap.org',
        ],
        // Stripe Elements mounts its card-input iframe from js.stripe.com.
        // openstreetmap.org: the embedded map iframe on property/[id].vue.
        // BACKEND_ORIGIN: buyer-passport vault's PDF lightbox iframe loads
        // a backend-signed file URL.
        'frame-src': ["'self'", 'https://js.stripe.com', 'https://www.openstreetmap.org', BACKEND_ORIGIN],
        // mapbox-gl-js spins up its tile-processing workers from blob:
        // URLs internally.
        'worker-src': ["'self'", 'blob:'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        // Modern browsers that understand CSP's frame-ancestors ignore
        // X-Frame-Options entirely for that resource - nuxt-security's
        // own default here is 'self', which would have quietly loosened
        // the DENY below back to "same-origin framing allowed". Set
        // explicitly to keep the two headers in agreement.
        'frame-ancestors': ["'none'"],
      },
      crossOriginEmbedderPolicy: false,
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        // geolocation/camera stay same-origin-only (SearchDrawer.vue's
        // postcode "use my location", CameraScanModal.vue's document
        // scan both call these directly, same-origin, today) - this
        // blocks a cross-origin iframe from requesting them, not the
        // app's own existing usage.
        geolocation: ['self'],
        camera: ['self'],
        microphone: [],
      },
    },
  },

  icon: {
    // Both collections are installed (@iconify-json/heroicons, -lucide), so
    // icons are served from the bundle rather than fetched from Iconify's API
    // at runtime - no third-party request on render, and they work offline.
    serverBundle: 'local',
  },

  // Tailwind runs through Nuxt's own PostCSS pipeline. It used to be pulled in
  // as a side effect of @nuxt/ui (which registers @nuxtjs/tailwindcss); when
  // that dependency was dropped, nothing processed the `@import 'tailwindcss/*'`
  // lines in assets/css/main.css any more, so every utility class in the app
  // silently stopped existing - `w-[18px] h-[18px]` on the 3D PNG icons meant
  // nothing and they rendered at their full intrinsic size, over the text
  // beside them. Declaring the plugin here keeps it independent of whichever UI
  // library happens to be installed. Nuxt's defaults (postcss-import,
  // postcss-url, autoprefixer, cssnano) still apply around it.
  postcss: {
    plugins: {
      tailwindcss: {},
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    strategies: 'generateSW',
    manifest: {
      name: 'UmovingU | Property Toolkit',
      short_name: 'UmovingU',
      description: 'Your complete property toolkit. Track progress, store documents, and connect with trusted trades in one place.',
      theme_color: '#00a19a',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait-primary',
      start_url: '/',
      scope: '/',
      categories: ['lifestyle', 'utilities'],
      icons: [
        {
          src: '/logo.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/pwa-icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
      screenshots: [],
    },
    workbox: {
      navigateFallback: '/offline',
      navigateFallbackDenylist: [/^\/api\//],
      // Default precache cap is 2 MiB; some images (e.g. Exp.png ~2.16 MB)
      // exceed it. Raise to 3 MiB so they're still precached.
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      globIgnores: ['op-icons/temp/**'],
      runtimeCaching: [
        {
          // Google Fonts — cache-first
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // API calls — network-first so users always get fresh data when online
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            cacheableResponse: { statuses: [0, 200] },
            networkTimeoutSeconds: 10,
          },
        },
        {
          // Images — stale-while-revalidate
          urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico)(\?.*)?$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'image-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      // Service worker disabled in dev — the navigateFallback to /offline
      // hijacks every non-precached route (pages aren't precached in dev),
      // which made all routes redirect to /offline. PWA still runs in prod.
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  app: {
    head: {
      title: 'UmovingU | Your Property Toolkit',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        {
          name: 'description',
          content:
            'Your complete property toolkit. Track progress, store documents, and connect with trusted trades in one place.',
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'UmovingU' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'msapplication-TileColor', content: '#00a19a' },
        { name: 'theme-color', content: '#00a19a' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      script: [
        {
          // Desktop scale (--desk-zoom, see assets/css/main.css). The pages are
          // designed against a ~1440x730 browser window - a 1366x768 laptop
          // once the tabs and taskbar are gone. On anything bigger the content
          // is scaled so the window holds the same layout: by width, but never
          // more than the height allows, so a short or ultra-wide window
          // doesn't push the page off the bottom. Works for any monitor and for
          // browser zoom, since both show up as a resize.
          //   1920x1080 -> ~1.31   2560x1440 -> ~1.78   4K at 100% -> 2.2 (cap)
          // The cap keeps the raster artwork from being blown up past its
          // resolution. That is about screen pixels, not CSS pixels: with the
          // browser zoomed out (devicePixelRatio below 1) each CSS pixel
          // covers less than one screen pixel, so the cap rises by the same
          // factor. A fixed 2.2 stopped the page growing once zoomed out past
          // ~45% and left it as a small island in the window.
          // --wide-zoom is the width-only variant, used by the claim pages:
          // window width / 1366, so any monitor shows the page exactly as a
          // 1366px laptop does, only bigger - same margins, same layout - and
          // scrolls the same way when the page is taller than the window.
          // Its cap (3, also per screen pixel) is higher because the claim
          // artwork is drawn at 2.5-10x its display size.
          // Inline in <head> so it lands before the first paint; the stepped
          // values in main.css are the fallback without JS.
          key: 'desk-zoom',
          tagPosition: 'head',
          innerHTML:
            "(function(){var r=document.documentElement;function s(){var w=innerWidth,h=innerHeight,z=w<1536?1:Math.min(w/1440,h/730);z=Math.max(1,Math.min(z,2.2/Math.min(devicePixelRatio||1,1)));r.style.setProperty('--desk-zoom',z.toFixed(3));var d=Math.min(devicePixelRatio||1,1);r.style.setProperty('--wide-zoom',(w<=1366?1:Math.min(w/1366,3/d)).toFixed(3))}s();addEventListener('resize',s)})()",
        },
      ],
    },
  },
  runtimeConfig: {
    // Absolute backend URL for server routes (the certificate). The public
    // apiBase is the relative '/__backend' proxy path in dev, which server code
    // can't fetch.
    backendBase: (process.env.NUXT_PUBLIC_API_BASE || '').startsWith('http')
      ? process.env.NUXT_PUBLIC_API_BASE
      : proxyTarget,
    // Public keys (exposed to client-side)
    public: {
      // In dev, default to the same-origin proxy path so browser calls avoid
      // CORS (see $development.routeRules above). In prod, prefer
      // NUXT_PUBLIC_API_BASE (set on Vercel); if it's missing, fall back to the
      // real backend URL rather than localhost so a forgotten env var can't
      // silently break production.
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        (isDev ? '/__backend' : proxyTarget),
      googleClientId:
        process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ||
        '869780740735-rlucf6t174rb3dljniqfj3ri2r0kg9cj.apps.googleusercontent.com',
      appleClientId:
        process.env.NUXT_PUBLIC_APPLE_CLIENT_ID || 'io.umovingu.webapp',
      appleRedirectUri:
        process.env.NUXT_PUBLIC_APPLE_REDIRECT_URI ||
        'https://demo-umu-frontend.vercel.app/auth/apple/callback',
      stripeKey:
        process.env.NUXT_PUBLIC_STRIPE_KEY ||
        'pk_test_51RvzhKLR3oJsnvMf4gRG09EZsz4uX4VYt89aqLXTTAdFnphlHHVyfzHlkLyR6I5U0TSi8Su5H3gTaT0Yasza7t6K00h9dldDgB',
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN || '',
      googleApiKey: process.env.NUXT_PUBLIC_GOOGLE_API_KEY || '',
      osApiKey: process.env.NUXT_PUBLIC_OS_API_KEY || '',
    },
  },
  components: true,
  // Strip console.* from production bundles. The dev server keeps them so
  // engineers can still see logs locally; only the prod build (and SSR
  // server build) is stripped. `debugger` is dropped too.
  vite: {
    esbuild: {
      drop:
        process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },

  hooks: {
    // @napi-rs/canvas ships its native binary alongside a data file it loads
    // at runtime (icudtl.dat) from a path next to the binary, not via JS
    // `require()`. Nitro's file-tracer only follows JS requires, so a traced
    // build drops icudtl.dat and the certificate renderer hard-crashes in
    // production ("SkIcuLoader: datafile missing") even though it works in
    // dev. `nitro.externals.external` above keeps the package whole, and this
    // copies the data file next to the binary afterwards.
    //
    // This MUST be registered here rather than as `nitro: { hooks: { compiled } }`.
    // Nitro loads its preset as a c12 config layer and merges it with defu,
    // which overwrites a function rather than merging it — so a `compiled`
    // hook in nitro config REPLACES the preset's own. On Vercel the preset's
    // compiled hook is what writes .vercel/output/config.json (via
    // generateFunctionFiles), the manifest that marks the directory as Build
    // Output API. Without it Vercel ignores .vercel/output, falls back to the
    // framework's static output directory and fails the deployment with
    // "No Output Directory named 'dist' found after the Build completed" —
    // after a build that otherwise succeeded. `nitro.hooks.hook()` on the live
    // instance appends a listener instead, so both hooks run.
    'nitro:init'(nitro) {
      nitro.hooks.hook('compiled', async () => {
        const fs = await import('node:fs')
        const path = await import('node:path')
        const platformPkgs = [
          'canvas-win32-x64-msvc',
          'canvas-linux-x64-gnu',
          'canvas-linux-arm64-gnu',
          'canvas-darwin-x64',
          'canvas-darwin-arm64',
        ]
        for (const pkg of platformPkgs) {
          const src = path.join(process.cwd(), 'node_modules/@napi-rs', pkg, 'icudtl.dat')
          const destDir = path.join(nitro.options.output.serverDir, 'node_modules/@napi-rs', pkg)
          if (fs.existsSync(src) && fs.existsSync(destDir)) {
            fs.copyFileSync(src, path.join(destDir, 'icudtl.dat'))
            console.log(`[nitro] copied icudtl.dat for ${pkg}`)
          }
        }
      })
    },
  },
})
