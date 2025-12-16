import { Piece, Matrix, RotationState, GameState } from '../model/types';
import { SHAPES } from '../model/shapes';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';
import {
  getWallKickTable,
  getNextRotationState,
  getRotationTransitionKey,
  KickOffset,
} from '../model/wallKicks';

/**
 * Rotation direction
 */
export type RotationDirection = 'clockwise' | 'counterclockwise';

/**
 * Result of a rotation attempt
 */
export interface RotationResult {
  /** Whether the rotation was successful */
  success: boolean;
  /** The new piece state if successful, null otherwise */
  piece: Piece | null;
  /** The kick offset that was used (for scoring T-spins later) */
  kickUsed?: number;
}

/**
 * Implements the Super Rotation System (SRS) for piece rotation
 */
export class RotationSystem {
  /**
   * Attempts to rotate a piece in the specified direction
   * @param piece - The piece to rotate
   * @param direction - Clockwise or counterclockwise
   * @param matrix - The playfield matrix to check collisions against
   * @returns Rotation result with new piece state if successful
   */
  rotate(piece: Piece, direction: RotationDirection, matrix: Matrix): RotationResult {
    const targetRotation = getNextRotationState(piece.rotation, direction);
    const kickTable = getWallKickTable(piece.type);
    const transitionKey = getRotationTransitionKey(piece.rotation, targetRotation);
    const kickTests = kickTable[transitionKey];

    if (!kickTests) {
      return { success: false, piece: null };
    }

    // Try each kick offset in order
    for (let i = 0; i < kickTests.length; i++) {
      const kick = kickTests[i];
      const testPiece: Piece = {
        ...piece,
        rotation: targetRotation,
        position: {
          x: piece.position.x + kick[0],
          y: piece.position.y + kick[1],
        },
      };

      if (!this.checkCollision(testPiece, matrix)) {
        return {
          success: true,
          piece: testPiece,
          kickUsed: i,
        };
      }
    }

    // All kicks failed
    return { success: false, piece: null };
  }

  /**
   * Checks if a piece collides with the playfield boundaries or existing blocks
   * @param piece - The piece to check
   * @param matrix - The playfield matrix
   * @returns true if collision detected, false otherwise
   */
  private checkCollision(piece: Piece, matrix: Matrix): boolean {
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
          if (matrix[fieldY][fieldX] !== 0) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Rotates a piece clockwise
   * @param piece - The piece to rotate
   * @param matrix - The playfield matrix
   * @returns Rotation result
   */
  rotateClockwise(piece: Piece, matrix: Matrix): RotationResult;
  /**
   * Rotates the current piece clockwise in the game state
   * @param gameState - The game state to modify
   * @returns true if rotation was successful
   */
  rotateClockwise(gameState: GameState): boolean;
  rotateClockwise(pieceOrState: Piece | GameState, matrix?: Matrix): RotationResult | boolean {
    if ('currentPiece' in pieceOrState) {
      // GameState version
      const result = this.rotate(pieceOrState.currentPiece, 'clockwise', pieceOrState.playfield);
      if (result.success && result.piece) {
        pieceOrState.currentPiece = result.piece;
        return true;
      }
      return false;
    } else {
      // Piece version
      return this.rotate(pieceOrState, 'clockwise', matrix!);
    }
  }

  /**
   * Rotates a piece counterclockwise
   * @param piece - The piece to rotate
   * @param matrix - The playfield matrix
   * @returns Rotation result
   */
  rotateCounterclockwise(piece: Piece, matrix: Matrix): RotationResult;
  /**
   * Rotates the current piece counterclockwise in the game state
   * @param gameState - The game state to modify
   * @returns true if rotation was successful
   */
  rotateCounterclockwise(gameState: GameState): boolean;
  rotateCounterclockwise(pieceOrState: Piece | GameState, matrix?: Matrix): RotationResult | boolean {
    if ('currentPiece' in pieceOrState) {
      // GameState version
      const result = this.rotate(pieceOrState.currentPiece, 'counterclockwise', pieceOrState.playfield);
      if (result.success && result.piece) {
        pieceOrState.currentPiece = result.piece;
        return true;
      }
      return false;
    } else {
      // Piece version
      return this.rotate(pieceOrState, 'counterclockwise', matrix!);
    }
  }
}
