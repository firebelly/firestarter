# Refactor: Universal mode-based fluid token generation

## Problem

The current Terrazzo plugin uses two different strategies to compute fluid clamp values:

- **Space & Type**: Re-derives values from Utopia config params using `calculateSpaceScale()` / `calculateTypeScale()`, creating a second source of truth that diverges from Figma by tiny rounding differences
- **Line heights**: Reads resolved Min/Max modes directly from tokens, calls `calculateClamp()` — simpler, and Figma-exact

## Goal

Unify on the mode-based approach for all fluid token categories. The plugin should only need `calculateClamp()` from utopia-core.

## What changes

### Plugin (`terrazzo-plugin-fluid.mjs`)

- Drop `calculateSpaceScale` and `calculateTypeScale` imports
- Drop the ~20-line Utopia config reading block (space params, type params)
- Keep only two config reads: `Utopia.Viewport.Min width` and `Max width`
- Single loop over all `Fluid tokens.*` entries that have Min/Max modes:
  - **Pair tokens** (under `Space size pairs`): Parse the em-dash-separated label, look up each constituent size token's appropriate mode (from's Min, to's Max)
  - **Everything else** (individual spaces, type steps, line heights): Read Min/Max modes directly
  - Call `calculateClamp()`, pass to `setTransform()`

### Config (`terrazzo.config.mjs`)

- Replace the `variableName` chain of `if`/`startsWith`/`includes` guards with a declarative regex pattern list
- Current approach is fragile: `split("Step ").pop()` silently returns the whole string if "Step " is absent, `!includes("pairs")` guards could false-positive on future token names, and the em-dash replacement assumes an exact Unicode character
- Better approach: an array of `{ match, name }` objects where each regex matches the full token path and extracts only what it needs — no negative guards, no silent fallthrough, readable as a table
- `exclude` stays the same

### Naming

- Rename `dimValue` helper to `px` — current name just restates "dimension value", `px` makes it clear you're extracting the numeric pixel value from a Terrazzo dimension object (`{ value: 14.76, unit: "px" }`)
- Matters more after the refactor since this helper gets used for all token categories, not just line heights
- Add a comment explaining `enforce: "post"` — it's required because the plugin reads resolved pixel values, not raw token references, but that's not obvious to someone reading the code for the first time

### Excludes (`Utopia.*` tokens)

- Still excluded from CSS output, but now only the viewport tokens are read at build time (instead of all ~15 config params)

## What doesn't change

- Token naming / CSS variable names
- The design tokens JSON (Figma export)
- The `exclude` list

## Future opportunity

Grid tokens (`Fluid tokens.Grid.*`) already have Min/Max modes in the token file. The same universal loop would handle them if `Utopia.Grid.Active` is ever flipped to `true` — just remove `Fluid tokens.Grid.*` from the exclude list.

## Validation

A standalone test script (`test-fluid-modes.mjs`) confirmed output parity:

- Space tokens and line heights: identical
- Type steps: 4 values differ by < 0.01px (rounding), with the mode-based values matching Figma exactly

## Risk

The pair token resolution relies on parsing the em-dash-separated label (`3XS—2XS` → look up `3XS` Min, `2XS` Max). This naming convention comes from the Utopia Figma plugin and is already depended on by the `variableName` function in the config, so it's not new fragility.
