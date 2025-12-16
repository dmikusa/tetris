import { RotationState, TetrominoType } from './types';

/**
 * Wall kick offset for testing rotation validity
 * [x, y] where positive x is right, positive y is up
 */
export type KickOffset = [number, number];

/**
 * Rotation transition key (e.g., "0->1" for rotating from state 0 to state 1)
 */
export type RotationTransition = string;

/**
 * Wall kick table mapping rotation transitions to kick offset tests
 */
export type WallKickTable = Record<RotationTransition, KickOffset[]>;

/**
 * SRS wall kick data for JLSTZ pieces
 * Based on: https://tetris.wiki/Super_Rotation_System
 *
 * For each rotation transition, try these 5 kick tests in order:
 * Test 1: No offset (basic rotation)
 * Tests 2-5: Wall kick offsets
 */
export const WALL_KICK_DATA_JLSTZ: WallKickTable = {
  // Clockwise rotations
  '0->1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '1->2': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '2->3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  '3->0': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],

  // Counter-clockwise rotations
  '0->3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  '3->2': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '2->1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '1->0': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
};

/**
 * SRS wall kick data for I piece
 * I piece has different kick behavior due to its unique rotation center
 */
export const WALL_KICK_DATA_I: WallKickTable = {
  // Clockwise rotations
  '0->1': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '1->2': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  '2->3': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '3->0': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],

  // Counter-clockwise rotations
  '0->3': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  '3->2': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '2->1': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '1->0': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
};

/**
 * Wall kick data for O piece
 * O piece doesn't actually rotate (appears stationary), so only one "test" needed
 */
export const WALL_KICK_DATA_O: WallKickTable = {
  '0->1': [[0, 0]],
  '1->2': [[0, 0]],
  '2->3': [[0, 0]],
  '3->0': [[0, 0]],
  '0->3': [[0, 0]],
  '3->2': [[0, 0]],
  '2->1': [[0, 0]],
  '1->0': [[0, 0]],
};

/**
 * Gets the appropriate wall kick table for a given tetromino type
 */
export function getWallKickTable(type: TetrominoType): WallKickTable {
  if (type === TetrominoType.I) {
    return WALL_KICK_DATA_I;
  } else if (type === TetrominoType.O) {
    return WALL_KICK_DATA_O;
  } else {
    return WALL_KICK_DATA_JLSTZ;
  }
}

/**
 * Gets the next rotation state for a given direction
 */
export function getNextRotationState(
  current: RotationState,
  direction: 'clockwise' | 'counterclockwise'
): RotationState {
  if (direction === 'clockwise') {
    return ((current + 1) % 4) as RotationState;
  } else {
    return ((current + 3) % 4) as RotationState;
  }
}

/**
 * Creates a rotation transition key
 */
export function getRotationTransitionKey(from: RotationState, to: RotationState): string {
  return `${from}->${to}`;
}
