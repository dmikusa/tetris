# Story 03: Lint & Format

## Goal
Set up ESLint and Prettier with best-practice configurations to maintain consistent code quality and formatting across the project.

## Dependencies
- Story 01: Project Bootstrap (need base project structure)

## Acceptance Criteria
1. **ESLint Configuration**:
   - `.eslintrc.cjs` or `.eslintrc.json` file exists
   - Configured for TypeScript with React support
   - Uses recommended rule sets: `@typescript-eslint/recommended`, `react-hooks/recommended`
   - Includes Prettier integration to avoid conflicts
2. **Prettier Configuration**:
   - `.prettierrc` or `.prettierrc.json` file exists
   - Standard formatting rules configured (semi-colons, quotes, line width, etc.)
   - `.prettierignore` file excludes `dist/`, `node_modules/`, `coverage/`
3. **NPM Scripts**: `package.json` includes:
   - `"lint"`: runs ESLint on source files and reports errors
   - `"lint:fix"`: runs ESLint with auto-fix
   - `"format"`: runs Prettier on all source files with write
   - `"format:check"`: runs Prettier in check mode (no write)
4. **Dependencies**: Dev dependencies installed:
   - `eslint` and TypeScript ESLint packages
   - `prettier` and `eslint-config-prettier`
   - React ESLint plugins
5. **Editor Integration**: `.vscode/settings.json` configured for:
   - Format on save
   - ESLint auto-fix on save
6. **No Violations**: Running `npm run lint` on the bootstrapped project produces no errors
7. **CI Integration**: Update CI workflow from Story 02 to run `npm run lint` and `npm run format:check`

## Implementation Tasks
1. Install ESLint dependencies:
   ```
   npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   npm install -D eslint-plugin-react eslint-plugin-react-hooks
   ```
2. Install Prettier dependencies:
   ```
   npm install -D prettier eslint-config-prettier eslint-plugin-prettier
   ```
3. Create `.eslintrc.cjs` with:
   - Parser: `@typescript-eslint/parser`
   - Extends: recommended configs for TS and React
   - Rules: any project-specific overrides (minimal to start)
4. Create `.prettierrc` with:
   - `semi: true` (or false based on preference)
   - `singleQuote: true` (or false)
   - `printWidth: 100` (or 80)
   - `tabWidth: 2`
   - `trailingComma: "es5"`
5. Create `.prettierignore` to exclude build outputs
6. Add scripts to `package.json`
7. Create `.vscode/settings.json` with editor configuration
8. Run `npm run format` to format existing code
9. Run `npm run lint:fix` to auto-fix any ESLint issues
10. Update `.github/workflows/ci.yml` to include lint and format checks

## Testing Requirements
- **Manual Verification**:
  - Run `npm run lint` - should report zero errors
  - Run `npm run format:check` - should report no formatting issues
  - Introduce a formatting issue (e.g., inconsistent quotes) and verify `npm run format` fixes it
  - Introduce a lint error (e.g., unused variable) and verify `npm run lint` catches it
  - Verify VS Code shows inline ESLint errors and formats on save
- **CI Validation**:
  - Push code with lint errors and verify CI fails
  - Push properly formatted code and verify CI passes

## Definition of Done
- [ ] ESLint and Prettier configuration files exist
- [ ] All required dependencies installed
- [ ] NPM scripts for lint and format added
- [ ] VS Code settings configured
- [ ] Existing code passes all lint and format checks
- [ ] CI workflow updated to include lint and format validation
- [ ] Developer documentation updated with coding standards
- [ ] Changes merged to main branch
