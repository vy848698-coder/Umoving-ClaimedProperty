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
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],

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
      name: 'UmovingU - Property Toolkit',
      short_name: 'UmovingU',
      description: 'Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.',
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
      title: 'UmovingU - Your Property Toolkit',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        {
          name: 'description',
          content:
            'Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.',
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
