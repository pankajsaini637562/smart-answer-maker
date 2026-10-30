import { describe, it, expect } from 'vitest';
import { admitCardTheme, ADMIT_THEMES } from './admitCard';

describe('admitCardTheme', () => {
  it('gives the same roll the same colour', () => {
    expect(admitCardTheme('NEET26-0001').name).toBe(admitCardTheme('NEET26-0001').name);
  });
  it('gives neighbouring rolls different colours', () => {
    expect(admitCardTheme('NEET26-0001').name).not.toBe(admitCardTheme('NEET26-0002').name);
  });
  it('has 8 distinct colours', () => {
    expect(new Set(ADMIT_THEMES.map(t => t.name)).size).toBe(8);
  });
});
