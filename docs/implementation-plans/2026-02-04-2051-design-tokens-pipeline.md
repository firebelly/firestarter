# Implementation Plan: Design Tokens Pipeline

**Design Doc:** docs/design-plans/2026-02-04-1332-design-tokens-pipeline.md
**Created:** 2026-02-04

---

## Summary

Build a token pipeline that generates fluid CSS custom properties from Figma design tokens. Uses utopia-core for space/type scale calculations and individual clamp calculations for line heights. Terrazzo handles color and font tokens separately.

---

## Codebase Verification

- [x] utopia-core installed - Verified: yes, in `site/package.json`
- [x] @terrazzo/cli and @terrazzo/plugin-css installed - Verified: yes, in `site/package.json`
- [x] `site/src/tokens/` directory exists - Verified: yes, with `design.tokens.json` and placeholder `index.ts`
- [x] Token file contains expected structure - Verified: yes, `_theme-declarations`, `type-primitives`, `space-primitives` all present

**Patterns to leverage:**

- Existing Terrazzo config at `site/terrazzo.config.mjs`
- Monorepo structure with scripts in `site/package.json`

**Discrepancies found:**

- Terrazzo config points to non-existent `./tokens.json` (will be fixed in Task 6)

---

## Tasks

### Task 1: Create fluid token generator script (space scale)

**Description:** Create `generate-fluid-tokens.js` that reads config from `design.tokens.json` and uses utopia-core's `calculateSpaceScale()` to generate space size tokens and one-up pairs. The number of sizes is determined by the `Positive spaces` and `Negative spaces` multiplier arrays in `_theme-declarations.Space Boundaries`.

**Files:**

- `site/src/tokens/generate-fluid-tokens.js` - create

**Key implementation details:**

- Read viewport bounds from `_theme-declarations.Viewport` (Min width, Max width)
- Read space config from `_theme-declarations.Space Boundaries` (Min size, Max size, Positive spaces, Negative spaces)
- Parse the comma-separated multiplier strings into arrays
- Pass to `calculateSpaceScale()` which returns sizes and one-up pairs
- Format output as CSS custom properties (`:root { --space-3xs: clamp(...); }`)

**Done when:** Running the script outputs space scale CSS variables (sizes + one-up pairs) to console

**Commit:** "Add fluid token generator with space scale"

---

### Task 2: Add custom space pairs to generator

**Description:** Extend generator to read custom pairs from `_theme-declarations.Space Boundaries.Custom spaces` and generate additional pair tokens using `calculateClamp()`.

**Files:**

- `site/src/tokens/generate-fluid-tokens.js` - modify

**Key implementation details:**

- Parse `Custom spaces` value (e.g., "S-L") into pairs
- Look up min/max values for each size from the generated space scale
- Use `calculateClamp()` to generate the fluid value

**Done when:** Running script also outputs `--space-s-l` (and any other custom pairs defined in config)

**Commit:** "Add custom space pairs to fluid token generator"

---

### Task 3: Add type scale generation

**Description:** Add `calculateTypeScale()` from utopia-core to generate font size steps. The number of steps is determined by `Positive steps` and `Negative steps` in `_theme-declarations.Type Boundaries`.

**Files:**

- `site/src/tokens/generate-fluid-tokens.js` - modify

**Key implementation details:**

- Read type config from `_theme-declarations.Type Boundaries` (Min size, Max size, Min scale, Max scale, Positive steps, Negative steps)
- Pass to `calculateTypeScale()` which returns all steps
- Format as `--step-N` (positive) and `--step--N` (negative, note double dash)

**Done when:** Running script outputs all font size step tokens based on config

**Commit:** "Add type scale to fluid token generator"

---

### Task 4: Add line height generation

**Description:** Add line height calculations by iterating through the explicit step definitions in `_fluid-tokens.line-height-body` and `_fluid-tokens.line-height-heading`. For each step, resolve the min/max values from `type-primitives` and use `calculateClamp()`.

