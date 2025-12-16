import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputController, KeyCode, DAS_CONFIG, InputCallbacks } from './InputController';

describe('InputController', () => {
  let inputController: InputController;
  let callbacks: InputCallbacks;

  beforeEach(() => {
    // Create mock callbacks
    callbacks = {
      onMoveLeft: vi.fn(),
      onMoveRight: vi.fn(),
      onSoftDropStart: vi.fn(),
      onSoftDropEnd: vi.fn(),
      onHardDrop: vi.fn(),
    };

    // Create input controller
    inputController = new InputController(callbacks);
  });

  afterEach(() => {
    // Clean up
    inputController.destroy();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should create an InputController instance', () => {
      expect(inputController).toBeDefined();
    });

    it('should not start listening for input until start() is called', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });
  });

  describe('Starting and Stopping', () => {
    it('should start listening for keyboard input when start() is called', () => {
      inputController.start();
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();
    });

    it('should stop listening for keyboard input when stop() is called', () => {
      inputController.start();
      inputController.stop();
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });

    it('should handle multiple start() calls safely', () => {
      inputController.start();
      inputController.start();
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();
    });

    it('should handle multiple stop() calls safely', () => {
      inputController.start();
      inputController.stop();
      inputController.stop();
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });
  });

  describe('Key Mapping', () => {
    beforeEach(() => {
      inputController.start();
    });

    it('should call onMoveLeft when ArrowLeft is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();
    });

    it('should call onMoveRight when ArrowRight is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveRight).toHaveBeenCalledOnce();
    });

    it('should call onSoftDropStart when ArrowDown is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onSoftDropStart).toHaveBeenCalledOnce();
    });

    it('should call onHardDrop when ArrowUp is pressed', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onHardDrop).toHaveBeenCalledOnce();
    });

    it('should not trigger callbacks for non-arrow keys', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'Space' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
      expect(callbacks.onMoveRight).not.toHaveBeenCalled();
      expect(callbacks.onSoftDropStart).not.toHaveBeenCalled();
      expect(callbacks.onHardDrop).not.toHaveBeenCalled();
    });

    it('should prevent default browser behavior for arrow keys', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');
      window.dispatchEvent(keyEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Soft Drop Key Release', () => {
    beforeEach(() => {
      inputController.start();
    });

    it('should call onSoftDropEnd when ArrowDown is released', () => {
      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(keydownEvent);
      expect(callbacks.onSoftDropStart).toHaveBeenCalledOnce();

      const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowDown' });
      window.dispatchEvent(keyupEvent);
      expect(callbacks.onSoftDropEnd).toHaveBeenCalledOnce();
    });

    it('should not call onSoftDropEnd for other keys', () => {
      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keydownEvent);

      const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
      window.dispatchEvent(keyupEvent);
      expect(callbacks.onSoftDropEnd).not.toHaveBeenCalled();
    });
  });

  describe('Delayed Auto Shift (DAS)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      inputController.start();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should trigger immediate action on first key press', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();
    });

    it('should not repeat action before initial delay', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);

      vi.clearAllMocks();
      vi.advanceTimersByTime(DAS_CONFIG.INITIAL_DELAY - 20);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });

    it('should start repeating after initial delay', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);

      vi.clearAllMocks();
      vi.advanceTimersByTime(DAS_CONFIG.INITIAL_DELAY + DAS_CONFIG.REPEAT_RATE);
      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();
    });

    it('should repeat at the specified rate', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);

      vi.clearAllMocks();
      // Advance past initial delay and several repeat intervals
      vi.advanceTimersByTime(DAS_CONFIG.INITIAL_DELAY + DAS_CONFIG.REPEAT_RATE * 3);
      expect(callbacks.onMoveLeft).toHaveBeenCalledTimes(3);
    });

    it('should stop repeating when key is released', () => {
      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keydownEvent);

      // Advance past initial delay
      vi.advanceTimersByTime(DAS_CONFIG.INITIAL_DELAY + DAS_CONFIG.REPEAT_RATE);

      // Release key
      const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
      window.dispatchEvent(keyupEvent);

      vi.clearAllMocks();
      // Advance more time
      vi.advanceTimersByTime(DAS_CONFIG.REPEAT_RATE * 5);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });

    it('should handle left and right keys independently', () => {
      const leftKeydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const rightKeydown = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      window.dispatchEvent(leftKeydown);
      window.dispatchEvent(rightKeydown);

      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();
      expect(callbacks.onMoveRight).toHaveBeenCalledOnce();

      vi.clearAllMocks();
      vi.advanceTimersByTime(DAS_CONFIG.INITIAL_DELAY + DAS_CONFIG.REPEAT_RATE);

      // Both should repeat
      expect(callbacks.onMoveLeft).toHaveBeenCalled();
      expect(callbacks.onMoveRight).toHaveBeenCalled();
    });

    it('should not repeat hard drop', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(keyEvent);

      expect(callbacks.onHardDrop).toHaveBeenCalledOnce();

      vi.clearAllMocks();
      vi.advanceTimersByTime(DAS_CONFIG.INITIAL_DELAY + DAS_CONFIG.REPEAT_RATE * 5);
      expect(callbacks.onHardDrop).not.toHaveBeenCalled();
    });

    it('should ignore browser key repeat (duplicate keydown events)', () => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).toHaveBeenCalledOnce();

      vi.clearAllMocks();
      // Simulate browser sending duplicate keydown
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });
  });

  describe('Key State Tracking', () => {
    beforeEach(() => {
      inputController.start();
    });

    it('should track key pressed state', () => {
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(false);

      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keydownEvent);
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(true);

      const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
      window.dispatchEvent(keyupEvent);
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(false);
    });

    it('should track multiple keys independently', () => {
      const leftKeydown = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const downKeydown = new KeyboardEvent('keydown', { key: 'ArrowDown' });

      window.dispatchEvent(leftKeydown);
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(true);
      expect(inputController.isKeyPressed(KeyCode.ArrowDown)).toBe(false);

      window.dispatchEvent(downKeydown);
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(true);
      expect(inputController.isKeyPressed(KeyCode.ArrowDown)).toBe(true);
    });

    it('should reset all key states when stop() is called', () => {
      const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keydownEvent);
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(true);

      inputController.stop();
      expect(inputController.isKeyPressed(KeyCode.ArrowLeft)).toBe(false);
    });
  });

  describe('Destroy', () => {
    it('should clean up resources', () => {
      inputController.start();
      inputController.destroy();

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(keyEvent);
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });
  });
});
