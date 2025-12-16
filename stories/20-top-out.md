# Story 20: Top-Out Rules

## Goal
Implement complete top-out (game over) detection rules per Tetris guideline, handling all scenarios where the player loses.

## Dependencies
- Story 09: Spawn Piece (need spawn overlap detection)
- Story 11: Collision & Lock Delay (need lock position detection)

## Acceptance Criteria
1. **Top-Out Condition 1: Spawn Overlap**:
   - Piece spawns overlapping at least one locked block
   - Detected immediately at spawn time
   - Triggers instant game over
   - Most common top-out scenario
2. **Top-Out Condition 2: Lock Out**:
   - Piece locks completely above visible playfield (row 21+)
   - Even if no overlap during spawn
   - Detected when piece locks
   - Triggers game over
3. **Top-Out Condition 3: Block Out**:
   - Block pushed above 20-row buffer zone (row 40+)
   - Extremely rare scenario
   - Detected after lock
   - Triggers game over
4. **Game Over State**:
   - Game state transitions to "gameOver"
   - Gravity stops
   - Input disabled (cannot move pieces)
   - Game loop pauses or stops
   - Final score and stats displayed
5. **Game Over UI**:
   - Clear "GAME OVER" message displayed
   - Final score shown
   - Final level shown
   - Lines cleared shown
   - Option to restart game
   - Option to return to menu (if menu exists)
6. **No False Positives**:
   - Pieces in buffer zone (rows 21-40) don't trigger game over if valid
   - Only actual violations cause game over
   - Lock delay still applies before lock-out check

## Implementation Tasks
1. Enhance `src/controller/GameController.ts`:
   - Add `checkTopOut()` method
   - Method: `isSpawnOverlap()` checks condition 1
   - Method: `isLockOut()` checks condition 2  
   - Method: `isBlockOut()` checks condition 3
   - Method: `triggerGameOver()` transitions to game over state
2. Implement spawn overlap detection:
   - During `spawnNextPiece()`, check if spawn position overlaps
   - Use existing collision detection
   - If overlap detected, call `triggerGameOver()`
   - Do not create active piece on overlap
3. Implement lock-out detection:
   - In `lockPiece()`, check if piece is above row 20
   - Check all 4 minos of locked piece
   - If any mino above row 20, call `triggerGameOver()`
   - Check happens after lock but before line clear
4. Implement block-out detection:
   - After piece locks, scan playfield
   - Check if any cell above row 40 is filled
   - If found, call `triggerGameOver()`
   - Very rare edge case
5. Implement game over transition:
   - Set `gameState.status = "gameOver"`
   - Stop gravity system
   - Disable input controller
   - Save final score/stats
   - Emit game over event
6. Create `src/ui/GameOverScreen.tsx`:
   - Display "GAME OVER" message
   - Show final statistics:
     - Score
     - Level reached
     - Lines cleared
     - Time played (optional)
   - Button: "Play Again" (restarts game)
   - Button: "Main Menu" (optional, if menu exists)
7. Integrate game over UI:
   - Show modal/overlay on game over
   - Dim or blur playfield behind modal
   - Prevent interaction with game
8. Implement game restart:
   - Reset all game state
   - Clear matrix
   - Reset score, level, lines
   - Create new piece bag
   - Spawn first piece
   - Resume gameplay

## Testing Requirements
- **Unit Tests** (`src/controller/GameController.test.ts`):
  - **Spawn Overlap Tests**:
    - Empty field: spawn succeeds
    - Filled spawn position: top-out triggers
    - Partial spawn overlap: top-out triggers
    - All piece types tested
  - **Lock-Out Tests**:
    - Piece locks at row 19: game continues
    - Piece locks at row 20: game continues
    - Piece locks at row 21: top-out triggers
    - Partial lock above row 20: top-out triggers
  - **Block-Out Tests**:
    - Stack reaches row 40: top-out triggers
    - Stack at row 39: game continues
    - Edge case scenarios
  - **State Transition Tests**:
    - Game state changes to gameOver
    - Gravity stops on game over
    - Input disabled on game over
    - Stats frozen at game over
- **Integration Tests**:
  - Fill stack to top and verify top-out
  - Spawn piece on full column
  - Complete gameplay ending in top-out
  - Restart after game over works
- **UI Tests** (`src/ui/GameOverScreen.test.tsx`):
  - Component renders with stats
  - Stats display correctly
  - Restart button works
  - Main menu button works (if exists)
- **End-to-End Tests**:
  - Play game until top-out
  - Verify game over screen appears
  - Verify restart functionality
  - Test multiple game cycles
- **Coverage**: Target 95%+ on game over logic

## Definition of Done
- [ ] All three top-out conditions implemented
- [ ] Spawn overlap detection working
- [ ] Lock-out detection working
- [ ] Block-out detection working (rare case)
- [ ] Game state transitions to gameOver correctly
- [ ] Gravity and input disabled on game over
- [ ] GameOverScreen component created
- [ ] Final stats displayed correctly
- [ ] Restart game functionality working
- [ ] No false positive top-outs
- [ ] All unit tests pass
- [ ] Integration tests verify all conditions
- [ ] End-to-end game over flow tested
- [ ] UI looks polished and clear
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
