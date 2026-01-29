# ESLint Import Sorting

**Created:** 2026-01-28
**Status:** Complete
**Implementation Plan Doc:** docs/implementation-plans/2026-01-28-1200-eslint-import-sorting.md

---

## Overview

**What:** Add `eslint-plugin-simple-import-sort` to enforce consistent ordering of import and export statements across the `site/` codebase.

**Why:** Import order currently varies file-to-file. Enforcing a consistent, auto-fixable sort order reduces noise in diffs and keeps the codebase uniform.

**Type:** Enhancement

---

## Requirements

### Must Have

- [ ] Install `eslint-plugin-simple-import-sort` as a dev dependency in `site/`
- [ ] Enable `simple-import-sort/imports` rule as `"error"`
- [ ] Enable `simple-import-sort/exports` rule as `"error"`
- [ ] Disable built-in `sort-imports` rule if enabled by Next.js config (to avoid conflicts)
- [ ] Auto-fix all existing files with `eslint --fix`

### Nice to Have

_None_

### Out of Scope

- Custom import group ordering (using plugin defaults)
- Import sorting outside `site/` (e.g., `cms/`)

---

## Design Decisions

### Import sorting plugin

**Options considered:**

1. **Built-in `sort-imports`** — Zero dependencies, but cannot auto-fix declaration order (only fixes member sorting within a single import). Rule is frozen; no future improvements.
2. **`eslint-plugin-import-x`** — Granular group control and additional import rules (no duplicates, no circular deps), but heavier config and dependency footprint. Auto-fix only sorts groups, not within groups.
3. **`simple-import-sort`** — Lightweight, fully auto-fixable, deterministic output. One small dependency.

**Decision:** `simple-import-sort` — Full auto-fix is essential for developer experience. Deterministic sorting means the same imports always produce the same order, which is the primary goal (consistency over convention). Minimal config required for the existing flat config setup.

### Rule severity

**Decision:** `"error"` — Violations should fail CI, not just warn. Auto-fix makes this painless.

---

## Acceptance Criteria

- [ ] `eslint-plugin-simple-import-sort` is listed as a dev dependency in `site/package.json`
- [ ] Both `simple-import-sort/imports` and `simple-import-sort/exports` rules are enabled as `"error"` in `site/eslint.config.mjs`
- [ ] `pnpm --filter site lint` runs without configuration errors
- [ ] Running `pnpm --filter site lint --fix` auto-sorts import and export statements
- [ ] No conflicts with existing ESLint rules (Next.js, Storybook, Prettier)

---

## Files to Create/Modify

```
site/package.json          # add eslint-plugin-simple-import-sort dev dependency
site/eslint.config.mjs     # add plugin and rules
```

---

## Build Log

_Filled in during `/build` phase_

| Date       | Task   | Files                  | Notes                                                                                                                               |
| ---------- | ------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-28 | Task 1 | site/eslint.config.mjs | Deviated: `pnpm --filter site lint` doesn't work — pnpm-workspace.yaml has no `packages` field. Use `cd site && pnpm lint` instead. |
| 2026-01-28 | Task 2 | 12 files auto-fixed    | Clean lint pass. Pre-commit hook also verified working.                                                                             |

---

## Completion

**Completed:** 2026-01-28
**Final Status:** Complete

**Summary:** Installed `eslint-plugin-simple-import-sort` and configured both `simple-import-sort/imports` and `simple-import-sort/exports` rules as `"error"` in `site/eslint.config.mjs`. Auto-fixed 12 existing files. Lint passes cleanly and the pre-commit hook catches unsorted imports.

**Deviations from Plan:** The design doc and implementation plan referenced `pnpm --filter site lint` for running lint, but this doesn't work because `pnpm-workspace.yaml` has no `packages` field. The working command is `cd site && pnpm lint`. No other deviations — all acceptance criteria met.
