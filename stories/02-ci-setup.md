# Story 02: CI Setup

## Goal
Establish a GitHub Actions CI pipeline that automatically validates code quality, type safety, and test coverage on every pull request.

## Dependencies
- Story 01: Project Bootstrap (need base project structure)

## Acceptance Criteria
1. **Workflow File**: `.github/workflows/ci.yml` exists and is properly configured
2. **Trigger Configuration**: Workflow runs automatically on:
   - Pull request creation
   - Pull request updates (new commits pushed)
   - Optionally on push to `main` branch
3. **Build Steps**: CI workflow executes in order:
   - Checkout code
   - Setup Node.js (specify version, e.g., 18.x or 20.x)
   - Install dependencies with `npm ci` (clean install)
   - Run type checking with `npm run type-check`
   - Run tests with coverage with `npm test -- --coverage`
   - Run linter (once Story 03 is complete)
4. **Failure Handling**: 
   - Workflow fails and blocks merge if any step fails
   - Error messages are visible in GitHub PR checks
5. **Type-Check Script**: `package.json` includes a `type-check` script that runs `tsc --noEmit`
6. **Performance**: Workflow completes in reasonable time (under 5 minutes for base template)

## Implementation Tasks
1. Create `.github/workflows/` directory structure
2. Create `ci.yml` workflow file with:
   - Name: "CI"
   - Trigger: `pull_request` and optionally `push` to main
   - Job: `build-and-test`
   - Steps: checkout, setup-node, npm ci, type-check, test
3. Add `type-check` script to `package.json`: `"type-check": "tsc --noEmit"`
4. Verify `tsconfig.json` is properly configured for type checking
5. Test workflow by:
   - Creating a test branch
   - Making a trivial change
   - Opening a PR and verifying CI runs
   - Checking that all steps pass with green checkmarks

## Testing Requirements
- **CI Validation**:
  - Open a test PR and verify workflow triggers
  - Confirm all steps show in GitHub Actions UI
  - Verify workflow passes with green status
  - Test failure scenario: introduce a TypeScript error and confirm workflow fails
  - Test failure scenario: introduce a failing test and confirm workflow fails
- **Manual Verification**:
  - Check that `npm run type-check` runs locally without errors
  - Verify workflow logs are readable and helpful for debugging

## Definition of Done
- [ ] `.github/workflows/ci.yml` file exists with complete configuration
- [ ] `type-check` script added to `package.json`
- [ ] Workflow runs on test PR and all steps pass
- [ ] Workflow correctly fails when errors are introduced
- [ ] GitHub PR shows status checks clearly
- [ ] Documentation updated (README or CONTRIBUTING.md) mentioning CI pipeline
- [ ] Changes merged to main branch
