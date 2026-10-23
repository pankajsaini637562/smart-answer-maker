// UPI configuration for manual payment flow
export const UPI_ID = '7891041852@fam';
export const UPI_PAYEE_NAME = 'Smart AI OMR Analysis';

export function buildUpiLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: String(amount),
    cu: 'INR',
    tn: note.slice(0, 50),
  });
  return `upi://pay?${params.toString()}`;
}

export const REFERRAL_DISCOUNT_PERCENT = 50;
export const MAX_STACKED_DISCOUNT = 50;

/** Combine discounts, never above MAX_STACKED_DISCOUNT. */
export function stackDiscount(...pcts: number[]) {
  return Math.min(pcts.reduce((a, b) => a + Math.max(0, b), 0), MAX_STACKED_DISCOUNT);
}

/** Final price in rupees after discount; paid items never drop below ₹1. */
export function finalPrice(priceInr: number, discountPercent: number) {
  if (priceInr <= 0) return 0;
  return Math.max(1, Math.round(priceInr * (100 - discountPercent) / 100));
}

// Build a human-readable one-time coupon code for display purposes.
// The actual discount is enforced server-side via the referral_credits table
// and the on_purchase_approved trigger — this code is only shown to the user
// so the discount feels tangible ("apply your coupon").
export function buildCouponCode(kind: 'welcome' | 'thanks', seed: string, pct: number) {
  const short = seed.replace(/-/g, '').slice(0, 6).toUpperCase();
  const prefix = kind === 'welcome' ? 'WELCOME' : 'THANKS';
  return `${prefix}${pct}-${short}`;
}
