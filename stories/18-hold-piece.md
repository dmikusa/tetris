# Story 18: Hold Piece

## Goal
Implement the Hold mechanism that allows players to store the active piece for later use, with proper swap behavior and usage restrictions.

## Dependencies
- Story 12: Desktop Controls (need input handling)
- Story 09: Spawn Piece (need piece spawning system)

## Acceptance Criteria
1. **Hold Mechanism**:
   - Single hold slot stores one piece
   - Initially empty at game start
   - Hold key (C, Shift, or Space) triggers hold action
   - Stored piece persists until swapped
2. **Hold Behavior - Empty Slot**:
   - First hold: active piece stored, next piece spawns
   - Hold slot now contains stored piece
   - New piece becomes active
3. **Hold Behavior - Filled Slot**:
   - Subsequent hold: active and held pieces swap
   - Held piece moves to playfield (spawn position)
   - Active piece moves to hold slot
   - Piece resets to spawn position and rotation state 0
4. **Usage Restriction**:
   - Hold can only be used once per piece
   - After using hold, cannot hold again until piece locks
   - "Hold available" flag tracked per piece
   - Flag resets when new piece spawns
5. **UI Display**:
   - Hold slot shown near playfield (typically top-left)
   - "HOLD" label displayed
   - Stored piece rendered in spawn orientation
   - Correct color applied
   - Visual indication if hold unavailable
6. **Initial Hold System (IHS)** (Optional):
   - Allow holding immediately after spawn during ARE
   - Enhanced player control
   - May be advanced feature for later

## Implementation Tasks
1. Update game state in `src/model/types.ts`:
   - Add `heldPiece` field (nullable TetrominoType)
   - Add `canHold` boolean flag
2. Create `src/controller/HoldSystem.ts`:
   - Export `HoldSystem` class
   - Method: `hold()` attempts to hold current piece
   - Method: `canUseHold()` checks if hold available
   - Method: `getHeldPiece()` returns held piece or null
   - Method: `resetHoldFlag()` called when piece locks
3. Implement hold logic:
   - Check if hold is available (canHold flag)
   - If not available, return early (do nothing)
   - If hold slot empty:
     - Store active piece type
     - Spawn next piece from bag
     - Set canHold to false
   - If hold slot filled:
     - Swap active piece with held piece
     - Spawn held piece at spawn position with rotation 0
     - Store previous active piece in hold slot
     - Set canHold to false
4. Integrate with GameController:
   - Add `holdPiece()` method
   - Call HoldSystem logic
   - Update active piece after hold
   - Reset canHold flag after piece locks
5. Update InputController:
   - Add hold key binding (C, Shift, or Space)
   - Call `gameController.holdPiece()` on key press
   - Visual feedback on key press (optional)
6. Create React component `src/ui/HoldDisplay.tsx`:
   - Accept props: `heldPiece` (TetrominoType or null)
   - Accept props: `canHold` (boolean)
   - Render "HOLD" label
   - Render piece preview if piece is held
   - Render empty box if no piece held
   - Dim or indicate when hold unavailable
7. Position in layout:
   - Typically top-left near playfield
   - Consistent styling with NextQueue
   - Clear and visible during gameplay
8. Update piece locking:
   - When piece locks, set `canHold = true`
   - Reset flag for new piece

## Testing Requirements
- **Unit Tests** (`src/controller/HoldSystem.test.ts`):
  - **Initial Hold Tests**:
    - Hold with empty slot stores piece
    - Hold with empty slot spawns next piece
    - canHold flag set to false
  - **Swap Tests**:
    - Hold with filled slot swaps pieces
    - Swapped piece spawns at correct position
    - Swapped piece resets to rotation 0
    - Previous active piece stored correctly
  - **Restriction Tests**:
    - Cannot hold twice without locking
    - Attempting to hold when unavailable does nothing
    - Flag resets after piece locks
    - Flag available for new piece
  - **Edge Cases**:
    - Hold immediately after spawn
    - Hold during lock delay
    - Hold with piece near collision
    - Hold at game start
- **Integration Tests**:
  - Complete hold->swap->lock->hold cycle
  - Hold prevents infinite play (without locking)
  - Held piece appears correctly when spawned
  - Multiple holds throughout game
- **UI Tests** (`src/ui/HoldDisplay.test.tsx`):
  - Component renders with no piece
  - Component renders with piece held
  - Correct piece displayed
  - Visual state updates on hold
  - Disabled state shown when unavailable
- **Coverage**: Target 95%+ on hold logic

## Definition of Done
- [ ] HoldSystem class implemented
- [ ] Hold slot stores single piece
- [ ] Empty slot behavior working
- [ ] Swap behavior working correctly
- [ ] Usage restriction enforced (once per piece)
- [ ] Hold key mapped and functional
- [ ] HoldDisplay UI component created
- [ ] Hold display positioned in layout
- [ ] Visual indication of held piece
- [ ] Visual indication when hold unavailable
- [ ] All unit tests pass
- [ ] Integration tests verify hold cycle
- [ ] UI tests verify component behavior
- [ ] Manual gameplay testing confirms UX
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
