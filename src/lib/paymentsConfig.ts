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

export const REFERRAL_DISCOUNT_PERCENT = 10;
export const MAX_STACKED_DISCOUNT = 50;