**Files:**

- `site/src/tokens/generate-fluid-tokens.js` - modify

**Key implementation details:**

- Iterate through keys in `_fluid-tokens.line-height-body` (e.g., "step 8", "step -1")
- For each, resolve min from `type-primitives.Line height @min.Step N`
- Resolve max from `type-primitives.Line height body @max.Step N`
- Use `calculateClamp()` with viewport bounds to generate fluid value
- Repeat for `line-height-heading` using `Line height heading @max`
- Format step names: "step 8" → "step-8", "step -1" → "step--1"

**Done when:** Running script outputs `--lh-body-step-*` and `--lh-heading-step-*` for all defined steps

**Commit:** "Add line height generation to fluid token generator"

---

### Task 5: Add CSS file output and npm scripts

**Description:** Update generator to write output to `fluid-tokens.css` with organized sections. Add npm scripts to `site/package.json`.

**Files:**

- `site/src/tokens/generate-fluid-tokens.js` - modify to write file
- `site/package.json` - add scripts

**Scripts to add:**

```json
"tokens:fluid": "node src/tokens/generate-fluid-tokens.js",
"tokens:terrazzo": "terrazzo build",
"tokens": "npm run tokens:fluid && npm run tokens:terrazzo"
```

**Done when:**

- `npm run tokens:fluid` generates `site/src/tokens/fluid-tokens.css`
- `npm run tokens:terrazzo` runs Terrazzo build
- `npm run tokens` runs both sequentially

**Commit:** "Add CSS output and npm scripts for token builds"

---

### Task 6: Configure Terrazzo for color and font tokens

**Description:** Update Terrazzo config to output color primitives and font tokens (font-family, font-weight). Exclude fluid tokens that are handled by the custom script.

**Files:**

- `site/terrazzo.config.mjs` - modify

**Key implementation details:**

- Point to `./src/tokens/design.tokens.json`
- Configure CSS plugin to output to `./src/tokens/`
- May need to filter which token groups are processed

**Done when:** Running `npm run tokens:terrazzo` generates CSS with color primitives and font tokens in `site/src/tokens/`

**Commit:** "Configure Terrazzo for color and font tokens"

---

## Acceptance Criteria

- [x] Running `npm run tokens:fluid` generates `site/src/tokens/fluid-tokens.css`
- [x] `fluid-tokens.css` contains space sizes with names matching utopia convention (`--space-3xs`, `--space-s`, etc.)
- [x] `fluid-tokens.css` contains one-up pairs (`--space-3xs-2xs`, `--space-s-m`, etc.)
- [x] `fluid-tokens.css` contains custom pairs from config (`--space-s-l`)
- [x] `fluid-tokens.css` contains font size steps (`--step-0`, `--step-8`, `--step--1`, etc.)
- [x] `fluid-tokens.css` contains line heights for body and heading variants
- [x] All clamp values use viewport range from config (320px–1820px)
- [x] Running `npm run tokens:terrazzo` generates color and font tokens
- [x] Running `npm run tokens` executes both builds
- [x] Number of tokens in each scale is driven by config values, not hardcoded

---

## Notes

- The generator reads config values from `design.tokens.json` so changes in Figma automatically affect output
- Line heights are handled differently from type/space - they iterate explicit token definitions rather than using scale calculation
- Grid tokens are out of scope for this phase (noted as future design in design doc)
- Terrazzo plugin approach (single orchestrated build) is noted as future evolution
- **Figma rename (post-build):** After the pipeline is working, Figma variables should be renamed to match utopia output conventions (see design doc for full specification). This is required for Terrazzo to correctly resolve references when higher-level tokens reference fluid tokens (e.g., a `button-padding` token referencing `{_fluid-tokens.space-size.s}` needs Terrazzo to output `var(--space-s)`). Not a build blocker for this phase, but needed before component-level tokens are added.
