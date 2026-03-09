# Implementation Plan: Fluid Tokens Terrazzo Plugin

**Design Spec:** `docs/design-specs/2026-02-11-0928-fluid-tokens-terrazzo-plugin.md`
**Created:** 2026-02-11

---

## Summary

Replace the standalone `generate-fluid-tokens.ts` script with a custom Terrazzo plugin. The plugin computes fluid `clamp()` values using `utopia-core` and overrides the CSS plugin's transforms via `enforce: "post"`, producing a single `:root` block with correct variable names and alias resolution.

---

## Codebase Verification

- [x] Terrazzo plugin API supports `enforce: "post"` — Verified: yes
- [x] `setTransform(id, { format, value })` overwrites existing transforms with same tokenId+format — Verified: yes (confirmed in docs)
- [x] CSS plugin exports `FORMAT_ID = "css"` — Verified: yes
- [x] CSS plugin accepts `variableName(token)` returning full `--`-prefixed name — Verified: yes (`makeCSSVar` returns `--`-prefixed names)
- [x] `token.mode["."]` always exists for default value access — Verified: yes (docs confirm)
- [x] `token.mode["Min"].$value` / `token.mode["Max"].$value` resolve correctly for line height tokens — Verified: yes (design spec confirms, these reference `@min`/`@max` primitives directly)
- [x] Utopia config tokens (`Utopia.*`) are `$type: "string"` with parseable numeric values — Verified: yes
- [x] `utopia-core` is already a devDependency — Verified: yes (`^1.6.0`)
- [x] Current exclude list has `"Fluid tokens.*"` and `"Utopia.*"` — Verified: yes
- [x] Grid tokens (`Fluid tokens.Grid.*`) exist and are out of scope — Verified: yes

**Patterns to leverage:**

- Existing `generate-fluid-tokens.ts` logic for `calculateSpaceScale()` / `calculateTypeScale()` config extraction and mapping
- CSS plugin's `FORMAT_ID` export for `setTransform` format parameter
- `token.mode` map for accessing resolved Min/Max values on line height tokens

**Discrepancies found:**

- None — all design spec assumptions match the codebase

---

## Tasks

### Task 1: Create the fluid tokens Terrazzo plugin

**Description:** Create a custom Terrazzo plugin that computes fluid `clamp()` values using `utopia-core` and overrides the CSS plugin's transforms. The plugin:

1. Reads Utopia config (viewport widths, space params, type params) from the `tokens` map — string tokens parsed to numbers
2. Computes space scale via `calculateSpaceScale()` — maps each result to its token ID (e.g., `sizes[i]` → `Fluid tokens.Space size.{LABEL}`, `oneUpPairs[i]` → `Fluid tokens.Space size pairs.{A}—{B}`, `customPairs[i]` → `Fluid tokens.Space size pairs.Custom pairs.{A}—{B}`)
3. Computes type scale via `calculateTypeScale()` — maps each step to `Fluid tokens.Font size.Step {n}`
4. Computes line heights via `calculateClamp()` — for each step, reads Min/Max values from the line height token's `mode` property (`token.mode["Min"].$value` and `token.mode["Max"].$value`), maps to `Fluid tokens.Line height body.Step {n}` and `Fluid tokens.Line height heading.Step {n}`
5. For each computed token, calls `setTransform(tokenId, { format: "css", value: clampValue })` to override the CSS plugin's resolved px value with the `clamp()` expression

**Files:**

- `site/src/tokens/terrazzo-plugin-fluid.ts` — create

**Code example:**

