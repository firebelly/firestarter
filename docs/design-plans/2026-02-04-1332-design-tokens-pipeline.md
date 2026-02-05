# Design Tokens Pipeline

**Created:** 2026-02-04
**Status:** Design
**Implementation Plan Doc:** docs/implementation-plans/2026-02-04-2051-design-tokens-pipeline.md

---

## Overview

**What:** A build pipeline that generates fluid CSS custom properties from Figma design tokens using utopia-core for scale calculations and Terrazzo for other token conversions.

**Why:** Enables fluid typography, spacing, and line-heights that scale smoothly between viewport sizes (320px–1820px) without breakpoints, while keeping the source tokens platform-agnostic.

**Type:** Feature

---

## Requirements

### Must Have

- [ ] Script that reads `design.tokens.json` and generates fluid CSS using utopia-core
- [ ] Space scale output: sizes (`--space-3xs` through `--space-6xl`), one-up pairs, custom pairs
- [ ] Type scale output: font sizes (`--step--5` through `--step-8`)
- [ ] Line height output: body and heading variants (`--lh-body-step-{n}`, `--lh-heading-step-{n}`)
- [ ] Terrazzo configured to output color and font tokens
- [ ] npm scripts to run both builds
- [ ] Figma rename specification documented

### Nice to Have

- [ ] Comments in CSS output organizing sections

### Out of Scope

- Grid tokens (future design)
- Typography composites / CSS class generation
- SCSS or JSON output formats
- Integration with Storybook/Next.js builds
- Component-level tokens
- File concatenation / single output file
- Terrazzo plugin (future evolution)

---

## Design Decisions

### Token file remains untouched

**Context:** Design tokens are platform-agnostic design decisions, not platform-specific code. The tokens file holds min/max values and scale parameters; the build interprets those for the target platform.

**Decision:** The Figma export (`design.tokens.json`) is never modified by the build. Clamp values are generated as part of CSS output, not stored in the tokens file.

### Parallel builds (Option A)

**Options considered:**

1. **Option A: Parallel outputs** — utopia-core script and Terrazzo run separately, each reading the same source file
2. **Option B: Terrazzo plugin** — Single orchestrated build where Terrazzo calls utopia-core via a custom plugin

**Decision:** Option A for this phase. Simpler to implement, gets conversions working. Option B noted as future evolution for a single orchestrated build.

### Naming conventions match utopia defaults

**Decision:** CSS output uses utopia's default naming:

| Token type | Format |
|------------|--------|
| Font sizes | `--step-8`, `--step-0`, `--step--2` |
| Spacing sizes | `--space-3xs`, `--space-s`, `--space-2xl` |
| Spacing pairs | `--space-3xs-2xs`, `--space-s-l` |
| Line heights | `--lh-body-step-8`, `--lh-heading-step-0` |

No mapping in the build. Figma variables will be renamed to match.

### One-up pairs generated automatically

**Decision:** utopia-core generates all adjacent pairs by default (`--space-3xs-2xs`, `--space-2xs-xs`, etc.). Custom pairs read from `_theme-declarations.Space Boundaries.Custom spaces`.

---

## Architecture

```
design.tokens.json (untouched source of truth)
       │
       ├──────────────────┐
       ↓                  ↓
  utopia script       Terrazzo
       │                  │
       ↓                  ↓
  fluid-tokens.css    terrazzo-tokens.css
  (space, type, lh)   (colors, font-family, font-weight)
```

### Build script structure

**generate-fluid-tokens.js**

```
Inputs:
  - src/tokens/design.tokens.json

Reads:
  - _theme-declarations.Viewport (minWidth: 320, maxWidth: 1820)
  - _theme-declarations.Type Boundaries (base sizes, ratios, steps)
  - _theme-declarations.Space Boundaries (base sizes, multipliers, custom pairs)
  - type-primitives.Line height @min
  - type-primitives.Line height body @max
  - type-primitives.Line height heading @max

Generates (via utopia-core):
  - calculateSpaceScale() → space sizes + one-up pairs + custom pairs
  - calculateTypeScale() → font size steps
  - calculateClamp() per step → line heights (body + heading)

Outputs:
  - src/tokens/fluid-tokens.css
```

