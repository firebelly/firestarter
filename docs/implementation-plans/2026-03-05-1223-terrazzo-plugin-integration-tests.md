# Implementation Plan B: Terrazzo Plugin Integration Tests

**Created:** 2026-03-05
**Type:** Feature
**Overview:** Add an integration test that runs `tz build` against a fixture token file and asserts on CSS output.
**Design Spec:** docs/design-specs/2026-03-04-1942-terrazzo-plugin-testing.md

---

## Summary

Create a minimal fixture token file with representative tokens, a test-specific Terrazzo config, and an integration test that programmatically runs `tz build` and validates the CSS output contains correct `clamp()` values, excludes grid tokens, and is valid CSS.

---

## Codebase Verification

- [x] `@terrazzo/cli` exports `buildCmd` and `loadConfig` for programmatic use - Verified (v0.10.5)
- [x] Terrazzo config structure understood from `site/terrazzo.config.mjs` - Verified
- [x] Plugin refactor from Plan A provides named exports - Prerequisite (Plan A must be complete first)

**Patterns to leverage:**

- Existing Terrazzo config as reference for test config structure
- Real `design.tokens.json` as reference for fixture token shape

**Discrepancies found:**

- None

---

## Tasks

### Task 1: Create fixture token file

**Description:** Create a minimal DTCG token file with representative tokens:

- Viewport config (`Utopia.Viewport.Min width`, `Utopia.Viewport.Max width`)
- Regular space token (`Fluid tokens.Space size.S`) with Min/Max modes
- Regular type token (`Fluid tokens.Font size.Step 0`) with Min/Max modes
- Space pair token (`Fluid tokens.Space size pairs.S\u2014M`)
- Grid token (`Fluid tokens.Grid.Columns`) to verify exclusion
- Non-fluid token (e.g., color) to verify exclusion

**Files:**

- `site/src/tokens/__tests__/fixtures/test.tokens.json` - create

**Done when:** File contains valid DTCG tokens covering all required cases

**Commit:** `Add fixture token file for integration tests`

---

### Task 2: Create test config and integration test

**Description:** Create a test-specific Terrazzo config pointing at the fixture file, and an integration test that:

1. Calls `buildCmd` programmatically with the test config
2. Reads the generated CSS output
3. Asserts output contains valid `clamp()` values for fluid tokens
4. Asserts output does NOT contain grid tokens
5. Asserts output is valid CSS (parseable)
6. Cleans up temp output after test run

**Files:**

- `site/src/tokens/__tests__/fixtures/terrazzo.config.mjs` - create
- `site/src/tokens/__tests__/terrazzo-plugin-fluid.integration.test.ts` - create

**Done when:** `pnpm vitest --project unit` passes the integration test

**Commit:** `Add integration test for fluid plugin`

---

## Acceptance Criteria

- [x] Fixture token file contains representative tokens: viewport config, regular space, regular type, space pair, non-fluid token, grid token
- [x] Test-specific Terrazzo config points at fixture file with temp output path
- [x] `tz build` against fixtures produces output containing valid `clamp()` values for fluid tokens
- [x] Output does NOT contain entries for grid tokens or non-fluid tokens that are excluded
- [x] Output is valid CSS (parseable)
- [x] Temp output is cleaned up after test run

---

## Build Log

_Filled in during `/build` phase_

| Date       | Task      | Files                                                                   | Notes                                                                                 |
| ---------- | --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 2026-03-05 | Task 1    | site/src/tokens/**tests**/fixtures/test.tokens.json                     | Fixture with viewport, space S/M, pair S—M, font Step 0, grid Columns, color gray.500 |
| 2026-03-05 | Task 2    | fixtures/terrazzo.config.mjs, terrazzo-plugin-fluid.integration.test.ts | 6 integration tests, all passing (20 total with unit tests)                           |
| 2026-03-06 | Post-task | site/vitest.config.ts, site/package.json                                | Deviated: Renamed project "unit" → "tokens"; added `test:tokens` script               |

---

## Completion

**Completed:** 2026-03-06
**Final Status:** Complete

**Summary:** Integration test that runs `tz build` against a fixture token file and asserts CSS output contains correct `clamp()` values, excludes grid/config tokens, and is valid CSS. Added `@terrazzo/parser` as dev dependency for proper Logger usage. Renamed Vitest project from "unit" to "tokens" and added `test:tokens` script.

**Deviations from Plan:** Renamed Vitest project "unit" → "tokens" to reflect both unit and integration tests. Added `test:tokens` script to package.json. Added `@terrazzo/parser` as dev dependency.

---

## Notes

- This plan depends on Plan A being complete (plugin must have extracted helpers)
- The integration test serves as the safety net confirming the Plan A refactor didn't break output
- Programmatic API (`buildCmd`) preferred over CLI shell-out for speed and better error reporting
