# Story 09: Spawn Piece

## Goal
Implement piece spawning logic that places new tetrominoes at the correct starting position (rows 21/22) with proper centering and orientation, including top-out detection.

## Dependencies
- Story 06: Core Model (need types and shapes)
- Story 08: Random Bag Generator (need piece selection)

## Acceptance Criteria
1. **Spawn Position**:
   - Pieces spawn at rows 21-22 (in the buffer zone above visible playfield)
   - I and O pieces spawn centered (columns 4-5 or 3-6)
   - J, L, T, S, Z pieces spawn rounded to left (column 3 for 3-wide pieces)
   - Spawn position matches Tetris guideline specification
2. **Initial Orientation**:
   - All tetrominoes spawn horizontally (as per guideline)
   - J, L, T spawn with flat side down
   - I, S, Z spawn in upper horizontal orientation
   - Orientation corresponds to rotation state 0 in SRS
3. **Spawn Behavior**:
   - New piece fetched from PieceBag
   - Piece position and orientation initialized correctly
   - Piece immediately moves down one row after spawn
   - Active piece state updated in game model
4. **Top-Out Detection**:
   - Check if spawn position overlaps existing blocks
   - If overlap detected, trigger game over
   - Game state transitions to "game over" status
   - No piece spawns if game is over
5. **Controller Integration**:
   - Spawn logic in controller layer (MVC)
   - `spawnNextPiece()` method in game controller
   - Method called after previous piece locks
   - Method called at game start for first piece

## Implementation Tasks
1. Create `src/controller/GameController.ts`:
   - Export `GameController` class
   - Manages game state and business logic
   - Holds reference to PieceBag instance
2. Implement `spawnNextPiece()` method:
   - Get next piece type from bag
   - Determine spawn position based on piece type:
     - I: x = 3 (centered in 10-wide field)
     - O: x = 4 (centered)
     - T, S, Z, J, L: x = 3 (rounded left)
   - Set spawn y position: 21 or 22 depending on piece
   - Set initial rotation state to 0
   - Get shape data from shapes definition
3. Implement overlap detection:
   - Check each mino of spawning piece
   - Verify position is empty in playfield matrix
   - Return boolean indicating if spawn is safe
4. Implement top-out logic:
   - Call overlap detection before spawning
   - If overlap: set game state to "gameOver"
   - If safe: create active piece and add to state
   - Trigger game over event/callback
5. Implement initial drop:
   - After successful spawn, move piece down one row
   - Follow piece movement rules (will be expanded in Story 10)
6. Add spawn constants:
   - Spawn row for each piece type
   - Spawn column for each piece type
7. Update GameState to track:
   - Active piece (current falling piece)
   - Game status (playing, paused, gameOver)

## Testing Requirements
- **Unit Tests** (`src/controller/GameController.test.ts`):
  - **Spawn Position Tests**:
    - Test each piece type spawns at correct x,y coordinates
    - I piece spawns centered
    - O piece spawns centered
    - Other pieces spawn rounded left
  - **Orientation Tests**:
    - Each piece spawns in correct initial orientation
    - Flat sides down for J, L, T
    - Horizontal for I, S, Z
  - **Top-Out Tests**:
    - Spawn succeeds with empty playfield
    - Spawn fails when position occupied
    - Game over state set on failed spawn
    - No piece created on failed spawn
  - **Bag Integration Tests**:
    - First piece comes from bag
    - Second piece is different (or from new bag)
    - Spawning follows bag order
  - **Initial Drop Test**:
    - Piece moves down one row immediately after spawn
- **Integration Tests**:
  - Spawn multiple pieces in sequence
  - Fill playfield to near-top and verify top-out
  - Verify piece shape matches type
- **Coverage**: Target 95%+ on controller logic

## Definition of Done
- [ ] GameController class created
- [ ] spawnNextPiece() method implemented
- [ ] Correct spawn positions for all 7 piece types
- [ ] Correct initial orientations per specification
- [ ] Top-out detection working
- [ ] Game over state handled properly
- [ ] Initial drop after spawn implemented
- [ ] All unit tests pass
- [ ] Integration with PieceBag verified
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
