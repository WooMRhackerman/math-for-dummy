---
name: srs-algorithm
description: Spaced repetition algorithm (SuperMemo SM-2) implementation, interval calculations, ease factor updates, and review queue management.
---

# SRS Algorithm Skill

This skill defines the mathematical logic for the Spaced Repetition System (SRS) based on the SuperMemo SM-2 algorithm.

## 1. SM-2 Formula Reference

Each card tracks:
- `repetitions` ($n$): Consecutive successful reviews ($q \ge 3$).
- `interval` ($I$): Days until next review.
- `easeFactor` ($EF$): Multiplier for interval growth (default: 2.5, minimum: 1.3).
- `dueDate`: ISO date string (`YYYY-MM-DD`).

### Algorithm Execution per Grade ($q \in \{1, 2, 3, 4\}$):
Map 4-button ratings to standard SM-2 qualities:
- `1` (Again / 다시): $q = 1$
- `2` (Hard / 어려움): $q = 2$
- `3` (Good / 적당함): $q = 4$
- `4` (Easy / 쉬움): $q = 5$

```typescript
export interface SRSState {
  repetitions: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
}

export function calculateNextReview(state: SRSState, quality: 1 | 2 | 4 | 5): SRSState {
  let { repetitions, interval, easeFactor } = state;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Update Ease Factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate Due Date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const dueDate = nextDate.toISOString().split("T")[0];

  return { repetitions, interval, easeFactor: Number(easeFactor.toFixed(2)), dueDate };
}
```
