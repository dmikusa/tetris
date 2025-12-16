# Story 19: Ghost Piece

## Goal
Implement a ghost piece preview that shows where the active piece will land, helping players make better placement decisions.

## Dependencies
- Story 11: Collision & Lock Delay (need collision detection)

## Acceptance Criteria
1. **Ghost Piece Display**:
   - Shows where active piece will land if dropped
   - Rendered at lowest valid position directly below active piece
   - Updates in real-time as piece moves or rotates
   - Visible at all times during gameplay (when option enabled)
2. **Visual Style**:
   - Semi-transparent version of active piece (30-50% alpha)
   - OR outline/border only (no fill)
   - Same shape and color as active piece
   - Clearly distinguishable from active and locked pieces
   - Does not obstruct view of playfield
3. **Non-Interactive**:
   - Ghost is visual only, not part of game logic
   - Does not collide with anything
   - Does not affect piece movement
   - Cannot be controlled directly
4. **Configuration**:
   - Option to enable/disable ghost piece
   - Setting persists across game sessions
   - Default: enabled (standard in modern Tetris)
5. **Performance**:
   - Ghost position calculated efficiently
   - Minimal performance impact
   - No lag or stutter when moving pieces
6. **Edge Cases**:
   - Ghost shows correctly on all piece types
   - Ghost updates during rotation
   - Ghost position correct near walls and stack
   - Ghost at spawn position if piece cannot drop

## Implementation Tasks
1. Create `src/controller/GhostPieceCalculator.ts`:
   - Export `GhostPieceCalculator` class
   - Method: `calculateGhostPosition(piece, matrix)` returns position
   - Algorithm: simulate hard drop without locking
2. Implement ghost position calculation:
   - Start from active piece current position
   - Move down one row at a time
   - Check collision at each position
   - Stop at first collision (position above is ghost position)
   - Return final valid position
3. Update GameController:
   - Add `getGhostPosition()` method
   - Call calculator with active piece and matrix
   - Cache result (recalculate on piece move/rotate)
4. Update GameScene rendering:
   - Get ghost position from controller
   - Render piece at ghost position with transparency
   - Use alpha value (0.3 to 0.5)
   - OR render outline/border only
   - Ensure ghost renders behind active piece (z-index)
5. Add configuration setting:
   - Add `ghostPieceEnabled` to game settings
   - Default to `true`
   - Load from localStorage or config
   - Provide UI to toggle (in settings or options menu)
6. Conditional rendering:
   - Only render ghost if setting is enabled
   - Skip calculation if disabled for performance
7. Optimize performance:
   - Cache ghost position until piece moves
   - Only recalculate on movement, rotation, or lock
   - Use efficient collision detection
8. Create `src/ui/SettingsPanel.tsx` (optional):
   - Toggle for ghost piece setting
   - Save preference

## Testing Requirements
- **Unit Tests** (`src/controller/GhostPieceCalculator.test.ts`):
  - **Position Tests**:
    - Ghost at bottom when field is empty
    - Ghost on stack when pieces are locked
    - Ghost updates when piece moves left/right
    - Ghost updates when piece rotates
  - **Edge Case Tests**:
    - Ghost at spawn when cannot drop (stack too high)
    - Ghost with piece at bottom (ghost = active position)
    - Ghost near walls calculates correctly
    - All 7 piece types calculate correctly
  - **Performance Tests**:
    - Calculation completes in < 1ms
    - Complex stack doesn't slow calculation
- **Integration Tests**:
  - Ghost displays during gameplay
  - Ghost follows active piece movements
  - Ghost position matches hard drop destination
  - Hard drop lands exactly on ghost position
- **Visual Tests**:
  - Manually verify ghost appearance
  - Ghost is visible but not obtrusive
  - Transparency level appropriate
  - All piece types show ghost correctly
  - Ghost updates smoothly
- **Configuration Tests**:
  - Setting can be toggled
  - Ghost disappears when disabled
  - Ghost reappears when enabled
  - Setting persists across sessions
- **Coverage**: Target 95%+ on calculator logic

## Definition of Done
- [ ] GhostPieceCalculator class implemented
- [ ] Ghost position calculated correctly
- [ ] Ghost renders semi-transparent or as outline
- [ ] Ghost updates in real-time with piece movement
- [ ] Ghost displays for all piece types and rotations
- [ ] Enable/disable setting implemented
- [ ] Default setting is enabled
- [ ] Ghost rendering is performant
- [ ] Visual appearance is clear and helpful
- [ ] All unit tests pass
- [ ] Integration tests verify behavior
- [ ] Visual verification completed
- [ ] Configuration setting works correctly
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
