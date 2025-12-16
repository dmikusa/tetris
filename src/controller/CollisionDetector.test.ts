import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionDetector } from './CollisionDetector';
import { Piece, TetrominoType, Matrix } from '../model/types';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';

describe('CollisionDetector', () => {
  let detector: CollisionDetector;
  let emptyMatrix: Matrix;

  beforeEach(() => {
    detector = new CollisionDetector();

    // Create empty matrix
    emptyMatrix = [];
    for (let y = 0; y < FIELD_TOTAL_HEIGHT; y++) {
      emptyMatrix[y] = [];
      for (let x = 0; x < FIELD_WIDTH; x++) {
        emptyMatrix[y][x] = null;
      }
    }
  });

  describe('Boundary Tests', () => {
    it('should detect collision at left edge', () => {
      const piece: Piece = {
        type: TetrominoType.I,
        position: { x: -1, y: 20 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should detect collision at right edge', () => {
      const piece: Piece = {
        type: TetrominoType.I,
        position: { x: 10, y: 20 }, // I piece is 4 wide at rotation 0
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should detect collision at bottom', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: -1 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should detect collision at top', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 41 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should not detect collision in valid position', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(false);
    });
  });

  describe('Stack Collision Tests', () => {
    it('should detect collision with locked pieces below', () => {
      // T piece at (4, 6) rotation 0 has minos at:
      // (5, 6) - top center
      // (4, 7), (5, 7), (6, 7) - middle row
      // Place locked piece at matrix[7][5] to block (5, 7)
      emptyMatrix[7][5] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 4, y: 6 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should detect collision with locked pieces to the side', () => {
      // O piece at (2, 20) rotation 0 has minos at:
      // (3, 20), (4, 20) - top row
      // (3, 21), (4, 21) - bottom row
      // Place locked piece at matrix[20][2] to block (2, 20) - wait, x=2 is to the LEFT
      // Actually place at matrix[20][3] to block (3, 20)
      emptyMatrix[20][3] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.O,
        position: { x: 2, y: 20 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should not detect collision when spaces are empty', () => {
      // Place locked pieces but not in the way
      emptyMatrix[10][1] = TetrominoType.I;
      emptyMatrix[10][8] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 4, y: 20 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(false);
    });
  });

  describe('Shape Tests', () => {
    it('should detect collision for I piece', () => {
      // I piece at (3, 20) rotation 0 has minos at y=21: (3,21), (4,21), (5,21), (6,21)
      emptyMatrix[21][5] = TetrominoType.T;

      const piece: Piece = {
        type: TetrominoType.I,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(true);
    });

    it('should detect collision for all piece types', () => {
      const types = [
        TetrominoType.I,
        TetrominoType.O,
        TetrominoType.T,
        TetrominoType.S,
        TetrominoType.Z,
        TetrominoType.J,
        TetrominoType.L,
      ];

      types.forEach((type) => {
        // All pieces at (3, 0) have minos at row y=1 (second row of shape)
        // Most have a mino at x=4 (col 1 of shape)
        emptyMatrix[1][4] = TetrominoType.T;

        const piece: Piece = {
          type,
          position: { x: 3, y: 0 },
          rotation: 0,
        };

        const collision = detector.checkCollision(piece, emptyMatrix);
        expect(collision).toBe(true);

        emptyMatrix[1][4] = null;
      });
    });

    it('should work with all rotation states', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 4, y: 20 },
        rotation: 0,
      };

      const rotations: [0, 1, 2, 3] = [0, 1, 2, 3];
      rotations.forEach((rotation) => {
        const collision = detector.checkCollision(piece, emptyMatrix, undefined, rotation);
        expect(collision).toBe(false);
      });
    });
  });

  describe('Movement Check Methods', () => {
    it('canMoveDown should return true when space is clear', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const canMove = detector.canMoveDown(piece, emptyMatrix);
      expect(canMove).toBe(true);
    });

    it('canMoveDown should return false when blocked', () => {
      emptyMatrix[0][4] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 1 },
        rotation: 0,
      };

      const canMove = detector.canMoveDown(piece, emptyMatrix);
      expect(canMove).toBe(false);
    });

    it('canMoveLeft should return true when space is clear', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const canMove = detector.canMoveLeft(piece, emptyMatrix);
      expect(canMove).toBe(true);
    });

    it('canMoveLeft should return false when blocked', () => {
      // T at (3,20) moving left becomes (2,20) with minos: (3,20), (2,21), (3,21), (4,21)
      emptyMatrix[20][3] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const canMove = detector.canMoveLeft(piece, emptyMatrix);
      expect(canMove).toBe(false);
    });

    it('canMoveRight should return true when space is clear', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const canMove = detector.canMoveRight(piece, emptyMatrix);
      expect(canMove).toBe(true);
    });

    it('canMoveRight should return false when blocked', () => {
      // T at (3,20) moving right becomes (4,20) with minos: (5,20), (4,21), (5,21), (6,21)
      emptyMatrix[20][5] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const canMove = detector.canMoveRight(piece, emptyMatrix);
      expect(canMove).toBe(false);
    });

    it('canRotate should return true when rotation is clear', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 4, y: 20 },
        rotation: 0,
      };

      const canRotate = detector.canRotate(piece, 1, emptyMatrix);
      expect(canRotate).toBe(true);
    });

    it('canRotate should return false when rotation is blocked', () => {
      // T at (4,20) rotation 3 has minos: (5,20), (4,21), (5,21), (5,22)
      emptyMatrix[20][5] = TetrominoType.I;

      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 4, y: 20 },
        rotation: 0,
      };

      const canRotate = detector.canRotate(piece, 3, emptyMatrix);
      expect(canRotate).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle piece at exact boundary', () => {
      // O piece at right edge: position (7,0) gives minos at (8,0), (9,0), (8,1), (9,1)
      // This is valid since field is x: 0-9
      const piece: Piece = {
        type: TetrominoType.O,
        position: { x: 7, y: 0 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix);
      expect(collision).toBe(false);
    });

    it('should handle custom position parameter', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 3, y: 20 },
        rotation: 0,
      };

      const customPos = { x: 5, y: 15 };
      const collision = detector.checkCollision(piece, emptyMatrix, customPos);
      expect(collision).toBe(false);
    });

    it('should handle custom rotation parameter', () => {
      const piece: Piece = {
        type: TetrominoType.T,
        position: { x: 4, y: 20 },
        rotation: 0,
      };

      const collision = detector.checkCollision(piece, emptyMatrix, undefined, 2);
      expect(collision).toBe(false);
    });
  });
});
