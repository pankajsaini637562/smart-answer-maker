# Release Signing Setup (Android)

These files are templates. The actual `android/` folder is generated locally with
`npx cap add android` — it's not in this repo.

## One-time setup (after `npx cap add android`)

1. **Create keystore** (keep this file safe forever):
   ```bash
   keytool -genkey -v -keystore ~/keystores/exam-master-release.keystore \
     -alias exam-master -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Copy `keystore.properties.example` → `android/keystore.properties`**
   and fill in your real paths/passwords.

3. **Add to `android/.gitignore`:**
   ```
   keystore.properties
   *.keystore
   *.jks
   ```

4. **Patch `android/app/build.gradle`:** paste the contents of
   `build.gradle.signing.snippet` inside the existing `android { ... }` block
   (replace the default `buildTypes.release` block if present).

## Build commands

From the project root:

```bash
# 1. Build the web bundle
npm run build

# 2. Sync into native project
npx cap sync android

# 3. Build signed release APK (for sideloading/testing)
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# 4. Build signed release AAB (REQUIRED for Play Store upload)
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Verify the signature

```bash
# APK
$ANDROID_HOME/build-tools/<version>/apksigner verify --print-certs \
  android/app/build/outputs/apk/release/app-release.apk

# AAB (uses jarsigner)
jarsigner -verify -verbose -certs \
  android/app/build/outputs/bundle/release/app-release.aab
```

## Upload to Play Store

- Use the **AAB** (`app-release.aab`) in Play Console → Production → Create new release.
- First upload: enroll in **Play App Signing** (Google manages the upload key for you).
- Bump `versionCode` (integer, must increase) and `versionName` in
  `android/app/build.gradle` for every subsequent release.
