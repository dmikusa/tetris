# Story 04: Test Stack

## Goal
Configure Vitest as the test runner with React Testing Library for component testing, including code coverage reporting with an 80% threshold.

## Dependencies
- Story 01: Project Bootstrap (need base project structure)

## Acceptance Criteria
1. **Vitest Configuration**:
   - `vitest.config.ts` file exists with proper setup
   - Configured to use `jsdom` environment for DOM testing
   - Coverage provider configured (c8 or istanbul)
   - Coverage thresholds set to 80% for branches, functions, lines, statements
2. **Testing Libraries Installed**:
   - `vitest` - test runner
   - `@testing-library/react` - React component testing utilities
   - `@testing-library/jest-dom` - custom matchers for DOM
   - `@testing-library/user-event` - user interaction simulation
   - `jsdom` - DOM implementation for Node
   - `@vitest/ui` - optional UI for test results
3. **NPM Scripts**: `package.json` includes:
   - `"test"`: runs tests in watch mode for development
   - `"test:run"`: runs tests once (for CI)
   - `"test:coverage"`: runs tests with coverage report
   - `"test:ui"`: opens Vitest UI (optional)
4. **Test Setup**: 
   - `src/test/setup.ts` file with global test configuration
   - Imports `@testing-library/jest-dom` for custom matchers
   - Any global mocks or test utilities
5. **Example Tests**:
   - At least one component test demonstrating RTL usage
   - Test file uses `.test.tsx` or `.spec.tsx` extension
   - Example covers rendering, user interaction, and assertions
6. **Coverage Output**:
   - Running tests generates coverage report in `coverage/` directory
   - Coverage report shows percentage for all categories
   - HTML coverage report available for viewing
7. **CI Integration**: Update CI workflow to run `npm run test:coverage`

## Implementation Tasks
1. Install testing dependencies:
   ```
   npm install -D vitest @vitest/ui jsdom
   npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```
2. Create `vitest.config.ts`:
   - Import and merge with Vite config
   - Set `test.environment` to `jsdom`
   - Configure `test.setupFiles` pointing to setup file
   - Set `test.coverage.provider` to `c8` or `istanbul`
   - Set `test.coverage.thresholds` to 80% for all metrics
   - Configure `test.coverage.exclude` for config files, tests, etc.
3. Create `src/test/setup.ts`:
   - Import `@testing-library/jest-dom`
   - Add any global test utilities
4. Add test scripts to `package.json`
5. Create example test file `src/App.test.tsx`:
   - Test that App component renders
   - Test basic interaction (if applicable)
   - Demonstrate proper RTL patterns
6. Add `coverage/` to `.gitignore`
7. Update CI workflow to run tests with coverage
8. Document testing approach in README or TESTING.md

## Testing Requirements
- **Manual Verification**:
  - Run `npm test` - tests run in watch mode
  - Run `npm run test:coverage` - generates coverage report
  - Open `coverage/index.html` - view detailed coverage
  - Verify coverage meets 80% threshold (or adjust if starting lower)
- **Example Test Coverage**:
  - Write test for default React component from template
  - Test should check that component renders without crashing
  - Test should verify expected content appears in DOM
  - Tests should pass with `npm run test:run`
- **CI Validation**:
  - Verify CI runs tests and fails if tests fail
  - Verify CI reports coverage metrics

## Definition of Done
- [ ] Vitest configuration file created with coverage thresholds
- [ ] All testing dependencies installed
- [ ] Test setup file configured
- [ ] NPM test scripts added
- [ ] At least one example component test passes
- [ ] Coverage report generates successfully
- [ ] Coverage meets or baseline is documented
- [ ] `.gitignore` excludes coverage directory
- [ ] CI workflow runs tests with coverage
- [ ] Testing documentation added to README
- [ ] Changes merged to main branch
