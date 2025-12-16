# Story 05: Build Output

## Goal
Verify and document the production build process to ensure it produces deployable static assets that can run on any static file server or directly from the filesystem.

## Dependencies
- Story 01: Project Bootstrap (need base project structure)

## Acceptance Criteria
1. **Build Process**:
   - `npm run build` completes successfully without errors
   - Build time is reasonable (under 30 seconds for base template)
   - Console output shows clear progress and completion message
2. **Output Directory**:
   - `dist/` directory is created with all necessary files
   - Directory structure includes:
     - `index.html` - main HTML entry point
     - `assets/` folder with bundled JS and CSS files
     - Asset files have content hashes for cache-busting
     - Any images or fonts are copied to appropriate locations
3. **Asset Requirements**:
   - JavaScript files are minified and optimized
   - CSS is bundled and minified
   - Source maps are generated (optional, configurable)
   - Assets are properly referenced in HTML with correct paths
4. **Deployment Readiness**:
   - Opening `dist/index.html` directly in browser works
   - All assets load without 404 errors
   - Phaser canvas initializes and runs
   - No console errors in browser
5. **Base Path Configuration**:
   - Vite config allows setting base path for subdirectory deployment
   - Default config works for root domain and file:// protocol
6. **Documentation**:
   - README includes build instructions
   - Deployment instructions documented (at least for basic scenarios)
   - Document minimum browser requirements

## Implementation Tasks
1. Review `vite.config.ts` to understand build configuration
2. Verify `base` option is set correctly (default `/` for root deployment)
3. Test build process:
   - Run `npm run build`
   - Verify `dist/` directory contents
   - Check file sizes and optimization
4. Test deployment scenarios:
   - Local file system: open `dist/index.html` in browser
   - Local server: use `npm run preview` or serve `dist/` with static server
   - Verify all assets load correctly in both scenarios
5. Update README.md with:
   - Build command and process
   - Expected output location
   - Deployment instructions for common static hosts (Netlify, Vercel, GitHub Pages)
   - Browser compatibility notes
6. Add `.gitignore` entry for `dist/` if not already present
7. Optional: Configure `vite.config.ts` for optimizations:
   - Tree-shaking
   - Code splitting
   - Asset inlining thresholds

## Testing Requirements
- **Build Verification**:
  - Clean `dist/` directory
  - Run `npm run build`
  - Verify build completes without errors or warnings
  - Check `dist/` contains expected files
- **File System Testing**:
  - Navigate to `dist/` folder
  - Open `index.html` directly in browser (file:// protocol)
  - Verify application loads and runs without errors
  - Check browser console for any 404s or errors
- **Server Testing**:
  - Run `npm run preview` (Vite preview server)
  - Open application in browser
  - Verify all functionality works
  - Test in multiple browsers (Chrome, Firefox, Safari)
- **Asset Validation**:
  - Verify JS files are minified (check file content)
  - Verify CSS is bundled and minified
  - Check that asset filenames include content hashes
  - Confirm total bundle size is reasonable

## Definition of Done
- [ ] `npm run build` completes successfully
- [ ] `dist/` directory contains complete deployable application
- [ ] Application runs when opened as local file
- [ ] `npm run preview` serves application correctly
- [ ] README includes build and deployment instructions
- [ ] `.gitignore` excludes `dist/` directory
- [ ] Build output tested in multiple browsers
- [ ] Asset optimization verified (minification, hashing)
- [ ] Documentation includes browser compatibility info
- [ ] Changes merged to main branch
