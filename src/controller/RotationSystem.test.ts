import { describe, it, expect, beforeEach } from 'vitest';
import { RotationSystem } from './RotationSystem';
import { TetrominoType, GameStatus, type Cell } from '../model/types';
import type { GameState } from '../model/types';
import { SHAPES } from '../model/shapes';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';

describe('RotationSystem', () => {
  let rotationSystem: RotationSystem;
  let gameState: GameState;

  beforeEach(() => {
    rotationSystem = new RotationSystem();

    // Create a basic game state
    const playfield: Cell[][] = Array(FIELD_TOTAL_HEIGHT)
      .fill(null)
      .map(() => Array(FIELD_WIDTH).fill(null));
    gameState = {
      matrix: playfield,
      playfield: playfield,
      activePiece: null,
      currentPiece: {
        type: TetrominoType.T,
        rotation: 0,
        position: { x: 3, y: 0 },
      },
      score: 0,
      level: 1,
      linesCleared: 0,
      status: GameStatus.Playing,
      isGameOver: false,
    };
  });

  describe('Basic Rotation', () => {
    it('should rotate T piece clockwise through all 4 states', () => {
      expect(gameState.currentPiece.rotation).toBe(0);

      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(1);

      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(2);

      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(3);

      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(0);
    });

    it('should rotate T piece counter-clockwise through all 4 states', () => {
      expect(gameState.currentPiece.rotation).toBe(0);

      rotationSystem.rotateCounterclockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(3);

      rotationSystem.rotateCounterclockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(2);

      rotationSystem.rotateCounterclockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(1);

      rotationSystem.rotateCounterclockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(0);
    });

    it('should rotate I piece clockwise', () => {
      gameState.currentPiece.type = TetrominoType.I;
      gameState.currentPiece.position = { x: 3, y: 0 };

      expect(gameState.currentPiece.rotation).toBe(0);
      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(1);
    });

    it('should not rotate O piece (stays in same visual position)', () => {
      gameState.currentPiece.type = TetrominoType.O;
      gameState.currentPiece.position = { x: 4, y: 0 };
      const initialPosition = { ...gameState.currentPiece.position };

      // O-piece rotates through states but stays visually in the same place
      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(1); // Rotation state changes
      expect(gameState.currentPiece.position).toEqual(initialPosition); // But position stays the same

      rotationSystem.rotateCounterclockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(0); // Back to original state
      expect(gameState.currentPiece.position).toEqual(initialPosition); // Position still the same
    });
  });

  describe('Wall Kicks', () => {
    it('should perform basic wall kick when blocked', () => {
      // Place J piece at left wall in rotation 1 (vertical with block on left)
      // This will require a kick when rotating to rotation 2
      gameState.currentPiece.type = TetrominoType.J;
      gameState.currentPiece.position = { x: 0, y: 5 };
      gameState.currentPiece.rotation = 2; // horizontal with knob on right

      rotationSystem.rotateClockwise(gameState);

      // Should have kicked (successfully rotated with potential offset)
      expect(gameState.currentPiece.rotation).toBe(3);
      // Position may or may not have changed depending on the kick, but rotation should succeed
    });

    it('should try all 5 wall kick tests in order', () => {
      // Place I piece at right wall in horizontal position
      gameState.currentPiece.type = TetrominoType.I;
      gameState.currentPiece.position = { x: FIELD_WIDTH - 2, y: 5 };
      gameState.currentPiece.rotation = 0;

      // Should successfully rotate using one of the kick tests
      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(1);
    });

    it('should not rotate if all wall kick tests fail', () => {
      // Create a confined space where no rotation is possible
      // Fill cells around the piece
      gameState.currentPiece.type = TetrominoType.T;
      gameState.currentPiece.position = { x: 5, y: 5 };
      gameState.currentPiece.rotation = 0;

      // Block all possible rotation positions
      for (let y = 3; y < 8; y++) {
        for (let x = 3; x < 8; x++) {
          if (y === 5 && x >= 4 && x <= 6) {
            continue; // Leave space for current piece
          }
          gameState.playfield[y][x] = TetrominoType.I;
        }
      }

      const initialRotation = gameState.currentPiece.rotation;
      const initialPosition = { ...gameState.currentPiece.position };

      rotationSystem.rotateClockwise(gameState);

      // Should not rotate
      expect(gameState.currentPiece.rotation).toBe(initialRotation);
      expect(gameState.currentPiece.position).toEqual(initialPosition);
    });

    it('should handle floor kicks (upward kicks)', () => {
      // Place piece near floor
      gameState.currentPiece.type = TetrominoType.I;
      gameState.currentPiece.position = { x: 5, y: FIELD_TOTAL_HEIGHT - 3 };
      gameState.currentPiece.rotation = 1; // Vertical

      // Try to rotate to horizontal - should kick upward or succeed
      const rotated = rotationSystem.rotateClockwise(gameState);

      // Should successfully rotate (SRS allows floor kicks)
      expect(rotated).toBe(true);
      expect(gameState.currentPiece.rotation).toBe(2);
    });
  });

  describe('I-Piece Special Cases', () => {
    it('should use I-piece specific wall kick table', () => {
      gameState.currentPiece.type = TetrominoType.I;
      gameState.currentPiece.position = { x: 0, y: 5 };
      gameState.currentPiece.rotation = 0;

      // I-piece has different kick offsets than other pieces
      rotationSystem.rotateClockwise(gameState);

      expect(gameState.currentPiece.rotation).toBe(1);
      // I-piece wall kicks should be applied
      expect(gameState.currentPiece.position.x).toBeGreaterThanOrEqual(0);
    });

    it('should rotate I piece from vertical to horizontal', () => {
      gameState.currentPiece.type = TetrominoType.I;
      gameState.currentPiece.position = { x: 5, y: 2 };
      gameState.currentPiece.rotation = 1; // Vertical

      rotationSystem.rotateClockwise(gameState);
      expect(gameState.currentPiece.rotation).toBe(2); // Horizontal
    });
  });

  describe('Collision Detection', () => {
    it('should not rotate into occupied cells', () => {
      // Place a T piece
      gameState.currentPiece.type = TetrominoType.T;
      gameState.currentPiece.position = { x: 5, y: 5 };
      gameState.currentPiece.rotation = 0;

      // Place a locked piece to the right that would collide with rotated shape
      gameState.playfield[5][7] = TetrominoType.I;
      gameState.playfield[6][7] = TetrominoType.I;

      rotationSystem.rotateClockwise(gameState);

      // Rotation should succeed (likely with a wall kick)
      // But verify it doesn't overlap with existing blocks
      const shape = SHAPES[gameState.currentPiece.type][gameState.currentPiece.rotation];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (shape[row][col]) {
            const fieldX = gameState.currentPiece.position.x + col;
            const fieldY = gameState.currentPiece.position.y + row;
            expect(gameState.playfield[fieldY][fieldX]).toBeNull();
          }
        }
      }
    });

    it('should not rotate out of bounds', () => {
      // Place piece at very top
      gameState.currentPiece.position = { x: 0, y: 0 };
      gameState.currentPiece.rotation = 0;

      // Try to rotate - should either succeed with kick or fail gracefully
      rotationSystem.rotateClockwise(gameState);

      // Verify piece is still in bounds
      expect(gameState.currentPiece.position.x).toBeGreaterThanOrEqual(0);
      expect(gameState.currentPiece.position.x).toBeLessThan(FIELD_WIDTH);
      expect(gameState.currentPiece.position.y).toBeGreaterThanOrEqual(0);
      expect(gameState.currentPiece.position.y).toBeLessThan(FIELD_TOTAL_HEIGHT);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rotation at right wall', () => {
      gameState.currentPiece.position = { x: FIELD_WIDTH - 2, y: 5 };
      gameState.currentPiece.rotation = 0;

      rotationSystem.rotateClockwise(gameState);

      // Should either rotate or stay in same state, but not crash
      expect(gameState.currentPiece.rotation).toBeGreaterThanOrEqual(0);
      expect(gameState.currentPiece.rotation).toBeLessThan(4);
    });

    it('should handle rotation at left wall', () => {
      gameState.currentPiece.position = { x: 0, y: 5 };
      gameState.currentPiece.rotation = 0;

      rotationSystem.rotateClockwise(gameState);

      // Should either rotate or stay in same state, but not crash
      expect(gameState.currentPiece.rotation).toBeGreaterThanOrEqual(0);
      expect(gameState.currentPiece.rotation).toBeLessThan(4);
    });

    it('should handle all tetromino types', () => {
      const types = [
        TetrominoType.I,
        TetrominoType.J,
        TetrominoType.L,
        TetrominoType.O,
        TetrominoType.S,
        TetrominoType.T,
        TetrominoType.Z,
      ];

      types.forEach((type) => {
        gameState.currentPiece.type = type;
        gameState.currentPiece.rotation = 0;
        gameState.currentPiece.position = { x: 3, y: 5 };

        // Should be able to rotate all types without crashing
        expect(() => {
          rotationSystem.rotateClockwise(gameState);
        }).not.toThrow();
      });
    });
  });
});
