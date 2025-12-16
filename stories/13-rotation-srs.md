# Story 13: Rotation (SRS)

## Goal
Implement the Super Rotation System (SRS) with proper rotation states, centers, and wall kicks as defined in the Tetris guideline.

## Dependencies
- Story 12: Desktop Controls (need input handling framework)

## Acceptance Criteria
1. **Rotation States**:
   - All 7 tetrominoes have 4 distinct rotation states (0, 1, 2, 3)
   - State 0 is spawn orientation
   - States 1, 2, 3 are successive clockwise 90° rotations
   - Each state stored as shape data (4x4 grid or coordinate list)
2. **Rotation Centers**:
   - I and O: rotation center at gridline intersection
   - J, L, S, T, Z: rotation center at center of one mino
   - Pieces appear to rotate purely about a single point
   - Centers match SRS specification diagram
3. **Rotation Controls**:
   - Z key or Ctrl: Rotate counter-clockwise
   - X key or Up arrow: Rotate clockwise
   - Keys can be held for repeated rotation (with DAS)
4. **Basic Rotation**:
   - Unobstructed rotation transitions between states smoothly
   - Collision detection prevents invalid rotations
   - Invalid rotation attempts don't change state
5. **Wall Kicks** (Basic):
   - When rotation is blocked, attempt to "kick" piece into valid position
   - SRS defines 5 kick tests per rotation
   - Try each kick offset in order until valid position found
   - If all kicks fail, rotation fails and piece stays in original state
6. **Wall Kick Data**:
   - Different kick tables for JLSTZ pieces vs I piece vs O piece
   - O piece doesn't actually rotate (appears stationary)
   - Implement standard SRS kick offset tables
7. **State Transitions**:
   - 0→1, 1→2, 2→3, 3→0 for clockwise
   - 0→3, 3→2, 2→1, 1→0 for counter-clockwise
   - Each transition has specific kick offsets

## Implementation Tasks
1. Update `src/model/shapes.ts`:
   - Define all 4 rotation states for each tetromino
   - Use consistent representation (4x4 grid with 1s and 0s)
   - Match SRS diagram: https://tetris.wiki/images/3/3d/SRS-pieces.png
2. Create `src/model/wallKicks.ts`:
   - Export SRS wall kick offset tables
   - Table for JLSTZ pieces (5 tests per rotation)
   - Table for I piece (5 different tests)
   - Table for O piece (no kicks, always successful)
3. Create `src/controller/RotationSystem.ts`:
   - Export `RotationSystem` class
   - Method: `rotate(piece, direction, matrix)` returns new state or null
   - Method: `tryRotation()` attempts rotation with kicks
   - Method: `applyKick()` tests individual kick offset
4. Implement rotation logic:
   - Get target rotation state based on direction
   - Get shape data for target state
   - Try basic rotation (no offset)
   - If collision, try each kick offset in order
   - Return first valid state or null if all fail
5. Update GameController:
   - `rotateClockwise()` method
   - `rotateCounterClockwise()` method
   - Call RotationSystem to get new state
   - Update active piece if rotation succeeds
   - Reset lock delay timer on successful rotation (Story 11)
6. Update InputController:
   - Add rotation key bindings (Z, X, Up, Ctrl)
   - Handle rotation key presses
   - Apply DAS to rotation keys
7. Add rotation constants:
   - Key mappings for rotation
   - DAS settings for rotation (may differ from movement)

## Testing Requirements
- **Unit Tests** (`src/model/shapes.test.ts`):
  - **Shape Data Tests**:
    - Each piece has exactly 4 states
    - Each state has exactly 4 minos
    - States match SRS specification
    - Rotation centers calculated correctly
- **Unit Tests** (`src/controller/RotationSystem.test.ts`):
  - **Basic Rotation Tests**:
    - Each piece rotates through all 4 states
    - 0→1→2→3→0 for clockwise
    - 0→3→2→1→0 for counter-clockwise
    - O piece "rotation" works (stays same position)
  - **Collision Tests**:
    - Rotation blocked by walls
    - Rotation blocked by locked pieces
    - Failed rotation doesn't change state
  - **Wall Kick Tests**:
    - Piece kicks away from left wall
    - Piece kicks away from right wall
    - Piece kicks up from floor
    - I-piece special kicks work
    - All 5 kick tests per rotation
    - Correct kick used when multiple would work
  - **Edge Cases**:
    - Rotation at spawn
    - Rotation while locked (during lock delay)
    - Rotation with no space available
- **Integration Tests**:
  - Rotate pieces during actual gameplay
  - Verify wall kicks work visually
  - Test T-spin setups (advanced, but useful)
- **Coverage**: Target 95%+ on rotation logic

## Definition of Done
- [ ] All 4 rotation states defined for each tetromino
- [ ] Rotation states match SRS specification
- [ ] Wall kick offset tables implemented
- [ ] RotationSystem class implemented
- [ ] Rotation methods in GameController
- [ ] Rotation keys mapped in InputController
- [ ] Basic rotation works in open space
- [ ] Wall kicks allow rotation near boundaries
- [ ] Failed rotations don't change state
- [ ] O piece handles rotation correctly
- [ ] All unit tests pass
- [ ] Integration tests verify wall kicks
- [ ] Visual testing confirms correct behavior
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
