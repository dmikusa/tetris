# Story 10: Gravity Fall

## Goal
Implement the gravity system that automatically moves the active piece downward at intervals determined by the current level's gravity formula.

## Dependencies
- Story 09: Spawn Piece (need active piece management)

## Acceptance Criteria
1. **Gravity Timing**:
   - Pieces automatically move down at intervals based on level
   - Level 1 gravity: piece moves down one row every ~0.8 seconds (per formula)
   - Timing matches Tetris Worlds speed curve formula: `Time = (0.8-((Level-1)*0.007))^(Level-1)`
   - Timer is precise and consistent
2. **Movement Behavior**:
   - Active piece moves down exactly one row per gravity tick
   - Movement only occurs if piece can move (no collision)
   - If piece cannot move down, gravity triggers lock delay (Story 11)
   - Gravity continues as long as game is playing
3. **Pause Control**:
   - Gravity can be paused (for game pause feature)
   - Gravity resumes from paused state correctly
   - Timer resets appropriately on pause/resume
4. **Level Integration**:
   - Gravity speed increases with level
   - Level advancement triggers gravity recalculation
   - Support for levels 1-20 per speed table in specification
5. **Testability**:
   - Gravity timer can be controlled in tests
   - Mock time for deterministic testing
   - Gravity tick can be triggered manually for testing

## Implementation Tasks
1. Create `src/controller/GravitySystem.ts`:
   - Export `GravitySystem` class
   - Manages timing and automatic downward movement
2. Implement gravity timing:
   - Calculate drop interval based on level
   - Use formula from specification or lookup table:
     ```
     Level 1: 0.01667 G (about 1 second per row)
     Level 2: 0.021017 G
     ... (see spec for full table)
     ```
   - Convert G value to milliseconds per row
3. Implement timer mechanism:
   - Use Phaser timer events or custom timer
   - Schedule repeating callback at calculated interval
   - Callback triggers piece movement
4. Create `moveDown()` method in GameController:
   - Attempt to move active piece down one row
   - Check collision before moving
   - Update piece position if move is valid
   - Return boolean indicating success
   - If failed, initiate lock delay (will be Story 11)
5. Integrate gravity with controller:
   - GameController creates GravitySystem instance
   - Gravity system calls controller.moveDown()
   - Gravity starts when piece spawns
6. Implement pause/resume:
   - `pause()`: Stop gravity timer
   - `resume()`: Restart gravity timer
   - Preserve remaining time in current interval
7. Add level-based speed adjustment:
   - `setLevel(level)`: Recalculate gravity speed
   - `getGravityInterval()`: Return current interval
8. Create gravity speed constants/table:
   - Store level-to-speed mapping
   - Support levels 1-20 minimum

## Testing Requirements
- **Unit Tests** (`src/controller/GravitySystem.test.ts`):
  - **Timing Tests**:
    - Verify gravity interval calculated correctly for level 1
    - Verify interval for level 5, 10, 15, 20
    - Test formula or lookup table accuracy
  - **Movement Tests**:
    - Mock piece and verify it moves down on gravity tick
    - Verify piece moves exactly one row
    - Test multiple gravity ticks move piece multiple rows
  - **Pause Tests**:
    - Pause gravity and verify no movement occurs
    - Resume gravity and verify movement restarts
    - Test pause/resume multiple times
  - **Level Change Tests**:
    - Change level and verify gravity speed updates
    - Higher level results in shorter interval
    - Level 20 significantly faster than level 1
  - **Collision Tests**:
    - Piece reaches bottom and stops
    - Movement fails when blocked
    - Lock delay initiated (once Story 11 is implemented)
- **Integration Tests**:
  - Spawn piece and verify it falls automatically
  - Measure time for piece to fall from top to bottom
  - Verify timing matches expected gravity speed
  - Test level progression affects speed
- **Coverage**: Target 95%+ on gravity logic

## Definition of Done
- [ ] GravitySystem class implemented
- [ ] Gravity timing based on level formula
- [ ] Active piece moves down automatically
- [ ] Pause and resume functionality works
- [ ] Level changes update gravity speed
- [ ] moveDown() method in GameController
- [ ] Collision detection prevents invalid moves
- [ ] All unit tests pass
- [ ] Integration tests verify timing accuracy
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
