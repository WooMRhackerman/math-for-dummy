import { describe, it, expect } from 'vitest';
import { calculateNextReview, isCardDue } from '../src/services/srs';
import { Flashcard, SRSState } from '../src/types';

describe('Spaced Repetition (SM-2) Algorithm', () => {
  const initialState: SRSState = {
    repetitions: 0,
    interval: 0,
    easeFactor: 2.5,
    dueDate: ''
  };

  it('should reset repetitions to 0 and interval to 1 on "Again" (Rating 1)', () => {
    const activeState: SRSState = {
      repetitions: 4,
      interval: 15,
      easeFactor: 2.5,
      dueDate: '2026-09-17'
    };

    const next = calculateNextReview(activeState, 1);
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBeLessThan(2.5); // Ease factor penalty
  });

  it('should advance from repetitions 0 to 1 with interval 1 on "Good" (Rating 3)', () => {
    const next = calculateNextReview(initialState, 3);
    expect(next.repetitions).toBe(1);
    expect(next.interval).toBe(1);
  });

  it('should advance from repetitions 1 to 2 with interval 6 on "Good" (Rating 3)', () => {
    const stateAfterFirstReview: SRSState = {
      repetitions: 1,
      interval: 1,
      easeFactor: 2.5,
      dueDate: '2026-09-17'
    };

    const next = calculateNextReview(stateAfterFirstReview, 3);
    expect(next.repetitions).toBe(2);
    expect(next.interval).toBe(6);
  });

  it('should multiply interval by ease factor on consecutive successful reviews', () => {
    const stateAfterSecondReview: SRSState = {
      repetitions: 2,
      interval: 6,
      easeFactor: 2.5,
      dueDate: '2026-09-17'
    };

    const next = calculateNextReview(stateAfterSecondReview, 4); // Easy rating
    expect(next.repetitions).toBe(3);
    expect(next.interval).toBe(Math.round(6 * 2.5)); // 15 days (uses current EF 2.5)
    expect(next.easeFactor).toBeGreaterThan(2.5);
  });

  it('should never let ease factor drop below 1.3', () => {
    let state: SRSState = {
      repetitions: 0,
      interval: 1,
      easeFactor: 1.35,
      dueDate: '2026-09-17'
    };

    state = calculateNextReview(state, 1); // Failure reduces ease factor
    state = calculateNextReview(state, 1);
    expect(state.easeFactor).toBe(1.3);
  });

  it('should correctly evaluate isCardDue', () => {
    const dueCard = {
      review: { dueDate: '2026-09-10' }
    } as Flashcard;

    const notDueCard = {
      review: { dueDate: '2099-01-01' }
    } as Flashcard;

    expect(isCardDue(dueCard, '2026-09-17')).toBe(true);
    expect(isCardDue(notDueCard, '2026-09-17')).toBe(false);
  });
});
