# Storybook Token Display

**Created:** 2026-02-12
**Status:** Complete
**Implementation Plan Doc:** docs/implementation-plans/2026-02-12-1743-storybook-token-display.md

---

## Overview

**What:** Custom React viewer components displayed via MDX pages in Storybook for browsing design tokens (colors, typography, spacing).

**Why:** With the structured/commented CSS approach removed, designers need a way to verify the token pipeline output in Storybook. Fluid tokens (space, type, line height) need live visual demos that respond to viewport resizing — something no existing addon handles well.

**Type:** Feature

---

## Requirements

### Must Have

- [ ] Storybook sidebar shows a "Tokens" group with Color, Typography, and Spacing entries
- [ ] Color page renders swatches grouped by hue with token name and HSL value
- [ ] Typography page renders font family specimens, font weight specimens, fluid type scale, and line height scales (body + heading)
- [ ] Spacing page renders fluid space sizes and space pairs as visual bars
- [ ] All fluid viewers show min/max px values
- [ ] All fluid viewers use CSS vars for rendering — visual elements respond to viewport resize
- [ ] No new dependencies added
- [ ] Viewer components live in `site/src/stories/tokens/`, not production `components/`
- [ ] `tokens.css` is not modified

### Nice to Have

- [ ] Generated data file replacing hand-authored `token-data.ts` (see Future Consideration below)
- [ ] Line height viewer paired with corresponding type step for real leading demo

### Out of Scope

- Semantic token aliases (e.g., `--color-primary`)
- Component-level token variables (e.g., `--button-background-color`)
- Space primitives (Utopia-derived source values, not hand-authored)
- Type primitives for min/max font size and line height (Utopia inputs)
- Live pixel readout via `getComputedStyle`
- Modifications to the token build pipeline

---

## Design Decisions

### 1. Sidebar organization

**Options considered:**

1. Primitives / Semantic / Component — standard design token taxonomy
2. Primitives / Scales — groups by generation method (raw values vs. fluid output)
3. Color / Typography / Spacing — groups by domain

**Decision:** Color / Typography / Spacing. Groups by what the token describes, not how it's generated. A designer looking for spacing goes to Spacing. Each page shows the complete picture for its domain.

### 2. Data source for viewer components

**Options considered:**

1. Cross-reference at render time — import `design.tokens.json`, replicate Terrazzo `variableName` logic to derive CSS var names. Fragile: two sources of truth for the naming transform.
2. Generated data file — a build step produces a combined JSON with var names, grouping, and min/max values. Clean single source, but adds pipeline complexity.
3. Static hand-authored data — a manually maintained `token-data.ts` file listing each token's CSS var name, group, and min/max values.

**Decision:** Option 3 (static hand-authored data). Tokens don't change frequently — they're a design system foundation. The hand-authored file gives full control over display order and grouping with zero build coupling. Trade-off is manual upkeep when tokens change.

### 3. Display format for token names

**Decision:** CSS variable names (e.g., `--space-m`, `--step-3`). That's what developers type when using the token. Page grouping and headings provide context.

### 4. Component granularity

**Decision:** Small focused components composed by MDX pages. Six viewer components, each responsible for one visual concern. MDX pages own headings, descriptions, and layout. This keeps components simple and the MDX pages readable.

### 5. Scope limited to base tokens

**Decision:** Only display primitive and fluid scale tokens. Semantic aliases and component-level variables are just renaming — showing every layer would be redundant. The viewer shows the building blocks.

---

## Future Consideration: Generated Data File

The hand-authored `token-data.ts` approach works well when tokens are stable. If token churn increases (frequent Figma updates, more token categories), consider replacing it with a generated file:

- Add a script to the `pnpm tokens` pipeline that reads both `design.tokens.json` (for grouping and min/max values) and `terrazzo.config.mjs` (for `variableName` mappings)
- Outputs a single `token-meta.json` with CSS var names, groups, and min/max values pre-computed
- Viewer components import this instead of `token-data.ts`
- Eliminates manual upkeep at the cost of a more complex build pipeline

