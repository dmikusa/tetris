import { describe, it, expect } from 'vitest';
import {
  TetrominoType,
  GameStatus,
  type RotationState,
  type Cell,
  type Position,
  type Matrix,
  type Piece,
  type GameState,
} from './types';
import {
  FIELD_WIDTH,
  FIELD_VISIBLE_HEIGHT,
  FIELD_BUFFER_HEIGHT,
  FIELD_TOTAL_HEIGHT,
} from './constants';
import { COLORS } from './colors';

describe('Constants', () => {
  it('should have correct playfield dimensions', () => {
    expect(FIELD_WIDTH).toBe(10);
    expect(FIELD_VISIBLE_HEIGHT).toBe(20);
    expect(FIELD_BUFFER_HEIGHT).toBe(20);
    expect(FIELD_TOTAL_HEIGHT).toBe(40);
  });

  it('should have total height equal to visible + buffer', () => {
    expect(FIELD_TOTAL_HEIGHT).toBe(FIELD_VISIBLE_HEIGHT + FIELD_BUFFER_HEIGHT);
  });
});

describe('TetrominoType', () => {
  it('should have all 7 tetromino types', () => {
    const types = Object.values(TetrominoType);
    expect(types).toHaveLength(7);
    expect(types).toContain('I');
    expect(types).toContain('O');
    expect(types).toContain('T');
    expect(types).toContain('S');
    expect(types).toContain('Z');
    expect(types).toContain('J');
    expect(types).toContain('L');
  });
});

describe('GameStatus', () => {
  it('should have all game statuses', () => {
    expect(GameStatus.Playing).toBe('playing');
    expect(GameStatus.Paused).toBe('paused');
    expect(GameStatus.GameOver).toBe('game_over');
  });
});

describe('Color Mapping', () => {
  it('should have colors for all tetromino types', () => {
    expect(COLORS[TetrominoType.I]).toBeDefined();
    expect(COLORS[TetrominoType.O]).toBeDefined();
    expect(COLORS[TetrominoType.T]).toBeDefined();
    expect(COLORS[TetrominoType.S]).toBeDefined();
    expect(COLORS[TetrominoType.Z]).toBeDefined();
    expect(COLORS[TetrominoType.J]).toBeDefined();
    expect(COLORS[TetrominoType.L]).toBeDefined();
  });

  it('should have valid hex color codes', () => {
    Object.values(COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('Type Definitions', () => {
  it('should allow creating a valid position', () => {
    const pos: Position = { x: 5, y: 10 };
    expect(pos.x).toBe(5);
    expect(pos.y).toBe(10);
  });

  it('should allow creating a valid piece', () => {
    const piece: Piece = {
      type: TetrominoType.I,
      position: { x: 3, y: 0 },
      rotation: 0,
    };
    expect(piece.type).toBe(TetrominoType.I);
    expect(piece.position.x).toBe(3);
    expect(piece.rotation).toBe(0);
  });

  it('should allow creating empty matrix', () => {
    const matrix: Matrix = Array(FIELD_TOTAL_HEIGHT)
      .fill(null)
      .map(() => Array(FIELD_WIDTH).fill(null));

    expect(matrix.length).toBe(FIELD_TOTAL_HEIGHT);
    expect(matrix[0].length).toBe(FIELD_WIDTH);
  });

  it('should allow creating a game state', () => {
    const matrix: Matrix = Array(FIELD_TOTAL_HEIGHT)
      .fill(null)
      .map(() => Array(FIELD_WIDTH).fill(null));
    const gameState: GameState = {
      matrix,
      playfield: matrix,
      activePiece: null,
      currentPiece: {
        type: TetrominoType.T,
        rotation: 0 as RotationState,
        position: { x: 0, y: 0 },
      },
      score: 0,
      level: 1,
      linesCleared: 0,
      status: GameStatus.Playing,
      isGameOver: false,
    };

    expect(gameState.score).toBe(0);
    expect(gameState.level).toBe(1);
    expect(gameState.status).toBe(GameStatus.Playing);
    expect(gameState.activePiece).toBeNull();
  });

  it('should allow cells to be null or tetromino type', () => {
    const emptyCell: Cell = null;
    const filledCell: Cell = TetrominoType.I;

    expect(emptyCell).toBeNull();
    expect(filledCell).toBe(TetrominoType.I);
  });

  it('should support all rotation states', () => {
    const rotations: RotationState[] = [0, 1, 2, 3];
    expect(rotations).toHaveLength(4);
  });
});
