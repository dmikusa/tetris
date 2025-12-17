import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighScoreManager } from './HighScoreManager';

describe('HighScoreManager', () => {
  // Clear high scores before and after each test
  beforeEach(() => {
    HighScoreManager.clearHighScores();
  });

  afterEach(() => {
    HighScoreManager.clearHighScores();
  });

  describe('getHighScores', () => {
    it('should return empty array when no scores exist', () => {
      const scores = HighScoreManager.getHighScores();
      expect(scores).toEqual([]);
    });

    it('should return scores sorted by highest first', () => {
      HighScoreManager.addScore(100);
      HighScoreManager.addScore(300);
      HighScoreManager.addScore(200);

      const scores = HighScoreManager.getHighScores();
      expect(scores).toHaveLength(3);
      expect(scores[0].score).toBe(300);
      expect(scores[1].score).toBe(200);
      expect(scores[2].score).toBe(100);
    });
  });

  describe('addScore', () => {
    it('should add a score to empty list', () => {
      const position = HighScoreManager.addScore(1000);

      expect(position).toBe(1);
      const scores = HighScoreManager.getHighScores();
      expect(scores).toHaveLength(1);
      expect(scores[0].score).toBe(1000);
    });

    it('should add score and return correct position', () => {
      HighScoreManager.addScore(1000);
      HighScoreManager.addScore(3000);
      const position = HighScoreManager.addScore(2000);

      expect(position).toBe(2); // Should be second place
      const scores = HighScoreManager.getHighScores();
      expect(scores[0].score).toBe(3000);
      expect(scores[1].score).toBe(2000);
      expect(scores[2].score).toBe(1000);
    });

    it('should limit to maximum of 10 scores', () => {
      // Add 12 scores
      for (let i = 1; i <= 12; i++) {
        HighScoreManager.addScore(i * 100);
      }

      const scores = HighScoreManager.getHighScores();
      expect(scores).toHaveLength(10);
      expect(scores[0].score).toBe(1200); // Highest
      expect(scores[9].score).toBe(300); // 10th place
    });

    it('should not include score below top 10', () => {
      // Fill with 10 scores
      for (let i = 10; i >= 1; i--) {
        HighScoreManager.addScore(i * 1000);
      }

      // Try to add a score lower than all existing
      const position = HighScoreManager.addScore(500);

      expect(position).toBe(-1); // Not in top 10
      const scores = HighScoreManager.getHighScores();
      expect(scores).toHaveLength(10);
      expect(scores[9].score).toBe(1000); // Lowest is still 1000
    });

    it('should include timestamp for each score', () => {
      const before = Date.now();
      HighScoreManager.addScore(5000);
      const after = Date.now();

      const scores = HighScoreManager.getHighScores();
      expect(scores[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(scores[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('isHighScore', () => {
    it('should return true when list is empty', () => {
      expect(HighScoreManager.isHighScore(100)).toBe(true);
    });

    it('should return true when list has fewer than 10 scores', () => {
      HighScoreManager.addScore(1000);
      HighScoreManager.addScore(2000);

      expect(HighScoreManager.isHighScore(500)).toBe(true);
    });

    it('should return true when score is higher than lowest high score', () => {
      // Fill with 10 scores (100-1000)
      for (let i = 1; i <= 10; i++) {
        HighScoreManager.addScore(i * 100);
      }

      expect(HighScoreManager.isHighScore(150)).toBe(true); // Higher than 100
    });

    it('should return false when score is lower than lowest high score', () => {
      // Fill with 10 scores (100-1000)
      for (let i = 1; i <= 10; i++) {
        HighScoreManager.addScore(i * 100);
      }

      expect(HighScoreManager.isHighScore(50)).toBe(false); // Lower than 100
    });

    it('should return false when score equals lowest high score', () => {
      // Fill with 10 scores (100-1000)
      for (let i = 1; i <= 10; i++) {
        HighScoreManager.addScore(i * 100);
      }

      expect(HighScoreManager.isHighScore(100)).toBe(false); // Equal to lowest
    });
  });

  describe('clearHighScores', () => {
    it('should remove all high scores', () => {
      HighScoreManager.addScore(1000);
      HighScoreManager.addScore(2000);

      HighScoreManager.clearHighScores();

      const scores = HighScoreManager.getHighScores();
      expect(scores).toEqual([]);
    });
  });

  describe('persistence', () => {
    it('should persist scores across manager instances', () => {
      HighScoreManager.addScore(1500);

      // Simulate getting scores in a new context
      const scores = HighScoreManager.getHighScores();

      expect(scores).toHaveLength(1);
      expect(scores[0].score).toBe(1500);
    });
  });
});
