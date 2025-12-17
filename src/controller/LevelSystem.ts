/**
 * Level progression system for Tetris
 * Tracks lines cleared and manages level progression
 */
export class LevelSystem {
  private level: number;
  private totalLinesCleared: number;
  private linesPerLevel: number;
  private maxLevel: number;
  private startLevel: number;

  /**
   * Creates a new level system
   * @param startLevel - Initial level (default: 1)
   * @param linesPerLevel - Lines required to advance each level (default: 10)
   * @param maxLevel - Maximum level achievable (default: 20)
   */
  constructor(startLevel = 1, linesPerLevel = 10, maxLevel = 20) {
    this.startLevel = startLevel;
    this.level = startLevel;
    this.totalLinesCleared = 0;
    this.linesPerLevel = linesPerLevel;
    this.maxLevel = maxLevel;
  }

  /**
   * Adds cleared lines and checks for level up
   * @param count - Number of lines cleared
   * @returns True if level increased, false otherwise
   */
  addLines(count: number): boolean {
    this.totalLinesCleared += count;
    return this.checkLevelUp();
  }

  /**
   * Gets the current level
   * @returns Current level
   */
  getCurrentLevel(): number {
    return this.level;
  }

  /**
   * Gets total lines cleared
   * @returns Total lines cleared
   */
  getTotalLinesCleared(): number {
    return this.totalLinesCleared;
  }

  /**
   * Checks if level should increase based on lines cleared
   * @returns True if level increased, false otherwise
   */
  private checkLevelUp(): boolean {
    const newLevel = this.calculateLevel();
    if (newLevel > this.level && this.level < this.maxLevel) {
      this.level = Math.min(newLevel, this.maxLevel);
      return true;
    }
    return false;
  }

  /**
   * Calculates what level should be based on total lines cleared
   * @returns Calculated level
   */
  private calculateLevel(): number {
    return this.startLevel + Math.floor(this.totalLinesCleared / this.linesPerLevel);
  }

  /**
   * Gets the number of lines until next level
   * @returns Lines remaining until level up
   */
  getLinesUntilNextLevel(): number {
    if (this.level >= this.maxLevel) {
      return 0;
    }
    const linesIntoCurrentLevel = this.totalLinesCleared % this.linesPerLevel;
    return this.linesPerLevel - linesIntoCurrentLevel;
  }

  /**
   * Resets the level system to initial state
   */
  reset(): void {
    this.level = this.startLevel;
    this.totalLinesCleared = 0;
  }

  /**
   * Sets a new start level (useful for game restart with different difficulty)
   * @param level - New start level
   */
  setStartLevel(level: number): void {
    this.startLevel = Math.max(1, Math.min(level, this.maxLevel));
    this.reset();
  }

  /**
   * Gets the maximum level
   * @returns Maximum level
   */
  getMaxLevel(): number {
    return this.maxLevel;
  }
}
