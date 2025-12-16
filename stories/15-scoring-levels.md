# Story 15: Scoring & Levels

## Goal
Implement the scoring system per Tetris guideline and level progression that increases difficulty by accelerating gravity.

## Dependencies
- Story 14: Line Clear (need clear detection and types)

## Acceptance Criteria
1. **Scoring System**:
   - Points awarded based on line clears:
     - **Single**: 100 × level points
     - **Double**: 300 × level points
     - **Triple**: 500 × level points
     - **Tetris**: 800 × level points
   - Score accumulates throughout game
   - Score displayed in UI
2. **Level System**:
   - Game starts at level 1 (or configurable start level)
   - Level increases based on lines cleared
   - Common progression: level up every 10 lines
   - Level displayed in UI
   - Maximum level 20 (matching gravity table)
3. **Gravity Speed Adjustment**:
   - Gravity speed increases with level
   - Use formula or lookup table from specification
   - Level 1: ~0.8s per row
   - Level 20: very fast (0.027s per row at 36.6G)
   - Gravity updates immediately when level changes
4. **Level Progression**:
   - Starting level option (1, 5, 10, etc.)
   - Lines required per level configurable
   - Level cannot decrease
5. **UI Display**:
   - Current score visible
   - Current level visible
   - Lines cleared visible
   - Lines until next level (optional)
6. **Soft Drop Bonus** (Optional):
   - Award 1 point per cell of soft drop
   - Encourages faster play
7. **Hard Drop Bonus** (Optional):
   - Award 2 points per cell of hard drop
   - Encourages skilled play

## Implementation Tasks
1. Create `src/controller/ScoringSystem.ts`:
   - Export `ScoringSystem` class
   - Method: `calculateScore(linesCleared, level)` returns points
   - Method: `addScore(points)` updates total
   - Method: `getScore()` returns current score
2. Implement scoring calculation:
   - Switch or lookup based on lines cleared (1-4)
   - Multiply base value by current level
   - Return calculated points
3. Create `src/controller/LevelSystem.ts`:
   - Export `LevelSystem` class
   - Method: `addLines(count)` increments line count
   - Method: `getCurrentLevel()` returns level
   - Method: `checkLevelUp()` determines if level should increase
   - Method: `setStartLevel(level)` configures initial level
4. Implement level progression:
   - Track total lines cleared
   - Check if threshold reached (e.g., every 10 lines)
   - Increment level when threshold crossed
   - Emit event or callback on level up
5. Integrate with GameController:
   - After line clear, calculate score
   - Add score to total
   - Add cleared lines to line count
   - Check for level up
   - Update gravity speed if level increased
6. Update game state:
   - Add `score` field
   - Add `level` field
   - Add `linesCleared` field
7. Create UI components (React):
   - Score display component
   - Level display component
   - Lines cleared display
   - Position in game layout
8. Update GravitySystem (from Story 10):
   - Add `setLevel(level)` method if not already present
   - Update gravity interval based on new level
9. Optional: Add drop bonuses:
   - Track soft drop distance
   - Track hard drop distance
   - Award bonus points accordingly

## Testing Requirements
- **Unit Tests** (`src/controller/ScoringSystem.test.ts`):
  - **Score Calculation Tests**:
    - Single at level 1 = 100 points
    - Double at level 1 = 300 points
    - Triple at level 1 = 500 points
    - Tetris at level 1 = 800 points
    - Single at level 5 = 500 points
    - Tetris at level 10 = 8000 points
  - **Score Accumulation Tests**:
    - Multiple clears accumulate correctly
    - Score never decreases
- **Unit Tests** (`src/controller/LevelSystem.test.ts`):
  - **Level Up Tests**:
    - Level starts at 1
    - Level increases after 10 lines
    - Level increases again after 20 lines
    - Level progression follows rules
  - **Starting Level Tests**:
    - Can start at level 5
    - Lines required adjusted for start level
  - **Max Level Tests**:
    - Level caps at 20 (or configured max)
- **Integration Tests**:
  - Clear lines and verify score updates
  - Clear enough lines and verify level up
  - Verify gravity speed increases with level
  - Test complete game from level 1 to level 5+
- **UI Tests**:
  - Score displays and updates correctly
  - Level displays and updates correctly
  - Lines cleared displays correctly
- **Coverage**: Target 95%+ on scoring and level logic

## Definition of Done
- [ ] ScoringSystem class implemented
- [ ] Score calculation matches specification
- [ ] LevelSystem class implemented
- [ ] Level progression based on lines cleared
- [ ] Gravity speed updates with level
- [ ] Score, level, lines tracked in game state
- [ ] UI components display score and level
- [ ] Starting level configurable
- [ ] Optional drop bonuses implemented
- [ ] All unit tests pass
- [ ] Integration tests verify progression
- [ ] UI displays update correctly during gameplay
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target
- [ ] Changes merged to main branch