```ts
import type { Plugin } from "@terrazzo/cli";
import {
  calculateClamp,
  calculateSpaceScale,
  calculateTypeScale,
} from "utopia-core";

export default function fluidTokensPlugin(): Plugin {
  return {
    name: "terrazzo-plugin-fluid",
    enforce: "post",
    async transform({ tokens, setTransform }) {
      // 1. Read Utopia config from tokens map
      const minWidth = parseInt(
        tokens["Utopia.Viewport.Min width"].$value as string,
        10,
      );
      const maxWidth = parseInt(
        tokens["Utopia.Viewport.Max width"].$value as string,
        10,
      );
      // ... space config, type config

      // 2. Compute space scale
      const spaceScale = calculateSpaceScale({ minWidth, maxWidth /* ... */ });
      for (const size of spaceScale.sizes) {
        const tokenId = `Fluid tokens.Space size.${size.label.toUpperCase()}`;
        setTransform(tokenId, { format: "css", value: size.clamp });
      }
      // ... oneUpPairs, customPairs

      // 3. Compute type scale
      const typeScale = calculateTypeScale({ minWidth, maxWidth /* ... */ });
      for (const step of typeScale) {
        const tokenId = `Fluid tokens.Font size.Step ${step.step}`;
        setTransform(tokenId, { format: "css", value: step.clamp });
      }

      // 4. Compute line heights
      for (const stepKey of Object.keys(tokens).filter((id) =>
        id.startsWith("Fluid tokens.Line height body."),
      )) {
        const token = tokens[stepKey];
        const minSize = parseFloat(String(token.mode["Min"].$value));
        const maxSize = parseFloat(String(token.mode["Max"].$value));
        const clamp = calculateClamp({ minWidth, maxWidth, minSize, maxSize });
        setTransform(stepKey, { format: "css", value: clamp });
      }
      // ... same for "Fluid tokens.Line height heading."
    },
  };
}
```

**Key mapping details:**

| utopia-core result          | Label format                 | Token ID                                         |
| --------------------------- | ---------------------------- | ------------------------------------------------ |
| `spaceScale.sizes[i]`       | `"3xs"`                      | `Fluid tokens.Space size.3XS`                    |
| `spaceScale.oneUpPairs[i]`  | `"3xs-2xs"`                  | `Fluid tokens.Space size pairs.3XS—2XS`          |
| `spaceScale.customPairs[i]` | `"s-l"`                      | `Fluid tokens.Space size pairs.Custom pairs.S—L` |
| `typeScale[i]`              | step: `0`, label: `"Step 0"` | `Fluid tokens.Font size.Step 0`                  |

Label-to-token-ID mapping requires uppercasing space labels and converting hyphens back to em dashes (—) for pair names. See the existing `generate-fluid-tokens.ts` for the full label set.

**Important:** The dimension `$value` on normalized tokens may be a number (pixels) or a string. Use `parseFloat(String(value))` to safely extract the numeric value for `calculateClamp()`.

**Done when:** Plugin file compiles without TypeScript errors. `npx tsc --noEmit` passes.
**Commit:** "Add fluid tokens Terrazzo plugin"

---

### Task 2: Integrate plugin into Terrazzo config

**Description:** Wire up the fluid plugin and `variableName()` function in the Terrazzo config. Update the exclude list and the `tokens` script.

**Files:**

- `site/terrazzo.config.mjs` — modify
- `site/package.json` — modify

**Changes to `terrazzo.config.mjs`:**

1. Import `fluidTokensPlugin` from `./src/tokens/terrazzo-plugin-fluid.ts`
2. Add `variableName(token)` to CSS plugin options:

```js
css({
  filename: "tokens.css",
  variableName(token) {
    const id = token.id;

    // Space sizes: "Fluid tokens.Space size.3XS" → "--space-3xs"
    if (id.startsWith("Fluid tokens.Space size.") && !id.includes("pairs")) {
      const label = id.split(".").pop().toLowerCase();
      return `--space-${label}`;
    }

    // Space one-up pairs: "Fluid tokens.Space size pairs.3XS—2XS" → "--space-3xs-2xs"
    if (
      id.startsWith("Fluid tokens.Space size pairs.") &&
      !id.includes("Custom")
    ) {
      const pair = id.split(".").pop().toLowerCase().replace("—", "-");
      return `--space-${pair}`;
    }

    // Space custom pairs: "Fluid tokens.Space size pairs.Custom pairs.S—L" → "--space-s-l"
    if (id.startsWith("Fluid tokens.Space size pairs.Custom pairs.")) {
      const pair = id.split(".").pop().toLowerCase().replace("—", "-");
      return `--space-${pair}`;
    }

    // Font size: "Fluid tokens.Font size.Step 0" → "--step-0"
    if (id.startsWith("Fluid tokens.Font size.")) {
      const n = id.split("Step ").pop();
      return `--step-${n}`;
    }

    // Line height body: "Fluid tokens.Line height body.Step 0" → "--lh-body-step-0"
    if (id.startsWith("Fluid tokens.Line height body.")) {
      const n = id.split("Step ").pop();
      return `--lh-body-step-${n}`;
    }

    // Line height heading: "Fluid tokens.Line height heading.Step 0" → "--lh-heading-step-0"
    if (id.startsWith("Fluid tokens.Line height heading.")) {
      const n = id.split("Step ").pop();
      return `--lh-heading-step-${n}`;
    }

    // Non-fluid tokens: fall through to default naming
    return undefined;
  },
  exclude: [
    "Space primitives.*",
    "Type primitives.Font size*",
    "Type primitives.Line height*",
    "Fluid tokens.Grid.*",
    "Utopia.*",
  ],
});
```

