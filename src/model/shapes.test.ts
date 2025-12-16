import { describe, it, expect } from 'vitest';
import { SHAPES } from './shapes';
import { TetrominoType, RotationState } from './types';

describe('Shape Definitions', () => {
  it('should have shapes for all 7 tetromino types', () => {
    const types = Object.keys(SHAPES);
    expect(types).toHaveLength(7);
    expect(SHAPES[TetrominoType.I]).toBeDefined();
    expect(SHAPES[TetrominoType.O]).toBeDefined();
    expect(SHAPES[TetrominoType.T]).toBeDefined();
    expect(SHAPES[TetrominoType.S]).toBeDefined();
    expect(SHAPES[TetrominoType.Z]).toBeDefined();
    expect(SHAPES[TetrominoType.J]).toBeDefined();
    expect(SHAPES[TetrominoType.L]).toBeDefined();
  });

  it('should have 4 rotation states for each tetromino', () => {
    Object.values(TetrominoType).forEach((type) => {
      const rotations = SHAPES[type];
      expect(Object.keys(rotations)).toHaveLength(4);
      expect(rotations[0]).toBeDefined();
      expect(rotations[1]).toBeDefined();
      expect(rotations[2]).toBeDefined();
      expect(rotations[3]).toBeDefined();
    });
  });

  it('should have 4x4 grids for all shapes', () => {
    Object.values(TetrominoType).forEach((type) => {
      ([0, 1, 2, 3] as RotationState[]).forEach((rotation) => {
        const shape = SHAPES[type][rotation];
        expect(shape).toHaveLength(4);
        shape.forEach((row) => {
          expect(row).toHaveLength(4);
        });
      });
    });
  });

  it('should have exactly 4 filled cells for each tetromino', () => {
    Object.values(TetrominoType).forEach((type) => {
      ([0, 1, 2, 3] as RotationState[]).forEach((rotation) => {
        const shape = SHAPES[type][rotation];
        const filledCells = shape.flat().filter((cell) => cell === 1).length;
        expect(filledCells).toBe(4);
      });
    });
  });

  it('should only contain 0 or 1 values', () => {
    Object.values(TetrominoType).forEach((type) => {
      ([0, 1, 2, 3] as RotationState[]).forEach((rotation) => {
        const shape = SHAPES[type][rotation];
        shape.flat().forEach((cell) => {
          expect([0, 1]).toContain(cell);
        });
      });
    });
  });

  describe('I piece', () => {
    it('should have horizontal shape in rotation 0', () => {
      const shape = SHAPES[TetrominoType.I][0];
      expect(shape[1]).toEqual([1, 1, 1, 1]);
    });

    it('should have vertical shape in rotation 1', () => {
      const shape = SHAPES[TetrominoType.I][1];
      expect(shape[0][2]).toBe(1);
      expect(shape[1][2]).toBe(1);
      expect(shape[2][2]).toBe(1);
      expect(shape[3][2]).toBe(1);
    });
  });

  describe('O piece', () => {
    it('should have same shape in all rotations', () => {
      const rotation0 = SHAPES[TetrominoType.O][0];
      const rotation1 = SHAPES[TetrominoType.O][1];
      const rotation2 = SHAPES[TetrominoType.O][2];
      const rotation3 = SHAPES[TetrominoType.O][3];

      expect(rotation0).toEqual(rotation1);
      expect(rotation1).toEqual(rotation2);
      expect(rotation2).toEqual(rotation3);
    });

    it('should be a 2x2 square', () => {
      const shape = SHAPES[TetrominoType.O][0];
      expect(shape[0][1]).toBe(1);
      expect(shape[0][2]).toBe(1);
      expect(shape[1][1]).toBe(1);
      expect(shape[1][2]).toBe(1);
    });
  });

  describe('T piece', () => {
    it('should have T shape in rotation 0', () => {
      const shape = SHAPES[TetrominoType.T][0];
      expect(shape[0][1]).toBe(1); // Top center
      expect(shape[1][0]).toBe(1); // Bottom left
      expect(shape[1][1]).toBe(1); // Bottom center
      expect(shape[1][2]).toBe(1); // Bottom right
    });
  });

  describe('S piece', () => {
    it('should have S shape in rotation 0', () => {
      const shape = SHAPES[TetrominoType.S][0];
      expect(shape[0][1]).toBe(1);
      expect(shape[0][2]).toBe(1);
      expect(shape[1][0]).toBe(1);
      expect(shape[1][1]).toBe(1);
    });
  });

  describe('Z piece', () => {
    it('should have Z shape in rotation 0', () => {
      const shape = SHAPES[TetrominoType.Z][0];
      expect(shape[0][0]).toBe(1);
      expect(shape[0][1]).toBe(1);
      expect(shape[1][1]).toBe(1);
      expect(shape[1][2]).toBe(1);
    });
  });

  describe('J piece', () => {
    it('should have J shape in rotation 0', () => {
      const shape = SHAPES[TetrominoType.J][0];
      expect(shape[0][0]).toBe(1); // Top left
      expect(shape[1][0]).toBe(1); // Bottom left
      expect(shape[1][1]).toBe(1); // Bottom center
      expect(shape[1][2]).toBe(1); // Bottom right
    });
  });

  describe('L piece', () => {
    it('should have L shape in rotation 0', () => {
      const shape = SHAPES[TetrominoType.L][0];
      expect(shape[0][2]).toBe(1); // Top right
      expect(shape[1][0]).toBe(1); // Bottom left
      expect(shape[1][1]).toBe(1); // Bottom center
      expect(shape[1][2]).toBe(1); // Bottom right
    });
  });
});
