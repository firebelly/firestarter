# Terrazzo Plugin Testing

**Created:** 2026-03-04
**Implementation Plans:** This design produces two separate plans:

- **Plan A:** Unit tests (includes plugin refactor)
- **Plan B:** Integration tests

---

## Overview

**What:** Add unit tests and integration tests for the custom Terrazzo fluid token plugin (`terrazzo-plugin-fluid.mjs`).

**Why:** The plugin is the most complex custom code in Firestarter — it parses token modes, splits em-dash pair labels, and computes fluid `clamp()` values via utopia-core. It has no tests today. Testing it catches regressions when the plugin or token structure changes, and the refactor required for unit testing also improves the plugin's readability.

**Type:** Feature

---

## Requirements

### Must Have

- [ ] Vitest config updated with a `"unit"` test project alongside the existing `"storybook"` project
- [ ] Plugin refactored to extract testable helper functions (no behavior change)
- [ ] Unit tests for each extracted helper function
- [ ] Integration test that runs `tz build` against a fixture token file and asserts on CSS output
- [ ] Tests colocated with source at `site/src/tokens/__tests__/`

### Nice to Have

- [ ] Edge case coverage (malformed tokens, missing modes)

### Out of Scope

- CI/CD pipeline integration (local `pnpm test` for now)
- Testing craftFetch, revalidate route, Storybook components, or server component pages
- Changes to plugin behavior or token output
- Publishing or packaging tests

---

## Design Decisions

### Unit test approach: Extract helpers vs. test transform directly

**Options considered:**

1. **Extract helpers** — Refactor plugin to export pure functions (`parseViewportConfig`, `splitPairLabel`, `resolveMinMax`), test those individually. Requires source changes but produces granular, stable tests.
2. **Test transform directly** — Keep plugin as-is, mock `tokens` and `setTransform` arguments. No source changes but tests are coupled to the full token data structure and less granular.

**Decision:** Extract helpers (Option 1). The helpers are genuinely reusable logic, and extracting them makes both the plugin and the tests clearer. The refactor is small — the plugin becomes a thin orchestrator calling three pure functions.

### Integration test data: Real tokens vs. fixture file

**Options considered:**

1. **Real `design.tokens.json`** — Zero setup, reflects actual project state. But tests break when token values change in Figma, causing false failures.
2. **Minimal fixture file** — Stable, controlled inputs, faster builds. But requires maintaining a fake token file.

**Decision:** Fixture file (Option 2). The integration test's job is to verify the plugin produces valid clamp CSS from known inputs, not to validate the current Figma export. False failures from designer-driven value changes would erode trust in the test suite.

### Integration test execution: Programmatic API vs. CLI shell-out

**Options considered:**

1. **Programmatic** — Import `buildCmd` from `@terrazzo/cli` and call it directly with a custom config. Faster, no subprocess overhead, better error reporting.
2. **CLI shell-out** — Spawn `tz build --config <path>`. Simpler setup but slower, harder to capture errors.

**Decision:** Programmatic (Option 1). `@terrazzo/cli` exports `buildCmd`, `loadConfig`, and `writeFiles` functions. The test can call these directly with a config pointing at the fixture file and a temp output directory.

### Test location: Colocated vs. top-level

**Decision:** Colocated at `site/src/tokens/__tests__/`. Follows modern JS convention of placing tests next to the code they test. Scales naturally — future tests for other modules go in their own `__tests__/` directories.

### Plan ordering: Unit tests first, integration tests second

**Decision:** Plan A (refactor + unit tests) before Plan B (integration tests). The integration tests serve as a safety net that validates the refactor didn't break anything. Running `tz build` after extracting helpers confirms the plugin still produces correct output.

---

## Acceptance Criteria

### Plan A: Unit Tests

- [ ] `parseViewportConfig(tokens)` returns `{ minWidth, maxWidth }` as numbers from viewport tokens
- [ ] `splitPairLabel("S—M")` returns `["S", "M"]` (splits on em-dash)
- [ ] `resolveMinMax` returns correct `{ minSize, maxSize }` for regular tokens (reads Min/Max modes)
- [ ] `resolveMinMax` returns correct `{ minSize, maxSize }` for pair tokens (cross-references from/to tokens)
- [ ] Plugin's `transform` still produces identical output after refactor (verified by integration test in Plan B)
- [ ] `pnpm vitest --project unit` runs and passes

### Plan B: Integration Tests

- [ ] Fixture token file contains representative tokens: viewport config, regular space, regular type, space pair, non-fluid token, grid token
- [ ] Test-specific `terrazzo.config.mjs` points at fixture file with temp output path
- [ ] `tz build` against fixtures produces output containing valid `clamp()` values for fluid tokens
- [ ] Output does NOT contain entries for grid tokens or non-fluid tokens that are excluded
- [ ] Output is valid CSS (parseable)
- [ ] Temp output is cleaned up after test run

---

## Suggested Files to Create/Modify

### Plan A: Unit Tests

```
site/src/tokens/terrazzo-plugin-fluid.mjs          # Modify — extract parseViewportConfig, splitPairLabel, resolveMinMax as named exports
site/src/tokens/__tests__/terrazzo-plugin-fluid.test.mjs  # Create — unit tests for extracted helpers
site/vitest.config.ts                               # Modify — add "unit" test project
```

### Plan B: Integration Tests

```
site/src/tokens/__tests__/fixtures/test.tokens.json           # Create — minimal fixture token data
site/src/tokens/__tests__/fixtures/terrazzo.config.mjs         # Create — test-specific Terrazzo config
site/src/tokens/__tests__/terrazzo-plugin-fluid.integration.test.mjs  # Create — integration test
```

---

## Technical Reference

### Current plugin structure

The plugin (`site/src/tokens/terrazzo-plugin-fluid.mjs`) is a single default export that returns an object with a `transform` hook. All logic lives inside the `transform` callback:

- Parses viewport min/max widths from `Utopia.Viewport.*` tokens
- Iterates all `Fluid tokens.*` entries (skipping `Grid.*`)
- For pair tokens (`Space size pairs.*`): splits the em-dash label, looks up from/to tokens' Min/Max modes
- For regular tokens: reads Min/Max modes directly
- Calls `calculateClamp()` from utopia-core
- Calls `setTransform()` to override the CSS plugin's output

### Refactored plugin structure (Plan A)

```js
export function parseViewportConfig(tokens) {
  /* viewport min/max */
}
export function splitPairLabel(label) {
  /* em-dash split */
}
export function resolveMinMax(id, token, tokens) {
  /* mode lookup */
}
export default function fluidTokensPlugin() {
  /* thin orchestrator */
}
```

### Terrazzo programmatic API (Plan B)

```js
import { buildCmd, loadConfig } from "@terrazzo/cli";
// buildCmd({ config, configPath, flags, logger }) → runs build
// loadConfig({ cmd, flags, logger }) → loads and parses config
```

### Known constraint: Dimension $value shape

Normalized dimension tokens expose `$value` as `{ value, unit }` (an object), not a bare number. The plugin's `px` helper accesses `$value.value`. Tests must match this structure.
