# Story 06: Core Model (MVC)

## Goal
Implement the foundational data structures and types that represent the Tetris game state, following the MVC pattern where this is the Model layer.

## Dependencies
- Story 01: Project Bootstrap (need base project structure)

## Acceptance Criteria
1. **Type Definitions**:
   - `src/model/types.ts` file exists with all core types
   - Tetromino type enum: `I, O, T, S, Z, J, L`
   - Color enum or constant mapping tetrominoes to their guideline colors
   - Rotation state type: representing 4 possible orientations
   - Coordinate type: `{x: number, y: number}` for positions
2. **Playfield Model**:
   - Type or interface representing the game matrix
   - 10 columns (width) constant
   - 20 visible rows constant
   - 20 buffer rows constant (total 40 rows)
   - Matrix representation: 2D array or equivalent structure
   - Cell type: empty or containing a tetromino type
3. **Piece Model**:
   - Active piece type with:
     - Tetromino type
     - Current position (x, y coordinates)
     - Current rotation state (0-3)
     - Shape data structure (4x4 grid or coordinate list)
4. **Game State Type**:
   - Playfield/matrix
   - Active piece (nullable)
   - Piece bag state
   - Score
   - Level
   - Game status (playing, paused, game over)
5. **Shape Definitions**:
   - Each tetromino's shape in all 4 rotation states
   - Spawn orientations match specification:
     - I and O spawn centrally
     - J, L, T spawn rounded left with flat side first
     - I, S, Z spawn in upper horizontal orientation
6. **Color Mapping**:
   - I: Light blue (#00F0F0 or similar)
   - O: Yellow (#F0F000)
   - T: Purple/Magenta (#A000F0)
   - S: Green (#00F000)
   - Z: Red (#F00000)
   - J: Blue (#0000F0)
   - L: Orange (#F0A000)

## Implementation Tasks
1. Create `src/model/` directory
2. Create `src/model/types.ts` with:
   - Export `TetrominoType` enum
   - Export `RotationState` type (0 | 1 | 2 | 3)
   - Export `Cell` type (empty or TetrominoType)
   - Export `Position` interface with x, y
   - Export `PlayfieldDimensions` constants
   - Export `Matrix` type (2D array)
   - Export `Piece` interface
   - Export `GameState` interface
3. Create `src/model/shapes.ts`:
   - Export shape definitions for all 7 tetrominoes
   - Each shape has 4 rotation states
   - Use consistent representation (e.g., 4x4 grid with 1/0)
4. Create `src/model/colors.ts`:
   - Export color mapping object or map
   - Colors as hex strings or RGB values
5. Create `src/model/constants.ts`:
   - Export `FIELD_WIDTH = 10`
   - Export `FIELD_VISIBLE_HEIGHT = 20`
   - Export `FIELD_BUFFER_HEIGHT = 20`
   - Export `FIELD_TOTAL_HEIGHT = 40`
6. Add JSDoc comments to all types and interfaces
7. Ensure all types are properly exported

## Testing Requirements
- **Type Tests** (`src/model/types.test.ts`):
  - Verify constants have correct values
  - Test that shape definitions cover all 7 pieces
  - Test that each piece has 4 rotation states
  - Verify color mapping includes all 7 pieces
  - Type-only tests ensuring proper TypeScript inference
- **Shape Validation Tests** (`src/model/shapes.test.ts`):
  - Each tetromino has exactly 4 minos (cells)
  - Shape dimensions fit within 4x4 grid
  - All rotation states are defined
  - No invalid/undefined shapes
- **Model Instantiation Tests**:
  - Can create empty playfield matrix
  - Matrix has correct dimensions (10x40)
  - Can create piece objects with all properties
  - Can access all enum values
- **Coverage**: Aim for 100% coverage on model code (primarily type validation)

## Definition of Done
- [ ] All type definition files created in `src/model/`
- [ ] Tetromino types, colors, and shapes fully defined
- [ ] Playfield and piece types properly structured
- [ ] Constants exported for all dimensions
- [ ] All code has JSDoc documentation
- [ ] Unit tests cover all model validation
- [ ] TypeScript compilation passes with no errors
- [ ] All exports are properly typed
- [ ] Code passes lint and format checks
- [ ] Tests achieve target coverage
- [ ] Changes merged to main branch
