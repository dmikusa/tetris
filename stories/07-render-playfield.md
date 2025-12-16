# Story 07: Render Playfield

## Goal
Create a Phaser scene that renders the 10x20 visible game matrix with proper styling and responsive sizing, serving as the View layer in MVC.

## Dependencies
- Story 06: Core Model (need type definitions and constants)

## Acceptance Criteria
1. **Phaser Scene**:
   - Create `src/game/scenes/GameScene.ts` that extends `Phaser.Scene`
   - Scene is registered and loads when game starts
   - Scene key is defined (e.g., 'GameScene')
2. **Playfield Rendering**:
   - 10x20 grid of cells visible on screen
   - Each cell is clearly delineated with borders or grid lines
   - Grid centered in the game canvas
   - Empty cells have a distinct appearance (background color or subtle fill)
3. **Visual Styling**:
   - Cell borders visible to distinguish individual spaces
   - Background contrasts with cells for visibility
   - Optional: subtle 21st row sliver visible at top (as per specification)
   - Professional appearance matching Tetris aesthetic
4. **Responsive Sizing**:
   - Cell size calculated based on available screen space
   - Grid maintains proper aspect ratio
   - Playfield scales appropriately on window resize
   - Minimum viable cell size maintained for small screens
5. **Buffer Zone Handling**:
   - 20 buffer rows exist in data model but are not rendered
   - Only rows 1-20 (visible playfield) are drawn
   - Optional: show a sliver of row 21 if screen space allows
6. **Performance**:
   - Grid renders without noticeable lag
   - Smooth 60fps frame rate maintained
   - Efficient rendering approach (not redrawing every frame unnecessarily)

## Implementation Tasks
1. Create `src/game/scenes/` directory structure
2. Create `GameScene.ts`:
   - Extend `Phaser.Scene`
   - Implement `create()` method for initialization
   - Implement `update()` method (even if empty initially)
3. Create playfield container or group in scene
4. Calculate cell size based on canvas dimensions:
   - Account for FIELD_WIDTH (10) and FIELD_VISIBLE_HEIGHT (20)
   - Leave space for UI elements (score, next pieces, etc.)
   - Ensure cells are square
5. Render grid cells:
   - Use Phaser Graphics or Sprites
   - Draw each cell with border
   - Apply background color for empty cells
6. Update game config to use GameScene:
   - Register scene in Phaser config
   - Set as default/boot scene
7. Add visual constants:
   - Cell size
   - Grid line width
   - Colors for grid and background
8. Optional: Add subtle visual polish:
   - Grid line glow or depth effect
   - Gradient backgrounds
   - Playfield frame/border

## Testing Requirements
- **Visual Tests** (`src/game/scenes/GameScene.test.ts`):
  - Scene creates without errors
  - Scene has expected properties and methods
  - Grid container is created
  - Correct number of cell sprites/graphics created (200 for 10x20)
- **Rendering Tests**:
  - Start game and verify grid appears
  - Count visible cells (should be 10 across, 20 down)
  - Verify cell borders are visible
  - Check cells are properly aligned (no gaps or overlaps)
  - Test on different screen sizes/resolutions
- **Integration Tests**:
  - Game boots and loads GameScene successfully
  - No console errors when scene loads
  - Scene persists and doesn't crash
  - Frame rate remains stable (monitor FPS)
- **Snapshot Tests** (if using visual regression testing):
  - Capture rendered playfield appearance
  - Compare against baseline

## Definition of Done
- [ ] GameScene class created and properly structured
- [ ] 10x20 grid renders correctly on screen
- [ ] Cells have visible borders and consistent sizing
- [ ] Grid is centered and properly positioned
- [ ] Buffer rows exist in model but are not rendered
- [ ] Rendering is performant (60fps)
- [ ] Scene is responsive to different screen sizes
- [ ] Unit tests pass for scene creation
- [ ] Visual verification completed
- [ ] Code passes lint and format checks
- [ ] TypeScript compilation has no errors
- [ ] Changes merged to main branch
