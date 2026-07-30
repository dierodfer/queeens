import { describe, expect, it } from 'vitest';
import { randomInt, randomUnit } from './random';

describe('randomUnit', () => {
  it('stays inside the [0, 1) range', () => {
    for (let i = 0; i < 500; i++) {
      const value = randomUnit();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('randomInt', () => {
  it('stays inside the [0, max) range', () => {
    for (let i = 0; i < 500; i++) {
      const value = randomInt(7);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
  });

  it('returns 0 for a non-positive max', () => {
    expect(randomInt(0)).toBe(0);
    expect(randomInt(-3)).toBe(0);
  });

  it('eventually covers every value of a small range', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(randomInt(3));
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });
});
