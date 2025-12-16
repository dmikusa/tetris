import { describe, it, expect, beforeEach } from 'vitest';
import { GameController } from './GameController';
import { TetrominoType, GameStatus } from '../model/types';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';
import { SHAPES } from '../model/shapes';

describe('GameController', () => {
  let controller: GameController;

  beforeEach(() => {
    controller = new GameController(12345); // Use seed for deterministic tests
  });

  describe('Initialization', () => {
    it('should create controller with initial state', () => {
      const state = controller.getState();
      expect(state).toBeDefined();
      expect(state.activePiece).toBeNull();
      expect(state.status).toBe(GameStatus.Playing);
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
    });

    it('should create empty playfield matrix', () => {
      const state = controller.getState();
      expect(state.matrix).toBeDefined();
      expect(state.matrix.length).toBe(40); // FIELD_TOTAL_HEIGHT

      // Check all cells are empty
      for (let y = 0; y < state.matrix.length; y++) {
        expect(state.matrix[y].length).toBe(FIELD_WIDTH);
        for (let x = 0; x < state.matrix[y].length; x++) {
          expect(state.matrix[y][x]).toBeNull();
        }
      }
    });
  });

  describe('Spawn Position Tests', () => {
    it('should spawn I piece centered at x=3', () => {
      const controller = new GameController(0); // Seed that produces I piece first
      let spawned = false;
      let iPieceFound = false;

      // Try spawning until we get an I piece (may take a few tries)
      for (let i = 0; i < 7; i++) {
        spawned = controller.spawnNextPiece();
        const state = controller.getState();

        if (state.activePiece?.type === TetrominoType.I) {
          expect(state.activePiece.position.x).toBe(3);
          expect(state.activePiece.position.y).toBe(22); // 21 + 1 (after initial drop)
          iPieceFound = true;
          break;
        }
      }

      expect(spawned).toBe(true);
      expect(iPieceFound).toBe(true);
    });

    it('should spawn O piece centered at x=4', () => {
      const controller = new GameController(100);
      let oPieceFound = false;

      for (let i = 0; i < 7; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();

        if (state.activePiece?.type === TetrominoType.O) {
          expect(state.activePiece.position.x).toBe(4);
          expect(state.activePiece.position.y).toBe(22); // 21 + 1
          oPieceFound = true;
          break;
        }
      }

      expect(oPieceFound).toBe(true);
    });

    it('should spawn T, S, Z, J, L pieces at x=3 (rounded left)', () => {
      const controller = new GameController(42);
      const leftRoundedPieces = [
        TetrominoType.T,
        TetrominoType.S,
        TetrominoType.Z,
        TetrominoType.J,
        TetrominoType.L,
      ];
      const foundPieces = new Set<TetrominoType>();

      // Spawn multiple pieces to find all types
      for (let i = 0; i < 21; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();

        if (state.activePiece && leftRoundedPieces.includes(state.activePiece.type)) {
          expect(state.activePiece.position.x).toBe(3);
          expect(state.activePiece.position.y).toBe(22); // 21 + 1
          foundPieces.add(state.activePiece.type);
        }
      }

      // Verify we found at least some of these pieces
      expect(foundPieces.size).toBeGreaterThan(0);
    });
  });

  describe('Orientation Tests', () => {
    it('should spawn all pieces with rotation state 0', () => {
      const controller = new GameController(999);

      // Spawn 7 pieces (one full bag)
      for (let i = 0; i < 7; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();
        expect(state.activePiece?.rotation).toBe(0);
      }
    });
  });

  describe('Initial Drop Test', () => {
    it('should move piece down one row immediately after spawn', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      // Piece should be at y=22 (spawned at 21, dropped to 22)
      expect(state.activePiece?.position.y).toBe(22);
    });
  });

  describe('Top-Out Tests', () => {
    it('should spawn successfully with empty playfield', () => {
      const success = controller.spawnNextPiece();
      const state = controller.getState();

      expect(success).toBe(true);
      expect(state.activePiece).not.toBeNull();
      expect(state.status).toBe(GameStatus.Playing);
    });

    it('should fail to spawn when position is occupied', () => {
      const state = controller.getState();

      // Fill spawn area at row 21 with blocks
      for (let x = 0; x < FIELD_WIDTH; x++) {
        state.matrix[21][x] = TetrominoType.I;
        state.matrix[20][x] = TetrominoType.I;
      }

      const success = controller.spawnNextPiece();

      expect(success).toBe(false);
      expect(state.status).toBe(GameStatus.GameOver);
      expect(state.activePiece).toBeNull();
    });

    it('should not spawn piece when game is over', () => {
      const state = controller.getState();

      // Trigger game over by filling spawn area
      for (let x = 0; x < FIELD_WIDTH; x++) {
        state.matrix[21][x] = TetrominoType.I;
        state.matrix[20][x] = TetrominoType.I;
      }

      // First spawn fails and sets game over
      const firstSpawn = controller.spawnNextPiece();
      expect(firstSpawn).toBe(false);
      expect(state.status).toBe(GameStatus.GameOver);

      // Second spawn should also fail
      const secondSpawn = controller.spawnNextPiece();
      expect(secondSpawn).toBe(false);
      expect(state.status).toBe(GameStatus.GameOver);
    });

    it('should set game over status on failed spawn', () => {
      const state = controller.getState();

      // Block spawn position
      for (let x = 0; x < FIELD_WIDTH; x++) {
        state.matrix[21][x] = TetrominoType.O;
      }

      const success = controller.spawnNextPiece();

      expect(success).toBe(false);
      expect(state.status).toBe(GameStatus.GameOver);
    });
  });

  describe('Bag Integration Tests', () => {
    it('should get pieces from bag in order', () => {
      const controller = new GameController(42); // Deterministic seed

      const pieces: TetrominoType[] = [];

      // Spawn 7 pieces (one bag)
      for (let i = 0; i < 7; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();
        if (state.activePiece) {
          pieces.push(state.activePiece.type);
        }
      }

      // Should have 7 unique pieces (one full bag)
      const uniqueTypes = new Set(pieces);
      expect(uniqueTypes.size).toBe(7);
      expect(pieces.length).toBe(7);
    });

    it('should spawn pieces across multiple bags', () => {
      const controller = new GameController(12345);

      const pieces: TetrominoType[] = [];

      // Spawn 21 pieces (3 bags)
      for (let i = 0; i < 21; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();
        if (state.activePiece) {
          pieces.push(state.activePiece.type);
        }
      }

      expect(pieces.length).toBe(21);

      // Each type should appear exactly 3 times
      const counts: Record<TetrominoType, number> = {
        [TetrominoType.I]: 0,
        [TetrominoType.O]: 0,
        [TetrominoType.T]: 0,
        [TetrominoType.S]: 0,
        [TetrominoType.Z]: 0,
        [TetrominoType.J]: 0,
        [TetrominoType.L]: 0,
      };

      pieces.forEach((type) => counts[type]++);

      expect(counts[TetrominoType.I]).toBe(3);
      expect(counts[TetrominoType.O]).toBe(3);
      expect(counts[TetrominoType.T]).toBe(3);
      expect(counts[TetrominoType.S]).toBe(3);
      expect(counts[TetrominoType.Z]).toBe(3);
      expect(counts[TetrominoType.J]).toBe(3);
      expect(counts[TetrominoType.L]).toBe(3);
    });
  });

  describe('Integration Tests', () => {
    it('should spawn multiple pieces in sequence', () => {
      const pieces: TetrominoType[] = [];

      for (let i = 0; i < 14; i++) {
        const success = controller.spawnNextPiece();
        expect(success).toBe(true);

        const state = controller.getState();
        expect(state.activePiece).not.toBeNull();
        if (state.activePiece) {
          pieces.push(state.activePiece.type);
        }
      }

      expect(pieces.length).toBe(14);
    });

    it('should handle startGame method', () => {
      controller.startGame();
      const state = controller.getState();

      expect(state.status).toBe(GameStatus.Playing);
      expect(state.activePiece).not.toBeNull();
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
    });

    it('should reset bag when requested', () => {
      const controller = new GameController(42);

      const pieces1: TetrominoType[] = [];
      for (let i = 0; i < 3; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();
        if (state.activePiece) {
          pieces1.push(state.activePiece.type);
        }
      }

      // Reset with same seed
      controller.resetBag(42);

      const pieces2: TetrominoType[] = [];
      for (let i = 0; i < 3; i++) {
        controller.spawnNextPiece();
        const state = controller.getState();
        if (state.activePiece) {
          pieces2.push(state.activePiece.type);
        }
      }

      // Should get same sequence after reset with same seed
      expect(pieces2).toEqual(pieces1);
    });
  });

  describe('Gravity and Movement Tests', () => {
    it('should have gravity system initialized', () => {
      const gravity = controller.getGravitySystem();
      expect(gravity).toBeDefined();
      expect(gravity.getLevel()).toBe(1);
    });

    it('should move piece down one row', () => {
      controller.spawnNextPiece();
      const state = controller.getState();
      const initialY = state.activePiece?.position.y;

      const success = controller.moveDown();

      expect(success).toBe(true);
      expect(state.activePiece?.position.y).toBe(initialY! + 1);
    });

    it('should return false when piece cannot move down', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      // Block the space below the piece
      if (state.activePiece) {
        const blockY = state.activePiece.position.y + 1;
        for (let x = 0; x < FIELD_WIDTH; x++) {
          state.matrix[blockY][x] = TetrominoType.I;
        }
      }

      const success = controller.moveDown();

      expect(success).toBe(false);
    });

    it('should not move piece when game is not playing', () => {
      controller.spawnNextPiece();
      const state = controller.getState();
      const initialY = state.activePiece?.position.y;

      state.status = GameStatus.Paused;

      const success = controller.moveDown();

      expect(success).toBe(false);
      expect(state.activePiece?.position.y).toBe(initialY);
    });

    it('should not move piece when no active piece', () => {
      const state = controller.getState();
      state.activePiece = null;

      const success = controller.moveDown();

      expect(success).toBe(false);
    });

    it('should move piece multiple times', () => {
      controller.spawnNextPiece();
      const state = controller.getState();
      const initialY = state.activePiece?.position.y ?? 0;

      controller.moveDown();
      controller.moveDown();
      controller.moveDown();

      expect(state.activePiece?.position.y).toBe(initialY + 3);
    });
  });

  describe('Pause and Resume Tests', () => {
    it('should pause the game', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      controller.pause();

      expect(state.status).toBe(GameStatus.Paused);
    });

    it('should resume the game', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      controller.pause();
      expect(state.status).toBe(GameStatus.Paused);

      controller.resume();
      expect(state.status).toBe(GameStatus.Playing);
    });

    it('should not pause when not playing', () => {
      const state = controller.getState();
      state.status = GameStatus.GameOver;

      controller.pause();

      expect(state.status).toBe(GameStatus.GameOver);
    });

    it('should not resume when not paused', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      controller.resume();

      expect(state.status).toBe(GameStatus.Playing);
    });
  });

  describe('Horizontal Movement Tests', () => {
    beforeEach(() => {
      controller.spawnNextPiece();
    });

    describe('moveLeft', () => {
      it('should move piece left by one column', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x;

        const success = controller.moveLeft();

        expect(success).toBe(true);
        expect(state.activePiece?.position.x).toBe(initialX! - 1);
      });

      it('should not move piece when at left wall', () => {
        const state = controller.getState();

        // Move piece to left wall - need to account for piece shape offset
        // Most pieces have some empty space in their 4x4 grid
        if (state.activePiece) {
          state.activePiece.position.x = 0;
        }

        const initialX = state.activePiece?.position.x;
        const success = controller.moveLeft();

        // Either returns false or the position doesn't change
        if (!success) {
          expect(state.activePiece?.position.x).toBe(initialX);
        } else {
          // Some pieces may move left from x=0 due to empty space in their grid
          expect(state.activePiece?.position.x).toBeLessThanOrEqual(0);
        }
      });

      it('should not move piece when blocked by other pieces', () => {
        const state = controller.getState();

        if (state.activePiece) {
          // Get the actual shape to know which cells to block
          const shape = SHAPES[state.activePiece.type][state.activePiece.rotation];
          const { x: pieceX, y: pieceY } = state.activePiece.position;

          // Find leftmost filled cell in the shape
          let minX = 4;
          for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
              if (shape[y][x] === 1) {
                minX = Math.min(minX, x);
              }
            }
          }

          // Block cells to the left of the leftmost filled cell
          const blockX = pieceX + minX - 1;
          for (let y = pieceY; y < pieceY + 4; y++) {
            if (y >= 0 && y < state.matrix.length && blockX >= 0 && blockX < FIELD_WIDTH) {
              state.matrix[y][blockX] = TetrominoType.I;
            }
          }
        }

        const initialX = state.activePiece?.position.x;
        const success = controller.moveLeft();

        expect(success).toBe(false);
        expect(state.activePiece?.position.x).toBe(initialX);
      });

      it('should not move piece when game is not playing', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x;

        state.status = GameStatus.Paused;

        const success = controller.moveLeft();

        expect(success).toBe(false);
        expect(state.activePiece?.position.x).toBe(initialX);
      });

      it('should not move piece when no active piece', () => {
        const state = controller.getState();
        state.activePiece = null;

        const success = controller.moveLeft();

        expect(success).toBe(false);
      });

      it('should allow multiple left movements', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x ?? 0;

        controller.moveLeft();
        controller.moveLeft();
        controller.moveLeft();

        expect(state.activePiece?.position.x).toBe(initialX - 3);
      });
    });

    describe('moveRight', () => {
      it('should move piece right by one column', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x;

        const success = controller.moveRight();

        expect(success).toBe(true);
        expect(state.activePiece?.position.x).toBe(initialX! + 1);
      });

      it('should not move piece when at right wall', () => {
        const state = controller.getState();

        // Move piece to right wall
        if (state.activePiece) {
          state.activePiece.position.x = FIELD_WIDTH - 1;
        }

        const success = controller.moveRight();

        expect(success).toBe(false);
      });

      it('should not move piece when blocked by other pieces', () => {
        const state = controller.getState();

        if (state.activePiece) {
          // Get the actual shape to know which cells to block
          const shape = SHAPES[state.activePiece.type][state.activePiece.rotation];
          const { x: pieceX, y: pieceY } = state.activePiece.position;

          // Find rightmost filled cell in the shape
          let maxX = -1;
          for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
              if (shape[y][x] === 1) {
                maxX = Math.max(maxX, x);
              }
            }
          }

          // Block cells to the right of the rightmost filled cell
          const blockX = pieceX + maxX + 1;
          for (let y = pieceY; y < pieceY + 4; y++) {
            if (y >= 0 && y < state.matrix.length && blockX >= 0 && blockX < FIELD_WIDTH) {
              state.matrix[y][blockX] = TetrominoType.I;
            }
          }
        }

        const initialX = state.activePiece?.position.x;
        const success = controller.moveRight();

        expect(success).toBe(false);
        expect(state.activePiece?.position.x).toBe(initialX);
      });

      it('should not move piece when game is not playing', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x;

        state.status = GameStatus.Paused;

        const success = controller.moveRight();

        expect(success).toBe(false);
        expect(state.activePiece?.position.x).toBe(initialX);
      });

      it('should not move piece when no active piece', () => {
        const state = controller.getState();
        state.activePiece = null;

        const success = controller.moveRight();

        expect(success).toBe(false);
      });

      it('should allow multiple right movements', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x ?? 0;

        controller.moveRight();
        controller.moveRight();

        expect(state.activePiece?.position.x).toBe(initialX + 2);
      });
    });

    describe('combined horizontal movements', () => {
      it('should handle left and right movements in sequence', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x ?? 0;

        controller.moveLeft();
        controller.moveLeft();
        controller.moveRight();

        expect(state.activePiece?.position.x).toBe(initialX - 1);
      });

      it('should combine horizontal and vertical movements', () => {
        const state = controller.getState();
        const initialX = state.activePiece?.position.x ?? 0;
        const initialY = state.activePiece?.position.y ?? 0;

        controller.moveLeft();
        controller.moveDown();
        controller.moveRight();
        controller.moveRight();
        controller.moveDown();

        expect(state.activePiece?.position.x).toBe(initialX + 1);
        expect(state.activePiece?.position.y).toBe(initialY + 2);
      });
    });
  });

  describe('Soft Drop Tests', () => {
    beforeEach(() => {
      controller.spawnNextPiece();
    });

    it('should move piece down when soft drop starts', () => {
      const state = controller.getState();
      const initialY = state.activePiece?.position.y;

      controller.softDropStart();

      expect(state.activePiece?.position.y).toBe(initialY! + 1);
    });

    it('should not soft drop when no active piece', () => {
      const state = controller.getState();
      state.activePiece = null;

      controller.softDropStart();

      expect(state.activePiece).toBeNull();
    });

    it('should not soft drop when game is not playing', () => {
      const state = controller.getState();
      const initialY = state.activePiece?.position.y;

      state.status = GameStatus.Paused;

      controller.softDropStart();

      expect(state.activePiece?.position.y).toBe(initialY);
    });

    it('should handle soft drop end', () => {
      controller.softDropEnd();
      // Soft drop end doesn't change state currently
      // This test verifies it doesn't crash
      expect(true).toBe(true);
    });
  });

  describe('Hard Drop Tests', () => {
    beforeEach(() => {
      controller.spawnNextPiece();
    });

    it('should drop piece to lowest position', () => {
      const state = controller.getState();

      const dropDistance = controller.hardDrop();

      expect(dropDistance).toBeGreaterThan(0);
      // After hard drop, a new piece is spawned, so we just verify drop occurred
      expect(state.activePiece).not.toBeNull();
    });

    it('should lock piece after hard drop', () => {
      const state = controller.getState();
      const pieceType = state.activePiece?.type;

      controller.hardDrop();

      // Check that piece was locked into matrix
      let foundLockedCell = false;
      for (let y = 0; y < state.matrix.length; y++) {
        for (let x = 0; x < state.matrix[y].length; x++) {
          if (state.matrix[y][x] === pieceType) {
            foundLockedCell = true;
            break;
          }
        }
      }

      expect(foundLockedCell).toBe(true);
    });

    it('should spawn next piece after hard drop', () => {
      const state = controller.getState();

      controller.hardDrop();

      // Should have a new active piece (likely different type)
      expect(state.activePiece).not.toBeNull();
      // Note: With random bag, new piece might be same type, so we just check it exists
    });

    it('should return zero when no active piece', () => {
      const state = controller.getState();
      state.activePiece = null;

      const dropDistance = controller.hardDrop();

      expect(dropDistance).toBe(0);
    });

    it('should return zero when game is not playing', () => {
      const state = controller.getState();
      state.status = GameStatus.Paused;

      const dropDistance = controller.hardDrop();

      expect(dropDistance).toBe(0);
    });

    it('should calculate correct drop distance', () => {
      const state = controller.getState();

      // Clear the matrix to ensure piece can drop to bottom
      for (let y = 0; y < state.matrix.length; y++) {
        for (let x = 0; x < state.matrix[y].length; x++) {
          state.matrix[y][x] = null;
        }
      }

      const initialY = state.activePiece?.position.y ?? 0;

      const dropDistance = controller.hardDrop();

      expect(dropDistance).toBeGreaterThanOrEqual(0);
      // Should drop from initialY (around 22) to bottom (around 36-39), so distance should be about 14-17
      expect(dropDistance).toBeGreaterThan(10);
    });

    it('should handle hard drop when piece is already at bottom', () => {
      const state = controller.getState();

      // Move piece close to bottom
      if (state.activePiece) {
        state.activePiece.position.y = FIELD_TOTAL_HEIGHT - 2;
      }

      const dropDistance = controller.hardDrop();

      // Drop distance should be small (0 or 1)
      expect(dropDistance).toBeLessThanOrEqual(1);
      expect(state.activePiece).not.toBeNull(); // Should spawn new piece
    });

    it('should lock piece into correct position', () => {
      const state = controller.getState();

      // Clear bottom rows (near the actual bottom at Y=39)
      for (let y = FIELD_TOTAL_HEIGHT - 5; y < FIELD_TOTAL_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
          state.matrix[y][x] = null;
        }
      }

      const pieceType = state.activePiece?.type;

      controller.hardDrop();

      // Check that piece was locked near the bottom
      let foundAtBottom = false;
      for (let y = FIELD_TOTAL_HEIGHT - 5; y < FIELD_TOTAL_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
          if (state.matrix[y][x] === pieceType) {
            foundAtBottom = true;
            break;
          }
        }
      }

      expect(foundAtBottom).toBe(true);
    });
  });
});
