# Story 22: Logo & Branding

## Goal
Add a Tetris-style logo variant that complies with Tetris brand guidelines to give the game professional presentation.

## Dependencies
- Story 01: Project Bootstrap (need base project)

## Acceptance Criteria
1. **Logo Requirements**:
   - Use Tetris logo variant per guidelines
   - Reference: https://tetris.wiki/Tetris_logo
   - Follow guideline rules for modifications
   - Respect trademark and brand guidelines
2. **Logo Placement**:
   - Displayed prominently in game UI
   - Typical locations: title screen, game header, or menu
   - Properly sized and positioned
   - Does not obstruct gameplay
3. **Attribution**:
   - Include appropriate attribution if required
   - Link to Tetris guidelines or source
   - Credit in about/info section
   - Comply with licensing requirements
4. **Visual Quality**:
   - High-resolution logo asset
   - Scales well on different screen sizes
   - Maintains aspect ratio
   - Clear and professional appearance
5. **File Management**:
   - Logo stored in appropriate assets directory
   - Multiple sizes or formats if needed
   - Properly optimized for web (SVG preferred)

## Implementation Tasks
1. Research Tetris logo guidelines:
   - Review https://tetris.wiki/Tetris_logo
   - Understand permitted modifications
   - Note any attribution requirements
   - Ensure compliance with brand standards
2. Obtain or create logo asset:
   - Download logo from official source if available
   - Create compliant variant if needed
   - Prepare in appropriate format (SVG, PNG)
   - Ensure high quality and resolution
3. Add logo to project:
   - Create `src/assets/images/` directory if not exists
   - Add logo file(s) to assets
   - Name appropriately (e.g., `tetris-logo.svg`)
4. Create logo component (if React):
   - `src/ui/Logo.tsx` component
   - Accept size/scale props
   - Render logo image
   - Handle responsive sizing
5. Integrate into UI:
   - Add to title screen or main menu
   - OR add to game header during gameplay
   - Position with CSS/styling
   - Ensure proper z-index and layering
6. Add attribution:
   - Create `src/ui/AboutScreen.tsx` or info modal
   - Include attribution text
   - Link to source/guidelines
   - Credit original trademark holders
7. Update documentation:
   - Note logo source in README
   - Document any licensing considerations
   - Add to credits or acknowledgments

## Testing Requirements
- **Visual Tests**:
  - Logo displays correctly
  - Logo is clearly visible and readable
  - Logo scales appropriately on different screens
  - Logo maintains quality (no pixelation)
  - Logo positioned correctly in layout
- **Compliance Tests**:
  - Verify logo matches approved variant
  - Check modifications are within guidelines
  - Confirm attribution is present
  - Review licensing requirements met
- **Responsiveness Tests**:
  - Test on mobile screen sizes
  - Test on tablet sizes
  - Test on desktop/large screens
  - Verify logo adapts to screen size
- **Integration Tests**:
  - Logo appears in expected locations
  - Logo doesn't break layout
  - Logo loads without errors
  - Asset file path resolves correctly
- **Accessibility Tests**:
  - Logo has alt text (if image tag)
  - Logo doesn't interfere with screen readers
  - Sufficient contrast with background

## Definition of Done
- [ ] Tetris logo guidelines reviewed and understood
- [ ] Compliant logo asset obtained or created
- [ ] Logo file added to project assets
- [ ] Logo component created (if needed)
- [ ] Logo displayed in appropriate location(s)
- [ ] Attribution included where required
- [ ] Logo is high quality and scales well
- [ ] Logo complies with brand guidelines
- [ ] Documentation updated with logo info
- [ ] Visual verification on multiple screen sizes
- [ ] No legal or trademark concerns
- [ ] Changes merged to main branch

## Notes
- This is primarily a visual/branding story
- Focus on compliance and quality
- Consult legal resources if uncertain about usage rights
- May need to create custom variant within guidelines
- Consider placeholder if official logo not available
