/**
 * Manages high scores using browser localStorage
 */
export interface HighScoreEntry {
  score: number;
  timestamp: number;
}

const HIGH_SCORE_KEY = '7signal-blocks-high-scores';
const MAX_HIGH_SCORES = 10;

/**
 * HighScoreManager handles storage, retrieval, and management of high scores
 */
export class HighScoreManager {
  /**
   * Get all high scores, sorted by score (highest first)
   */
  static getHighScores(): HighScoreEntry[] {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (!stored) {
        return [];
      }
      const scores = JSON.parse(stored) as HighScoreEntry[];
      return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error loading high scores:', error);
      return [];
    }
  }

  /**
   * Add a new score to the high score list
   * @param score - The score to add
   * @returns The position in the high score list (1-based), or -1 if not a high score
   */
  static addScore(score: number): number {
    const scores = this.getHighScores();
    const newEntry: HighScoreEntry = {
      score,
      timestamp: Date.now(),
    };

    // Add new score
    scores.push(newEntry);

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    // Keep only top scores
    const trimmedScores = scores.slice(0, MAX_HIGH_SCORES);

    // Save to localStorage
    this.saveHighScores(trimmedScores);

    // Find position of new score (1-based)
    const position = trimmedScores.findIndex((entry) => entry === newEntry);
    return position >= 0 ? position + 1 : -1;
  }

  /**
   * Check if a score qualifies as a high score
   * @param score - The score to check
   * @returns true if the score would make it into the high score list
   */
  static isHighScore(score: number): boolean {
    const scores = this.getHighScores();

    // If we have fewer than max scores, any score qualifies
    if (scores.length < MAX_HIGH_SCORES) {
      return true;
    }

    // Check if score is higher than the lowest high score
    const lowestHighScore = scores[scores.length - 1].score;
    return score > lowestHighScore;
  }

  /**
   * Save high scores to localStorage
   */
  private static saveHighScores(scores: HighScoreEntry[]): void {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    } catch (error) {
      console.error('Error saving high scores:', error);
    }
  }

  /**
   * Clear all high scores (useful for testing)
   */
  static clearHighScores(): void {
    try {
      localStorage.removeItem(HIGH_SCORE_KEY);
    } catch (error) {
      console.error('Error clearing high scores:', error);
    }
  }
}
