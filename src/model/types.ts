/**
 * Tetromino piece types as defined by the Tetris guideline
 */
export enum TetrominoType {
  I = 'I',
  O = 'O',
  T = 'T',
  S = 'S',
  Z = 'Z',
  J = 'J',
  L = 'L',
}

/**
 * Rotation state representing one of four possible orientations
 */
export type RotationState = 0 | 1 | 2 | 3;

/**
 * Cell in the playfield matrix - either empty or contains a tetromino type
 */
export type Cell = TetrominoType | null;

/**
 * Position in the playfield using grid coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 2D matrix representing the playfield state
 */
export type Matrix = Cell[][];

/**
 * Active tetromino piece state
 */
export interface Piece {
  /** Type of tetromino */
  type: TetrominoType;
  /** Current position in the playfield */
  position: Position;
  /** Current rotation state (0-3) */
  rotation: RotationState;
}

/**
 * Game status
 */
export enum GameStatus {
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'game_over',
}

/**
 * Complete game state
 */
export interface GameState {
  /** Playfield matrix */
  matrix: Matrix;
  /** Currently active piece (null if none) */
  activePiece: Piece | null;
  /** Current score */
  score: number;
  /** Current level */
  level: number;
  /** Game status */
  status: GameStatus;
}
