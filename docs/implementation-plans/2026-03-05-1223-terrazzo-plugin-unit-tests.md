# Implementation Plan A: Terrazzo Plugin Unit Tests

**Created:** 2026-03-05
**Type:** Feature
**Overview:** Refactor the fluid token plugin to extract testable helper functions, then add unit tests for each helper.
**Design Spec:** docs/design-specs/2026-03-04-1942-terrazzo-plugin-testing.md

---

## Summary

Extract three pure helper functions (`parseViewportConfig`, `splitPairLabel`, `resolveMinMax`) from the Terrazzo fluid token plugin and add unit tests for each. The plugin becomes a thin orchestrator; the helpers are independently testable. A new "unit" Vitest project is added alongside the existing "storybook" project.

---

## Codebase Verification

- [x] Plugin exists at `site/src/tokens/terrazzo-plugin-fluid.mjs` (43 lines, single `transform` hook) - Verified
- [x] Vitest config at `site/vitest.config.ts` has `storybook` project, ready for `unit` addition - Verified
- [x] No `__tests__` directory exists yet under `site/src/tokens/` - Verified
- [x] Dependencies present: `vitest`, `@terrazzo/cli`, `utopia-core` - Verified
- [x] `package.json` lacks `"type": "module"` — plugin uses `.mjs` for ESM; test files use `.ts` via Vitest - Verified

**Patterns to leverage:**

- Existing Vitest workspace config with named projects

**Discrepancies found:**

- None

---

## Tasks

### Task 1: Add "unit" test project to Vitest config

**Description:** Add a `"unit"` test project to the Vitest config that matches `.test.ts` files under `src/`.

**Files:**

- `site/vitest.config.ts` - modify

**Code example:**

```ts
{
  test: {
    name: "unit",
    include: ["src/**/*.test.ts"],
  },
},
```

**Done when:** `pnpm vitest --project unit` runs successfully (0 tests found is fine)

**Commit:** `Add unit test project to Vitest config`

---

### Task 2: Refactor plugin to extract testable helpers

**Description:** Extract three named exports from the plugin:

- `parseViewportConfig(tokens)` — returns `{ minWidth, maxWidth }` as numbers
- `splitPairLabel(label)` — splits on em-dash, returns `[fromLabel, toLabel]`
- `resolveMinMax(id, token, tokens)` — returns `{ minSize, maxSize }` using mode lookup (handles both regular and pair tokens)

The default export becomes a thin orchestrator calling these helpers. No behavior change.

**Files:**

- `site/src/tokens/terrazzo-plugin-fluid.mjs` - modify

**Done when:** `pnpm run tokens` produces identical CSS output (diff the before/after `tokens.css`)

**Commit:** `Refactor fluid plugin to extract testable helpers`

---

### Task 3: Write unit tests for extracted helpers

**Description:** Create unit tests covering:

- `parseViewportConfig` — returns correct `{ minWidth, maxWidth }` from mock viewport tokens
- `splitPairLabel("S\u2014M")` — returns `["S", "M"]`
- `resolveMinMax` — correct `{ minSize, maxSize }` for regular tokens (reads Min/Max modes)
- `resolveMinMax` — correct `{ minSize, maxSize }` for pair tokens (cross-references from/to tokens)

Tests use mock token objects matching the `{ value, unit }` dimension shape.

**Files:**

- `site/src/tokens/__tests__/terrazzo-plugin-fluid.test.ts` - create

**Done when:** `pnpm vitest --project unit` passes all tests

**Commit:** `Add unit tests for fluid plugin helpers`

---

## Acceptance Criteria

- [x] `parseViewportConfig(tokens)` returns `{ minWidth, maxWidth }` as numbers from viewport tokens
- [x] `splitPairLabel("S—M")` returns `["S", "M"]` (splits on em-dash)
- [x] `resolveMinMax` returns correct `{ minSize, maxSize }` for regular tokens (reads Min/Max modes)
- [x] `resolveMinMax` returns correct `{ minSize, maxSize }` for pair tokens (cross-references from/to tokens)
- [x] `pnpm vitest --project unit` runs and passes

---

## Build Log

_Filled in during `/build` phase_

| Date       | Task       | Files                                                   | Notes                                                                                              |
| ---------- | ---------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 2026-03-05 | Task 1     | site/vitest.config.ts                                   | Added "unit" project; Vitest recognizes it (no test files yet)                                     |
| 2026-03-05 | Task 2     | site/src/tokens/terrazzo-plugin-fluid.mjs               | Extracted 3 helpers; tokens.css output identical                                                   |
| 2026-03-05 | Task 3     | site/src/tokens/**tests**/terrazzo-plugin-fluid.test.ts | 5 tests, all passing                                                                               |
| 2026-03-05 | Review fix | plugin + test file                                      | Deviated: Extracted shouldProcess() allowlist helper; added 9 shouldProcess tests (14 tests total) |

---

## Completion

**Completed:** 2026-03-05
**Final Status:** Complete

**Summary:** Extracted 4 testable helpers (parseViewportConfig, splitPairLabel, resolveMinMax, shouldProcess) from the fluid token plugin and added 14 unit tests via a new Vitest "unit" project.

**Deviations from Plan:** Added shouldProcess() allowlist helper (review finding) — replaced blocklist filter with explicit allowlist of 5 fluid token groups.

---

## Notes

- Plugin source stays `.mjs` (Terrazzo CLI constraint); test files use `.ts` (Vitest handles ESM natively)
- Plan B (integration tests) should be completed after this plan to verify the refactor didn't break output