3. Add `fluidTokensPlugin()` to plugins array (after CSS plugin)
4. Update `site/package.json` `"tokens"` script from `"tz build && npx tsx src/tokens/generate-fluid-tokens.ts"` to `"tz build"`

**Done when:** `pnpm run tokens` produces `tokens.css` with a single `:root` block. All fluid variables have correct `--space-*`, `--step-*`, `--lh-body-step-*`, `--lh-heading-step-*` names with `clamp()` values matching the current output. Non-fluid tokens (colors, font-family, font-weight) are unchanged.
**Commit:** "Integrate fluid plugin into Terrazzo config"

---

### Task 3: Verify output and clean up

**Description:** Run a final verification of the output, then delete the old standalone script.

**Files:**

- `site/src/tokens/generate-fluid-tokens.ts` — delete

**Steps:**

1. Save current `tokens.css` fluid output (lines 35-114 of committed version) as reference
2. Run `pnpm run tokens`
3. Verify single `:root` block (no duplicate blocks)
4. Diff fluid variable names and clamp values against reference — must be identical
5. Verify non-fluid tokens (colors, font-family, font-weight) are unchanged
6. Delete `site/src/tokens/generate-fluid-tokens.ts`
7. Confirm no remaining imports or references to the deleted file

**Done when:** CSS output matches expected values, `generate-fluid-tokens.ts` is deleted, no dangling references.
**Commit:** "Remove standalone fluid token generator"

---

## Acceptance Criteria

- [x] `pnpm run tokens` (now just `tz build`) produces `tokens.css` with a single `:root` block
- [x] All fluid CSS custom properties (`--space-*`, `--step-*`, `--lh-body-step-*`, `--lh-heading-step-*`) have identical names and `clamp()` values as the current output
- [x] Non-fluid tokens (colors, font-family, font-weight) are unchanged
- [x] `generate-fluid-tokens.ts` is deleted and no longer referenced
- [x] Adding a component token (e.g., `Button.Vertical Padding`) that aliases a fluid token produces a `var()` reference in the CSS output (manual test if time allows)

---

## Notes

- **`setTransform` dedup:** The Terrazzo docs confirm that calling `setTransform` with the same `tokenId+format` overwrites the previous value. Our `enforce: "post"` plugin relies on this to replace the CSS plugin's resolved px values with `clamp()` expressions.
- **Line height approach:** Uses `token.mode["Min"].$value` / `token.mode["Max"].$value` instead of reading primitive tokens directly. This is cleaner and "Terrazzo-native." Safe because line height modes reference `@min`/`@max` primitives directly (no cross-mode resolution bug).
- **Space/type approach:** Must use `calculateSpaceScale()` / `calculateTypeScale()` from the Utopia config (not resolved mode values) because pair tokens have incorrect cross-mode alias resolution in Terrazzo.
- **Grid tokens:** Explicitly excluded (`Fluid tokens.Grid.*`) — out of scope per design spec.
- **`variableName()` is the single control point** for both CSS output names and `var()` alias references in downstream tokens. This is what enables `Button.Vertical Padding → var(--space-2xs-xs)`.
- **Dimension `$value` format:** Normalized dimension tokens may expose `$value` as a number or string. Implementation should handle both via `parseFloat(String(value))`.
