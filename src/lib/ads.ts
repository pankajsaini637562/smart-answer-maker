import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';

// AdMob App ID: ca-app-pub-5108980517670364~7785270991
// (also declared in android/app/src/main/AndroidManifest.xml as
//  com.google.android.gms.ads.APPLICATION_ID meta-data)
const APP_OPEN_AD_UNIT_ID = 'ca-app-pub-5108980517670364/4749762742';

let initialized = false;

/** Initialize the Google Mobile Ads SDK. No-op on web/PWA. */
export async function initializeAds(): Promise<void> {
  if (!Capacitor.isNativePlatform() || initialized) return;
  try {
    await AdMob.initialize({ initializeForTesting: false });
    initialized = true;
  } catch (e) {
    console.warn('AdMob init failed', e);
  }
}

/** Prepare + show the App Open ad. No-op on web/PWA. */
export async function showAppOpenAd(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !initialized) return;
  try {
    await AdMob.prepareAppOpenAd({ adId: APP_OPEN_AD_UNIT_ID });
    await AdMob.showAppOpenAd();
  } catch (e) {
    console.warn('App open ad failed', e);
  }
}
