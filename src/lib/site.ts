// Single source of truth for the public site origin.
// Change this when a custom domain is connected.
export const SITE_URL = 'https://smartaiomr.us.ci';
export const SITE_NAME = 'Smart AI OMR Analysis';
export const HOME_TITLE = 'Smart AI OMR Analysis | Free Online NEET & JEE OMR Sheet Checker';
export const HOME_DESCRIPTION = 'Scan and check your NEET, JEE, and competitive exam OMR sheets online instantly with AI. Get accurate score analysis, negative marking calculation, and subject-wise insights.';
export const SHARE_IMAGE_URL = `${SITE_URL}/og-smart-ai-omr.jpg`;
export const SHARE_IMAGE_ALT = 'Smart AI OMR Analysis — free online OMR sheet checker for NEET, JEE, and competitive exams';

/** Send a GA4 event if the existing Google tag is loaded. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
}
