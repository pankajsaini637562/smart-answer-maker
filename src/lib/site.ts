// Single source of truth for the public site origin.
// Change this when a custom domain is connected.
export const SITE_URL = 'https://smartaiomranalyis.lovable.app';
export const SITE_NAME = 'Smart AI OMR Analysis';

/** Send a GA4 event if the existing Google tag is loaded. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') w.gtag('event', name, params);
}
