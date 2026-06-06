## Goal
Configure the project so it can be exported to GitHub, built, and packaged into an Android APK using Capacitor — with hot-reload from the Lovable sandbox preview during development.

## Steps

1. **Install Capacitor dependencies**
   - `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`
   - Dev: `@capacitor/cli`

2. **Create `capacitor.config.ts` in project root** with:
   - `appId`: `app.lovable.daab3b32b18b4effafa4bf28a6ef5d77`
   - `appName`: `smart-answer-maker`
   - `webDir`: `dist`
   - `server.url`: `https://daab3b32-b18b-4eff-afa4-bf28a6ef5d77.lovableproject.com?forceHideBadge=true`
   - `server.cleartext`: `true`
   This enables live hot-reload from the Lovable preview onto your physical device.

3. **No app code changes** — UI, auth, Supabase calls all stay as-is. Capacitor just wraps the web build.

## What you do after I'm done (locally, to actually build the APK)

1. Click **Export to GitHub** in Lovable, then `git clone` your repo.
2. `npm install`
3. `npx cap add android`
4. `npx cap update android`
5. `npm run build`
6. `npx cap sync`
7. `npx cap run android` (needs Android Studio installed) — or open in Android Studio:
   `npx cap open android` → **Build → Build Bundle(s)/APK(s) → Build APK(s)**
8. APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

For production (Play Store) APK/AAB, you'll generate a signed release in Android Studio.

Reference: https://lovable.dev/blog/2025-03-25-using-capacitor-with-lovable

## Notes
- The `server.url` config means the installed app loads the live Lovable preview — great for dev. Before publishing to Play Store, remove the `server` block so the app uses bundled assets from `dist/`.
- Every time you pull updates from GitHub, re-run `npm run build && npx cap sync`.
