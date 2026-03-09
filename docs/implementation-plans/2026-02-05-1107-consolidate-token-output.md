# Implementation Plan: Consolidate Token Output

**Design Spec:** docs/design-specs/2026-02-05-1102-consolidate-token-output.md
**Created:** 2026-02-05

---

## Summary

Merge the two token pipeline outputs (`fluid-tokens.css` and `terrazzo-tokens.css`) into a single `tokens.css` file. Terrazzo writes first, then the fluid token generator appends. Replace the three npm scripts with one.

---

## Codebase Verification

- [x] `terrazzo.config.mjs` outputs `terrazzo-tokens.css` to `./src/tokens/` — Verified
- [x] `generate-fluid-tokens.js` writes `fluid-tokens.css` via `writeFileSync` — Verified
- [x] `package.json` has three scripts: `tokens:fluid`, `tokens:terrazzo`, `tokens` — Verified
- [x] Both CSS output files exist at `site/src/tokens/` — Verified
- [x] No components or pages import either CSS file — Verified

**Patterns to leverage:**

- `appendFileSync` from `node:fs` (already imported as `writeFileSync` in `generate-fluid-tokens.js`)

**Discrepancies found:**

- None

---

## Tasks

### Task 1: Update Terrazzo config output filename

**Description:** Change the Terrazzo CSS plugin output filename from `terrazzo-tokens.css` to `tokens.css`.
**Files:**

- `site/terrazzo.config.mjs` - modify

**Code example:**

```js
filename: "tokens.css",
```

**Done when:** `tz build` outputs to `site/src/tokens/tokens.css`
**Commit:** "Update Terrazzo output filename to tokens.css"

---

### Task 2: Update fluid token generator to append

**Description:** Change the fluid token generator to append its output to `tokens.css` instead of writing a separate `fluid-tokens.css`. Use `appendFileSync` instead of `writeFileSync` and update the output path.
**Files:**

- `site/src/tokens/generate-fluid-tokens.js` - modify

**Code example:**

```js
import { readFileSync, appendFileSync } from "node:fs";
// ...
const outputPath = join(__dirname, "tokens.css");
appendFileSync(outputPath, css);
```

**Done when:** Running `node src/tokens/generate-fluid-tokens.js` appends fluid tokens to the existing `tokens.css` file
**Commit:** "Update fluid token generator to append to tokens.css"

---

### Task 3: Consolidate package.json scripts and clean up

**Description:** Replace the three token scripts with a single `tokens` script. Delete old CSS output files.
**Files:**

- `site/package.json` - modify
- `site/src/tokens/fluid-tokens.css` - delete
- `site/src/tokens/terrazzo-tokens.css` - delete

**Code example:**

```json
"tokens": "tz build && node src/tokens/generate-fluid-tokens.js"
```

**Done when:**

- `pnpm run tokens` produces a single `site/src/tokens/tokens.css` containing Terrazzo output followed by fluid tokens
- No `tokens:fluid` or `tokens:terrazzo` scripts remain
- Old CSS files deleted

**Commit:** "Consolidate token scripts and remove old output files"

---

## Acceptance Criteria

- [ ] Running `pnpm run tokens` produces `src/tokens/tokens.css`
- [ ] `tokens.css` contains Terrazzo output (colors, font-family, font-weight) followed by fluid tokens (space, type, line heights)
- [ ] No `tokens:fluid` or `tokens:terrazzo` scripts remain in `package.json`
- [ ] `fluid-tokens.css` and `terrazzo-tokens.css` are deleted from the repo
- [ ] No references to old filenames remain in the codebase (excluding historical design/implementation plan docs)
