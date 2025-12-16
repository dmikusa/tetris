# Story 16: Colors & Rendering

## Goal
Apply proper Tetris guideline colors to all tetrominoes and improve piece rendering with consistent, polished graphics.

## Dependencies
- Story 07: Render Playfield (need rendering system)
- Story 09: Spawn Piece (need pieces to render)

## Acceptance Criteria
1. **Color Specification**:
   - **I**: Light blue/cyan (#00F0F0 or similar)
   - **O**: Yellow (#F0F000 or similar)
   - **T**: Purple/Magenta (#A000F0 or similar)
   - **S**: Green (#00F000 or similar)
   - **Z**: Red (#F00000 or similar)
   - **J**: Blue (#0000F0 or similar)
   - **L**: Orange (#F0A000 or similar)
2. **Piece Rendering**:
   - Active piece (currently falling) renders with full color
   - Locked pieces in matrix render with same colors
   - Colors are vibrant and clearly distinguishable
   - Consistent rendering between active and locked pieces
3. **Visual Polish**:
   - Each mino (individual block) has defined borders
   - Optional: Subtle gradient or shading for depth
   - Optional: Border/outline to separate minos
   - Clean, professional appearance
4. **Rendering System**:
   - Efficient rendering (not redrawing unnecessarily)
   - Colors stored in centralized constants
   - Easy to modify colors for themes (future enhancement)
5. **Matrix Rendering**:
   - Locked pieces display in correct colors
   - Empty cells clearly distinguished from filled
   - No color bleeding or artifacts
   - Maintains 60fps with full colored matrix

## Implementation Tasks
1. Update `src/model/colors.ts` (from Story 06):
   - Define precise hex color values for each tetromino
   - Export as constant map or object
   - Add TypeScript types for color values
2. Create `src/game/rendering/PieceRenderer.ts`:
   - Export `PieceRenderer` class
   - Method: `renderPiece(piece, position, alpha)` draws piece
   - Method: `renderMino(x, y, color, alpha)` draws single block
   - Method: `clearPiece(piece, position)` erases piece
3. Implement mino rendering:
   - Use Phaser Graphics or Sprites
   - Draw filled rectangle for mino body
   - Draw border/outline for definition
   - Optional: Add gradient or lighting effect
   - Support alpha transparency for ghost piece (Story 19)
4. Update GameScene to use colors:
   - Import color constants
   - Pass colors to piece rendering
   - Render active piece with correct color
   - Render matrix with correct colors for locked pieces
5. Implement matrix rendering:
   - Iterate through playfield matrix
   - For each non-empty cell, render mino with appropriate color
   - Update only changed cells for efficiency
   - Use Phaser render groups for optimization
6. Add rendering optimization:
   - Use Phaser containers for pieces
   - Layer system: background, locked pieces, active piece, UI
   - Only redraw when state changes
   - Consider using render textures for static parts
7. Optional: Create sprite-based rendering:
   - Generate or load sprite sheets for minos
   - Use sprites instead of graphics for better performance
   - Apply tint for different colors

## Testing Requirements
- **Unit Tests** (`src/game/rendering/PieceRenderer.test.ts`):
  - **Color Tests**:
    - Verify each piece type maps to correct color
    - Color values are valid hex codes
    - All 7 pieces have colors defined
  - **Rendering Tests**:
    - Piece renders at correct position
    - Mino count matches piece type (all have 4)
    - Rendering with different alphas works
- **Visual Tests**:
  - **Manual Verification**:
    - Spawn each piece type and verify color
    - Lock pieces and verify colors persist
    - Build stack with all 7 colors
    - Verify colors are clearly distinguishable
    - Check rendering quality (no jagged edges, color bleeding)
  - **Screenshot Comparison**:
    - Capture each piece type
    - Compare against reference images
    - Verify consistency
- **Performance Tests**:
  - Full matrix (200 cells) renders at 60fps
  - No frame drops during gameplay
  - Rendering doesn't impact game logic timing
- **Integration Tests**:
  - Colors work with rotation
  - Colors work with collision
  - Colors work with line clear
  - Colors persist correctly in matrix
- **Coverage**: Target 90%+ on rendering code

## Definition of Done
- [ ] Color constants defined for all 7 pieces
- [ ] Colors match Tetris guideline specification
- [ ] PieceRenderer class implemented
- [ ] Active pieces render with correct colors
- [ ] Locked pieces in matrix render with correct colors
- [ ] Minos have visible borders/outlines
- [ ] Rendering is performant (60fps)
- [ ] Visual polish applied (gradients, shadows optional)
- [ ] All unit tests pass
- [ ] Visual verification completed for all piece types
- [ ] Performance verified with full matrix
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
