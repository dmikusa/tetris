import { TetrominoType } from './types';

/**
 * Random number generator interface for dependency injection
 */
export interface RandomGenerator {
  /**
   * Returns a random number between 0 (inclusive) and 1 (exclusive)
   */
  random(): number;
}

/**
 * Default random generator using Math.random()
 */
export class DefaultRandomGenerator implements RandomGenerator {
  random(): number {
    return Math.random();
  }
}

/**
 * Seedable random generator for deterministic testing
 * Uses a simple Linear Congruential Generator (LCG) algorithm
 */
export class SeededRandomGenerator implements RandomGenerator {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  random(): number {
    // LCG parameters (from Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }
}

/**
 * Implements the "7-bag" Random Generator as specified in the Tetris guideline.
 * Ensures fair piece distribution by guaranteeing exactly one of each tetromino
 * type appears in every bag of 7 pieces.
 */
export class PieceBag {
  private bag: TetrominoType[] = [];
  private nextBag: TetrominoType[] = [];
  private index = 0;
  private rng: RandomGenerator;

  /**
   * Creates a new PieceBag
   * @param seed - Optional seed for deterministic random generation (for testing)
   */
  constructor(seed?: number) {
    this.rng = seed !== undefined ? new SeededRandomGenerator(seed) : new DefaultRandomGenerator();
    this.refillBag();
  }

  /**
   * Returns the next tetromino from the bag
   * Automatically refills the bag when empty
   */
  next(): TetrominoType {
    if (this.index >= this.bag.length) {
      this.refillBag();
    }
    return this.bag[this.index++];
  }

  /**
   * Look ahead at the next n pieces without consuming them
   * @param n - Number of pieces to peek (default: 1)
   * @returns Array of next n tetromino types
   */
  peek(n = 1): TetrominoType[] {
    const result: TetrominoType[] = [];
    let currentIndex = this.index;
    let currentBag = this.bag;
    let bagIndex = 0; // 0 for current bag, 1+ for future bags

    for (let i = 0; i < n; i++) {
      if (currentIndex >= currentBag.length) {
        bagIndex++;
        if (bagIndex === 1) {
          // Use pre-generated next bag
          if (this.nextBag.length === 0) {
            this.nextBag = this.createShuffledBag();
          }
          currentBag = this.nextBag;
        } else {
          // For bags beyond next, generate on the fly
          currentBag = this.createShuffledBag();
        }
        currentIndex = 0;
      }
      result.push(currentBag[currentIndex++]);
    }

    return result;
  }

  /**
   * Clear and refill the bag with optional new seed
   * @param seed - Optional seed for deterministic random generation
   */
  reset(seed?: number): void {
    if (seed !== undefined) {
      this.rng = new SeededRandomGenerator(seed);
    }
    this.index = 0;
    this.nextBag = [];
    this.refillBag();
  }

  /**
   * Refills the bag with a new shuffled set of all 7 tetrominoes
   */
  private refillBag(): void {
    if (this.nextBag.length > 0) {
      this.bag = this.nextBag;
      this.nextBag = [];
    } else {
      this.bag = this.createShuffledBag();
    }
    this.nextBag = this.createShuffledBag();
    this.index = 0;
  }

  /**
   * Creates a shuffled bag containing exactly one of each tetromino type
   */
  private createShuffledBag(): TetrominoType[] {
    const pieces: TetrominoType[] = [
      TetrominoType.I,
      TetrominoType.O,
      TetrominoType.T,
      TetrominoType.S,
      TetrominoType.Z,
      TetrominoType.J,
      TetrominoType.L,
    ];
    return this.shuffle(pieces);
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
