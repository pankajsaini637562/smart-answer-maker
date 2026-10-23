import { describe, it, expect } from 'vitest';
import { REFERRAL_DISCOUNT_PERCENT, finalPrice, stackDiscount, buildCouponCode } from './paymentsConfig';

describe('pricing rules', () => {
  it('referral discount is 50%', () => {
    expect(REFERRAL_DISCOUNT_PERCENT).toBe(50);
  });
  it('₹10 material with 50% off costs ₹5', () => {
    expect(finalPrice(10, 50)).toBe(5);
  });
  it('stacked discounts never exceed 50%', () => {
    expect(stackDiscount(50, 50)).toBe(50);
  });
  it('free items stay free', () => {
    expect(finalPrice(0, 50)).toBe(0);
  });
  it('each friend gets a different coupon code', () => {
    expect(buildCouponCode('thanks', 'aaaaaa-1', 50)).not.toBe(buildCouponCode('thanks', 'bbbbbb-2', 50));
  });
});

import { pickDiscount } from './paymentsConfig';
describe('coupon rules', () => {
  const coupons = [{ id: 'friend-a', percent: 50 }, { id: 'friend-b', percent: 50 }];
  it('uses only one coupon per purchase', () => {
    expect(pickDiscount(false, coupons)).toEqual({ percent: 50, couponId: 'friend-a' });
  });
  it('after a coupon is used, the next purchase uses the next friend coupon', () => {
    expect(pickDiscount(false, coupons.slice(1)).couponId).toBe('friend-b');
  });
  it('no coupons left means no discount', () => {
    expect(pickDiscount(false, []).percent).toBe(0);
  });
  it('welcome discount does not consume a coupon', () => {
    expect(pickDiscount(true, coupons).couponId).toBeNull();
  });
});
