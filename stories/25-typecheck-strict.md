# Story 25: Type-Check Strict

## Goal
Enable TypeScript strict mode and ensure the entire codebase passes type checking with zero errors, maximizing type safety.

## Dependencies
- Story 01: Project Bootstrap (need TypeScript configuration)

## Acceptance Criteria
1. **TypeScript Strict Mode**:
   - `strict: true` enabled in `tsconfig.json`
   - All strict-mode checks enabled:
     - `noImplicitAny`
     - `strictNullChecks`
     - `strictFunctionTypes`
     - `strictBindCallApply`
     - `strictPropertyInitialization`
     - `noImplicitThis`
     - `alwaysStrict`
2. **Additional Strictness** (Recommended):
   - `noUnusedLocals: true`
   - `noUnusedParameters: true`
   - `noImplicitReturns: true`
   - `noFallthroughCasesInSwitch: true`
   - `noUncheckedIndexedAccess: true` (very strict, optional)
3. **Zero Type Errors**:
   - `npm run type-check` completes with no errors
   - No `@ts-ignore` or `@ts-expect-error` comments (or minimized)
   - No use of `any` type (or explicitly justified)
4. **Type-Check Script**:
   - `package.json` has `type-check` script
   - Script runs `tsc --noEmit`
   - Script included in CI pipeline
5. **CI Integration**:
   - GitHub Actions workflow runs type-check
   - PR cannot merge if type errors exist
   - Type-check runs before tests
6. **Code Quality**:
   - All functions have return type annotations
   - All parameters have type annotations
   - Interfaces and types used appropriately
   - Enums used for constants where appropriate

## Implementation Tasks
1. Update `tsconfig.json`:
   - Enable `"strict": true`
   - Enable additional strict checks
   - Review and adjust `include` and `exclude` paths
   - Ensure proper module resolution
2. Add type-check script to `package.json`:
   ```json
   {
     "scripts": {
       "type-check": "tsc --noEmit"
     }
   }
   ```
3. Run type-check and fix errors:
   - Execute `npm run type-check`
   - Review all type errors reported
   - Fix errors one by one
4. Common fixes needed:
   - **Implicit any**: Add explicit type annotations
   - **Null/undefined**: Add null checks or use optional chaining
   - **Uninitialized properties**: Initialize in constructor or make optional
   - **Function return types**: Add explicit return types
   - **Array access**: Check bounds before accessing
5. Replace `any` types:
   - Identify all uses of `any`
   - Replace with specific types
   - Use generics where appropriate
   - Use `unknown` if truly unknown type
6. Add type annotations:
   - Function return types
   - Function parameters
   - Variable declarations where inference insufficient
   - Object and array literals
7. Handle third-party types:
   - Install `@types/*` packages for libraries
   - Create custom type declarations if needed
   - Use declaration merging if extending types
8. Update CI workflow:
   - Ensure type-check step exists
   - Position early in pipeline (fail fast)
   - Show clear error messages
9. Document type patterns:
   - Add comments for complex types
   - Document any necessary `any` or `unknown` uses
   - Create type utility functions if needed

## Testing Requirements
- **Type-Check Tests**:
  - **Clean Run**:
    - Execute `npm run type-check`
    - Verify exit code 0 (success)
    - Verify no errors in output
  - **Strict Mode Verification**:
    - Confirm `strict: true` in tsconfig
    - Verify all strict checks active
  - **Code Coverage**:
    - All source files type-checked
    - Test files type-checked
    - Config files type-checked if TS
- **CI Tests**:
  - Push code with type error
  - Verify CI fails
  - Fix error and verify CI passes
  - Confirm type-check runs before tests
- **Code Quality Review**:
  - Audit codebase for `any` usage
  - Verify function signatures complete
  - Check interface/type usage
  - Review for type safety patterns
- **Integration**:
  - All other stories' code passes type-check
  - No regressions when strict mode enabled
  - IDE TypeScript support working correctly

## Definition of Done
- [ ] `tsconfig.json` has `strict: true` enabled
- [ ] Additional strict checks enabled
- [ ] `type-check` script added to package.json
- [ ] `npm run type-check` completes with zero errors
- [ ] All `any` types eliminated or justified
- [ ] All functions have return type annotations
- [ ] Null/undefined handled safely throughout
- [ ] No `@ts-ignore` comments (or minimized and documented)
- [ ] CI workflow includes type-check step
- [ ] CI fails on type errors
- [ ] All existing code passes strict type-check
- [ ] Documentation updated with type-checking info
- [ ] TypeScript version documented
- [ ] Changes merged to main branch

## Notes
- This story may require changes across all source files
- Can be done incrementally if needed
- Strict mode catches many potential runtime errors
- Worth the effort for long-term maintainability
- May need to adjust based on Phaser type definitions
- Consider `skipLibCheck: true` if external lib types problematic
