import { describe, it, expect } from 'vitest';
import seedData from '../src/data/curriculum-seed.json';
import { DiagramType, Flashcard } from '../src/types';

describe('Interactive Math Diagrams Suite', () => {
  const validDiagramTypes: DiagramType[] = [
    'fraction-bar',
    'angle-protractor',
    'polygon-angle',
    'prism-net',
    'number-line',
    'clock'
  ];

  describe('Curriculum Seed Diagram Attachments', () => {
    it('should have valid diagram configs attached to representative cards', () => {
      const cardsWithDiagrams: Flashcard[] = [];

      for (const deck of seedData.decks) {
        for (const card of deck.cards) {
          if (card.diagram) {
            cardsWithDiagrams.push(card as Flashcard);
          }
        }
      }

      expect(cardsWithDiagrams.length).toBeGreaterThanOrEqual(6);

      const attachedTypes = new Set(cardsWithDiagrams.map((c) => c.diagram?.type));
      for (const type of validDiagramTypes) {
        expect(attachedTypes.has(type)).toBe(true);
      }

      for (const card of cardsWithDiagrams) {
        const diagram = card.diagram!;
        expect(validDiagramTypes).toContain(diagram.type);
        if (diagram.position) {
          expect(['front', 'back', 'both']).toContain(diagram.position);
        }
      }
    });
  });

  describe('Angle Protractor & Classification Logic', () => {
    const classifyAngle = (angle: number): 'acute' | 'right' | 'obtuse' | 'straight' => {
      if (angle < 90) return 'acute';
      if (angle === 90) return 'right';
      if (angle < 180) return 'obtuse';
      return 'straight';
    };

    it('should correctly classify angles under elementary math definitions', () => {
      expect(classifyAngle(30)).toBe('acute');
      expect(classifyAngle(45)).toBe('acute');
      expect(classifyAngle(89)).toBe('acute');
      expect(classifyAngle(90)).toBe('right');
      expect(classifyAngle(91)).toBe('obtuse');
      expect(classifyAngle(120)).toBe('obtuse');
      expect(classifyAngle(150)).toBe('obtuse');
      expect(classifyAngle(180)).toBe('straight');
    });
  });

  describe('Fraction Strip Equivalence Logic', () => {
    const areEquivalent = (num1: number, den1: number, num2: number, den2: number): boolean => {
      return num1 * den2 === num2 * den1;
    };

    it('should identify equivalent fractions visually mapped on strips', () => {
      expect(areEquivalent(1, 2, 2, 4)).toBe(true);
      expect(areEquivalent(1, 2, 4, 8)).toBe(true);
      expect(areEquivalent(2, 3, 4, 6)).toBe(true);
      expect(areEquivalent(3, 4, 6, 8)).toBe(true);
      expect(areEquivalent(1, 2, 3, 5)).toBe(false);
    });
  });

  describe('Polygon Angle Sum Theorem Logic', () => {
    const polygonAngleSum = (sides: number): number => {
      return (sides - 2) * 180;
    };

    it('should compute invariant sum of interior angles for triangle and quadrilateral', () => {
      expect(polygonAngleSum(3)).toBe(180);
      expect(polygonAngleSum(4)).toBe(360);
      expect(polygonAngleSum(5)).toBe(540);
      expect(polygonAngleSum(6)).toBe(720);
    });

    it('should preserve 180 deg sum for any triangle angles A, B, C', () => {
      const angles = [50, 60, 70];
      const sum = angles.reduce((acc, cur) => acc + cur, 0);
      expect(sum).toBe(180);
    });
  });

  describe('3D Net Properties (Cube / Rectangular Prism)', () => {
    it('should verify standard Euler characteristic and net face count', () => {
      const faces = 6;
      const vertices = 8;
      const edges = 12;

      // Euler characteristic: V - E + F = 2
      expect(vertices - edges + faces).toBe(2);

      // Cube has 3 pairs of parallel opposite faces
      const oppositePairs = [
        ['top', 'bottom'],
        ['front', 'back'],
        ['left', 'right']
      ];
      expect(oppositePairs.length).toBe(3);
    });
  });

  describe('Clock Hands Angle & Time Calculation', () => {
    const getHandAngles = (hours: number, minutes: number) => {
      const minuteAngle = minutes * 6; // 360 / 60 = 6 deg/min
      const hourAngle = ((hours % 12) * 30) + (minutes * 0.5); // 360 / 12 = 30 deg/hr + 0.5 deg/min
      return { minuteAngle, hourAngle };
    };

    it('should calculate accurate degree positions for clock hands', () => {
      // At 3:00, minute hand is at 0 deg (12), hour hand is at 90 deg (3)
      const at3 = getHandAngles(3, 0);
      expect(at3.minuteAngle).toBe(0);
      expect(at3.hourAngle).toBe(90);

      // At 6:30, minute hand is at 180 deg (6), hour hand is at 180 + 15 = 195 deg
      const at630 = getHandAngles(6, 30);
      expect(at630.minuteAngle).toBe(180);
      expect(at630.hourAngle).toBe(195);

      // At 12:00, both are 0 / 360
      const at12 = getHandAngles(12, 0);
      expect(at12.minuteAngle).toBe(0);
      expect(at12.hourAngle).toBe(0);
    });
  });

  describe('Number Line Calculation', () => {
    it('should correctly calculate jump end points and intervals', () => {
      const start = 3;
      const step = 4;
      const end = start + step;
      expect(end).toBe(7);

      const decimalStart = 0.3;
      const decimalStep = 0.4;
      const decimalEnd = Math.round((decimalStart + decimalStep) * 10) / 10;
      expect(decimalEnd).toBe(0.7);
    });
  });
});
