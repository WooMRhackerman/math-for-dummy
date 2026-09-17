import { describe, it, expect } from 'vitest';
import seedData from '../src/data/curriculum-seed.json';
import { MathDomain } from '../src/types';

describe('Elementary Math Curriculum Seed Data (68-Unit Expansion)', () => {
  const validDomains: MathDomain[] = [
    '수와 연산',
    '도형',
    '측정',
    '규칙성',
    '자료와 가능성'
  ];

  it('should have 12 elementary semester decks (Grades 1 to 6, Semesters 1 & 2)', () => {
    expect(seedData.decks.length).toBe(12);
    
    // Check all combinations of Grade 1-6 and Semester 1-2 exist
    for (let grade = 1; grade <= 6; grade++) {
      for (let sem = 1; sem <= 2; sem++) {
        const deck = seedData.decks.find((d) => d.grade === grade && d.semester === sem);
        expect(deck).toBeDefined();
        expect(deck?.cards.length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('should cover all official elementary math units across 12 semesters (70 units)', () => {
    const distinctUnits = new Set<string>();
    let totalCards = 0;

    for (const deck of seedData.decks) {
      for (const card of deck.cards) {
        totalCards++;
        distinctUnits.add(`${card.grade}-${card.semester}:${card.unit}`);
      }
    }

    expect(distinctUnits.size).toBe(70);
    expect(totalCards).toBeGreaterThanOrEqual(70);
  });

  it('should represent all 5 math domains with multiple cards each', () => {
    const domainCounts: Record<string, number> = {};

    for (const deck of seedData.decks) {
      for (const card of deck.cards) {
        domainCounts[card.domain] = (domainCounts[card.domain] || 0) + 1;
        expect(validDomains).toContain(card.domain);
      }
    }

    for (const domain of validDomains) {
      expect(domainCounts[domain]).toBeGreaterThanOrEqual(4);
    }
  });

  it('should have valid card structure and clean KaTeX math delimiters for all cards', () => {
    for (const deck of seedData.decks) {
      for (const card of deck.cards) {
        expect(card.id).toBeTruthy();
        expect(card.grade).toBe(deck.grade);
        expect(card.semester).toBe(deck.semester);
        expect(card.unit).toBeTruthy();
        expect(card.tags.length).toBeGreaterThan(0);
        expect(card.front.ko).toBeTruthy();
        expect(card.front.en).toBeTruthy();
        expect(card.back.ko).toBeTruthy();
        expect(card.back.en).toBeTruthy();
        expect(card.review.easeFactor).toBe(2.5);

        // KaTeX sanity: dollar signs should be paired
        const countDollars = (str: string) => (str.match(/\$/g) || []).length;
        expect(countDollars(card.front.ko) % 2).toBe(0);
        expect(countDollars(card.back.ko) % 2).toBe(0);
      }
    }
  });
});
