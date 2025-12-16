# Story 01: Project Bootstrap

## Goal
Initialize the project using the Phaser React + TypeScript template as the foundation for the Tetris game.

## Dependencies
None - this is the first story.

## Acceptance Criteria
1. **Project Structure**: Repository contains all files from the `phaserjs/template-react-ts` template
2. **Package Management**: `package.json` is configured to use NPM (not yarn or pnpm)
3. **Application Name**: Project name in `package.json` is set to `TetrisChallenge`
4. **Development Server**: Running `npm install` followed by `npm run dev` successfully starts a local development server
5. **Application Loads**: Browser opens and displays the default Phaser template running without errors
6. **Build Process**: `npm run build` completes successfully and produces output in `dist/` directory
7. **Documentation**: README.md includes basic instructions for:
   - Installing dependencies (`npm install`)
   - Running development server (`npm run dev`)
   - Building for production (`npm run build`)

## Implementation Tasks
1. Clone or download the template from https://github.com/phaserjs/template-react-ts
2. Copy all template files into the repository root (excluding `.git` directory if cloning)
3. Update `package.json`:
   - Change `name` field to `TetrisChallenge`
   - Verify scripts include `dev`, `build`, `preview`
4. Create initial README.md with:
   - Project title and brief description
   - Prerequisites (Node.js version)
   - Setup instructions
   - Development workflow commands
5. Run `npm install` to verify dependencies install correctly
6. Test `npm run dev` to confirm development server starts
7. Test `npm run build` to confirm production build works

## Testing Requirements
- **Manual Verification**: 
  - Development server starts without errors
  - Browser displays Phaser canvas
  - No console errors in browser developer tools
  - Build completes and produces `dist/` folder with HTML, JS, and CSS files
- **No Automated Tests**: This story focuses on scaffolding; automated tests will be added in Story 04

## Definition of Done
- [ ] All template files are in repository
- [ ] `package.json` shows correct project name
- [ ] `npm install` completes successfully
- [ ] `npm run dev` starts server and app displays in browser
- [ ] `npm run build` produces deployable assets in `dist/`
- [ ] README.md contains setup and run instructions
- [ ] Changes committed to feature branch
- [ ] Pull request created and passes basic review
