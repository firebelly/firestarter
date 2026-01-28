# Lefthook Pre-commit Hooks

**Created:** 2026-01-27
**Status:** Design

---

## Overview

**What:** Add Lefthook to run TypeScript and ESLint checks on pre-commit.

**Why:** Catch type errors and lint issues before they're committed, improving code quality and reducing broken commits in the repository.

**Type:** Process

---

## Requirements

### Must Have
- [ ] Lefthook installed at repo root with automatic setup via `postinstall` script
- [ ] Pre-commit hook runs TypeScript type checking (`tsc --noEmit`)
- [ ] Pre-commit hook runs ESLint on staged files
- [ ] TypeScript runs first; if it fails, ESLint is skipped (fail-fast)
- [ ] Commits are blocked when either check fails

### Nice to Have
- [ ] Easy migration path to pnpm workspaces in the future

### Out of Scope
- Other git hooks (pre-push, commit-msg, etc.)
- Code formatting (Prettier)
- Test execution (Vitest)
- The `cms/` directory (PHP, no JS tooling)
- CI/CD integration

---

## Design Decisions

### Installation Location
**Options considered:**
1. **Repo root** - Lefthook at root, new `package.json` at root, `site/package.json` unchanged
2. **Inside site/** - Keep single `package.json`, but hooks only work from `site/` directory
3. **pnpm workspaces** - Full monorepo setup with workspace configuration

**Decision:** Option 1 (Repo root). This is the conventional setup for multi-directory repos. It allows hooks to run regardless of which directory you're in when committing. Migration to pnpm workspaces (Option 3) remains easy — just add `pnpm-workspace.yaml` later.

### TypeScript Scope
**Options considered:**
1. **Full project check** - Run `tsc --noEmit` on entire `site/` directory
2. **Staged files only** - Check only changed TypeScript files

**Decision:** Option 1 (Full project). TypeScript cannot reliably type-check individual files in isolation because types depend on imports from other files. The full check is still fast due to TypeScript's incremental compilation (`"incremental": true` in tsconfig).

### ESLint Scope
**Options considered:**
1. **Full project check** - Lint all files in `site/`
2. **Staged files only** - Lint only files being committed

**Decision:** Option 2 (Staged files only). ESLint can lint individual files, making staged-only checks faster and focused on what's being committed.

### Failure Behavior
**Options considered:**
1. **Run both regardless** - Always run TypeScript and ESLint, report all errors
2. **Fail fast** - If TypeScript fails, skip ESLint

**Decision:** Option 2 (Fail fast via `piped: true`). If the code has type errors, there's no point running ESLint — the code is already broken. This saves time on failed commits.

---

## Acceptance Criteria

- [ ] Running `pnpm install` at repo root automatically runs `lefthook install`
- [ ] `.git/hooks/pre-commit` symlink exists after installation
- [ ] Committing valid code: both checks pass, commit succeeds
- [ ] Committing code with TypeScript errors: TypeScript fails, ESLint skipped, commit blocked
- [ ] Committing code with ESLint errors (valid TypeScript): TypeScript passes, ESLint fails, commit blocked

---

## Files to Create/Modify

```
package.json       # CREATE - Root package.json with Lefthook + postinstall
lefthook.yml       # CREATE - Pre-commit hook configuration
.gitignore         # MODIFY - Add .lefthook-local.yml
```

### File Contents

**package.json (root):**
```json
{
  "name": "firestarter",
  "private": true,
  "scripts": {
    "postinstall": "lefthook install"
  },
  "devDependencies": {
    "lefthook": "^1.11.0"
  }
}
```

**lefthook.yml:**
```yaml
pre-commit:
  piped: true
  commands:
    typecheck:
      root: site/
      run: pnpm tsc --noEmit

    lint:
      root: site/
      glob: "*.{ts,tsx,mts,js,jsx,mjs}"
      run: pnpm eslint {staged_files}
```

**.gitignore addition:**
```
# Lefthook local overrides
.lefthook-local.yml
```

---

## Build Log

*Filled in during `/build` phase*

| Date | Task | Files | Notes |
|------|------|-------|-------|
| 2026-01-27 | Task 1 | package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .gitignore | Created root package.json with Lefthook ^2.0.16. pnpm v10 blocks postinstall scripts by default; ran `pnpm approve-builds` which created pnpm-workspace.yaml with `onlyBuiltDependencies: [lefthook]`. Lefthook v2's own postinstall runs `lefthook install` automatically—no manual postinstall script needed (differs from v1). Added /node_modules to .gitignore. |
| 2026-01-27 | Task 2 | lefthook.yml | Configured pre-commit hooks for typecheck and lint. Used v2 `jobs:` array syntax instead of `commands:` object for explicit ordering with `piped: true`. |

---

## Completion

**Completed:** [Date]
**Final Status:** [Complete | Partial | Abandoned]

**Summary:** [Brief description of what was actually built]

**Deviations from Plan:** [Any significant changes from original design]
