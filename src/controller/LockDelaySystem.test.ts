import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LockDelaySystem, LockDelayMode } from './LockDelaySystem';

describe('LockDelaySystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Timer Tests', () => {
    it('should call callback after delay expires', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      lockDelay.start();
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback before delay expires', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      lockDelay.start();
      vi.advanceTimersByTime(400);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should use custom delay duration', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset, 1000);

      lockDelay.start();
      vi.advanceTimersByTime(999);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not start multiple times', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      lockDelay.start();
      lockDelay.start();
      lockDelay.start();

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Move Reset Mode Tests', () => {
    it('should reset timer on movement', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      lockDelay.start();
      vi.advanceTimersByTime(400);

      lockDelay.reset();
      vi.advanceTimersByTime(400);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should increment move counter on reset', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      lockDelay.start();
      expect(lockDelay.getMoveCount()).toBe(0);

      lockDelay.reset();
      expect(lockDelay.getMoveCount()).toBe(1);

      lockDelay.reset();
      expect(lockDelay.getMoveCount()).toBe(2);
    });

    it('should force lock after 15 moves', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      lockDelay.start();

      // Make 14 moves
      for (let i = 0; i < 14; i++) {
        lockDelay.reset();
        vi.advanceTimersByTime(100);
      }

      expect(callback).not.toHaveBeenCalled();

      // 15th move should force lock
      lockDelay.reset();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should reset move counter after lock', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      lockDelay.start();
      lockDelay.reset();
      lockDelay.reset();
      expect(lockDelay.getMoveCount()).toBe(2);

      vi.advanceTimersByTime(500);
      expect(lockDelay.getMoveCount()).toBe(0);
    });
  });

  describe('Infinity Mode Tests', () => {
    it('should reset timer indefinitely', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.Infinity);

      lockDelay.start();

      // Reset many times
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(400);
        lockDelay.reset();
        expect(callback).not.toHaveBeenCalled();
      }

      // Finally let it expire
      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not have move limit in infinity mode', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.Infinity);

      lockDelay.start();

      // Make 20 moves (more than move reset limit)
      for (let i = 0; i < 20; i++) {
        lockDelay.reset();
        vi.advanceTimersByTime(100);
      }

      // Should not have forced lock
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Step Reset Mode Tests', () => {
    it('should reset timer only on downward movement', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.StepReset);

      lockDelay.start();
      vi.advanceTimersByTime(400);

      // Non-downward movement should not reset
      lockDelay.reset(false);
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on downward movement', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.StepReset);

      lockDelay.start();
      vi.advanceTimersByTime(400);

      // Downward movement should reset
      lockDelay.reset(true);
      vi.advanceTimersByTime(400);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancel Tests', () => {
    it('should cancel lock delay', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      lockDelay.start();
      expect(lockDelay.isLockDelayActive()).toBe(true);

      lockDelay.cancel();
      expect(lockDelay.isLockDelayActive()).toBe(false);

      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should reset move counter on cancel', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      lockDelay.start();
      lockDelay.reset();
      lockDelay.reset();
      expect(lockDelay.getMoveCount()).toBe(2);

      lockDelay.cancel();
      expect(lockDelay.getMoveCount()).toBe(0);
    });
  });

  describe('State Tests', () => {
    it('should track active state', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      expect(lockDelay.isLockDelayActive()).toBe(false);

      lockDelay.start();
      expect(lockDelay.isLockDelayActive()).toBe(true);

      vi.advanceTimersByTime(500);
      expect(lockDelay.isLockDelayActive()).toBe(false);
    });

    it('should not reset when not active', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      lockDelay.reset();
      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Mode Tests', () => {
    it('should get and set mode', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      expect(lockDelay.getMode()).toBe(LockDelayMode.MoveReset);

      lockDelay.setMode(LockDelayMode.Infinity);
      expect(lockDelay.getMode()).toBe(LockDelayMode.Infinity);
    });

    it('should apply new mode immediately', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback, LockDelayMode.MoveReset);

      lockDelay.start();

      // Make 14 moves in move reset mode
      for (let i = 0; i < 14; i++) {
        lockDelay.reset();
      }

      // Switch to infinity mode
      lockDelay.setMode(LockDelayMode.Infinity);

      // Should be able to make more than 15 moves total
      for (let i = 0; i < 10; i++) {
        lockDelay.reset();
        vi.advanceTimersByTime(100);
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Stop Tests', () => {
    it('should stop the system completely', () => {
      const callback = vi.fn();
      const lockDelay = new LockDelaySystem(callback);

      lockDelay.start();
      lockDelay.stop();

      expect(lockDelay.isLockDelayActive()).toBe(false);
      vi.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
