# Story 23: Responsive Layout

## Goal
Ensure the game layout is fluid and adapts gracefully to different screen sizes, from mobile phones to large desktop monitors.

## Dependencies
- Story 07: Render Playfield (need base rendering)

## Acceptance Criteria
1. **Desktop Layout** (≥1024px):
   - Playfield centered with comfortable size
   - Score, level, lines displayed on sides or top
   - Next queue and hold display flanking playfield
   - All UI elements visible without scrolling
   - Optimal cell size for visibility
2. **Tablet Layout** (768px - 1023px):
   - Playfield scales appropriately
   - UI elements repositioned if needed
   - Touch controls work (if implemented)
   - Landscape and portrait support
   - No overlap or cutoff elements
3. **Mobile Layout** (< 768px):
   - Playfield fits on screen
   - UI elements stack or condense
   - Minimum playable cell size maintained
   - Portrait orientation preferred
   - Touch controls enabled
   - Score/stats visible but compact
4. **Fluid Scaling**:
   - Layout adapts smoothly to window resize
   - No hard-coded pixel dimensions where possible
   - Use viewport units, percentages, or flexbox/grid
   - Maintain aspect ratios
   - Phaser canvas resizes with container
5. **Minimum Size Support**:
   - Define minimum screen size (e.g., 320px width)
   - Game remains playable at minimum
   - Text remains readable
   - Controls remain usable
6. **Maximum Size Support**:
   - Cap playfield size on very large screens
   - Center layout with max-width
   - Prevent excessively large cells
   - Maintain visual balance

## Implementation Tasks
1. Update Phaser configuration:
   - Set canvas size to scale with container
   - Use Phaser scale manager
   - Configure scale mode (e.g., FIT, RESIZE)
   - Handle resize events
2. Implement responsive CSS:
   - Create `src/styles/responsive.css` or use CSS modules
   - Use CSS Grid or Flexbox for layout
   - Define breakpoints for mobile, tablet, desktop
   - Use media queries for different layouts
3. Update game container:
   - Make container responsive
   - Set max-width for playfield area
   - Center container on large screens
   - Add padding for smaller screens
4. Implement layout variants:
   - **Desktop**: Horizontal layout with side panels
   - **Tablet**: Slightly condensed, may stack some elements
   - **Mobile**: Vertical stacking, compact UI
5. Update UI components:
   - Score display responsive sizing
   - Next queue adapts position/orientation
   - Hold display repositions
   - Game over screen responsive
6. Calculate cell size dynamically:
   - Based on available screen height/width
   - Account for UI elements
   - Maintain square cells
   - Set minimum cell size (e.g., 20px)
   - Set maximum cell size (e.g., 40px)
7. Handle orientation changes:
   - Detect orientation change events
   - Recalculate layout on orientation change
   - Reload or reposition if necessary
8. Test on multiple devices:
   - Real device testing
   - Browser responsive design mode
   - Various resolutions and aspect ratios
9. Add viewport meta tag:
   - In `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - Prevents unwanted zooming
   - Ensures proper mobile rendering

## Testing Requirements
- **Responsive Tests** (manual and automated):
  - **Desktop Tests** (1920x1080, 1366x768):
    - Layout looks balanced
    - All elements visible
    - Comfortable cell size
    - No wasted space
  - **Tablet Tests** (1024x768, 768x1024):
    - Layout adapts appropriately
    - Landscape and portrait both work
    - Touch controls functional
    - No overlap
  - **Mobile Tests** (375x667, 360x640, 414x896):
    - Game playable
    - Minimum cell size maintained
    - All UI accessible
    - Portrait orientation optimal
    - Touch controls work well
  - **Resize Tests**:
    - Drag browser window to resize
    - Layout adapts smoothly
    - No breaking or glitches
    - Canvas resizes correctly
  - **Orientation Tests**:
    - Rotate device/emulator
    - Layout adjusts appropriately
    - Game remains playable
- **Browser Tests**:
  - Chrome DevTools device emulation
  - Firefox Responsive Design Mode
  - Safari responsive viewer
  - Test various viewport sizes
- **Real Device Tests**:
  - iOS device (iPhone, iPad)
  - Android device (phone, tablet)
  - Verify actual touch experience
  - Check performance on mobile hardware
- **Edge Cases**:
  - Very small screens (320px)
  - Very large screens (4K+)
  - Unusual aspect ratios
  - Split-screen/multi-window

## Definition of Done
- [ ] Phaser canvas scales responsively
- [ ] CSS media queries for breakpoints implemented
- [ ] Desktop layout tested and optimized
- [ ] Tablet layout tested (landscape and portrait)
- [ ] Mobile layout tested and playable
- [ ] Cell size calculates dynamically
- [ ] Minimum and maximum cell sizes enforced
- [ ] Viewport meta tag added
- [ ] Layout handles window resize smoothly
- [ ] Orientation changes handled
- [ ] Tested on real mobile devices
- [ ] Tested in browser responsive modes
- [ ] All UI elements accessible on all sizes
- [ ] Game remains playable on minimum size
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Changes merged to main branch
