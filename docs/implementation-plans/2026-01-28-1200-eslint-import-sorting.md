# Implementation Plan: ESLint Import Sorting

**Design Spec:** docs/design-plans/2026-01-28-1200-eslint-import-sorting.md
**Created:** 2026-01-28

---

## Summary

Add `eslint-plugin-simple-import-sort` to enforce consistent, auto-fixable import/export ordering across the `site/` codebase.

---

## Codebase Verification

- [x] `site/eslint.config.mjs` uses ESLint flat config with `defineConfig` - Verified: yes
- [x] No existing `sort-imports` rule enabled - Verified: correct, no conflict to disable
- [x] `eslint-config-prettier` is applied last in the config chain - Verified: yes (`prettierConfig` is the final entry)
- [x] `eslint-plugin-simple-import-sort` is not yet installed - Verified: correct

**Patterns to leverage:**

- Existing flat config pattern: import plugin, spread/add config object into the `defineConfig` array

**Discrepancies found:**

- None

---

## Tasks

### Task 1: Install plugin and configure ESLint rules

**Description:** Install `eslint-plugin-simple-import-sort` as a dev dependency and add the plugin + rules to the ESLint flat config.
**Files:**

- `site/package.json` - modify (new dev dependency added by pnpm)
- `site/eslint.config.mjs` - modify (import plugin, add rules)

**Code example:**

```js
// eslint.config.mjs — add import at top
import simpleImportSort from "eslint-plugin-simple-import-sort";

// Add rules object before prettierConfig (which must stay last)
{
  plugins: {
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
},
```

**Done when:**

- `pnpm --filter site lint` runs without configuration errors
- Plugin appears in `site/package.json` devDependencies

**Commit:** "Add eslint-plugin-simple-import-sort with import/export rules"

---

### Task 2: Auto-fix existing files and verify

**Description:** Run ESLint auto-fix to sort all existing import/export statements, then verify a clean lint pass.
**Files:**

- All `.ts` / `.tsx` / `.js` / `.mjs` files in `site/` (auto-fixed in place)

**Done when:**

- `pnpm --filter site lint` passes with zero errors
- Import statements in modified files are visibly sorted

**Commit:** "Auto-fix import/export sort order across site/"

---

## Verification Checklist

- [x] `pnpm --filter site lint` passes with zero errors
- [x] `pnpm --filter site lint --fix` is idempotent (running it again changes nothing)
- [x] No conflicts with Next.js, Storybook, or Prettier ESLint configs
- [x] `pnpm --filter site build` still succeeds (imports not broken)

---

## Notes

- `prettierConfig` must remain the last entry in the ESLint config array — the new plugin config should be inserted before it.
- The plugin's default grouping is used intentionally (per design spec "Out of Scope" — no custom group ordering).
