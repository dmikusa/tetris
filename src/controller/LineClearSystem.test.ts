import { describe, it, expect, beforeEach } from 'vitest';
import { LineClearSystem } from './LineClearSystem';
import { TetrominoType, type Matrix } from '../model/types';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';

describe('LineClearSystem', () => {
  let lineClearSystem: LineClearSystem;
  let emptyMatrix: Matrix;

  beforeEach(() => {
    lineClearSystem = new LineClearSystem();

    // Create empty matrix
    emptyMatrix = Array(FIELD_TOTAL_HEIGHT)
      .fill(null)
      .map(() => Array(FIELD_WIDTH).fill(null));
  });

  describe('Line Detection', () => {
    it('should not detect empty row as complete', () => {
      const isComplete = lineClearSystem.isRowComplete(emptyMatrix, 0);
      expect(isComplete).toBe(false);
    });

    it('should not detect partial row as complete', () => {
      // Fill half the row
      for (let col = 0; col < FIELD_WIDTH / 2; col++) {
        emptyMatrix[0][col] = TetrominoType.I;
      }

      const isComplete = lineClearSystem.isRowComplete(emptyMatrix, 0);
      expect(isComplete).toBe(false);
    });

    it('should detect complete row correctly', () => {
      // Fill entire row
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[0][col] = TetrominoType.I;
      }

      const isComplete = lineClearSystem.isRowComplete(emptyMatrix, 0);
      expect(isComplete).toBe(true);
    });

    it('should detect multiple complete rows', () => {
      // Fill rows 0 and 2
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[0][col] = TetrominoType.I;
        emptyMatrix[2][col] = TetrominoType.T;
      }

      expect(lineClearSystem.isRowComplete(emptyMatrix, 0)).toBe(true);
      expect(lineClearSystem.isRowComplete(emptyMatrix, 1)).toBe(false);
      expect(lineClearSystem.isRowComplete(emptyMatrix, 2)).toBe(true);
    });

    it('should handle out of bounds row indices', () => {
      expect(lineClearSystem.isRowComplete(emptyMatrix, -1)).toBe(false);
      expect(lineClearSystem.isRowComplete(emptyMatrix, FIELD_TOTAL_HEIGHT)).toBe(false);
    });
  });

  describe('Single Line Clear', () => {
    it('should clear single bottom row correctly', () => {
      const bottomRow = FIELD_TOTAL_HEIGHT - 1;

      // Fill bottom row
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[bottomRow][col] = TetrominoType.I;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(1);
      expect(result.clearedRows).toEqual([bottomRow]);

      // Bottom row should now be empty
      for (let col = 0; col < FIELD_WIDTH; col++) {
        expect(emptyMatrix[bottomRow][col]).toBeNull();
      }
    });

    it('should clear single middle row correctly', () => {
      const middleRow = 20;

      // Fill middle row
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[middleRow][col] = TetrominoType.T;
      }

      // Add some blocks above
      emptyMatrix[18][0] = TetrominoType.I;
      emptyMatrix[19][1] = TetrominoType.J;

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(1);
      expect(result.clearedRows).toEqual([middleRow]);

      // Blocks above should have fallen down
      expect(emptyMatrix[19][0]).toBe(TetrominoType.I);
      expect(emptyMatrix[20][1]).toBe(TetrominoType.J);

      // Row 20 should not be entirely empty (has the J piece)
      expect(emptyMatrix[20][1]).toBe(TetrominoType.J);
      // But other cells in row 20 should be empty
      for (let col = 0; col < FIELD_WIDTH; col++) {
        if (col !== 1) {
          expect(emptyMatrix[20][col]).toBeNull();
        }
      }
    });

    it('should clear single top row correctly', () => {
      const topRow = 0;

      // Fill top row
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[topRow][col] = TetrominoType.Z;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(1);

      // Top row should be empty after clear
      for (let col = 0; col < FIELD_WIDTH; col++) {
        expect(emptyMatrix[topRow][col]).toBeNull();
      }
    });

    it('should make rows above collapse down by one', () => {
      const clearRow = 35;

      // Fill row to clear
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[clearRow][col] = TetrominoType.I;
      }

      // Place blocks above the clear row
      emptyMatrix[30][5] = TetrominoType.T;
      emptyMatrix[32][3] = TetrominoType.L;
      emptyMatrix[34][7] = TetrominoType.J;

      lineClearSystem.checkAndClearLines(emptyMatrix);

      // Blocks should have moved down one row
      expect(emptyMatrix[31][5]).toBe(TetrominoType.T);
      expect(emptyMatrix[33][3]).toBe(TetrominoType.L);
      expect(emptyMatrix[35][7]).toBe(TetrominoType.J);

      // Original positions should be null
      expect(emptyMatrix[30][5]).toBeNull();
      expect(emptyMatrix[32][3]).toBeNull();
      expect(emptyMatrix[34][7]).toBeNull();
    });
  });

  describe('Multiple Line Clears', () => {
    it('should clear double (two adjacent rows)', () => {
      const row1 = 38;
      const row2 = 39;

      // Fill two adjacent rows
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[row1][col] = TetrominoType.I;
        emptyMatrix[row2][col] = TetrominoType.T;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(2);
      expect(result.clearedRows).toEqual(expect.arrayContaining([row1, row2]));

      // Both rows should be empty
      for (let col = 0; col < FIELD_WIDTH; col++) {
        expect(emptyMatrix[row1][col]).toBeNull();
        expect(emptyMatrix[row2][col]).toBeNull();
      }
    });

    it('should clear triple (three adjacent rows)', () => {
      const row1 = 37;
      const row2 = 38;
      const row3 = 39;

      // Fill three adjacent rows
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[row1][col] = TetrominoType.L;
        emptyMatrix[row2][col] = TetrominoType.J;
        emptyMatrix[row3][col] = TetrominoType.S;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(3);
      expect(result.clearedRows).toEqual(expect.arrayContaining([row1, row2, row3]));
    });

    it('should clear Tetris (four adjacent rows)', () => {
      const row1 = 36;
      const row2 = 37;
      const row3 = 38;
      const row4 = 39;

      // Fill four adjacent rows
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[row1][col] = TetrominoType.I;
        emptyMatrix[row2][col] = TetrominoType.I;
        emptyMatrix[row3][col] = TetrominoType.I;
        emptyMatrix[row4][col] = TetrominoType.I;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(4);
      expect(result.clearedRows).toEqual(expect.arrayContaining([row1, row2, row3, row4]));
    });

    it('should clear non-adjacent rows', () => {
      const row1 = 35;
      const row2 = 38;

      // Fill two non-adjacent rows
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[row1][col] = TetrominoType.Z;
        emptyMatrix[row2][col] = TetrominoType.T;
      }

      // Add blocks between them
      emptyMatrix[36][0] = TetrominoType.I;
      emptyMatrix[37][1] = TetrominoType.J;

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(2);
      expect(result.clearedRows).toEqual(expect.arrayContaining([row1, row2]));

      // Blocks between should have moved down appropriately
      expect(emptyMatrix[37][0]).toBe(TetrominoType.I);
      expect(emptyMatrix[38][1]).toBe(TetrominoType.J);
    });
  });

  describe('Collapse/Gravity Tests', () => {
    it('should collapse stack by correct number of rows', () => {
      // Create a stack with 2 complete rows in the middle
      const clearRow1 = 35;
      const clearRow2 = 36;

      // Fill rows to clear
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[clearRow1][col] = TetrominoType.I;
        emptyMatrix[clearRow2][col] = TetrominoType.I;
      }

      // Place blocks above
      emptyMatrix[30][0] = TetrominoType.T;
      emptyMatrix[32][1] = TetrominoType.J;
      emptyMatrix[34][2] = TetrominoType.L;

      lineClearSystem.checkAndClearLines(emptyMatrix);

      // Blocks should have moved down by 2 rows
      expect(emptyMatrix[32][0]).toBe(TetrominoType.T);
      expect(emptyMatrix[34][1]).toBe(TetrominoType.J);
      expect(emptyMatrix[36][2]).toBe(TetrominoType.L);
    });

    it('should maintain piece shapes during collapse', () => {
      // Create a T-shaped piece above a complete row
      const clearRow = 38;

      // Fill row to clear
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[clearRow][col] = TetrominoType.I;
      }

      // Place T-shape above
      emptyMatrix[35][3] = TetrominoType.T;
      emptyMatrix[35][4] = TetrominoType.T;
      emptyMatrix[35][5] = TetrominoType.T;
      emptyMatrix[36][4] = TetrominoType.T;

      lineClearSystem.checkAndClearLines(emptyMatrix);

      // T-shape should be intact, just moved down one row
      expect(emptyMatrix[36][3]).toBe(TetrominoType.T);
      expect(emptyMatrix[36][4]).toBe(TetrominoType.T);
      expect(emptyMatrix[36][5]).toBe(TetrominoType.T);
      expect(emptyMatrix[37][4]).toBe(TetrominoType.T);
    });

    it('should handle complex stack collapse correctly', () => {
      // Build a complex stack
      // Row 39: complete
      // Row 38: partial
      // Row 37: complete
      // Row 36: partial
      // Row 35: partial

      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[39][col] = TetrominoType.I;
        emptyMatrix[37][col] = TetrominoType.T;
      }

      emptyMatrix[38][0] = TetrominoType.L;
      emptyMatrix[38][1] = TetrominoType.L;
      emptyMatrix[36][8] = TetrominoType.J;
      emptyMatrix[36][9] = TetrominoType.J;
      emptyMatrix[35][5] = TetrominoType.S;

      lineClearSystem.checkAndClearLines(emptyMatrix);

      // Should have cleared 2 rows (37 and 39)
      // Partial blocks should have moved down appropriately
      expect(emptyMatrix[39][0]).toBe(TetrominoType.L);
      expect(emptyMatrix[39][1]).toBe(TetrominoType.L);
      expect(emptyMatrix[38][8]).toBe(TetrominoType.J);
      expect(emptyMatrix[38][9]).toBe(TetrominoType.J);
      expect(emptyMatrix[37][5]).toBe(TetrominoType.S);
    });

    it('should add empty rows at top after clear', () => {
      // Fill bottom 4 rows
      for (let row = 36; row < FIELD_TOTAL_HEIGHT; row++) {
        for (let col = 0; col < FIELD_WIDTH; col++) {
          emptyMatrix[row][col] = TetrominoType.I;
        }
      }

      lineClearSystem.checkAndClearLines(emptyMatrix);

      // Top 4 rows should now be empty
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < FIELD_WIDTH; col++) {
          expect(emptyMatrix[row][col]).toBeNull();
        }
      }

      // Matrix height should remain the same
      expect(emptyMatrix.length).toBe(FIELD_TOTAL_HEIGHT);
    });
  });

  describe('Edge Cases', () => {
    it('should handle no completed rows', () => {
      // Partial row
      emptyMatrix[39][0] = TetrominoType.I;
      emptyMatrix[39][1] = TetrominoType.I;

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(0);
      expect(result.clearedRows).toEqual([]);
    });

    it('should handle clear at row 20 boundary (visible area)', () => {
      const row20 = 20;

      // Fill row 20 (top of visible area)
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[row20][col] = TetrominoType.T;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(1);

      // Row should be cleared
      for (let col = 0; col < FIELD_WIDTH; col++) {
        expect(emptyMatrix[row20][col]).toBeNull();
      }
    });

    it('should handle clear in buffer zone', () => {
      const bufferRow = 10;

      // Fill row in buffer zone
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[bufferRow][col] = TetrominoType.L;
      }

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(1);
    });

    it('should handle multiple clears with pieces between', () => {
      // Complete rows at 35, 37, 39
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[35][col] = TetrominoType.I;
        emptyMatrix[37][col] = TetrominoType.T;
        emptyMatrix[39][col] = TetrominoType.L;
      }

      // Partial rows at 36, 38
      emptyMatrix[36][0] = TetrominoType.J;
      emptyMatrix[36][1] = TetrominoType.J;
      emptyMatrix[38][8] = TetrominoType.S;
      emptyMatrix[38][9] = TetrominoType.S;

      const result = lineClearSystem.checkAndClearLines(emptyMatrix);

      expect(result.linesCleared).toBe(3);

      // Verify pieces fell correctly
      expect(emptyMatrix[38][0]).toBe(TetrominoType.J);
      expect(emptyMatrix[38][1]).toBe(TetrominoType.J);
      expect(emptyMatrix[39][8]).toBe(TetrominoType.S);
      expect(emptyMatrix[39][9]).toBe(TetrominoType.S);
    });
  });

  describe('Optimization: Affected Rows', () => {
    it('should only check specified affected rows', () => {
      // Fill multiple rows
      for (let col = 0; col < FIELD_WIDTH; col++) {
        emptyMatrix[20][col] = TetrominoType.I;
        emptyMatrix[30][col] = TetrominoType.T;
        emptyMatrix[35][col] = TetrominoType.L;
      }

      // Only check rows 34-37 (simulating piece locked at y=34)
      const result = lineClearSystem.checkAndClearLines(emptyMatrix, [34, 35, 36, 37]);

      // Should only detect row 35
      expect(result.linesCleared).toBe(1);
      expect(result.clearedRows).toEqual([35]);
    });

    it('should get correct affected rows for piece position', () => {
      const affectedRows = lineClearSystem.getAffectedRows(35, 4);
      expect(affectedRows).toEqual([35, 36, 37, 38]);
    });

    it('should handle affected rows at boundaries', () => {
      const topRows = lineClearSystem.getAffectedRows(0, 4);
      expect(topRows).toEqual([0, 1, 2, 3]);

      const bottomRows = lineClearSystem.getAffectedRows(36, 4);
      expect(bottomRows).toEqual([36, 37, 38, 39]);
    });

    it('should handle affected rows partially out of bounds', () => {
      const rows = lineClearSystem.getAffectedRows(-2, 4);
      expect(rows).toEqual([0, 1]);
    });
  });
});
