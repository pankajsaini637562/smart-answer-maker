# Plan: Vike SSR/SSG migration + public, crawlable surface for every route

You picked **Vike (SSR/SSG)** + making the **landing page** and **all app routes** publicly crawlable. Important reality check up front, then the plan.

## Reality check (please read)

1. **App routes can't expose real user data publicly.** `/history`, `/analytics`, `/chat`, `/profile`, `/sheets` show data tied to the logged-in student. Making the *real* views public would leak PII and break RLS intent. So "all app routes public" really means: **build a public, marketing-style page for each route** (`/analytics` → "About our analytics" with screenshots + features) and keep the authenticated app at the same URL behind a login gate that activates only when a user is signed in. Prerendered HTML = marketing copy. Hydrated app for logged-in users = current dashboard.

2. **Vike migration is a large refactor.** Every page becomes a `+Page.tsx` / `+config.ts` pair. React Router goes away. Auth context, protected routes, and Supabase client need to be SSR-safe (no `window`, no localStorage at import time). Expect noticeable churn across `src/`.

3. **SSG vs SSR.** Since there are no per-request dynamic public pages, I'll use **prerender (SSG)** — Vike builds static HTML for each public route at `npm run build`. Output is still deployable to Vercel as a static site (your current `vercel.json` works with minor changes). No Node server needed.

## Scope

### A. Vike scaffolding
- `bun add vike vike-react`
- New `vite.config.ts` plugin: `vike({ prerender: true })`
- New entry points: `src/pages/+config.ts` (shared), `renderer/+onRenderHtml.tsx`, `renderer/+onRenderClient.tsx`, `renderer/Layout.tsx`
- Remove `react-router-dom`, replace `<BrowserRouter>` and `<Routes>` with Vike's file-based routing
- Move `HelmetProvider`, `QueryClient`, `AuthProvider`, `ThemeProvider`, `TooltipProvider`, toasters into `Layout.tsx`

### B. Route migration (file-based)
Each existing page becomes a Vike page directory:

```text
pages/
  index/                  +Page.tsx (public landing — new marketing content)
  auth/                   +Page.tsx (public; wraps current AuthPage)
  app/                    +Page.tsx (current Dashboard, guarded client-side)
  create/                 +Page.tsx (guarded)
  sheets/                 +Page.tsx (public marketing + guarded app view)
  history/                +Page.tsx (public marketing + guarded app view)
  analytics/              +Page.tsx (public marketing + guarded app view)
  chat/                   +Page.tsx (public marketing + guarded app view)
  profile/                +Page.tsx (guarded only)
  exam/@id/               +Page.tsx (guarded, prerender:false)
  result/@attemptId/      +Page.tsx (guarded, prerender:false)
```

Each public page renders a `<PublicMarketing>` component on the server (prerendered, crawlable) and swaps to the live app component on the client when `useAuth().user` is present.

### C. Public marketing content (new)
- **Landing (`/`)** — hero, features grid, FAQ (uses existing JSON-LD), CTA → `/auth`
- **`/sheets`** — "Create OMR sheets" feature page
- **`/history`** — "Track your exam history" feature page
- **`/analytics`** — "AI-powered exam analytics" feature page
- **`/chat`** — "Study Chat groups" feature page
- **`/auth`** — sign-in/up (already public, just ported)

All marketing pages get per-route `+Head.tsx` with unique title, description, canonical, og:*, and route-appropriate JSON-LD (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`).

### D. SSR-safety fixes
- `src/integrations/supabase/client.ts` — already lazy on `window`; verify no top-level `localStorage` access
- `src/contexts/AuthContext.tsx` — guard `localStorage` / `window` with `typeof window !== 'undefined'`
- `src/components/ThemeProvider.tsx` — same guard for theme detection
- Any `useEffect`-free top-level `window` access → move into effects

### E. Build & deploy
- Update `package.json` build: `vite build` (Vike handles prerender automatically)
- Update `vercel.json` rewrites: drop SPA fallback, let Vike's prerendered HTML serve directly; only fallback unprerendered (guarded app) routes to `index.html`
- Update `public/sitemap.xml` to list all prerendered URLs

### F. Cleanup
- Delete `src/App.tsx` (replaced by Vike layout/routing)
- Delete `src/pages/NotFound.tsx`, replaced with Vike's `_error.page.tsx`
- Remove `react-router-dom` dependency
- Remove `src/components/SEO.tsx` (replaced by Vike `+Head.tsx`)

## Out of scope
- Backend/Supabase changes
- Real-data SSR for authed views (would require service-role on edge — security tradeoff not worth it)
- og:image generation (can do later if you want)
- Capacitor / mobile build changes (still works against `dist/`)

## Risks
- **Auth flicker**: on first paint, prerendered marketing shows, then hydration swaps to app view for logged-in users. Mitigated with a brief skeleton.
- **Breakage surface is wide**: React Router → Vike touches every page file.
- **Build time grows**: prerender step runs once per route at build.

## Expected outcome
- Every listed route returns full crawlable HTML to Googlebot with unique title/description/JSON-LD.
- Logged-in users still see the live app at the same URLs.
- Lighthouse SEO and indexability rise across all public pages.

**Approve to implement, or tell me to scale back** (e.g. landing page only, skip marketing for app routes, or use lightweight `vite-plugin-prerender` instead of full Vike).