This is a straightforward upgrade path — the viewer component interfaces wouldn't need to change, only the data import.

---

## Acceptance Criteria

- [ ] Storybook sidebar shows **Tokens** group with three entries: Color, Typography, Spacing
- [ ] Color page renders swatches grouped by hue (Gray, Blue, Magenta, Lemon, Teal), each showing token name and HSL value
- [ ] Typography page renders font family specimens with sample text
- [ ] Typography page renders font weight specimens with sample text
- [ ] Typography page renders type scale — each step shows token name, min/max px, and sample text rendered at that step's fluid size
- [ ] Typography page renders body line height scale — each step shows token name, min/max px, and multi-line sample text with the line height applied
- [ ] Typography page renders heading line height scale — same as body
- [ ] Spacing page renders space sizes (3XS–6XL) as fluid visual bars with token name and min/max px
- [ ] Spacing page renders space pairs as fluid visual bars with token name and min/max px
- [ ] Resizing the Storybook viewport causes all fluid elements (bars, text) to scale visibly
- [ ] No new npm dependencies introduced
- [ ] `tokens.css` is unchanged

---

## Files to Create/Modify

### Create

```
site/src/stories/tokens/token-data.ts       # Hand-authored token metadata (names, groups, min/max values)
site/src/stories/tokens/Color.mdx            # Color tokens MDX page
site/src/stories/tokens/Typography.mdx       # Typography tokens MDX page
site/src/stories/tokens/Spacing.mdx          # Spacing tokens MDX page
site/src/stories/tokens/ColorSwatches.tsx     # Color swatch renderer
site/src/stories/tokens/FontSpecimen.tsx      # Font family/weight renderer
site/src/stories/tokens/TypeScale.tsx         # Fluid type step renderer
site/src/stories/tokens/LineHeightScale.tsx   # Fluid line height renderer
site/src/stories/tokens/SpaceSizes.tsx        # Fluid space size renderer
site/src/stories/tokens/SpacePairs.tsx        # Fluid space pair renderer
```

### Modify

None.

---

## Build Log

_Filled in during `/build` phase_

| Date       | Task   | Files                                                                            | Notes                                                                                                                                                       |
| ---------- | ------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-12 | Task 1 | `site/src/stories/tokens/token-data.ts`, `site/.storybook/preview.ts`            | Created token metadata; added tokens.css import to preview (deviation from "Modify: None" — approved during planning)                                       |
| 2026-02-12 | Task 2 | `site/src/stories/tokens/ColorSwatches.tsx`, `site/src/stories/tokens/Color.mdx` | Color swatch grid component + MDX page with 5 hue groups. Deviation: changed `@storybook/blocks` to `@storybook/addon-docs/blocks` to match project pattern |
| 2026-02-12 | Task 3 | `FontSpecimen.tsx`, `TypeScale.tsx`, `LineHeightScale.tsx`, `Typography.mdx`     | Three typography viewer components + MDX page with 5 sections. Used `@storybook/addon-docs/blocks` per Task 2 fix                                           |
| 2026-02-12 | Task 4 | `SpaceSizes.tsx`, `SpacePairs.tsx`, `Spacing.mdx`                                | Two spacing viewer components + MDX page. Sizes use blue-102 bar color, pairs use blue-103 for visual distinction                                           |

---

## Completion

**Completed:** 2026-02-12
**Final Status:** Complete

**Summary:** All 4 tasks completed. 10 files created, 1 file modified. Six viewer components (ColorSwatches, FontSpecimen, TypeScale, LineHeightScale, SpaceSizes, SpacePairs) composed by three MDX pages (Color, Typography, Spacing) under a Tokens sidebar group. Hand-authored token-data.ts provides metadata. All 12 acceptance criteria passed.

**Deviations from Plan:**

- `preview.ts` modified to import `tokens.css` (approved during planning, design spec said "Modify: None")
- MDX `Meta` import changed from `@storybook/blocks` to `@storybook/addon-docs/blocks` to match existing project pattern
