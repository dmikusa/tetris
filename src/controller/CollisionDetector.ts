import { Piece, Matrix, RotationState } from '../model/types';
import { SHAPES } from '../model/shapes';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';

/**
 * Handles collision detection for tetromino pieces
 * Checks boundaries and collisions with locked pieces in the matrix
 */
export class CollisionDetector {
  /**
   * Checks if a piece at a given position/rotation collides with boundaries or locked pieces
   * @param piece - The piece to check
   * @param position - Position to check (optional, uses piece.position if not provided)
   * @param rotation - Rotation to check (optional, uses piece.rotation if not provided)
   * @param matrix - The playfield matrix
   * @returns true if collision detected, false if position is clear
   */
  checkCollision(
    piece: Piece,
    matrix: Matrix,
    position?: { x: number; y: number },
    rotation?: RotationState
  ): boolean {
    const pos = position || piece.position;
    const rot = rotation !== undefined ? rotation : piece.rotation;
    const shape = SHAPES[piece.type][rot];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const fieldX = pos.x + x;
          const fieldY = pos.y + y;

          // Check boundaries
          if (fieldX < 0 || fieldX >= FIELD_WIDTH || fieldY < 0 || fieldY >= FIELD_TOTAL_HEIGHT) {
            return true;
          }

          // Check collision with locked pieces
          if (matrix[fieldY][fieldX] !== null) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Checks if the active piece can move down
   * @param piece - The piece to check
   * @param matrix - The playfield matrix
   * @returns true if piece can move down, false if blocked
   */
  canMoveDown(piece: Piece, matrix: Matrix): boolean {
    const newPosition = {
      x: piece.position.x,
      y: piece.position.y + 1,
    };
    return !this.checkCollision(piece, matrix, newPosition);
  }

  /**
   * Checks if the active piece can move left
   * @param piece - The piece to check
   * @param matrix - The playfield matrix
   * @returns true if piece can move left, false if blocked
   */
  canMoveLeft(piece: Piece, matrix: Matrix): boolean {
    const newPosition = {
      x: piece.position.x - 1,
      y: piece.position.y,
    };
    return !this.checkCollision(piece, matrix, newPosition);
  }

  /**
   * Checks if the active piece can move right
   * @param piece - The piece to check
   * @param matrix - The playfield matrix
   * @returns true if piece can move right, false if blocked
   */
  canMoveRight(piece: Piece, matrix: Matrix): boolean {
    const newPosition = {
      x: piece.position.x + 1,
      y: piece.position.y,
    };
    return !this.checkCollision(piece, matrix, newPosition);
  }

  /**
   * Checks if the active piece can rotate to a new rotation state
   * @param piece - The piece to check
   * @param newRotation - The rotation state to check (0-3)
   * @param matrix - The playfield matrix
   * @returns true if piece can rotate, false if blocked
   */
  canRotate(piece: Piece, newRotation: RotationState, matrix: Matrix): boolean {
    return !this.checkCollision(piece, matrix, undefined, newRotation);
  }
}
