/**
 * Touch gesture types
 */
export enum TouchGesture {
  SwipeLeft = 'SwipeLeft',
  SwipeRight = 'SwipeRight',
  SwipeUp = 'SwipeUp',
  SwipeDown = 'SwipeDown',
  Tap = 'Tap',
  TwoFingerTap = 'TwoFingerTap',
}

/**
 * Configuration for touch gesture recognition
 */
export const TOUCH_CONFIG = {
  MIN_SWIPE_DISTANCE: 40, // Minimum pixels for a valid swipe
  MAX_SWIPE_TIME: 400, // Maximum ms for a swipe gesture
  MAX_TAP_TIME: 200, // Maximum ms for a tap
  MAX_TAP_MOVEMENT: 10, // Maximum pixels for a tap
} as const;

/**
 * Callback interface for touch gestures
 */
export interface TouchCallbacks {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onSoftDrop?: () => void;
  onHardDrop?: () => void;
  onRotateClockwise?: () => void;
  onRotateCounterclockwise?: () => void;
}

/**
 * Touch state for tracking a touch point
 */
interface TouchState {
  identifier: number;
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

/**
 * TouchController manages touch input and gesture recognition for mobile gameplay
 */
export class TouchController {
  private callbacks: TouchCallbacks;
  private isActive: boolean = false;
  private touchStates: Map<number, TouchState> = new Map();

  private touchstartHandler!: (event: TouchEvent) => void;
  private touchmoveHandler!: (event: TouchEvent) => void;
  private touchendHandler!: (event: TouchEvent) => void;
  private touchcancelHandler!: (event: TouchEvent) => void;

  constructor(callbacks: TouchCallbacks) {
    this.callbacks = callbacks;

    // Bind event handlers
    this.touchstartHandler = this.onTouchStart.bind(this);
    this.touchmoveHandler = this.onTouchMove.bind(this);
    this.touchendHandler = this.onTouchEnd.bind(this);
    this.touchcancelHandler = this.onTouchCancel.bind(this);
  }

  /**
   * Starts listening for touch input
   */
  start(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    window.addEventListener('touchstart', this.touchstartHandler, { passive: false });
    window.addEventListener('touchmove', this.touchmoveHandler, { passive: false });
    window.addEventListener('touchend', this.touchendHandler, { passive: false });
    window.addEventListener('touchcancel', this.touchcancelHandler, { passive: false });
  }

  /**
   * Stops listening for touch input
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    window.removeEventListener('touchstart', this.touchstartHandler);
    window.removeEventListener('touchmove', this.touchmoveHandler);
    window.removeEventListener('touchend', this.touchendHandler);
    window.removeEventListener('touchcancel', this.touchcancelHandler);
    this.touchStates.clear();
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    this.stop();
  }

  /**
   * Handles touch start event
   */
  private onTouchStart(event: TouchEvent): void {
    // Prevent default to avoid page scrolling
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touchStates.set(touch.identifier, {
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: touch.clientX,
        currentY: touch.clientY,
      });
    }
  }

  /**
   * Handles touch move event
   */
  private onTouchMove(event: TouchEvent): void {
    // Prevent default to avoid page scrolling
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const state = this.touchStates.get(touch.identifier);
      if (state) {
        state.currentX = touch.clientX;
        state.currentY = touch.clientY;
      }
    }
  }

  /**
   * Handles touch end event
   */
  private onTouchEnd(event: TouchEvent): void {
    // Prevent default to avoid page scrolling
    event.preventDefault();

    // Check for two-finger tap
    if (event.changedTouches.length === 2) {
      const gesture = this.recognizeTwoFingerTap(event.changedTouches);
      if (gesture === TouchGesture.TwoFingerTap) {
        this.callbacks.onRotateCounterclockwise?.();
        // Clean up touch states
        for (let i = 0; i < event.changedTouches.length; i++) {
          this.touchStates.delete(event.changedTouches[i].identifier);
        }
        return;
      }
    }

    // Process single touch gestures
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const state = this.touchStates.get(touch.identifier);
      if (state) {
        const gesture = this.recognizeGesture(state, touch);
        this.handleGesture(gesture);
        this.touchStates.delete(touch.identifier);
      }
    }
  }

  /**
   * Handles touch cancel event
   */
  private onTouchCancel(event: TouchEvent): void {
    for (let i = 0; i < event.changedTouches.length; i++) {
      this.touchStates.delete(event.changedTouches[i].identifier);
    }
  }

  /**
   * Recognizes a gesture from touch state
   */
  private recognizeGesture(state: TouchState, touch: Touch): TouchGesture | null {
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - state.startTime;

    // Check for tap
    if (duration < TOUCH_CONFIG.MAX_TAP_TIME && distance < TOUCH_CONFIG.MAX_TAP_MOVEMENT) {
      return TouchGesture.Tap;
    }

    // Check for swipe
    if (duration < TOUCH_CONFIG.MAX_SWIPE_TIME && distance >= TOUCH_CONFIG.MIN_SWIPE_DISTANCE) {
      // Determine swipe direction based on angle
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        return deltaX > 0 ? TouchGesture.SwipeRight : TouchGesture.SwipeLeft;
      } else {
        // Vertical swipe
        return deltaY > 0 ? TouchGesture.SwipeDown : TouchGesture.SwipeUp;
      }
    }

    return null;
  }

  /**
   * Recognizes a two-finger tap
   */
  private recognizeTwoFingerTap(touches: TouchList): TouchGesture | null {
    if (touches.length !== 2) {
      return null;
    }

    let allTaps = true;
    for (let i = 0; i < touches.length; i++) {
      const state = this.touchStates.get(touches[i].identifier);
      if (!state) {
        allTaps = false;
        break;
      }

      const duration = Date.now() - state.startTime;
      const deltaX = touches[i].clientX - state.startX;
      const deltaY = touches[i].clientY - state.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (duration >= TOUCH_CONFIG.MAX_TAP_TIME || distance >= TOUCH_CONFIG.MAX_TAP_MOVEMENT) {
        allTaps = false;
        break;
      }
    }

    return allTaps ? TouchGesture.TwoFingerTap : null;
  }

  /**
   * Handles a recognized gesture
   */
  private handleGesture(gesture: TouchGesture | null): void {
    if (!gesture) {
      return;
    }

    switch (gesture) {
      case TouchGesture.SwipeLeft:
        this.callbacks.onMoveLeft?.();
        break;
      case TouchGesture.SwipeRight:
        this.callbacks.onMoveRight?.();
        break;
      case TouchGesture.SwipeUp:
        this.callbacks.onHardDrop?.();
        break;
      case TouchGesture.SwipeDown:
        this.callbacks.onSoftDrop?.();
        break;
      case TouchGesture.Tap:
        this.callbacks.onRotateClockwise?.();
        break;
      case TouchGesture.TwoFingerTap:
        this.callbacks.onRotateCounterclockwise?.();
        break;
    }
  }

  /**
   * Checks if the device supports touch
   */
  static isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ('msMaxTouchPoints' in navigator &&
        (navigator as { msMaxTouchPoints: number }).msMaxTouchPoints > 0)
    );
  }
}
