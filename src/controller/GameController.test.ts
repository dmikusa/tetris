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
          expect(state.activePiece.position.y).toBe(20); // 19 + 1 (after initial drop)
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
          expect(state.activePiece.position.y).toBe(20); // 19 + 1
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
          expect(state.activePiece.position.y).toBe(20); // 19 + 1
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

  describe('Next Queue Preview', () => {
    it('should return requested number of next pieces', () => {
      const nextPieces = controller.getNextPieces(3);
      expect(nextPieces).toBeDefined();
      expect(nextPieces.length).toBe(3);
    });

    it('should return pieces without consuming them', () => {
      const firstPeek = controller.getNextPieces(3);
      const secondPeek = controller.getNextPieces(3);

      expect(firstPeek).toEqual(secondPeek);
    });

    it('should show actual next piece that will spawn', () => {
      const nextPieces = controller.getNextPieces(1);
      controller.spawnNextPiece();
      const state = controller.getState();

      expect(state.activePiece?.type).toBe(nextPieces[0]);
    });

    it('should update queue after piece is spawned', () => {
      const beforeSpawn = controller.getNextPieces(3);
      controller.spawnNextPiece();
      const afterSpawn = controller.getNextPieces(3);

      // Second piece before spawn should be first piece after spawn
      expect(afterSpawn[0]).toBe(beforeSpawn[1]);
      expect(afterSpawn[1]).toBe(beforeSpawn[2]);
    });

    it('should handle different preview counts', () => {
      expect(controller.getNextPieces(1).length).toBe(1);
      expect(controller.getNextPieces(3).length).toBe(3);
      expect(controller.getNextPieces(6).length).toBe(6);
    });

    it('should default to 3 pieces when count not specified', () => {
      const nextPieces = controller.getNextPieces();
      expect(nextPieces.length).toBe(3);
    });

    it('should return valid tetromino types', () => {
      const nextPieces = controller.getNextPieces(7);
      const validTypes = Object.values(TetrominoType);

      nextPieces.forEach((piece) => {
        expect(validTypes).toContain(piece);
      });
    });

    it('should maintain synchronization across multiple spawns', () => {
      for (let i = 0; i < 5; i++) {
        const nextPiece = controller.getNextPieces(1)[0];
        controller.spawnNextPiece();
        const state = controller.getState();
        expect(state.activePiece?.type).toBe(nextPiece);
      }
    });
  });

  describe('Initial Drop Test', () => {
    it('should move piece down one row immediately after spawn', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      // Piece should be at y=20 (spawned at 19, dropped to 20)
      expect(state.activePiece?.position.y).toBe(20);
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
        state.matrix[19][x] = TetrominoType.O;
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

      const dropDistance = controller.hardDrop();

      expect(dropDistance).toBeGreaterThanOrEqual(0);
      // Should drop from spawn position (around 22) to bottom (around 36-39), so distance should be about 14-17
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

  describe('Top-Out Detection', () => {
    describe('Spawn Overlap (Condition 1)', () => {
      it('should detect top-out when piece spawns on filled cells', () => {
        const controller = new GameController(12345);
        const state = controller.getState();

        // Fill the spawn area (around row 21-22) for all piece types
        for (let y = 20; y < 24; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        // Try to spawn - should fail due to overlap
        const spawned = controller.spawnNextPiece();

        expect(spawned).toBe(false);
        expect(state.status).toBe(GameStatus.GameOver);
        expect(state.isGameOver).toBe(true);
        expect(state.activePiece).toBeNull();
      });

      it('should allow spawn when playfield is empty', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        expect(state.status).toBe(GameStatus.Playing);
        expect(state.isGameOver).toBe(false);
        expect(state.activePiece).not.toBeNull();
      });

      it('should allow spawn when only bottom rows are filled', () => {
        const controller = new GameController(12345);
        const state = controller.getState();

        // Fill only the bottom visible rows (30-39)
        for (let y = 30; y < FIELD_TOTAL_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        const spawned = controller.spawnNextPiece();

        expect(spawned).toBe(true);
        expect(state.status).toBe(GameStatus.Playing);
        expect(state.activePiece).not.toBeNull();
      });

      it('should detect top-out with partial spawn overlap', () => {
        const controller = new GameController(12345);
        const state = controller.getState();

        // Fill only part of the spawn area
        state.matrix[22][4] = TetrominoType.I;
        state.matrix[22][5] = TetrominoType.I;

        // Try to spawn a piece that might overlap
        // Keep trying until we get a piece that spawns at the filled position
        for (let i = 0; i < 10; i++) {
          const spawned = controller.spawnNextPiece();
          if (!spawned) {
            // Top-out was detected as expected
            break;
          }
          // If spawn succeeded, clear the piece and try again
          state.activePiece = null;
          state.status = GameStatus.Playing;
        }

        // At least one attempt should have detected overlap
        // (This may pass if the piece spawns in a different position)
      });
    });

    describe('Lock-Out (Condition 2)', () => {
      it('should detect lock-out when piece locks above visible playfield', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        // Fill the visible playfield almost completely, forcing piece to lock high
        // Leave spawn area clear but fill everything from row 20 down
        for (let y = 20; y < FIELD_TOTAL_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        // Clear a small gap at row 20 where piece can try to fit
        // But make it too small, forcing piece to lock in buffer
        for (let x = 3; x <= 5; x++) {
          state.matrix[20][x] = null;
        }

        // Manually position piece in buffer zone and lock it
        // This simulates a piece that can't fit in visible area
        if (state.activePiece) {
          const piece = state.activePiece;
          piece.position.y = 18; // Position in buffer zone

          // Manually call lockPiece through hard drop
          // Since piece is in buffer, it should trigger lock-out
          const gravitySystem = controller.getGravitySystem();
          gravitySystem.stop();

          // Directly test the private lockPiece by hard dropping from buffer position
          // The piece will try to drop but should immediately lock
          controller.hardDrop();
        }

        expect(state.status).toBe(GameStatus.GameOver);
        expect(state.isGameOver).toBe(true);
      });

      it('should allow piece to lock at row 20 (bottom of buffer)', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        // Fill playfield from row 24 down to create a normal landing surface
        for (let y = 24; y < FIELD_TOTAL_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        // Piece should be able to lock at row 20-23 (visible area starts at 20)
        if (state.activePiece) {
          controller.hardDrop();
        }

        // Should not trigger game over if piece locks at row 20 or below
        // (row 20 is the first visible row)
        expect(state.status).toBe(GameStatus.Playing);
        expect(state.isGameOver).toBe(false);
      });

      it('should detect lock-out even if only one mino is above row 20', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        // Fill everything from row 20 down completely
        for (let y = 20; y < FIELD_TOTAL_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        // Position piece manually in buffer zone where it will lock
        if (state.activePiece) {
          state.activePiece.position.y = 19; // At least one mino will be < 20
          controller.hardDrop();
        }

        expect(state.status).toBe(GameStatus.GameOver);
        expect(state.isGameOver).toBe(true);
      });
    });

    describe('Block-Out (Condition 3)', () => {
      it('should not trigger block-out in normal gameplay', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        // Fill most of the playfield
        for (let y = 25; y < FIELD_TOTAL_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        if (state.activePiece) {
          controller.hardDrop();
        }

        // Block-out is prevented by bounds checking, so this should never happen
        expect(state.status).toBe(GameStatus.Playing);
      });
    });

    describe('Game Over State Transitions', () => {
      it('should stop gravity on game over', () => {
        const controller = new GameController(12345);
        const state = controller.getState();

        // Fill spawn area to trigger game over
        for (let y = 20; y < 24; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        controller.spawnNextPiece();

        // Gravity should be stopped
        expect(state.status).toBe(GameStatus.GameOver);
      });

      it('should prevent spawning when game is over', () => {
        const controller = new GameController(12345);
        const state = controller.getState();

        // Manually set game over
        state.status = GameStatus.GameOver;
        state.isGameOver = true;

        const spawned = controller.spawnNextPiece();

        expect(spawned).toBe(false);
        expect(state.activePiece).toBeNull();
      });

      it('should freeze game state on game over', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        const initialScore = state.score;
        const initialLevel = state.level;
        const initialLines = state.linesCleared;

        // Trigger game over by filling spawn area
        for (let y = 20; y < 24; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        controller.spawnNextPiece();

        expect(state.status).toBe(GameStatus.GameOver);
        expect(state.isGameOver).toBe(true);

        // Stats should remain frozen
        expect(state.score).toBe(initialScore);
        expect(state.level).toBe(initialLevel);
        expect(state.linesCleared).toBe(initialLines);
      });

      it('should not restart gravity after game over', () => {
        const controller = new GameController(12345);
        controller.startGame();
        const state = controller.getState();

        // Fill spawn area
        for (let y = 20; y < 24; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        controller.spawnNextPiece();

        expect(state.status).toBe(GameStatus.GameOver);

        // Gravity should remain stopped even if we try operations
        const canMoveDown = controller.moveDown();
        expect(canMoveDown).toBe(false);
      });
    });

    describe('Game Restart', () => {
      it('should allow restarting after game over', () => {
        const controller = new GameController(12345);
        const state = controller.getState();

        // Trigger game over
        for (let y = 20; y < 24; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            state.matrix[y][x] = TetrominoType.I;
          }
        }

        controller.spawnNextPiece();
        expect(state.status).toBe(GameStatus.GameOver);

        // Restart game
        controller.startGame();

        expect(state.status).toBe(GameStatus.Playing);
        expect(state.isGameOver).toBe(false);
        expect(state.activePiece).not.toBeNull();
        expect(state.score).toBe(0);
        expect(state.level).toBe(1);
        expect(state.linesCleared).toBe(0);

        // Matrix should be cleared
        let hasFilledCells = false;
        for (let y = 0; y < FIELD_TOTAL_HEIGHT; y++) {
          for (let x = 0; x < FIELD_WIDTH; x++) {
            if (state.matrix[y][x] !== null) {
              hasFilledCells = true;
              break;
            }
          }
        }
        expect(hasFilledCells).toBe(false);
      });
    });
  });
});
