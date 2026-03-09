# Implementation Plan: Storybook Token Display

**Design Spec:** docs/design-plans/2026-02-12-1651-storybook-token-display.md
**Created:** 2026-02-12

---

## Summary

Create custom React viewer components displayed via MDX pages in Storybook for browsing design tokens (colors, typography, spacing). A hand-authored `token-data.ts` provides metadata. Six focused viewer components are composed by three MDX pages that appear under a "Tokens" sidebar group.

---

## Codebase Verification

- [x] `tokens.css` exists at `site/src/tokens/tokens.css` with expected CSS var naming — Verified
- [x] `design.tokens.json` has min/max primitive values for all fluid tokens — Verified
- [x] Storybook story glob (`../src/**/*.mdx`) will pick up files in `site/src/stories/tokens/` — Verified
- [x] No existing token viewer components — Verified
- [x] Storybook v10 with `@storybook/nextjs-vite` framework — Verified
- [x] Color hue groups match design spec (Gray, Blue, Magenta, Lemon, Teal) — Verified

**Patterns to leverage:**

- MDX page pattern from `Configure.mdx` — `<Meta>` tag for sidebar title, inline `<style>` for page CSS
- Terrazzo `variableName` logic in `terrazzo.config.mjs` confirms CSS var naming (em-dash → hyphen)

**Discrepancies found:**

- Design spec says "Modify: None" but `preview.ts` needs a `tokens.css` import for CSS vars to be available at render time. One-line addition. Approved during planning.

---

## Tasks

### Task 1: Create token data file and import tokens.css

**Description:** Create the hand-authored `token-data.ts` with typed arrays for all token groups. Add `tokens.css` import to `preview.ts`.

**Files:**

- `site/src/stories/tokens/token-data.ts` — create
- `site/.storybook/preview.ts` — modify (add CSS import)

**Data to include:**

- **Colors:** Grouped by hue (gray, blue, magenta, lemon, teal). Each entry: `{ cssVar, label, hsl }`.
- **Font families:** `{ cssVar, label, value }` for body (Inter) and heading (Platform).
- **Font weights:** `{ cssVar, label, value }` for medium and bold.
- **Type steps:** Steps -5 through 8. Each: `{ cssVar, label, minPx, maxPx }`.
- **Line heights (body):** Steps -5 through 8. Each: `{ cssVar, label, minPx, maxPx }`.
- **Line heights (heading):** Steps -5 through 8. Each: `{ cssVar, label, minPx, maxPx }`.
- **Space sizes:** 3XS through 6XL. Each: `{ cssVar, label, minPx, maxPx }`.
- **Space pairs:** Adjacent pairs (3XS-2XS through 5XL-6XL) + custom pairs (S-L, XS-M). Each: `{ cssVar, label, minPx, maxPx }`.

Min/max values sourced from `design.tokens.json` primitive groups (`Space primitives.Space @min/@max`, `Type primitives.Font size @min/@max`, `Type primitives.Line height @min` + `body @max` / `heading @max`). Round to 2 decimal places.

**preview.ts change:**

```ts
import "../src/tokens/tokens.css";
```

**Done when:** File exports typed arrays. TypeScript compiles. `preview.ts` imports tokens.css.

**Commit:** `Add token metadata and import tokens.css in Storybook preview`

---

### Task 2: Create color token viewer

**Description:** Create `ColorSwatches.tsx` and `Color.mdx`. The component renders a group of swatches as a grid — each swatch shows the color (rendered via CSS var), token name, and HSL value string. The MDX page renders one `ColorSwatches` per hue group with a heading.

**Files:**

- `site/src/stories/tokens/ColorSwatches.tsx` — create
- `site/src/stories/tokens/Color.mdx` — create

**Component interface:**

```tsx
// ColorSwatches.tsx
interface ColorToken {
  cssVar: string;
  label: string;
  hsl: string;
}

interface ColorSwatchesProps {
  colors: ColorToken[];
}
```

Each swatch: a square div with `backgroundColor: var(--color-primitives-...)`, the CSS var name below, and the HSL value below that.

**MDX structure:**

```mdx
<Meta title="Tokens/Color" />

# Color

## Gray

<ColorSwatches colors={colorTokens.gray} />

## Blue

<ColorSwatches colors={colorTokens.blue} />
...
```

**Done when:** Storybook sidebar shows Tokens > Color. Swatches render grouped by hue with token name and HSL value.

**Commit:** `Add color token viewer`

---

### Task 3: Create typography token viewers

**Description:** Create three viewer components and one MDX page.

**Files:**

- `site/src/stories/tokens/FontSpecimen.tsx` — create
- `site/src/stories/tokens/TypeScale.tsx` — create
- `site/src/stories/tokens/LineHeightScale.tsx` — create
- `site/src/stories/tokens/Typography.mdx` — create

