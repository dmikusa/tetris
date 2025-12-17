import { describe, it, expect, beforeEach } from 'vitest';
import { LevelSystem } from './LevelSystem';

describe('LevelSystem', () => {
  let levelSystem: LevelSystem;

  beforeEach(() => {
    levelSystem = new LevelSystem();
  });

  describe('initialization', () => {
    it('should start at level 1 by default', () => {
      expect(levelSystem.getCurrentLevel()).toBe(1);
    });

    it('should have 0 total lines cleared initially', () => {
      expect(levelSystem.getTotalLinesCleared()).toBe(0);
    });

    it('should report 10 lines until next level at start', () => {
      expect(levelSystem.getLinesUntilNextLevel()).toBe(10);
    });
  });

  describe('addLines', () => {
    it('should add lines to total count', () => {
      levelSystem.addLines(3);
      expect(levelSystem.getTotalLinesCleared()).toBe(3);

      levelSystem.addLines(2);
      expect(levelSystem.getTotalLinesCleared()).toBe(5);
    });

    it('should return false when not leveling up', () => {
      const leveledUp = levelSystem.addLines(5);
      expect(leveledUp).toBe(false);
      expect(levelSystem.getCurrentLevel()).toBe(1);
    });

    it('should return true and level up after 10 lines', () => {
      levelSystem.addLines(9);
      expect(levelSystem.getCurrentLevel()).toBe(1);

      const leveledUp = levelSystem.addLines(1);
      expect(leveledUp).toBe(true);
      expect(levelSystem.getCurrentLevel()).toBe(2);
    });

    it('should level up multiple times if enough lines added', () => {
      const leveledUp = levelSystem.addLines(25);
      expect(leveledUp).toBe(true);
      expect(levelSystem.getCurrentLevel()).toBe(3); // Started at 1, 25 lines = 2 level ups
      expect(levelSystem.getTotalLinesCleared()).toBe(25);
    });

    it('should handle adding 0 lines', () => {
      levelSystem.addLines(0);
      expect(levelSystem.getTotalLinesCleared()).toBe(0);
      expect(levelSystem.getCurrentLevel()).toBe(1);
    });
  });

  describe('getLinesUntilNextLevel', () => {
    it('should calculate lines until next level correctly', () => {
      expect(levelSystem.getLinesUntilNextLevel()).toBe(10);

      levelSystem.addLines(3);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(7);

      levelSystem.addLines(6);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(1);

      levelSystem.addLines(1); // Should level up to 2
      expect(levelSystem.getLinesUntilNextLevel()).toBe(10);

      levelSystem.addLines(5);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(5);
    });

    it('should show 0 lines remaining at max level', () => {
      levelSystem.addLines(200); // Way more than needed for max level
      expect(levelSystem.getCurrentLevel()).toBe(20);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(0);
    });
  });

  describe('level progression', () => {
    it('should progress through levels correctly', () => {
      // Level 1 -> 2
      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(2);

      // Level 2 -> 3
      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(3);

      // Level 3 -> 4
      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(4);
    });

    it('should cap at level 20', () => {
      levelSystem.addLines(200); // 10 lines/level * 19 levels = 190 to reach 20
      expect(levelSystem.getCurrentLevel()).toBe(20);

      // Adding more lines should not increase level
      const leveledUp = levelSystem.addLines(100);
      expect(leveledUp).toBe(false);
      expect(levelSystem.getCurrentLevel()).toBe(20);
    });

    it('should handle exact level boundaries', () => {
      // Exactly 10 lines
      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(2);

      // Exactly 20 total lines
      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(3);
    });
  });

  describe('setStartLevel', () => {
    it('should allow setting a different start level', () => {
      levelSystem.setStartLevel(5);
      levelSystem.reset();
      expect(levelSystem.getCurrentLevel()).toBe(5);
    });

    it('should respect start level in line progression', () => {
      levelSystem.setStartLevel(10);
      levelSystem.reset();

      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(11);

      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(12);
    });

    it('should cap start level at max level', () => {
      levelSystem.setStartLevel(25); // More than max
      levelSystem.reset();
      expect(levelSystem.getCurrentLevel()).toBe(20);
    });

    it('should handle start level of 1', () => {
      levelSystem.setStartLevel(1);
      levelSystem.reset();
      expect(levelSystem.getCurrentLevel()).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      levelSystem.addLines(25);
      expect(levelSystem.getCurrentLevel()).toBe(3);
      expect(levelSystem.getTotalLinesCleared()).toBe(25);

      levelSystem.reset();
      expect(levelSystem.getCurrentLevel()).toBe(1);
      expect(levelSystem.getTotalLinesCleared()).toBe(0);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(10);
    });

    it('should reset to custom start level if set', () => {
      levelSystem.setStartLevel(5);
      levelSystem.addLines(20);

      levelSystem.reset();
      expect(levelSystem.getCurrentLevel()).toBe(5);
      expect(levelSystem.getTotalLinesCleared()).toBe(0);
    });

    it('should allow progression after reset', () => {
      levelSystem.addLines(15);
      levelSystem.reset();

      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(2);
    });
  });

  describe('integration scenarios', () => {
    it('should handle realistic game progression', () => {
      // Typical game flow
      levelSystem.addLines(1); // Single
      expect(levelSystem.getCurrentLevel()).toBe(1);

      levelSystem.addLines(2); // Double
      expect(levelSystem.getCurrentLevel()).toBe(1);

      levelSystem.addLines(4); // Tetris - total 7 lines
      expect(levelSystem.getCurrentLevel()).toBe(1);

      levelSystem.addLines(3); // Triple - total 10 lines, level up!
      expect(levelSystem.getCurrentLevel()).toBe(2);
      expect(levelSystem.getTotalLinesCleared()).toBe(10);

      levelSystem.addLines(4); // Another tetris
      expect(levelSystem.getCurrentLevel()).toBe(2);
      expect(levelSystem.getTotalLinesCleared()).toBe(14);

      levelSystem.addLines(6); // Six more lines - total 20, level up!
      expect(levelSystem.getCurrentLevel()).toBe(3);
    });

    it('should track progression to max level', () => {
      // Add lines to reach level 20 (190 lines needed)
      for (let i = 0; i < 19; i++) {
        levelSystem.addLines(10);
      }

      expect(levelSystem.getCurrentLevel()).toBe(20);
      expect(levelSystem.getTotalLinesCleared()).toBe(190);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(0);

      // Further progress should not increase level
      levelSystem.addLines(10);
      expect(levelSystem.getCurrentLevel()).toBe(20);
      expect(levelSystem.getTotalLinesCleared()).toBe(200);
    });

    it('should handle uneven line counts correctly', () => {
      levelSystem.addLines(1);
      levelSystem.addLines(3);
      levelSystem.addLines(2);
      levelSystem.addLines(1); // Total: 7
      expect(levelSystem.getCurrentLevel()).toBe(1);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(3);

      levelSystem.addLines(4); // Total: 11, should level up
      expect(levelSystem.getCurrentLevel()).toBe(2);
      expect(levelSystem.getLinesUntilNextLevel()).toBe(9);
    });
  });
});
