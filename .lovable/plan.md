## Build Commands for This Project (GitHub / Local)

This is a standard **Vite + React + TypeScript** project. After cloning from GitHub:

### 1. Prerequisites
- Node.js 18+ and npm (install via [nvm](https://github.com/nvm-sh/nvm))

### 2. Install dependencies
```sh
npm install
```

### 3. Development (local preview with hot reload)
```sh
npm run dev
```
Runs on `http://localhost:8080`

### 4. Production build
```sh
npm run build
```
Outputs static files to `dist/`

### 5. Development-mode build (with extra debug info)
```sh
npm run build:dev
```

### 6. Preview the production build locally
```sh
npm run preview
```

### 7. Lint
```sh
npm run lint
```

### 8. Run tests
```sh
npm test
```

---

### Deploying the `dist/` folder
The `dist/` output is plain static files — deploy to any static host:
- **Vercel / Netlify**: connect the GitHub repo, framework = Vite, build = `npm run build`, output = `dist`
- **GitHub Pages / Cloudflare Pages**: same build settings
- **Self-hosted**: serve `dist/` with nginx/Caddy/any static server

---

### Android (Capacitor) build
If you want the Android APK/AAB (Play Store), see `android-signing-template/README.md`. Short version after `npm run build`:
```sh
npx cap add android       # first time only
npx cap sync android
cd android && ./gradlew assembleRelease     # APK
cd android && ./gradlew bundleRelease       # AAB for Play Store
```

---

### Required environment variables (`.env` at project root)
The Lovable Cloud backend needs these — copy them from the existing `.env` in Lovable, or from your backend project:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```
Without these, the app builds but auth/database calls fail at runtime.

---

Let me know if you want me to add a `README.md` update, a GitHub Actions CI workflow (auto-build on push), or Vercel/Netlify config files.