**FontSpecimen component:**

Renders a list of font family or weight specimens. Each row shows the token name and sample text rendered with that font family/weight via CSS var.

```tsx
interface FontSpecimenProps {
  fonts: Array<{ cssVar: string; label: string; value: string }>;
  property: "fontFamily" | "fontWeight"; // which CSS property to apply
}
```

**TypeScale component:**

Renders the type scale. Each row shows: token name (`--step-N`), min/max px values, and sample text rendered at `font-size: var(--step-N)`. Text scales with viewport.

```tsx
interface TypeScaleProps {
  steps: Array<{ cssVar: string; label: string; minPx: number; maxPx: number }>;
}
```

**LineHeightScale component:**

Renders line height scale. Each row shows: token name, min/max px values, and multi-line sample text with `line-height: var(--lh-body-step-N)` (or heading). Text at corresponding type step size via `font-size: var(--step-N)`.

```tsx
interface LineHeightScaleProps {
  steps: Array<{ cssVar: string; label: string; minPx: number; maxPx: number }>;
  fontSizeSteps: Array<{ cssVar: string }>; // parallel array for font-size pairing
}
```

**MDX structure:**

```mdx
<Meta title="Tokens/Typography" />

# Typography

## Font Families

<FontSpecimen fonts={fontFamilies} property="fontFamily" />

## Font Weights

<FontSpecimen fonts={fontWeights} property="fontWeight" />

## Type Scale

<TypeScale steps={typeSteps} />

## Line Height — Body

<LineHeightScale steps={lineHeightBodySteps} fontSizeSteps={typeSteps} />

## Line Height — Heading

<LineHeightScale steps={lineHeightHeadingSteps} fontSizeSteps={typeSteps} />
```

**Done when:** Storybook sidebar shows Tokens > Typography. All five sections render. Fluid text resizes with viewport.

**Commit:** `Add typography token viewers`

---

### Task 4: Create spacing token viewers

**Description:** Create two viewer components and one MDX page.

**Files:**

- `site/src/stories/tokens/SpaceSizes.tsx` — create
- `site/src/stories/tokens/SpacePairs.tsx` — create
- `site/src/stories/tokens/Spacing.mdx` — create

**SpaceSizes component:**

Renders space sizes as horizontal bars. Each row: token name, min/max px, and a bar div with `width: var(--space-m)` (fluid, responds to viewport). Fixed height, filled background.

```tsx
interface SpaceSizesProps {
  sizes: Array<{ cssVar: string; label: string; minPx: number; maxPx: number }>;
}
```

**SpacePairs component:**

Same visual treatment as SpaceSizes but for space pairs.

```tsx
interface SpacePairsProps {
  pairs: Array<{ cssVar: string; label: string; minPx: number; maxPx: number }>;
}
```

**MDX structure:**

```mdx
<Meta title="Tokens/Spacing" />

# Spacing

## Space Sizes

<SpaceSizes sizes={spaceSizes} />

## Space Pairs

<SpacePairs pairs={spacePairs} />
```

**Done when:** Storybook sidebar shows Tokens > Spacing. Bars render and resize fluidly with viewport.

**Commit:** `Add spacing token viewers`

---

## Acceptance Criteria

- [x] Storybook sidebar shows **Tokens** group with three entries: Color, Typography, Spacing
- [x] Color page renders swatches grouped by hue (Gray, Blue, Magenta, Lemon, Teal), each showing token name and HSL value
- [x] Typography page renders font family specimens with sample text
- [x] Typography page renders font weight specimens with sample text
- [x] Typography page renders type scale — each step shows token name, min/max px, and sample text rendered at that step's fluid size
- [x] Typography page renders body line height scale — each step shows token name, min/max px, and multi-line sample text with the line height applied
- [x] Typography page renders heading line height scale — same as body
- [x] Spacing page renders space sizes (3XS–6XL) as fluid visual bars with token name and min/max px
- [x] Spacing page renders space pairs as fluid visual bars with token name and min/max px
- [x] Resizing the Storybook viewport causes all fluid elements (bars, text) to scale visibly
- [x] No new npm dependencies introduced
- [x] `tokens.css` is unchanged

---

## Notes

- `preview.ts` modification (one import line) was not in the design spec's "Modify: None" section but is necessary for CSS vars to be available. Approved during planning.
- Min/max px values are manually transcribed from `design.tokens.json` primitive groups. If values look wrong, cross-reference the JSON source.
- Font files (Inter, Platform) must be available in the Storybook environment for font specimens to render correctly. If fonts aren't loaded, specimens will fall back to system fonts.
