# Configure Prettier

**Created:** 2026-01-28
**Status:** Design
**Implementation Plan Doc:** TBD

---

## Overview

**What:** Add Prettier as a code formatter across the entire Firestarter repo, integrated into the existing Lefthook pre-commit pipeline.

**Why:** Ensures consistent code formatting across the project without manual effort. Formatting is enforced automatically on commit, so all code in the repo stays consistent regardless of editor or developer preferences.

**Type:** Process

---

## Requirements

### Must Have
- [ ] Prettier installed as a root devDependency
- [ ] `.prettierrc` config file at repo root with explicit defaults
- [ ] `.prettierignore` for generated/vendored files
- [ ] Lefthook pre-commit job that runs Prettier before typecheck and lint
- [ ] `eslint-config-prettier` installed in `/site` to prevent ESLint/Prettier conflicts

### Nice to Have
- [ ] npm script for running Prettier manually (e.g., `format` or `prettier:check`)

### Out of Scope
- Format-on-save / editor configuration
- Import ordering (future ESLint concern)
- CSS property ordering (future Stylelint concern)
- Prettier plugins (starting vanilla)
- Scoping Prettier to `/site` only (starting repo-wide; can restrict later)

---

## Design Decisions

### Installation Location
**Options considered:**
1. Root `package.json` — Prettier runs repo-wide, lives alongside Lefthook
2. `/site/package.json` — Prettier scoped to the Next.js project

**Decision:** Root `package.json`. Prettier is a repo-wide tool like Lefthook, and the intent is to format the entire repo.

### Config Format
**Options considered:**
1. `.prettierrc` (JSON) — most common, simple
2. `prettier.config.js` — allows comments and logic
3. `.prettierrc.yaml` — YAML format

**Decision:** `.prettierrc` — most widely recognized, no need for logic or comments.

### Config Style
**Options considered:**
1. Empty `{}` — rely on Prettier defaults implicitly
2. Explicit defaults — list all values even though they match defaults

**Decision:** Explicit defaults. Self-documenting; anyone reading the file knows the project's formatting rules without looking up Prettier's defaults.

### Config Values
All Prettier defaults:

| Rule | Value |
|------|-------|
| `semi` | `true` |
| `singleQuote` | `false` |
| `trailingComma` | `"all"` |
| `tabWidth` | `2` |
| `printWidth` | `80` |

### ESLint Compatibility
**Options considered:**
1. Add `eslint-config-prettier` — disables ESLint rules that conflict with Prettier
2. Skip it — trust that `eslint-config-next` avoids formatting rules

**Decision:** Add `eslint-config-prettier`. Low-cost insurance against rule conflicts. Installed in `/site` where ESLint lives, added as the last config entry so it overrides any conflicting rules.

### Lefthook Integration
**Options considered:**
1. Prettier as a standalone hook — separate from existing pipeline
2. Prettier as first job in existing piped pre-commit — formats before typecheck and lint

**Decision:** First job in the existing piped pipeline. Prettier formats and re-stages files, then typecheck and lint run against the formatted code.

---

## Acceptance Criteria

- [ ] `prettier` is listed in root `package.json` devDependencies
- [ ] `.prettierrc` exists at repo root with explicit config values
- [ ] `.prettierignore` exists at repo root, excluding generated files
- [ ] `npx prettier --check .` runs without error from repo root
- [ ] `eslint-config-prettier` is installed in `/site` and added to ESLint config
- [ ] Lefthook pre-commit runs Prettier first, then typecheck, then lint
- [ ] Committing an unformatted file results in it being auto-formatted and committed correctly

---

## Files to Create/Modify

```
package.json              # add prettier devDependency
.prettierrc               # create — formatter config
.prettierignore           # create — ignore generated files
lefthook.yml              # add prettier job as first piped step
site/package.json         # add eslint-config-prettier devDependency
site/eslint.config.mjs    # add eslint-config-prettier to config
```

---

## Build Log

*Filled in during `/build` phase*

| Date | Task | Files | Notes |
|------|------|-------|-------|
| | | | |

---

## Completion

**Completed:** TBD
**Final Status:** TBD

**Summary:** TBD

**Deviations from Plan:** TBD
