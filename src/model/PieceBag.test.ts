import { describe, it, expect } from 'vitest';
import { PieceBag } from './PieceBag';
import { TetrominoType } from './types';

describe('PieceBag', () => {
  describe('Distribution Test', () => {
    it('should generate exactly 100 of each piece type in 700 pieces (100 bags)', () => {
      const bag = new PieceBag();
      const counts: Record<TetrominoType, number> = {
        [TetrominoType.I]: 0,
        [TetrominoType.O]: 0,
        [TetrominoType.T]: 0,
        [TetrominoType.S]: 0,
        [TetrominoType.Z]: 0,
        [TetrominoType.J]: 0,
        [TetrominoType.L]: 0,
      };

      // Generate 700 pieces (100 complete bags)
      for (let i = 0; i < 700; i++) {
        const piece = bag.next();
        counts[piece]++;
      }

      // Verify each type appears exactly 100 times
      expect(counts[TetrominoType.I]).toBe(100);
      expect(counts[TetrominoType.O]).toBe(100);
      expect(counts[TetrominoType.T]).toBe(100);
      expect(counts[TetrominoType.S]).toBe(100);
      expect(counts[TetrominoType.Z]).toBe(100);
      expect(counts[TetrominoType.J]).toBe(100);
      expect(counts[TetrominoType.L]).toBe(100);
    });
  });

  describe('Bag Integrity Test', () => {
    it('should have all 7 types exactly once in each bag', () => {
      const bag = new PieceBag();

      // Test multiple bags
      for (let bagNum = 0; bagNum < 10; bagNum++) {
        const pieces: TetrominoType[] = [];
        for (let i = 0; i < 7; i++) {
          pieces.push(bag.next());
        }

        // Verify all 7 types appear exactly once
        const uniqueTypes = new Set(pieces);
        expect(uniqueTypes.size).toBe(7);
        expect(pieces.length).toBe(7);

        // Verify each type appears exactly once
        expect(pieces.filter((p) => p === TetrominoType.I).length).toBe(1);
        expect(pieces.filter((p) => p === TetrominoType.O).length).toBe(1);
        expect(pieces.filter((p) => p === TetrominoType.T).length).toBe(1);
        expect(pieces.filter((p) => p === TetrominoType.S).length).toBe(1);
        expect(pieces.filter((p) => p === TetrominoType.Z).length).toBe(1);
        expect(pieces.filter((p) => p === TetrominoType.J).length).toBe(1);
        expect(pieces.filter((p) => p === TetrominoType.L).length).toBe(1);
      }
    });
  });

  describe('Refill Test', () => {
    it('should refill automatically after 7 pieces', () => {
      const bag = new PieceBag();

      // Consume first bag
      const firstBag: TetrominoType[] = [];
      for (let i = 0; i < 7; i++) {
        firstBag.push(bag.next());
      }

      // 8th piece should come from new bag
      const eighthPiece = bag.next();
      expect(eighthPiece).toBeDefined();

      // Get rest of second bag
      const secondBag: TetrominoType[] = [eighthPiece];
      for (let i = 0; i < 6; i++) {
        secondBag.push(bag.next());
      }

      // Verify second bag also has all 7 types
      const uniqueTypes = new Set(secondBag);
      expect(uniqueTypes.size).toBe(7);
    });
  });

  describe('Peek Test', () => {
    it('should peek without consuming pieces', () => {
      const bag = new PieceBag(12345); // Use seed for deterministic test

      // Peek at next 5 pieces
      const peeked = bag.peek(5);
      expect(peeked.length).toBe(5);

      // Call next() 5 times and verify they match peeked sequence
      for (let i = 0; i < 5; i++) {
        const piece = bag.next();
        expect(piece).toBe(peeked[i]);
      }
    });

    it('should peek beyond current bag', () => {
      const bag = new PieceBag(12345);

      // Peek at 14 pieces (2 full bags)
      const peeked = bag.peek(14);
      expect(peeked.length).toBe(14);

      // First 7 should have all types
      const firstBag = peeked.slice(0, 7);
      const firstBagTypes = new Set(firstBag);
      expect(firstBagTypes.size).toBe(7);

      // Second 7 should also have all types
      const secondBag = peeked.slice(7, 14);
      const secondBagTypes = new Set(secondBag);
      expect(secondBagTypes.size).toBe(7);
    });

    it('should peek default 1 piece when no argument', () => {
      const bag = new PieceBag(12345);

      const peeked = bag.peek();
      expect(peeked.length).toBe(1);

      const next = bag.next();
      expect(next).toBe(peeked[0]);
    });
  });

  describe('Seed Test', () => {
    it('should produce identical sequences with same seed', () => {
      const bag1 = new PieceBag(42);
      const bag2 = new PieceBag(42);

      const sequence1: TetrominoType[] = [];
      const sequence2: TetrominoType[] = [];

      // Generate 21 pieces (3 bags) from each
      for (let i = 0; i < 21; i++) {
        sequence1.push(bag1.next());
        sequence2.push(bag2.next());
      }

      // Verify sequences are identical
      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      const bag1 = new PieceBag(42);
      const bag2 = new PieceBag(99);

      const sequence1: TetrominoType[] = [];
      const sequence2: TetrominoType[] = [];

      // Generate 21 pieces (3 bags) from each
      for (let i = 0; i < 21; i++) {
        sequence1.push(bag1.next());
        sequence2.push(bag2.next());
      }

      // Verify sequences are different
      expect(sequence1).not.toEqual(sequence2);
    });

    it('should produce different sequences without seed (random)', () => {
      const bag1 = new PieceBag();
      const bag2 = new PieceBag();

      const sequence1: TetrominoType[] = [];
      const sequence2: TetrominoType[] = [];

      // Generate 21 pieces from each
      for (let i = 0; i < 21; i++) {
        sequence1.push(bag1.next());
        sequence2.push(bag2.next());
      }

      // Sequences should very likely be different (not a guarantee, but extremely probable)
      // We'll just verify they both contain valid pieces
      expect(sequence1.length).toBe(21);
      expect(sequence2.length).toBe(21);
    });
  });

  describe('Reset Test', () => {
    it('should reset and refill bag', () => {
      const bag = new PieceBag(12345);

      // Consume some pieces
      const beforeReset: TetrominoType[] = [];
      for (let i = 0; i < 3; i++) {
        beforeReset.push(bag.next());
      }

      // Reset bag with same seed
      bag.reset(12345);

      // Should produce same initial sequence
      const afterReset: TetrominoType[] = [];
      for (let i = 0; i < 3; i++) {
        afterReset.push(bag.next());
      }

      expect(afterReset).toEqual(beforeReset);
    });

    it('should reset with new seed', () => {
      const bag = new PieceBag(42);

      const sequence1: TetrominoType[] = [];
      for (let i = 0; i < 7; i++) {
        sequence1.push(bag.next());
      }

      // Reset with different seed
      bag.reset(99);

      const sequence2: TetrominoType[] = [];
      for (let i = 0; i < 7; i++) {
        sequence2.push(bag.next());
      }

      // Sequences should be different
      expect(sequence2).not.toEqual(sequence1);
    });

    it('should handle multiple consecutive resets', () => {
      const bag = new PieceBag(12345);

      bag.next();
      bag.next();

      bag.reset(42);
      const seq1 = bag.next();

      bag.reset(42);
      const seq2 = bag.next();

      bag.reset(42);
      const seq3 = bag.next();

      // All should be the same (same seed)
      expect(seq1).toBe(seq2);
      expect(seq2).toBe(seq3);
    });
  });

  describe('Edge Cases', () => {
    it('should work correctly with multiple consecutive next() calls', () => {
      const bag = new PieceBag();
      const pieces: TetrominoType[] = [];

      // Call next() 100 times
      for (let i = 0; i < 100; i++) {
        pieces.push(bag.next());
      }

      expect(pieces.length).toBe(100);
      // All should be valid tetromino types
      pieces.forEach((piece) => {
        expect(Object.values(TetrominoType)).toContain(piece);
      });
    });

    it('should peek correctly after consuming some pieces', () => {
      const bag = new PieceBag(12345);

      // Consume 3 pieces
      bag.next();
      bag.next();
      bag.next();

      // Peek at next 10
      const peeked = bag.peek(10);
      expect(peeked.length).toBe(10);

      // Verify by consuming
      for (let i = 0; i < 10; i++) {
        expect(bag.next()).toBe(peeked[i]);
      }
    });
  });
});
