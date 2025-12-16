import { describe, it, expect, beforeEach } from 'vitest';
import { GameController } from './GameController';
import { TetrominoType, GameStatus } from '../model/types';
import { FIELD_WIDTH } from '../model/constants';

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
          expect(state.activePiece.position.y).toBe(20); // 21 - 1 (after initial drop)
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
          expect(state.activePiece.position.y).toBe(20); // 21 - 1
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
          expect(state.activePiece.position.y).toBe(20); // 21 - 1
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

      // Piece should be at y=20 (spawned at 21, dropped to 20)
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
      expect(state.activePiece?.position.y).toBe(initialY! - 1);
    });

    it('should return false when piece cannot move down', () => {
      controller.spawnNextPiece();
      const state = controller.getState();

      // Block the space below the piece
      if (state.activePiece) {
        const blockY = state.activePiece.position.y - 1;
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

      expect(state.activePiece?.position.y).toBe(initialY - 3);
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
});
