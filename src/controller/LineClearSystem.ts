import type { Matrix } from '../model/types';
import { FIELD_WIDTH, FIELD_TOTAL_HEIGHT } from '../model/constants';

/**
 * Result of a line clear operation
 */
export interface LineClearResult {
  /** Number of lines cleared */
  linesCleared: number;
  /** Indices of rows that were cleared */
  clearedRows: number[];
}

/**
 * Manages line clearing logic including detection, removal, and gravity collapse
 */
export class LineClearSystem {
  /**
   * Checks if a specific row is complete (all cells filled)
   * @param matrix - The playfield matrix
   * @param rowIndex - Index of the row to check
   * @returns true if row is complete, false otherwise
   */
  isRowComplete(matrix: Matrix, rowIndex: number): boolean {
    if (rowIndex < 0 || rowIndex >= FIELD_TOTAL_HEIGHT) {
      return false;
    }

    for (let col = 0; col < FIELD_WIDTH; col++) {
      if (matrix[rowIndex][col] === null) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks for completed lines and clears them
   * @param matrix - The playfield matrix (modified in place)
   * @param affectedRows - Optional array of row indices to check (optimization)
   * @returns Result containing number of lines cleared and their indices
   */
  checkAndClearLines(matrix: Matrix, affectedRows?: number[]): LineClearResult {
    const rowsToCheck = affectedRows || Array.from({ length: FIELD_TOTAL_HEIGHT }, (_, i) => i);
    const completedRows: number[] = [];

    // Find all completed rows
    for (const rowIndex of rowsToCheck) {
      if (this.isRowComplete(matrix, rowIndex)) {
        completedRows.push(rowIndex);
      }
    }

    // If no completed rows, return early
    if (completedRows.length === 0) {
      return { linesCleared: 0, clearedRows: [] };
    }

    // Remove completed rows and apply gravity
    this.removeCompletedRows(matrix, completedRows);

    return {
      linesCleared: completedRows.length,
      clearedRows: completedRows,
    };
  }

  /**
   * Removes completed rows and collapses the stack
   * @param matrix - The playfield matrix (modified in place)
   * @param completedRows - Array of row indices to remove
   */
  removeCompletedRows(matrix: Matrix, completedRows: number[]): void {
    const completedRowSet = new Set(completedRows);
    const numCleared = completedRows.length;

    // Build new matrix by filtering out completed rows
    const remainingRows = matrix.filter((_, index) => !completedRowSet.has(index));

    // Add empty rows at the top
    for (let i = 0; i < numCleared; i++) {
      remainingRows.unshift(Array(FIELD_WIDTH).fill(null));
    }

    // Replace matrix contents
    matrix.length = 0;
    matrix.push(...remainingRows);
  }

  /**
   * Gets the row indices that could be affected by a piece at a given position
   * @param pieceY - Y position of the piece
   * @param pieceHeight - Height of the piece shape (usually 4)
   * @returns Array of row indices to check
   */
  getAffectedRows(pieceY: number, pieceHeight: number = 4): number[] {
    const rows: number[] = [];
    for (let i = 0; i < pieceHeight; i++) {
      const rowIndex = pieceY + i;
      if (rowIndex >= 0 && rowIndex < FIELD_TOTAL_HEIGHT) {
        rows.push(rowIndex);
      }
    }
    return rows;
  }
}