---

## CSS Output Format

```css
:root {
  /* Space sizes */
  --space-3xs: clamp(...);
  --space-2xs: clamp(...);
  --space-xs: clamp(...);
  --space-s: clamp(...);
  --space-m: clamp(...);
  --space-l: clamp(...);
  --space-xl: clamp(...);
  --space-2xl: clamp(...);
  --space-3xl: clamp(...);
  --space-4xl: clamp(...);
  --space-5xl: clamp(...);
  --space-6xl: clamp(...);

  /* Space one-up pairs */
  --space-3xs-2xs: clamp(...);
  --space-2xs-xs: clamp(...);
  --space-xs-s: clamp(...);
  --space-s-m: clamp(...);
  --space-m-l: clamp(...);
  --space-l-xl: clamp(...);
  --space-xl-2xl: clamp(...);
  --space-2xl-3xl: clamp(...);
  --space-3xl-4xl: clamp(...);
  --space-4xl-5xl: clamp(...);
  --space-5xl-6xl: clamp(...);

  /* Space custom pairs */
  --space-s-l: clamp(...);

  /* Font sizes */
  --step--5: clamp(...);
  --step--4: clamp(...);
  --step--3: clamp(...);
  --step--2: clamp(...);
  --step--1: clamp(...);
  --step-0: clamp(...);
  --step-1: clamp(...);
  --step-2: clamp(...);
  --step-3: clamp(...);
  --step-4: clamp(...);
  --step-5: clamp(...);
  --step-6: clamp(...);
  --step-7: clamp(...);
  --step-8: clamp(...);

  /* Line heights - body */
  --lh-body-step--5: clamp(...);
  --lh-body-step--4: clamp(...);
  --lh-body-step--3: clamp(...);
  --lh-body-step--2: clamp(...);
  --lh-body-step--1: clamp(...);
  --lh-body-step-0: clamp(...);
  --lh-body-step-1: clamp(...);
  --lh-body-step-2: clamp(...);
  --lh-body-step-3: clamp(...);
  --lh-body-step-4: clamp(...);
  --lh-body-step-5: clamp(...);
  --lh-body-step-6: clamp(...);
  --lh-body-step-7: clamp(...);
  --lh-body-step-8: clamp(...);

  /* Line heights - heading */
  --lh-heading-step--5: clamp(...);
  --lh-heading-step--4: clamp(...);
  --lh-heading-step--3: clamp(...);
  --lh-heading-step--2: clamp(...);
  --lh-heading-step--1: clamp(...);
  --lh-heading-step-0: clamp(...);
  --lh-heading-step-1: clamp(...);
  --lh-heading-step-2: clamp(...);
  --lh-heading-step-3: clamp(...);
  --lh-heading-step-4: clamp(...);
  --lh-heading-step-5: clamp(...);
  --lh-heading-step-6: clamp(...);
  --lh-heading-step-7: clamp(...);
  --lh-heading-step-8: clamp(...);
}
```

---

## Figma Rename Specification

Variables to rename in Figma to match utopia output:

### `_fluid-tokens.space-size`

| Current | New |
|---------|-----|
| `3XS` | `3xs` |
| `2XS` | `2xs` |
| `XS` | `xs` |
| `S` | `s` |
| `M` | `m` |
| `L` | `l` |
| `XL` | `xl` |
| `2XL` | `2xl` |
| `3XL` | `3xl` |
| `4XL` | `4xl` |
| `5XL` | `5xl` |
| `6XL` | `6xl` |

### `_fluid-tokens.space-size-pairs`

