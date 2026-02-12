# Fluid Token Modes

**Created:** 2026-02-12
**Status:** Design
**Implementation Plan Doc:** `docs/implementation-plans/2026-02-12-1327-fluid-token-modes.md`
**Research Doc:** `docs/research/2026-02-11-universal-fluid-tokens.md`

---

## Overview

**What:** Refactor the Terrazzo fluid tokens plugin to unify all token categories (space, type, line heights) on a single mode-based approach using only `calculateClamp()` from utopia-core.

**Why:** The current plugin uses two strategies — re-deriving values from Utopia config params (space, type) and reading Min/Max modes directly (line heights). The config-based approach creates a second source of truth that diverges from Figma by tiny rounding differences. Unifying on the mode-based approach makes the plugin simpler, Figma-exact, and easier to extend.

**Type:** Refactor

---

## Requirements

### Must Have

- [ ] Single loop over all `Fluid tokens.*` entries using `calculateClamp()` only
- [ ] Pair tokens resolve correctly: "from" token's Min mode, "to" token's Max mode
- [ ] `variableName` in config uses ordered regex pattern array (most specific first)
- [ ] `dimValue` renamed to `px`
- [ ] Comment explaining `enforce: "post"` rationale
- [ ] Comments at key decision points in the plugin (not every line)
- [ ] Output parity with current build (allowing ≤0.01px type step rounding improvement)

### Nice to Have

- [ ] _None identified_

### Out of Scope

- Grid tokens (`Fluid tokens.Grid.*`) — future opportunity, stays excluded
- Changes to design tokens JSON (Figma export)
- Changes to token naming / CSS variable names (same output)
- Changes to the exclude list
- Formalizing the test script (`test-fluid-modes.mjs`)

---

## Design Decisions

### 1. Unify on mode-based approach

**Options considered:**

1. Keep dual strategy (config-based for space/type, mode-based for line heights) — working, but two code paths, rounding divergence from Figma
2. Unify on mode-based for all categories — single code path, Figma-exact, simpler

**Decision:** Option 2. All `Fluid tokens.*` entries already have Min/Max modes in the token file. Reading resolved mode values and calling `calculateClamp()` is simpler and matches Figma exactly.

### 2. Single loop with pair branch

**Options considered:**

1. Separate loops per category (current approach) — explicit but repetitive
2. Single loop with a branch for pairs — one iteration, pair logic isolated

**Decision:** Option 2. One loop iterates all `Fluid tokens.*` entries. Pair tokens (under `Space size pairs`) parse the em-dash label to look up constituent size tokens' modes. Everything else reads its own Min/Max modes directly.

**Pair resolution logic:**

- Parse label: `"3XS—2XS"` → `"3XS"`, `"2XS"`
- `minSize` = `px(tokens["Fluid tokens.Space size.3XS"].mode["Min"].$value)`
- `maxSize` = `px(tokens["Fluid tokens.Space size.2XS"].mode["Max"].$value)`

### 3. Replace `variableName` with ordered regex patterns

**Options considered:**

1. Keep if/startsWith chain — working but fragile (negative guards, silent fallthrough on `split().pop()`)
2. Ordered `[match, prefix]` array, first match wins — no negative guards, readable as a table

**Decision:** Option 2. Patterns ordered most-specific first:

```js
const patterns = [
  [/^Fluid tokens\.Space size pairs\.Custom pairs\.(.+)$/, "--space-"],
  [/^Fluid tokens\.Space size pairs\.(.+)$/, "--space-"],
  [/^Fluid tokens\.Space size\.(.+)$/, "--space-"],
  [/^Fluid tokens\.Font size\.Step (.+)$/, "--step-"],
  [/^Fluid tokens\.Line height body\.Step (.+)$/, "--lh-body-step-"],
  [/^Fluid tokens\.Line height heading\.Step (.+)$/, "--lh-heading-step-"],
];
```

Uniform transform: `prefix + capture.toLowerCase().replace("—", "-")`

### 4. Rename `dimValue` → `px`

**Rationale:** After the refactor, this helper is used for all token categories (not just line heights). `px` makes it clear you're extracting the numeric pixel value from a Terrazzo dimension object (`{ value: 14.76, unit: "px" }`). `dimValue` just restates "dimension value."

---

## Acceptance Criteria

- [ ] `pnpm run tokens` produces identical CSS output for all space, type, and line height tokens (allowing ≤0.01px rounding improvement on type steps where mode-based values match Figma exactly)
- [ ] Plugin imports only `calculateClamp` from utopia-core (no `calculateSpaceScale`, `calculateTypeScale`)
- [ ] Plugin reads no Utopia config tokens beyond `Utopia.Viewport.Min width` and `Max width`
- [ ] Each pair token's clamp uses the "from" token's Min mode value and the "to" token's Max mode value
- [ ] `variableName` produces identical CSS variable names for all token categories
- [ ] `enforce: "post"` has a comment explaining why it's required
- [ ] Key decision points in the plugin loop are commented (pair branching logic)

---

## Files to Create/Modify

```
site/src/tokens/terrazzo-plugin-fluid.mjs  # Refactor to mode-based loop
site/terrazzo.config.mjs                   # Replace variableName with regex patterns
```

---

## Build Log

_Filled in during `/build` phase_

| Date       | Task   | Files                                     | Notes                                                                   |
| ---------- | ------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| 2026-02-12 | Task 1 | site/src/tokens/terrazzo-plugin-fluid.mjs | No deviations. 4 type step values improved by ≤0.0001rem (Figma-exact). |
| 2026-02-12 | Task 2 | site/terrazzo.config.mjs                  | No deviations. Identical CSS variable names.                            |

---

## Completion

**Completed:** _TBD_
**Final Status:** _TBD_

**Summary:** _TBD_

**Deviations from Plan:** _TBD_
