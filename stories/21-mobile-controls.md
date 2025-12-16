# Story 21: Mobile Controls

## Goal
Implement touch controls with swipe gesture recognition for mobile and tablet devices, providing an accessible control scheme for touchscreen gameplay.

## Dependencies
- Story 12: Desktop Controls (need input controller framework)

## Acceptance Criteria
1. **Gesture Mappings**:
   - **Swipe Left**: Move piece left
   - **Swipe Right**: Move piece right
   - **Swipe Down**: Soft drop (fast downward movement)
   - **Swipe Up**: Hard drop (instant drop and lock)
   - **Tap**: Rotate clockwise
   - **Two-finger tap** (optional): Rotate counter-clockwise
2. **Gesture Recognition**:
   - Detect swipe direction based on touch movement
   - Minimum swipe distance threshold (e.g., 30-50px)
   - Distinguish between tap and swipe
   - Fast, responsive detection (< 50ms)
3. **Touch Responsiveness**:
   - Immediate feedback on gesture
   - No lag or delayed response
   - Works on various screen sizes
   - Supports multi-touch for simultaneous actions
4. **Device Detection**:
   - Automatically detect touch capability
   - Use touch controls on mobile/tablet
   - Fall back to keyboard on desktop
   - Or allow manual control scheme selection
5. **Visual Feedback**:
   - Touch point indicator (optional)
   - Gesture trail or animation (optional)
   - Visual confirmation of recognized gesture
6. **Usability**:
   - Controls feel natural and intuitive
   - Minimal accidental inputs
   - Comfortable for extended play
   - Works in portrait and landscape

## Implementation Tasks
1. Create `src/controller/TouchController.ts`:
   - Export `TouchController` class
   - Manage touch event listeners
   - Detect and classify gestures
   - Translate gestures to game actions
2. Implement touch event handling:
   - Listen to `touchstart`, `touchmove`, `touchend` events
   - Track touch positions and timing
   - Calculate delta between start and end positions
3. Implement gesture recognition:
   - **Swipe Detection**:
     - Track touch start position
     - Calculate distance and direction on touchend
     - Determine if horizontal or vertical
     - Minimum threshold for valid swipe (30-50px)
     - Maximum time for swipe (300-500ms)
   - **Tap Detection**:
     - Touch duration < 200ms
     - Minimal movement (< 10px)
     - Trigger rotation action
   - **Direction Calculation**:
     - Compare deltaX and deltaY
     - Use angle or ratio to determine primary direction
4. Integrate with GameController:
   - Reuse existing action methods (moveLeft, moveRight, etc.)
   - Map gestures to same actions as keyboard
   - Ensure consistent behavior across input methods
5. Implement device detection:
   - Check for touch capability: `'ontouchstart' in window`
   - Enable TouchController on touch devices
   - Keep KeyboardController available as fallback
   - Allow switching between control schemes
6. Add visual feedback (optional):
   - Render touch point circles
   - Show swipe trail
   - Highlight recognized gesture
   - Use Phaser graphics or CSS overlays
7. Handle edge cases:
   - Prevent page scrolling on touch
   - Call `preventDefault()` on touch events
   - Handle rapid successive gestures
   - Support landscape and portrait orientations
8. Add configuration:
   - Swipe sensitivity settings
   - Gesture thresholds configurable
   - Enable/disable specific gestures

## Testing Requirements
- **Unit Tests** (`src/controller/TouchController.test.ts`):
  - **Swipe Tests**:
    - Left swipe calls moveLeft()
    - Right swipe calls moveRight()
    - Up swipe calls hardDrop()
    - Down swipe calls softDrop()
    - Diagonal swipe resolves to primary direction
  - **Tap Tests**:
    - Tap triggers rotation
    - Quick tap vs long press distinction
  - **Threshold Tests**:
    - Short swipe ignored (below threshold)
    - Slow gesture not recognized as swipe
    - Valid swipe detected correctly
  - **Multi-Touch Tests**:
    - Two-finger tap recognized
    - Simultaneous gestures handled
- **Integration Tests**:
  - Simulate touch events on game canvas
  - Verify pieces respond to gestures
  - Test complete gesture sequences
  - Verify gesture-driven gameplay works
- **Device Tests**:
  - Test on actual mobile devices (iOS, Android)
  - Test on tablets
  - Test various screen sizes
  - Test portrait and landscape modes
- **Usability Tests**:
  - Play several games using only touch
  - Verify controls feel responsive
  - Check for accidental inputs
  - Confirm gestures are natural
- **Coverage**: Target 90%+ on touch controller logic

## Definition of Done
- [ ] TouchController class implemented
- [ ] All swipe gestures mapped correctly
- [ ] Tap gesture for rotation working
- [ ] Gesture recognition accurate and fast
- [ ] Works on mobile and tablet devices
- [ ] No conflicts with page scrolling
- [ ] Visual feedback implemented (optional)
- [ ] Device detection and auto-enable working
- [ ] Fallback to keyboard on non-touch devices
- [ ] All unit tests pass
- [ ] Integration tests verify gesture handling
- [ ] Tested on real mobile devices
- [ ] Usability verified through gameplay
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
