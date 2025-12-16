import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GravitySystem } from './GravitySystem';

describe('GravitySystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Timing Tests', () => {
    it('should calculate correct interval for level 1', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      // Level 1: 0.01667 G
      // Interval = 1000 / (0.01667 * 60) ≈ 1000ms
      const interval = gravity.getGravityInterval();
      expect(interval).toBeCloseTo(1000, 0);
    });

    it('should calculate correct interval for level 5', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(5, callback);

      // Level 5: 0.04693 G
      // Interval = 1000 / (0.04693 * 60) ≈ 355ms
      const interval = gravity.getGravityInterval();
      expect(interval).toBeCloseTo(355, 0);
    });

    it('should calculate correct interval for level 10', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(10, callback);

      // Level 10: 0.2598 G
      // Interval = 1000 / (0.2598 * 60) ≈ 64ms
      const interval = gravity.getGravityInterval();
      expect(interval).toBeCloseTo(64, 0);
    });

    it('should calculate correct interval for level 15', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(15, callback);

      // Level 15: 2.36 G
      // Interval = 1000 / (2.36 * 60) ≈ 7ms
      const interval = gravity.getGravityInterval();
      expect(interval).toBeCloseTo(7, 0);
    });

    it('should calculate correct interval for level 20', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(20, callback);

      // Level 20: 20.0 G (instant)
      // Interval = 1000 / (20.0 * 60) ≈ 0.83ms
      const interval = gravity.getGravityInterval();
      expect(interval).toBeCloseTo(0.83, 1);
    });
  });

  describe('Movement Tests', () => {
    it('should call callback on gravity tick', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();
      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledTimes(1);

      gravity.stop();
    });

    it('should call callback multiple times for multiple ticks', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();
      vi.advanceTimersByTime(3000);

      expect(callback).toHaveBeenCalledTimes(3);

      gravity.stop();
    });

    it('should trigger manual tick', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.tick();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when not started', () => {
      const callback = vi.fn(() => true);
      new GravitySystem(1, callback);

      vi.advanceTimersByTime(1000);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Pause Tests', () => {
    it('should not call callback when paused', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();
      gravity.pause();
      vi.advanceTimersByTime(1000);

      expect(callback).not.toHaveBeenCalled();

      gravity.stop();
    });

    it('should resume calling callback after resume', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();
      gravity.pause();
      vi.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();

      gravity.resume();
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      gravity.stop();
    });

    it('should handle multiple pause/resume cycles', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();

      // First tick
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Pause
      gravity.pause();
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Resume and tick
      gravity.resume();
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);

      // Pause again
      gravity.pause();
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);

      gravity.stop();
    });

    it('should not trigger manual tick when paused', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.pause();
      gravity.tick();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Level Change Tests', () => {
    it('should update interval when level changes', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      const interval1 = gravity.getGravityInterval();
      expect(interval1).toBeCloseTo(1000, 0);

      gravity.setLevel(10);

      const interval10 = gravity.getGravityInterval();
      expect(interval10).toBeCloseTo(64, 0);
      expect(interval10).toBeLessThan(interval1);
    });

    it('should restart timer with new interval when running', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();

      // Should tick at ~1000ms
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Change to level 5 (faster)
      gravity.setLevel(5);

      // Should now tick at ~355ms
      vi.advanceTimersByTime(355);
      expect(callback).toHaveBeenCalledTimes(2);

      gravity.stop();
    });

    it('should have faster interval for higher levels', () => {
      const callback = vi.fn(() => true);
      const gravity1 = new GravitySystem(1, callback);
      const gravity20 = new GravitySystem(20, callback);

      expect(gravity20.getGravityInterval()).toBeLessThan(gravity1.getGravityInterval());
    });
  });

  describe('Start/Stop Tests', () => {
    it('should stop timer when stop is called', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      gravity.stop();
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not start multiple timers', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      gravity.start();
      gravity.start(); // Should not create second timer
      gravity.start(); // Should not create third timer

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);

      gravity.stop();
    });
  });

  describe('Getter Tests', () => {
    it('should return current level', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(5, callback);

      expect(gravity.getLevel()).toBe(5);

      gravity.setLevel(10);
      expect(gravity.getLevel()).toBe(10);
    });

    it('should return current gravity interval', () => {
      const callback = vi.fn(() => true);
      const gravity = new GravitySystem(1, callback);

      const interval = gravity.getGravityInterval();
      expect(interval).toBeGreaterThan(0);
    });
  });
});
