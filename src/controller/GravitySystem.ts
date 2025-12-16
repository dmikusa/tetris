/**
 * Gravity speed table based on Tetris guideline
 * Maps level to gravity value in G (cells per frame at 60 FPS)
 * Higher G = faster falling speed
 */
const GRAVITY_TABLE: Record<number, number> = {
  1: 0.01667, // ~1 second per row
  2: 0.021017,
  3: 0.026977,
  4: 0.035256,
  5: 0.04693,
  6: 0.06361,
  7: 0.0879,
  8: 0.1236,
  9: 0.1775,
  10: 0.2598,
  11: 0.388,
  12: 0.59,
  13: 0.92,
  14: 1.42,
  15: 2.36,
  16: 3.91,
  17: 6.61,
  18: 11.0,
  19: 18.72,
  20: 20.0, // Instant drop (1 cell per frame)
};

/**
 * Callback function for gravity tick
 */
export type GravityCallback = () => boolean;

/**
 * Manages the gravity system that automatically moves pieces downward
 * Implements level-based timing according to Tetris guideline
 */
export class GravitySystem {
  private level: number;
  private interval: number;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isPaused = false;
  private callback: GravityCallback;

  /**
   * Creates a new gravity system
   * @param level - Initial level (1-20)
   * @param callback - Function called on each gravity tick, returns true if movement succeeded
   */
  constructor(level: number, callback: GravityCallback) {
    this.level = level;
    this.callback = callback;
    this.interval = this.calculateInterval(level);
  }

  /**
   * Calculates the gravity interval in milliseconds for a given level
   * @param level - Game level (1-20)
   * @returns Interval in milliseconds between gravity ticks
   */
  private calculateInterval(level: number): number {
    // Get G value from table (default to level 1 if not found)
    const g = GRAVITY_TABLE[level] || GRAVITY_TABLE[1];

    // Convert G (cells per frame at 60 FPS) to milliseconds per cell
    // G cells/frame * 60 frames/sec = G*60 cells/sec
    // 1 / (G*60) = seconds per cell
    // 1000 / (G*60) = milliseconds per cell
    const msPerCell = 1000 / (g * 60);

    return msPerCell;
  }

  /**
   * Starts the gravity timer
   */
  start(): void {
    if (this.timerId !== null || this.isPaused) {
      return;
    }

    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.callback();
      }
    }, this.interval);
  }

  /**
   * Stops the gravity timer
   */
  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPaused = false;
  }

  /**
   * Pauses the gravity timer
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resumes the gravity timer
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Sets the current level and updates gravity speed
   * @param level - New level (1-20)
   */
  setLevel(level: number): void {
    this.level = level;
    this.interval = this.calculateInterval(level);

    // Restart timer with new interval if running
    if (this.timerId !== null) {
      this.stop();
      this.start();
    }
  }

  /**
   * Gets the current gravity interval in milliseconds
   */
  getGravityInterval(): number {
    return this.interval;
  }

  /**
   * Gets the current level
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * Triggers a gravity tick manually (for testing)
   */
  tick(): void {
    if (!this.isPaused) {
      this.callback();
    }
  }
}
