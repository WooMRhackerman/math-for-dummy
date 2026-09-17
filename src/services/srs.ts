import { SRSState, Flashcard } from '../types';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Rating mapping:
 * 1 (Again / 다시) -> Quality 1
 * 2 (Hard / 어려움) -> Quality 2
 * 3 (Good / 적당함) -> Quality 4
 * 4 (Easy / 쉬움) -> Quality 5
 */
export function calculateNextReview(currentState: SRSState, rating: 1 | 2 | 3 | 4): SRSState {
  const qualityMap: Record<number, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 5
  };
  const q = qualityMap[rating];

  let { repetitions, interval, easeFactor } = currentState;

  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate Next Due Date (YYYY-MM-DD)
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const dueDate = nextDate.toISOString().split('T')[0];

  return {
    repetitions,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    dueDate
  };
}

/**
 * Checks if a card is due for review on or before the target date (defaults to today).
 */
export function isCardDue(card: Flashcard, targetDate?: string): boolean {
  const today = targetDate || new Date().toISOString().split('T')[0];
  return !card.review.dueDate || card.review.dueDate <= today;
}
