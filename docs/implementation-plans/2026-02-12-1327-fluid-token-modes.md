# Implementation Plan: Fluid Token Modes

**Design Doc:** `docs/design-plans/2026-02-12-1317-fluid-token-modes.md`
**Created:** 2026-02-12

---

## Summary

Refactor the Terrazzo fluid tokens plugin to unify all token categories (space, type, line heights) on a single mode-based approach using only `calculateClamp()` from utopia-core. Replace the `variableName` if/startsWith chain with an ordered regex pattern array.

---

## Codebase Verification

- [x] Plugin has dual strategy (config-based for space/type, mode-based for line heights) - Verified
- [x] Plugin imports `calculateClamp`, `calculateSpaceScale`, `calculateTypeScale` - Verified
- [x] `dimValue` helper exists as `(val) => val.value` - Verified
- [x] `enforce: "post"` present with no comment - Verified
- [x] `variableName` uses if/startsWith chains with negative guards - Verified
- [x] All `Fluid tokens.*` entries have Min/Max modes in token file - Verified (space, type, line heights, pairs)
- [x] Pair token modes reference constituent tokens correctly (e.g., "S—M" Min → Space size S, Max → Space size M) - Verified

**Patterns to leverage:**

- Existing `dimValue` helper pattern (renamed to `px`)
- Existing mode-reading pattern from line heights section (lines 86-97)

**Discrepancies found:**

- None. Codebase matches all design doc assumptions.

---

## Tasks

### Task 1: Refactor plugin to unified mode-based loop

**Description:** Rewrite `terrazzo-plugin-fluid.mjs` to replace the three separate strategies (config-based space, config-based type, mode-based line heights) with a single loop over all `Fluid tokens.*` entries using `calculateClamp()` only.

**Files:**

- `site/src/tokens/terrazzo-plugin-fluid.mjs` - rewrite

**Changes:**

- Remove `calculateSpaceScale`/`calculateTypeScale` imports; keep only `calculateClamp`
- Remove all Utopia config reads except viewport widths
- Rename `dimValue` → `px`
- Single loop over `Object.entries(tokens)`, combined guard to skip non-fluid and grid tokens
- Branch for pair tokens: parse em-dash label → look up constituent size tokens' Min/Max modes
- All other tokens: read their own Min/Max modes directly
- Add comment explaining `enforce: "post"` rationale
- Add comments at pair branching logic

**Code example:**

```js
import { calculateClamp } from "utopia-core";

export default function fluidTokensPlugin() {
  return {
    name: "terrazzo-plugin-fluid",
    // enforce: "post" ensures this runs after Terrazzo resolves
    // token references and modes to concrete values
    enforce: "post",
    async transform({ tokens, setTransform }) {
      const px = (val) => val.value;
      const minWidth = parseInt(tokens["Utopia.Viewport.Min width"].$value, 10);
      const maxWidth = parseInt(tokens["Utopia.Viewport.Max width"].$value, 10);

      for (const [id, token] of Object.entries(tokens)) {
        if (
          !id.startsWith("Fluid tokens.") ||
          id.startsWith("Fluid tokens.Grid.")
        )
          continue;

        let minSize, maxSize;

        if (id.startsWith("Fluid tokens.Space size pairs.")) {
          // Pair tokens: use "from" token's Min mode, "to" token's Max mode
          const label = id.split(".").pop();
          const [fromLabel, toLabel] = label.split("\u2014");
          minSize = px(
            tokens[`Fluid tokens.Space size.${fromLabel}`].mode["Min"].$value,
          );
          maxSize = px(
            tokens[`Fluid tokens.Space size.${toLabel}`].mode["Max"].$value,
          );
        } else {
          minSize = px(token.mode["Min"].$value);
          maxSize = px(token.mode["Max"].$value);
        }

        const clamp = calculateClamp({ minWidth, maxWidth, minSize, maxSize });
        setTransform(id, { format: "css", value: clamp });
      }
    },
  };
}
```

**Done when:** `pnpm run tokens` produces identical CSS output for all space, type, and line height tokens (≤0.01px rounding improvement allowed on type steps).

**Commit:** "Refactor fluid plugin to unified mode-based loop"

---

### Task 2: Replace variableName with ordered regex patterns

**Description:** Replace the if/startsWith chain in `terrazzo.config.mjs` with an ordered `[regex, prefix]` array. First match wins, most-specific patterns first.

**Files:**

- `site/terrazzo.config.mjs` - modify `variableName` function

**Code example:**

```js
variableName(token) {
  const patterns = [
    [/^Fluid tokens\.Space size pairs\.Custom pairs\.(.+)$/, "--space-"],
    [/^Fluid tokens\.Space size pairs\.(.+)$/, "--space-"],
    [/^Fluid tokens\.Space size\.(.+)$/, "--space-"],
    [/^Fluid tokens\.Font size\.Step (.+)$/, "--step-"],
    [/^Fluid tokens\.Line height body\.Step (.+)$/, "--lh-body-step-"],
    [/^Fluid tokens\.Line height heading\.Step (.+)$/, "--lh-heading-step-"],
  ];

  for (const [re, prefix] of patterns) {
    const m = token.id.match(re);
    if (m) return prefix + m[1].toLowerCase().replace("\u2014", "-");
  }

  return undefined;
},
```

**Done when:** `pnpm run tokens` produces identical CSS variable names for all token categories.

**Commit:** "Replace variableName if-chain with regex patterns"

---

## Acceptance Criteria

- [x] `pnpm run tokens` produces identical CSS output for all space, type, and line height tokens (≤0.01px rounding improvement allowed on type steps)
- [x] Plugin imports only `calculateClamp` from utopia-core (no `calculateSpaceScale`, `calculateTypeScale`)
- [x] Plugin reads no Utopia config tokens beyond `Utopia.Viewport.Min width` and `Max width`
- [x] Each pair token's clamp uses the "from" token's Min mode value and the "to" token's Max mode value
- [x] `variableName` produces identical CSS variable names for all token categories
- [x] `enforce: "post"` has a comment explaining why it's required
- [x] Key decision points in the plugin loop are commented (pair branching logic)

---

## Notes

- The test script `test-fluid-modes.mjs` does not exist; formalizing it is out of scope per the design doc.
- Grid tokens (`Fluid tokens.Grid.*`) remain excluded via the combined guard clause and the existing CSS plugin exclude list.
- Task 1 should be verified before starting Task 2, since both tasks change how tokens build and independent verification is cleaner.
