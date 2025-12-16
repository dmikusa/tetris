import { TetrominoType } from './types';

/**
 * Tetromino colors as defined by the Tetris guideline
 */
export const COLORS: Record<TetrominoType, string> = {
  [TetrominoType.I]: '#00F0F0', // Cyan/Light blue
  [TetrominoType.O]: '#F0F000', // Yellow
  [TetrominoType.T]: '#A000F0', // Purple/Magenta
  [TetrominoType.S]: '#00F000', // Green
  [TetrominoType.Z]: '#F00000', // Red
  [TetrominoType.J]: '#0000F0', // Blue
  [TetrominoType.L]: '#F0A000', // Orange
};
