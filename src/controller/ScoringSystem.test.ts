import { describe, it, expect, beforeEach } from 'vitest';
import { ScoringSystem } from './ScoringSystem';

describe('ScoringSystem', () => {
  let scoringSystem: ScoringSystem;

  beforeEach(() => {
    scoringSystem = new ScoringSystem();
  });

  describe('calculateScore', () => {
    it('should calculate score for single line clear at level 1', () => {
      const score = scoringSystem.calculateScore(1, 1);
      expect(score).toBe(100); // 100 × 1
    });

    it('should calculate score for double line clear at level 1', () => {
      const score = scoringSystem.calculateScore(2, 1);
      expect(score).toBe(300); // 300 × 1
    });

    it('should calculate score for triple line clear at level 1', () => {
      const score = scoringSystem.calculateScore(3, 1);
      expect(score).toBe(500); // 500 × 1
    });

    it('should calculate score for tetris (4 lines) at level 1', () => {
      const score = scoringSystem.calculateScore(4, 1);
      expect(score).toBe(800); // 800 × 1
    });

    it('should scale score by level', () => {
      expect(scoringSystem.calculateScore(1, 5)).toBe(500); // 100 × 5
      expect(scoringSystem.calculateScore(2, 3)).toBe(900); // 300 × 3
      expect(scoringSystem.calculateScore(3, 10)).toBe(5000); // 500 × 10
      expect(scoringSystem.calculateScore(4, 20)).toBe(16000); // 800 × 20
    });

    it('should return 0 for clearing 0 lines', () => {
      const score = scoringSystem.calculateScore(0, 5);
      expect(score).toBe(0);
    });

    it('should handle invalid line counts gracefully', () => {
      // If more than 4 lines somehow cleared, should return 0
      const score = scoringSystem.calculateScore(5, 1);
      expect(score).toBe(0);
    });
  });

  describe('addScore and getScore', () => {
    it('should start with score of 0', () => {
      expect(scoringSystem.getScore()).toBe(0);
    });

    it('should accumulate score correctly', () => {
      scoringSystem.addScore(100);
      expect(scoringSystem.getScore()).toBe(100);

      scoringSystem.addScore(300);
      expect(scoringSystem.getScore()).toBe(400);

      scoringSystem.addScore(800);
      expect(scoringSystem.getScore()).toBe(1200);
    });

    it('should handle adding zero points', () => {
      scoringSystem.addScore(0);
      expect(scoringSystem.getScore()).toBe(0);
    });
  });

  describe('calculateHardDropBonus', () => {
    it('should calculate hard drop bonus correctly', () => {
      expect(scoringSystem.calculateHardDropBonus(0)).toBe(0);
      expect(scoringSystem.calculateHardDropBonus(1)).toBe(2);
      expect(scoringSystem.calculateHardDropBonus(5)).toBe(10);
      expect(scoringSystem.calculateHardDropBonus(10)).toBe(20);
      expect(scoringSystem.calculateHardDropBonus(20)).toBe(40);
    });
  });

  describe('calculateSoftDropBonus', () => {
    it('should calculate soft drop bonus correctly', () => {
      expect(scoringSystem.calculateSoftDropBonus(0)).toBe(0);
      expect(scoringSystem.calculateSoftDropBonus(1)).toBe(1);
      expect(scoringSystem.calculateSoftDropBonus(5)).toBe(5);
      expect(scoringSystem.calculateSoftDropBonus(10)).toBe(10);
    });
  });

  describe('reset', () => {
    it('should reset score to 0', () => {
      scoringSystem.addScore(1000);
      expect(scoringSystem.getScore()).toBe(1000);

      scoringSystem.reset();
      expect(scoringSystem.getScore()).toBe(0);
    });

    it('should allow adding score after reset', () => {
      scoringSystem.addScore(500);
      scoringSystem.reset();
      scoringSystem.addScore(200);

      expect(scoringSystem.getScore()).toBe(200);
    });
  });

  describe('integration scenarios', () => {
    it('should handle a complete game scenario', () => {
      // Level 1 - Single line clear
      const points1 = scoringSystem.calculateScore(1, 1);
      scoringSystem.addScore(points1);
      expect(scoringSystem.getScore()).toBe(100);

      // Hard drop bonus
      const hardDropBonus = scoringSystem.calculateHardDropBonus(5);
      scoringSystem.addScore(hardDropBonus);
      expect(scoringSystem.getScore()).toBe(110); // 100 + 10

      // Level 2 - Tetris
      const points2 = scoringSystem.calculateScore(4, 2);
      scoringSystem.addScore(points2);
      expect(scoringSystem.getScore()).toBe(1710); // 110 + 1600

      // Soft drop bonus
      const softDropBonus = scoringSystem.calculateSoftDropBonus(3);
      scoringSystem.addScore(softDropBonus);
      expect(scoringSystem.getScore()).toBe(1713); // 1710 + 3
    });

    it('should maintain accurate score through multiple operations', () => {
      // Simulate multiple line clears with different bonuses
      scoringSystem.addScore(scoringSystem.calculateScore(2, 1)); // 300
      scoringSystem.addScore(scoringSystem.calculateHardDropBonus(3)); // 6
      scoringSystem.addScore(scoringSystem.calculateScore(1, 1)); // 100
      scoringSystem.addScore(scoringSystem.calculateSoftDropBonus(2)); // 2
      scoringSystem.addScore(scoringSystem.calculateScore(4, 2)); // 1600

      expect(scoringSystem.getScore()).toBe(2008);
    });
  });
});