| Current | New |
|---------|-----|
| `3XS—2XS` | `3xs-2xs` |
| `2XS—XS` | `2xs-xs` |
| `XS—S` | `xs-s` |
| `S—M` | `s-m` |
| `M—L` | `m-l` |
| `L—XL` | `l-xl` |
| `XL—2XL` | `xl-2xl` |
| `2XL—3XL` | `2xl-3xl` |
| `3XL—4XL` | `3xl-4xl` |
| `4XL—5XL` | `4xl-5xl` |
| `5XL—6XL` | `5xl-6xl` |
| `Custom pairs/S—L` | `s-l` (flatten, remove nesting) |

### `_fluid-tokens.font-size`

| Current | New |
|---------|-----|
| `h1` | `step-8` |
| `h2` | `step-7` |
| `h3` | `step-6` |
| `h4` | `step-5` |
| `h5` | `step-4` |
| `h6` | `step-3` |
| `h7` | `step-2` |
| `p0` | `step-1` |
| `p1` | `step-0` |
| `p2` | `step--1` |
| `p3-caption-1` | `step--2` |
| `caption-2` | `step--3` |
| `dot-1` | `step--4` |
| `dot-2` | `step--5` |

### `_fluid-tokens.line-height-body` and `_fluid-tokens.line-height-heading`

| Current | New |
|---------|-----|
| `step 8` | `step-8` |
| `step 7` | `step-7` |
| `step 6` | `step-6` |
| `step 5` | `step-5` |
| `step 4` | `step-4` |
| `step 3` | `step-3` |
| `step 2` | `step-2` |
| `step 1` | `step-1` |
| `step 0` | `step-0` |
| `step -1` | `step--1` |
| `step -2` | `step--2` |
| `step -3` | `step--3` |
| `step -4` | `step--4` |
| `step -5` | `step--5` |

---

## Acceptance Criteria

- [ ] Running `npm run tokens:fluid` generates `src/tokens/fluid-tokens.css`
- [ ] `fluid-tokens.css` contains all space sizes (`--space-3xs` through `--space-6xl`)
- [ ] `fluid-tokens.css` contains all one-up pairs (`--space-3xs-2xs` through `--space-5xl-6xl`)
- [ ] `fluid-tokens.css` contains custom pairs from config (`--space-s-l`)
- [ ] `fluid-tokens.css` contains all font size steps (`--step--5` through `--step-8`)
- [ ] `fluid-tokens.css` contains all line heights for body and heading variants
- [ ] All clamp values use correct viewport range (320px–1820px)
- [ ] Running `npm run tokens:terrazzo` generates color and font tokens
- [ ] Running `npm run tokens` executes both builds
- [ ] Figma variables renamed per specification (manual task)

---

## Files to Create/Modify

```
src/tokens/generate-fluid-tokens.js   # new - utopia-core script
src/tokens/fluid-tokens.css           # new - generated output
package.json                          # add npm scripts
terrazzo.config.js                    # configure if needed
```

---

## Future Evolution

**Terrazzo Plugin (Option B)**

A future design could consolidate the build into a single Terrazzo-orchestrated process:

- Custom Terrazzo plugin reads `_theme-declarations`
- Plugin calls utopia-core during build
- Single output file
- Component tokens can reference fluid tokens naturally

---

## Build Log

_Filled in during `/build` phase_

| Date | Task | Files | Notes |
| ---- | ---- | ----- | ----- |
| 2026-02-04 | Task 1 | src/tokens/generate-fluid-tokens.js | Created script with space scale generation |
| 2026-02-04 | Task 2 | src/tokens/generate-fluid-tokens.js | Added custom space pairs; fixed NaN bug — size objects use `minSize`/`maxSize` not `min`/`max` |

---

## Completion

**Completed:** _TBD_
**Final Status:** _TBD_

**Summary:** _TBD_

**Deviations from Plan:** _TBD_
