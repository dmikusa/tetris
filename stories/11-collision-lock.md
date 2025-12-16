# Story 11: Collision & Lock Delay

## Goal
Implement collision detection for piece movement and the lock delay mechanism that gives players time to position pieces after they land, with support for different lock delay modes.

## Dependencies
- Story 10: Gravity Fall (need automatic movement)

## Acceptance Criteria
1. **Collision Detection**:
   - Detects collision with playfield boundaries (sides and bottom)
   - Detects collision with locked pieces in matrix
   - Checks all 4 minos of active piece
   - Works for all movement directions and rotations
   - Returns boolean or collision info
2. **Landing Detection**:
   - Piece is "landed" when it cannot move down
   - Landing triggers lock delay timer
   - Visual or state indication that piece has landed
3. **Lock Delay (Move Reset Mode)**:
   - Default mode: Extended Placement Lock Down (move reset)
   - 0.5 second delay when piece lands (for gravity < 20G)
   - Timer resets on any movement or rotation
   - Maximum 15 moves/rotations before forced lock
   - After 15 moves OR 0.5s with no input, piece locks
4. **Alternative Lock Modes** (Configurable):
   - **Infinity Mode**: Timer resets indefinitely on move/rotate
   - **Step Reset Mode**: Timer only resets when piece moves down a row
   - Game configuration allows selecting mode
   - Default to move reset mode
5. **Lock Behavior**:
   - When lock timer expires or move limit reached:
     - Active piece minos transferred to playfield matrix
     - Active piece cleared from state
     - Next piece spawns
   - Lock cannot be cancelled once timer expires
6. **Edge Cases**:
   - Hard drop locks immediately (no delay)
   - Lock delay only applies when gravity < 20G
   - Lock at 20G happens immediately
   - Piece can still be moved during lock delay if space available

## Implementation Tasks
1. Create `src/controller/CollisionDetector.ts`:
   - Export `CollisionDetector` class
   - Method: `checkCollision(piece, position, rotation, matrix)`
   - Method: `canMoveDown(piece, matrix)`
   - Method: `canMoveLeft(piece, matrix)`
   - Method: `canMoveRight(piece, matrix)`
   - Method: `canRotate(piece, newRotation, matrix)`
2. Implement collision algorithm:
   - For each mino in piece shape:
     - Calculate absolute position (piece pos + mino offset)
     - Check if within playfield bounds (0-9 x, 0-39 y)
     - Check if matrix cell at position is empty
     - Return false if any mino collides
   - Return true if all minos are clear
3. Create `src/controller/LockDelaySystem.ts`:
   - Export `LockDelaySystem` class
   - Configurable lock mode (infinity, moveReset, stepReset)
   - Lock delay duration (default 500ms)
   - Move counter for move reset mode
4. Implement lock delay logic:
   - `startLockDelay()`: Begin timer when piece lands
   - `resetLockDelay()`: Reset timer on valid action
   - `cancelLockDelay()`: Stop timer if piece lifts off ground
   - `onLockDelayExpire()`: Callback when piece should lock
5. Implement move tracking:
   - Count moves and rotations in move reset mode
   - Track move count resets to 0 when piece locks
   - Maximum 15 moves before forced lock
6. Integrate with GameController:
   - Check collision before all movements
   - Start lock delay when piece lands
   - Reset lock delay based on mode
   - Lock piece when timer expires
7. Implement `lockPiece()` method:
   - Transfer piece minos to matrix
   - Mark matrix cells with piece type
   - Clear active piece
   - Call spawn next piece
8. Update movement methods to use collision detection:
   - `moveLeft()`, `moveRight()`, `moveDown()` check collision first
   - Return false if movement blocked

## Testing Requirements
- **Unit Tests** (`src/controller/CollisionDetector.test.ts`):
  - **Boundary Tests**:
    - Piece at left edge cannot move left
    - Piece at right edge cannot move right
    - Piece at bottom cannot move down
  - **Stack Collision Tests**:
    - Piece collides with locked pieces below
    - Piece collides with locked pieces to side
    - No collision when spaces are empty
  - **Shape Tests**:
    - All 7 piece types detect collision correctly
    - All rotation states work
- **Unit Tests** (`src/controller/LockDelaySystem.test.ts`):
  - **Timer Tests**:
    - Lock delay starts when piece lands
    - Timer expires after 500ms
    - Lock callback triggered on expiration
  - **Move Reset Tests**:
    - Timer resets on movement
    - Timer resets on rotation
    - Move counter increments correctly
    - Forced lock after 15 moves
  - **Infinity Mode Tests**:
    - Timer resets indefinitely
    - No move limit
  - **Step Reset Tests**:
    - Timer resets only on downward movement
    - Rotation doesn't reset timer
  - **Cancel Tests**:
    - Lock cancelled if piece lifts off (e.g., due to rotation)
- **Integration Tests**:
  - Piece lands and locks after delay
  - Moving during lock delay extends time
  - Hard drop locks immediately
  - Piece transfers to matrix correctly
- **Coverage**: Target 95%+ on collision and lock logic

## Definition of Done
- [ ] CollisionDetector class implemented
- [ ] All collision methods working correctly
- [ ] LockDelaySystem class implemented
- [ ] Move reset mode working (default)
- [ ] Infinity and step reset modes implemented
- [ ] Lock delay configurable
- [ ] Move limit enforced (15 moves)
- [ ] lockPiece() transfers minos to matrix
- [ ] All movement respects collision detection
- [ ] All unit tests pass
- [ ] Integration tests verify behavior
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
