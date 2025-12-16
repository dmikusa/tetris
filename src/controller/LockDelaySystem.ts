/**
 * Lock delay modes
 */
export enum LockDelayMode {
  /** Timer resets on any movement or rotation */
  MoveReset = 'moveReset',
  /** Timer resets indefinitely on move/rotate */
  Infinity = 'infinity',
  /** Timer only resets when piece moves down */
  StepReset = 'stepReset',
}

/**
 * Callback function when lock delay expires
 */
export type LockCallback = () => void;

/**
 * Manages the lock delay system that gives players time to position pieces after landing
 * Supports multiple lock delay modes per Tetris guideline
 */
export class LockDelaySystem {
  private mode: LockDelayMode;
  private delayDuration: number;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private moveCount = 0;
  private maxMoves = 15;
  private callback: LockCallback;
  private isActive = false;

  /**
   * Creates a new lock delay system
   * @param callback - Function called when lock delay expires
   * @param mode - Lock delay mode (default: MoveReset)
   * @param delayDuration - Lock delay duration in milliseconds (default: 500ms)
   */
  constructor(
    callback: LockCallback,
    mode: LockDelayMode = LockDelayMode.MoveReset,
    delayDuration = 500
  ) {
    this.callback = callback;
    this.mode = mode;
    this.delayDuration = delayDuration;
  }

  /**
   * Starts the lock delay timer
   */
  start(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.moveCount = 0;
    this.scheduleTimer();
  }

  /**
   * Resets the lock delay timer based on the current mode
   * @param isDownwardMovement - Whether the reset is from moving down (for step reset mode)
   */
  reset(isDownwardMovement = false): void {
    if (!this.isActive) {
      return;
    }

    // Check move limit in move reset mode
    if (this.mode === LockDelayMode.MoveReset) {
      this.moveCount++;
      if (this.moveCount >= this.maxMoves) {
        // Force lock after max moves
        this.forceLock();
        return;
      }
    }

    // Handle different modes
    switch (this.mode) {
      case LockDelayMode.Infinity:
        // Always reset
        this.cancelTimer();
        this.scheduleTimer();
        break;

      case LockDelayMode.MoveReset:
        // Reset on any movement
        this.cancelTimer();
        this.scheduleTimer();
        break;

      case LockDelayMode.StepReset:
        // Only reset on downward movement
        if (isDownwardMovement) {
          this.cancelTimer();
          this.scheduleTimer();
        }
        break;
    }
  }

  /**
   * Cancels the lock delay (piece lifted off ground)
   */
  cancel(): void {
    this.cancelTimer();
    this.isActive = false;
    this.moveCount = 0;
  }

  /**
   * Forces immediate lock
   */
  private forceLock(): void {
    this.cancelTimer();
    this.isActive = false;
    this.moveCount = 0;
    this.callback();
  }

  /**
   * Schedules the lock delay timer
   */
  private scheduleTimer(): void {
    this.timerId = setTimeout(() => {
      this.isActive = false;
      this.moveCount = 0;
      this.callback();
    }, this.delayDuration);
  }

  /**
   * Cancels the current timer
   */
  private cancelTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Checks if lock delay is currently active
   */
  isLockDelayActive(): boolean {
    return this.isActive;
  }

  /**
   * Gets the current move count (for move reset mode)
   */
  getMoveCount(): number {
    return this.moveCount;
  }

  /**
   * Sets the lock delay mode
   */
  setMode(mode: LockDelayMode): void {
    this.mode = mode;
  }

  /**
   * Gets the current lock delay mode
   */
  getMode(): LockDelayMode {
    return this.mode;
  }

  /**
   * Stops the lock delay system completely
   */
  stop(): void {
    this.cancel();
  }
}
