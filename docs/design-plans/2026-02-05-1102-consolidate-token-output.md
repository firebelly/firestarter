# Consolidate Token Output

**Created:** 2026-02-05
**Status:** Design
**Implementation Plan Doc:** docs/implementation-plans/2026-02-05-1107-consolidate-token-output.md

---

## Overview

**What:** Merge the two token pipeline outputs (`fluid-tokens.css` and `terrazzo-tokens.css`) into a single `tokens.css` file.

**Why:** Simplifies the token output — one file to import, fewer moving parts, cleaner build.

**Type:** Enhancement

---

## Requirements

### Must Have

- [ ] Single output file: `src/tokens/tokens.css`
- [ ] Terrazzo output (colors, font-family, font-weight) and fluid tokens (space, type, line heights) combined in one file
- [ ] Single `tokens` script in `package.json` replaces the three existing scripts
- [ ] Old output files (`fluid-tokens.css`, `terrazzo-tokens.css`) removed from repo

### Nice to Have

_None_

### Out of Scope

- Changing token values or naming conventions
- Terrazzo plugin approach (still future work)
- Storybook or Next.js integration

---

## Design Decisions

### Append strategy over concatenation

**Decision:** Terrazzo writes `tokens.css` first, then `generate-fluid-tokens.js` appends its output to the same file. This avoids a separate concatenation step and keeps the build simple: `tz build && node src/tokens/generate-fluid-tokens.js`.

### Single script replaces three

**Decision:** Remove `tokens:fluid` and `tokens:terrazzo` as separate scripts. The single `tokens` script runs both steps in sequence. There's no need to run them independently.

---

## Acceptance Criteria

- [ ] Running `pnpm run tokens` produces `src/tokens/tokens.css`
- [ ] `tokens.css` contains Terrazzo output (colors, font-family, font-weight) followed by fluid tokens (space, type, line heights)
- [ ] No `tokens:fluid` or `tokens:terrazzo` scripts remain in `package.json`
- [ ] `fluid-tokens.css` and `terrazzo-tokens.css` are deleted from the repo
- [ ] No references to old filenames remain in the codebase

---

## Files to Create/Modify

```
site/terrazzo.config.mjs                      # change output filename to tokens.css
site/src/tokens/generate-fluid-tokens.js      # append to tokens.css instead of writing fluid-tokens.css
site/package.json                             # single tokens script, remove tokens:fluid and tokens:terrazzo
site/src/tokens/fluid-tokens.css              # delete
site/src/tokens/terrazzo-tokens.css            # delete
```

---

## Build Log

_Filled in during `/build` phase_

| Date       | Task   | Files                                                             | Notes                                                                    |
| ---------- | ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 2026-02-05 | Task 1 | site/terrazzo.config.mjs                                          | Changed output filename from `terrazzo-tokens.css` to `tokens.css`       |
| 2026-02-05 | Task 2 | site/src/tokens/generate-fluid-tokens.js                          | Changed `writeFileSync` to `appendFileSync`, output path to `tokens.css` |
| 2026-02-05 | Task 3 | site/package.json, deleted fluid-tokens.css & terrazzo-tokens.css | Consolidated to single `tokens` script, removed old output files         |

---

## Completion

**Completed:** 2026-02-05
**Final Status:** Done

**Summary:** Consolidated two token CSS outputs into a single `tokens.css` file. Terrazzo writes first, fluid token generator appends. Three npm scripts replaced with one.

**Deviations from Plan:** None
