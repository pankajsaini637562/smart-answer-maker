const KEY = 'referral_code';

export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (code && /^[A-Z0-9]{4,16}$/i.test(code)) {
    localStorage.setItem(KEY, code.toUpperCase());
  }
}

export function getPendingReferral(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY);
}

export function clearPendingReferral() {
  localStorage.removeItem(KEY);
}

export function buildInviteLink(code: string) {
  if (typeof window === 'undefined') return `?ref=${code}`;
  return `${window.location.origin}/?ref=${code}`;
}
