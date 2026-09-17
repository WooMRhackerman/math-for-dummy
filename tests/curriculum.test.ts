import { describe, it, expect } from 'vitest';
import seedData from '../src/data/curriculum-seed.json';
import { MathDomain } from '../src/types';

describe('Elementary Math Curriculum Seed Data', () => {
  const validDomains: MathDomain[] = [
    '수와 연산',
    '도형',
    '측정',
    '규칙성',
    '자료와 가능성'
  ];

  it('should have 6 elementary grade decks', () => {
    expect(seedData.decks.length).toBe(6);
    const grades = seedData.decks.map((d) => d.grade);
    expect(grades).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should have valid card structure for all cards', () => {
    let totalCards = 0;
    for (const deck of seedData.decks) {
      expect(deck.cards.length).toBeGreaterThan(0);
      for (const card of deck.cards) {
        totalCards++;
        expect(card.id).toBeTruthy();
        expect(card.grade).toBe(deck.grade);
        expect(card.semester).toBeGreaterThanOrEqual(1);
        expect(card.semester).toBeLessThanOrEqual(2);
        expect(card.unit).toBeTruthy();
        expect(validDomains).toContain(card.domain);
        expect(card.front.ko).toBeTruthy();
        expect(card.back.ko).toBeTruthy();
        expect(card.review.easeFactor).toBe(2.5);
      }
    }
    expect(totalCards).toBeGreaterThanOrEqual(12);
  });
});
