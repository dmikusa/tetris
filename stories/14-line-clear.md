# Story 14: Line Clear

## Goal
Implement line clearing logic that detects completed rows, removes them, and collapses the stack with proper gravity, supporting single through quad (Tetris) clears.

## Dependencies
- Story 11: Collision & Lock Delay (need piece locking in matrix)

## Acceptance Criteria
1. **Line Detection**:
   - After piece locks, scan all rows for completion
   - Complete row: all 10 cells are filled
   - Detect multiple simultaneous clears (1-4 lines)
   - Only scan rows that could be affected by locked piece
2. **Clear Types**:
   - **Single**: 1 line cleared
   - **Double**: 2 lines cleared simultaneously
   - **Triple**: 3 lines cleared simultaneously
   - **Tetris**: 4 lines cleared simultaneously (most points)
3. **Row Removal**:
   - Cleared rows completely removed from matrix
   - No visual artifacts or partial cells remain
   - Removal is clean and predictable
4. **Gravity/Collapse**:
   - Rows above cleared lines fall down to fill gaps
   - All rows fall by correct number of spaces
   - Multiple clears collapse correctly (e.g., rows between cleared lines)
   - Locked pieces maintain their shape during collapse
   - No orphaned cells or incorrect positions after collapse
5. **Animation** (Optional for this story):
   - Brief visual feedback when line clears
   - Can be simple flash or fade
   - Animation doesn't block gameplay
6. **Line Count Tracking**:
   - Total lines cleared tracked in game state
   - Used for level progression (Story 15)
   - Displayed in UI

## Implementation Tasks
1. Create `src/controller/LineClearSystem.ts`:
   - Export `LineClearSystem` class
   - Method: `checkAndClearLines(matrix)` returns number cleared
   - Method: `isRowComplete(matrix, rowIndex)` checks single row
   - Method: `removeCompletedRows(matrix)` removes and collapses
2. Implement line detection:
   - After piece locks, scan relevant rows
   - Optimization: only check rows occupied by locked piece (4 rows max)
   - Build list of completed row indices
3. Implement row removal:
   - Remove completed rows from matrix
   - Insert empty rows at top to maintain height
   - Ensure matrix remains 10x40 after operation
4. Implement gravity/collapse:
   - For each cleared row:
     - Copy all rows above down by one
     - Repeat for multiple clears
   - Alternative efficient approach:
     - Build new matrix from non-cleared rows
     - Add empty rows at top
5. Integrate with GameController:
   - Call `checkAndClearLines()` after piece locks
   - Get number of lines cleared
   - Emit event or callback with clear type
   - Update line count in game state
   - Trigger scoring (Story 15)
6. Add line tracking:
   - Add `totalLinesCleared` to game state
   - Increment on each clear
7. Optional: Add clear animation:
   - Flash or highlight cleared rows
   - Brief delay before removal
   - Visual polish for player feedback

## Testing Requirements
- **Unit Tests** (`src/controller/LineClearSystem.test.ts`):
  - **Detection Tests**:
    - Empty row not detected as complete
    - Partial row not detected as complete
    - Complete row detected correctly
    - Multiple complete rows detected
  - **Single Clear Tests**:
    - Single bottom row clears correctly
    - Single middle row clears correctly
    - Single top row clears correctly
    - Rows above collapse down by one
  - **Multiple Clear Tests**:
    - Double clear: two adjacent rows
    - Triple clear: three adjacent rows
    - Tetris clear: four adjacent rows
    - Non-adjacent clears (e.g., rows 5 and 8)
  - **Collapse Tests**:
    - Stack collapses correct number of rows
    - Piece shapes maintained during collapse
    - Complex stack collapses correctly
    - Empty rows added at top
  - **Edge Cases**:
    - Clear row at top of stack
    - Clear with buffer zone pieces
    - Multiple clears with pieces between
    - Clear exactly at row 20 boundary
- **Integration Tests**:
  - Lock piece that completes line
  - Verify line clears and new piece spawns
  - Clear multiple lines in one lock
  - Build up complex stack and verify clears work
- **Visual Tests**:
  - Manually verify stack collapses correctly
  - No visual glitches or artifacts
  - Animation looks smooth (if implemented)
- **Coverage**: Target 95%+ on line clear logic

## Definition of Done
- [ ] LineClearSystem class implemented
- [ ] Row completion detection working
- [ ] Single, double, triple, Tetris clears supported
- [ ] Row removal removes correct rows
- [ ] Stack collapses properly with gravity
- [ ] No artifacts or orphaned cells after clear
- [ ] Line count tracked in game state
- [ ] Integrated with piece locking
- [ ] Optional animation implemented
- [ ] All unit tests pass
- [ ] Integration tests verify end-to-end flow
- [ ] Visual verification of collapse behavior
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
