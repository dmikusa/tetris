# Story 12: Desktop Controls

## Goal
Implement keyboard controls for desktop play, mapping arrow keys to piece movements following the Tetris guideline standard mappings.

## Dependencies
- Story 11: Collision & Lock Delay (need movement validation)

## Acceptance Criteria
1. **Arrow Key Mappings**:
   - **Left Arrow**: Move piece one cell left
   - **Right Arrow**: Move piece one cell right
   - **Down Arrow**: Soft drop (faster downward movement, non-locking)
   - **Up Arrow**: Hard drop (instant drop to lowest position, locks immediately)
2. **Movement Behavior**:
   - Left/Right movement is immediate and repeatable (can hold key)
   - Soft drop accelerates downward movement while held
   - Hard drop drops piece instantly and locks without delay
   - All movements respect collision detection
3. **Input Responsiveness**:
   - Key presses register immediately (< 16ms latency)
   - Delayed Auto Shift (DAS): Hold key for continuous movement
   - DAS initial delay: ~170ms before repeat begins
   - DAS repeat rate: ~50ms between movements when held
4. **Soft Drop**:
   - Piece moves down continuously while Down arrow held
   - Drop speed faster than normal gravity
   - Does not lock piece (except first frame in some variants)
   - Player can still move left/right during soft drop
   - Releasing key returns to normal gravity
5. **Hard Drop**:
   - Single key press drops to lowest valid position
   - Locks immediately (bypasses lock delay)
   - Triggers next piece spawn
   - Cannot be cancelled once triggered
6. **Key Handling**:
   - No double-input on single key press
   - Key repeat handled correctly by browser/OS
   - Works with multiple simultaneous keys (e.g., left + soft drop)

## Implementation Tasks
1. Create `src/controller/InputController.ts`:
   - Export `InputController` class
   - Manages keyboard event listeners
   - Translates key events to game actions
2. Set up keyboard event listeners:
   - Listen to `keydown` and `keyup` events
   - Map key codes to game actions
   - Prevent default browser behavior for arrow keys
3. Implement movement actions in GameController:
   - `moveLeft()`: Move active piece left if no collision
   - `moveRight()`: Move active piece right if no collision
   - `softDrop()`: Move piece down faster while key held
   - `hardDrop()`: Drop piece to bottom and lock immediately
4. Implement DAS (Delayed Auto Shift):
   - Track key press start time
   - Initial delay before repeat (~170ms)
   - Repeat interval for continuous movement (~50ms)
   - Separate DAS timers for left and right
5. Implement soft drop:
   - Temporarily increase gravity speed while Down held
   - Reset to normal speed on key release
   - Track soft drop state
6. Implement hard drop:
   - Calculate lowest valid position for piece
   - Move piece to that position instantly
   - Call lock immediately (bypass lock delay)
   - Award bonus points for hard drop distance (if scoring implemented)
7. Integrate with Phaser input system:
   - Use Phaser keyboard plugin if available
   - Or use native browser events
   - Ensure proper cleanup on scene destroy
8. Add input configuration:
   - Key bindings as constants
   - Allow for future key remapping

## Testing Requirements
- **Unit Tests** (`src/controller/InputController.test.ts`):
  - **Key Mapping Tests**:
    - Left arrow calls moveLeft()
    - Right arrow calls moveRight()
    - Down arrow activates soft drop
    - Up arrow calls hardDrop()
  - **Movement Tests**:
    - Left movement reduces x coordinate
    - Right movement increases x coordinate
    - Movements stopped by collision
    - Movements update piece position
  - **DAS Tests**:
    - Holding key triggers repeated movement
    - Initial delay before repeat
    - Repeat rate matches specification
    - Releasing key stops movement
  - **Soft Drop Tests**:
    - Soft drop increases fall speed
    - Releasing Down key restores normal speed
    - Soft drop doesn't auto-lock piece
  - **Hard Drop Tests**:
    - Piece moves to bottom position
    - Piece locks immediately
    - Next piece spawns after hard drop
- **Integration Tests**:
  - Simulate complete game with keyboard input
  - Test multiple simultaneous keys
  - Verify no input lag or dropped inputs
  - Test edge cases (hard drop at spawn, soft drop at bottom)
- **Manual Testing**:
  - Play game with keyboard
  - Verify controls feel responsive
  - Test DAS tuning for good gameplay feel
- **Coverage**: Target 90%+ on input handling

## Definition of Done
- [ ] InputController class implemented
- [ ] All arrow keys mapped correctly
- [ ] Movement methods in GameController
- [ ] DAS implemented for smooth key repeat
- [ ] Soft drop functionality working
- [ ] Hard drop instant-locks piece
- [ ] Collision detection integrated with movements
- [ ] Input feels responsive during gameplay
- [ ] All unit tests pass
- [ ] Integration tests verify behavior
- [ ] Manual gameplay testing confirms good UX
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
