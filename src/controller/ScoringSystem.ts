/**
 * Scoring system for Tetris based on official guideline
 * Points awarded based on line clears and current level
 */
export class ScoringSystem {
  private score: number;

  /**
   * Base point values for each type of line clear
   */
  private static readonly BASE_SCORES = {
    1: 100, // Single
    2: 300, // Double
    3: 500, // Triple
    4: 800, // Tetris
  } as const;

  constructor() {
    this.score = 0;
  }

  /**
   * Calculates score for a line clear based on number of lines and current level
   * @param linesCleared - Number of lines cleared (1-4)
   * @param level - Current game level
   * @returns Points awarded for this clear
   */
  calculateScore(linesCleared: number, level: number): number {
    if (linesCleared < 1 || linesCleared > 4) {
      return 0;
    }

    const baseScore = ScoringSystem.BASE_SCORES[linesCleared as 1 | 2 | 3 | 4];
    return baseScore * level;
  }

  /**
   * Adds points to the total score
   * @param points - Points to add
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Gets the current total score
   * @returns Current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Resets the score to zero
   */
  reset(): void {
    this.score = 0;
  }

  /**
   * Calculates soft drop bonus (1 point per cell)
   * @param cells - Number of cells dropped
   * @returns Bonus points
   */
  calculateSoftDropBonus(cells: number): number {
    return cells;
  }

  /**
   * Calculates hard drop bonus (2 points per cell)
   * @param cells - Number of cells dropped
   * @returns Bonus points
   */
  calculateHardDropBonus(cells: number): number {
    return cells * 2;
  }
}
