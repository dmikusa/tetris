# Story 08: Random Bag Generator

## Goal
Implement the "7-bag" Random Generator as specified in the Tetris guideline, which ensures fair piece distribution and allows for deterministic testing.

## Dependencies
- Story 06: Core Model (need TetrominoType enum)

## Acceptance Criteria
1. **Bag Implementation**:
   - Class or module: `src/model/PieceBag.ts`
   - Contains exactly one of each of the 7 tetrominoes per bag
   - Shuffles pieces randomly when bag is created
   - Deals out pieces one at a time
   - Automatically refills and shuffles when empty
2. **Random Number Generation**:
   - Uses seedable RNG for deterministic testing
   - Default: uses Math.random() for production
   - Test mode: accepts seed to produce predictable sequences
   - Clean interface to inject RNG strategy
3. **API Design**:
   - `next()`: Returns next tetromino from bag
   - `peek(n)`: Look ahead at next n pieces without consuming
   - `reset(seed?)`: Clear and refill bag with optional seed
   - Internal state properly encapsulated
4. **Distribution Guarantees**:
   - Every 7 pieces includes one of each type
   - No piece appears twice in same bag
   - Pieces well-shuffled (not always same order)
   - Long-term distribution is even (14.28% each)
5. **Edge Cases**:
   - Bag correctly refills after 7th piece
   - Multiple consecutive next() calls work correctly
   - Peeking beyond current bag shows pieces from next bag
   - Resetting clears internal state properly

## Implementation Tasks
1. Create `src/model/PieceBag.ts`:
   - Export `PieceBag` class
   - Constructor accepts optional seed parameter
2. Implement core methods:
   - `next()`: Pop piece from bag, refill if empty
   - `peek(n = 1)`: Return array of next n pieces
   - Private `refillBag()`: Create new shuffled bag
   - Private `shuffle()`: Fisher-Yates or similar algorithm
3. Create RNG abstraction:
   - Interface for random number generation
   - Default implementation using Math.random()
   - Seedable implementation for tests (e.g., using seedrandom library)
4. Add state management:
   - Current bag array
   - Current index/position in bag
   - RNG instance
5. Add validation:
   - Ensure all 7 pieces in each bag
   - Verify no duplicates in single bag
6. Optional optimization:
   - Pre-generate next bag while current bag is being consumed
   - Lazy initialization

## Testing Requirements
- **Unit Tests** (`src/model/PieceBag.test.ts`):
  - **Distribution Test**: 
    - Generate 700 pieces (100 complete bags)
    - Count occurrences of each type
    - Verify each type appears exactly 100 times
  - **Bag Integrity Test**:
    - Take 7 pieces
    - Verify all 7 types appear exactly once
    - Repeat for multiple bags
  - **Refill Test**:
    - Consume exactly 7 pieces
    - Verify 8th piece comes from new bag
    - Verify new bag also has all 7 types
  - **Peek Test**:
    - Peek at next 5 pieces
    - Call next() 5 times
    - Verify pieces match peeked sequence
  - **Seed Test**:
    - Create two bags with same seed
    - Verify both produce identical sequences
    - Create bag with different seed
    - Verify sequence is different
  - **Edge Cases**:
    - Peek beyond current bag (e.g., peek 14 pieces)
    - Reset after consuming some pieces
    - Multiple consecutive resets
- **Integration Tests**:
  - Use bag in actual game context
  - Verify piece spawning uses bag correctly
- **Coverage**: Aim for 100% coverage on PieceBag class

## Definition of Done
- [ ] PieceBag class implemented with complete API
- [ ] Seedable RNG for deterministic testing
- [ ] All 7 pieces guaranteed per bag
- [ ] Proper shuffling algorithm implemented
- [ ] Bag refills automatically when empty
- [ ] Peek functionality works correctly
- [ ] All unit tests pass
- [ ] Distribution tests verify fairness
- [ ] Code has JSDoc documentation
- [ ] TypeScript compilation passes
- [ ] Code passes lint and format checks
- [ ] Test coverage meets target (100%)
- [ ] Changes merged to main branch
