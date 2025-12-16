# Story 17: Next Queue

## Goal
Display a preview of upcoming pieces to help players plan their moves, following Tetris guideline standards for the "Next Queue."

## Dependencies
- Story 08: Random Bag Generator (need piece queue)
- Story 07: Render Playfield (need rendering context)

## Acceptance Criteria
1. **Queue Display**:
   - Shows at least 3 upcoming pieces by default
   - Configurable to show up to 6 pieces
   - Positioned to the right or top of playfield
   - Next active piece displayed closest to playfield
2. **Piece Preview**:
   - Pieces shown in spawn orientation (rotation state 0)
   - Correct colors per piece type
   - Scaled appropriately for preview area
   - All 4 minos of each piece visible
3. **Visual Layout**:
   - "NEXT" label or heading
   - Pieces stacked vertically or arranged horizontally
   - Clear separation between pieces
   - Consistent spacing and alignment
   - Fits within game layout without overlap
4. **Data Binding**:
   - Queue updates when piece spawns
   - Uses PieceBag.peek() to look ahead
   - Real-time sync with actual piece sequence
   - No desync or incorrect preview
5. **Responsiveness**:
   - Scales with screen size
   - Readable on small screens
   - Maintains aspect ratio
   - Works in responsive layout

## Implementation Tasks
1. Create React component `src/ui/NextQueue.tsx`:
   - Accept props: `pieces` (array of TetrominoType)
   - Accept props: `count` (number of pieces to show, default 3)
   - Render heading "NEXT" or "Next Pieces"
2. Implement piece preview rendering:
   - For each piece in queue:
     - Get shape data for rotation state 0
     - Get color for piece type
     - Render miniature version of piece
     - Use consistent sizing (e.g., 20x20px per mino)
3. Create styled container:
   - Vertical stack of preview pieces
   - Use CSS Grid or Flexbox
   - Padding and spacing between pieces
   - Border or background to define area
4. Integrate with GameController:
   - Expose method `getNextPieces(count)` 
   - Use `pieceBag.peek(count)` internally
   - Update component when piece spawns
5. Position in layout:
   - Add to main game UI
   - Position right of playfield (typical)
   - Or above playfield for mobile
   - Ensure z-index layering correct
6. Add configuration option:
   - Allow changing number of previews (3-6)
   - Store in game settings
   - UI to adjust setting (optional)
7. Optional: Add visual polish:
   - Subtle drop shadow on preview pieces
   - Highlight next immediate piece
   - Smooth transition when queue updates
   - Border or frame around each piece

## Testing Requirements
- **Unit Tests** (`src/ui/NextQueue.test.tsx`):
  - **Rendering Tests**:
    - Component renders without crashing
    - Correct number of pieces displayed
    - Each piece shows 4 minos
    - Colors match piece types
  - **Data Tests**:
    - Correct pieces shown from bag
    - Order matches bag sequence
    - Updates when new data passed
  - **Configuration Tests**:
    - Shows 3 pieces by default
    - Can show 1, 4, 5, 6 pieces
    - Handles empty queue gracefully
- **Integration Tests**:
  - Spawn piece and verify queue updates
  - First queue piece becomes active piece
  - Queue stays synchronized with bag
  - Multiple spawns maintain correct preview
- **Visual Tests**:
  - Manually verify layout looks good
  - Check alignment and spacing
  - Verify colors are correct
  - Test on different screen sizes
  - Verify doesn't overlap playfield
- **Snapshot Tests**:
  - Capture rendered queue component
  - Compare against baseline
  - Detect unintended visual changes
- **Coverage**: Target 90%+ on component logic

## Definition of Done
- [ ] NextQueue React component created
- [ ] Displays 3+ upcoming pieces
- [ ] Pieces shown in spawn orientation
- [ ] Correct colors applied
- [ ] Positioned right or top of playfield
- [ ] Data synchronized with PieceBag
- [ ] Updates when pieces spawn
- [ ] Number of previews configurable
- [ ] Responsive layout works
- [ ] All unit tests pass
- [ ] Integration tests verify synchronization
- [ ] Visual verification on multiple screen sizes
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
