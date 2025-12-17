import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchController, TOUCH_CONFIG, TouchCallbacks } from './TouchController';

describe('TouchController', () => {
  let touchController: TouchController;
  let callbacks: TouchCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = {
      onMoveLeft: vi.fn(),
      onMoveRight: vi.fn(),
      onSoftDrop: vi.fn(),
      onHardDrop: vi.fn(),
      onRotateClockwise: vi.fn(),
      onRotateCounterclockwise: vi.fn(),
    };
    touchController = new TouchController(callbacks);
  });

  afterEach(() => {
    touchController.destroy();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should create touch controller', () => {
      expect(touchController).toBeDefined();
    });

    it('should not be active initially', () => {
      // TouchController is inactive until start() is called
      // We can test this by trying to stop without starting
      touchController.stop(); // Should not throw
    });
  });

  describe('start and stop', () => {
    it('should start listening for touch events', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      touchController.start();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchstart',
        expect.any(Function),
        expect.any(Object)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function),
        expect.any(Object)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'touchend',
        expect.any(Function),
        expect.any(Object)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should stop listening for touch events', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      touchController.start();
      touchController.stop();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should not start multiple times', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      touchController.start();
      touchController.start();

      // Should only be called once per event type
      const touchstartCalls = addEventListenerSpy.mock.calls.filter(
        (call) => call[0] === 'touchstart'
      );
      expect(touchstartCalls).toHaveLength(1);

      addEventListenerSpy.mockRestore();
    });
  });

  describe('swipe detection', () => {
    beforeEach(() => {
      touchController.start();
    });

    it('should detect swipe left', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX - TOUCH_CONFIG.MIN_SWIPE_DISTANCE - 10;
      const endY = startY;

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onMoveLeft).toHaveBeenCalled();
      expect(callbacks.onMoveRight).not.toHaveBeenCalled();
    });

    it('should detect swipe right', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX + TOUCH_CONFIG.MIN_SWIPE_DISTANCE + 10;
      const endY = startY;

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onMoveRight).toHaveBeenCalled();
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });

    it('should detect swipe up (hard drop)', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX;
      const endY = startY - TOUCH_CONFIG.MIN_SWIPE_DISTANCE - 10;

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onHardDrop).toHaveBeenCalled();
      expect(callbacks.onSoftDrop).not.toHaveBeenCalled();
    });

    it('should detect swipe down (soft drop)', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX;
      const endY = startY + TOUCH_CONFIG.MIN_SWIPE_DISTANCE + 10;

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onSoftDrop).toHaveBeenCalled();
      expect(callbacks.onHardDrop).not.toHaveBeenCalled();
    });

    it('should ignore short swipes below threshold', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX + TOUCH_CONFIG.MIN_SWIPE_DISTANCE - 10;
      const endY = startY;

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onMoveRight).not.toHaveBeenCalled();
      expect(callbacks.onMoveLeft).not.toHaveBeenCalled();
    });

    it('should resolve diagonal swipe to primary direction (horizontal)', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX + 60; // More horizontal
      const endY = startY + 30; // Less vertical

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onMoveRight).toHaveBeenCalled();
      expect(callbacks.onSoftDrop).not.toHaveBeenCalled();
    });

    it('should resolve diagonal swipe to primary direction (vertical)', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX + 30; // Less horizontal
      const endY = startY + 60; // More vertical

      simulateSwipe(startX, startY, endX, endY);

      expect(callbacks.onSoftDrop).toHaveBeenCalled();
      expect(callbacks.onMoveRight).not.toHaveBeenCalled();
    });
  });

  describe('tap detection', () => {
    beforeEach(() => {
      touchController.start();
    });

    it('should detect tap (rotate clockwise)', () => {
      const x = 200;
      const y = 300;

      simulateTap(x, y);

      expect(callbacks.onRotateClockwise).toHaveBeenCalled();
    });

    it('should not detect tap if movement exceeds threshold', () => {
      const startX = 200;
      const startY = 300;
      const endX = startX + TOUCH_CONFIG.MAX_TAP_MOVEMENT + 5;
      const endY = startY;

      simulateSwipe(startX, startY, endX, endY, 50); // Quick duration

      expect(callbacks.onRotateClockwise).not.toHaveBeenCalled();
    });

    it('should not detect tap if duration exceeds threshold', () => {
      const x = 200;
      const y = 300;

      simulateTap(x, y, TOUCH_CONFIG.MAX_TAP_TIME + 50);

      expect(callbacks.onRotateClockwise).not.toHaveBeenCalled();
    });
  });

  describe('two-finger tap', () => {
    beforeEach(() => {
      touchController.start();
    });

    it('should detect two-finger tap (rotate counter-clockwise)', () => {
      simulateTwoFingerTap(200, 300, 250, 300);

      expect(callbacks.onRotateCounterclockwise).toHaveBeenCalled();
      expect(callbacks.onRotateClockwise).not.toHaveBeenCalled();
    });

    it('should not detect two-finger tap if one finger moves too much', () => {
      const touch1 = createTouch(0, 200, 300);
      const touch2 = createTouch(1, 250, 300);

      const startEvent = createTouchEvent('touchstart', [touch1, touch2]);
      window.dispatchEvent(startEvent);

      // Move second finger too much
      const endTouch1 = createTouch(0, 200, 300);
      const endTouch2 = createTouch(1, 250 + TOUCH_CONFIG.MAX_TAP_MOVEMENT + 10, 300);

      const endEvent = createTouchEvent('touchend', [endTouch1, endTouch2]);
      window.dispatchEvent(endEvent);

      expect(callbacks.onRotateCounterclockwise).not.toHaveBeenCalled();
    });
  });

  describe('device detection', () => {
    it('should detect touch capability', () => {
      // This test depends on the test environment
      // In most test environments, touch support is not available
      const isTouchDevice = TouchController.isTouchDevice();
      expect(typeof isTouchDevice).toBe('boolean');
    });
  });

  describe('cleanup', () => {
    it('should clean up on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      touchController.start();
      touchController.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      removeEventListenerSpy.mockRestore();
    });
  });

  // Helper functions
  function createTouch(identifier: number, clientX: number, clientY: number): Touch {
    return {
      identifier,
      clientX,
      clientY,
      screenX: clientX,
      screenY: clientY,
      pageX: clientX,
      pageY: clientY,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
      target: window,
    } as Touch;
  }

  function createTouchEvent(type: string, touches: Touch[]): TouchEvent {
    const touchList = {
      length: touches.length,
      item: (index: number) => touches[index] || null,
      [Symbol.iterator]: function* () {
        for (const touch of touches) {
          yield touch;
        }
      },
    } as unknown as TouchList;

    // Add numeric indices
    touches.forEach((touch, index) => {
      (touchList as unknown as Record<number, Touch>)[index] = touch;
    });

    const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
    Object.defineProperty(event, 'changedTouches', {
      value: touchList,
      writable: false,
    });
    Object.defineProperty(event, 'touches', {
      value: touchList,
      writable: false,
    });
    Object.defineProperty(event, 'targetTouches', {
      value: touchList,
      writable: false,
    });

    return event;
  }

  function simulateSwipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 100
  ): void {
    const touch = createTouch(0, startX, startY);
    const startEvent = createTouchEvent('touchstart', [touch]);
    window.dispatchEvent(startEvent);

    // Simulate touch move (optional, but adds realism)
    const midTouch = createTouch(0, (startX + endX) / 2, (startY + endY) / 2);
    const moveEvent = createTouchEvent('touchmove', [midTouch]);
    window.dispatchEvent(moveEvent);

    // Wait for duration (simulate time passing)
    vi.advanceTimersByTime(duration);

    const endTouch = createTouch(0, endX, endY);
    const endEvent = createTouchEvent('touchend', [endTouch]);
    window.dispatchEvent(endEvent);
  }

  function simulateTap(x: number, y: number, duration: number = 100): void {
    const touch = createTouch(0, x, y);
    const startEvent = createTouchEvent('touchstart', [touch]);
    window.dispatchEvent(startEvent);

    vi.advanceTimersByTime(duration);

    const endTouch = createTouch(0, x, y);
    const endEvent = createTouchEvent('touchend', [endTouch]);
    window.dispatchEvent(endEvent);
  }

  function simulateTwoFingerTap(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    duration: number = 100
  ): void {
    const touch1 = createTouch(0, x1, y1);
    const touch2 = createTouch(1, x2, y2);
    const startEvent = createTouchEvent('touchstart', [touch1, touch2]);
    window.dispatchEvent(startEvent);

    vi.advanceTimersByTime(duration);

    const endTouch1 = createTouch(0, x1, y1);
    const endTouch2 = createTouch(1, x2, y2);
    const endEvent = createTouchEvent('touchend', [endTouch1, endTouch2]);
    window.dispatchEvent(endEvent);
  }
});
