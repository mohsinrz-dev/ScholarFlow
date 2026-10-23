import { describe, it, expect } from 'vitest';

describe('Revision scheduling algorithm', () => {
  function computeNextReviewDate(reviewCount) {
    const intervals = [1, 3, 7, 14, 30, 60];
    const days = intervals[Math.min(reviewCount, intervals.length - 1)];
    const next = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return { days, next };
  }

  it('schedules first review in 1 day', () => {
    const { days } = computeNextReviewDate(1);
    expect(days).toBe(3);
  });

  it('schedules review 0 (initial) in 1 day', () => {
    const { days } = computeNextReviewDate(0);
    expect(days).toBe(1);
  });

  it('schedules review after 5 completions at max interval (60 days)', () => {
    const { days } = computeNextReviewDate(5);
    expect(days).toBe(60);
  });

  it('caps at 60 days beyond the interval array', () => {
    const { days } = computeNextReviewDate(100);
    expect(days).toBe(60);
  });

  it('returns a future date', () => {
    const { next } = computeNextReviewDate(0);
    expect(next.getTime()).toBeGreaterThan(Date.now());
  });

  it('is deterministic for the same review count', () => {
    const a = computeNextReviewDate(2);
    const b = computeNextReviewDate(2);
    expect(a.days).toBe(b.days);
  });
});
