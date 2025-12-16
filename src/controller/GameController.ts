import { GameState, GameStatus, Piece, TetrominoType } from '../model/types';
import { PieceBag } from '../model/PieceBag';
import { SHAPES } from '../model/shapes';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';

/**
 * Spawn positions for each tetromino type
 * Based on Tetris guideline specification
 */
const SPAWN_POSITIONS: Record<TetrominoType, { x: number; y: number }> = {
  [TetrominoType.I]: { x: 3, y: 21 }, // Centered (4-wide piece)
  [TetrominoType.O]: { x: 4, y: 21 }, // Centered (2-wide piece)
  [TetrominoType.T]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.S]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.Z]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.J]: { x: 3, y: 21 }, // Rounded left (3-wide)
  [TetrominoType.L]: { x: 3, y: 21 }, // Rounded left (3-wide)
};

/**
 * Game controller manages game logic and state
 * Implements the Controller layer in MVC architecture
 */
export class GameController {
  private state: GameState;
  private pieceBag: PieceBag;

  /**
   * Creates a new game controller
   * @param seed - Optional seed for deterministic piece generation (testing)
   */
  constructor(seed?: number) {
    this.pieceBag = new PieceBag(seed);
    this.state = this.createInitialState();
  }

  /**
   * Gets the current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Creates the initial game state
   */
  private createInitialState(): GameState {
    // Create empty matrix
    const matrix: (TetrominoType | null)[][] = [];
    for (let y = 0; y < FIELD_TOTAL_HEIGHT; y++) {
      matrix[y] = [];
      for (let x = 0; x < FIELD_WIDTH; x++) {
        matrix[y][x] = null;
      }
    }

    return {
      matrix,
      activePiece: null,
      score: 0,
      level: 1,
      status: GameStatus.Playing,
    };
  }

  /**
   * Spawns the next piece from the bag
   * @returns true if spawn succeeded, false if top-out occurred
   */
  spawnNextPiece(): boolean {
    if (this.state.status === GameStatus.GameOver) {
      return false;
    }

    // Get next piece from bag
    const type = this.pieceBag.next();
    const spawnPos = SPAWN_POSITIONS[type];

    // Create piece at spawn position with rotation 0
    const newPiece: Piece = {
      type,
      position: { x: spawnPos.x, y: spawnPos.y },
      rotation: 0,
    };

    // Check for overlap (top-out condition)
    if (this.checkOverlap(newPiece)) {
      this.state.status = GameStatus.GameOver;
      return false;
    }

    // Set active piece
    this.state.activePiece = newPiece;

    // Immediately drop piece one row
    this.state.activePiece.position.y--;

    return true;
  }

  /**
   * Checks if a piece overlaps with existing blocks in the playfield
   * @param piece - The piece to check
   * @returns true if overlap detected, false if position is clear
   */
  private checkOverlap(piece: Piece): boolean {
    const shape = SHAPES[piece.type][piece.rotation];
    const { x: pieceX, y: pieceY } = piece.position;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const fieldX = pieceX + x;
          const fieldY = pieceY + y;

          // Check bounds
          if (fieldX < 0 || fieldX >= FIELD_WIDTH || fieldY < 0 || fieldY >= FIELD_TOTAL_HEIGHT) {
            return true;
          }

          // Check if cell is occupied
          if (this.state.matrix[fieldY][fieldX] !== null) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Starts a new game
   */
  startGame(): void {
    this.state = this.createInitialState();
    this.spawnNextPiece();
  }

  /**
   * Resets the piece bag with optional seed
   * @param seed - Optional seed for deterministic generation
   */
  resetBag(seed?: number): void {
    this.pieceBag.reset(seed);
  }
}
