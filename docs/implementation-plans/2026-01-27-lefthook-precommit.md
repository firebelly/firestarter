# Implementation Plan: Lefthook Pre-commit Hooks

**Design Spec:** `docs/design-plans/2026-01-27-lefthook-precommit.md`
**Created:** 2026-01-27

---

## Summary

Add Lefthook to run TypeScript type checking and ESLint on pre-commit. TypeScript checks the full project (fast due to incremental compilation), ESLint checks only staged files. Fail-fast behavior: if TypeScript fails, ESLint is skipped.

---

## Codebase Verification

_Confirmed assumptions from design spec match actual codebase_

- [x] No root `package.json` exists - Verified: yes
- [x] No `lefthook.yml` exists - Verified: yes
- [x] `site/package.json` has TypeScript and ESLint - Verified: TypeScript ^5, ESLint ^9
- [x] `site/tsconfig.json` has `incremental: true` - Verified: line 15
- [x] ESLint config exists - Verified: `site/eslint.config.mjs` (flat config)
- [x] `.gitignore` exists at root - Verified: currently contains only `.DS_Store`

**Patterns to leverage:**

- pnpm package manager (v10.28.2) already configured in site/
- Existing `lint` script in site/package.json: `"lint": "eslint"`
- TypeScript already configured with `noEmit: true`

**Discrepancies found:**

- None

---

## Tasks

### Task 1: Create root `package.json` with Lefthook

**Description:** Create a minimal `package.json` at the repository root with Lefthook as a dev dependency and a `postinstall` script that automatically runs `lefthook install`.

**Files:**

- `package.json` - create

**Code example:**

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

**Done when:**

- `package.json` exists at repo root
- Running `pnpm install` at root installs Lefthook to `node_modules/`

**Commit:** "Add root package.json with Lefthook dependency"

---

### Task 2: Create `lefthook.yml` configuration

**Description:** Create the Lefthook configuration file with pre-commit hooks for TypeScript type checking and ESLint. Use `piped: true` for fail-fast behavior (TypeScript runs first; if it fails, ESLint is skipped).

**Files:**

- `lefthook.yml` - create

**Code example:**

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

**Done when:**

- `lefthook.yml` exists at repo root
- Configuration matches design spec

**Commit:** "Add Lefthook pre-commit configuration"

---

### Task 3: Update `.gitignore` and verify hook installation

**Description:** Add `.lefthook-local.yml` to `.gitignore` to allow developers to override hook behavior locally without committing changes. Then run `pnpm install` to trigger the postinstall script and verify everything works.

**Files:**

- `.gitignore` - modify

**Code example:**

```
.DS_Store

# Lefthook local overrides
.lefthook-local.yml
```

**Done when:**

- `.gitignore` contains `.lefthook-local.yml`
- `pnpm install` at root completes successfully
- `lefthook install` runs automatically (via postinstall)
- `.git/hooks/pre-commit` symlink exists

**Commit:** "Update .gitignore for Lefthook local overrides"

---

## Verification Checklist

After all tasks complete, verify acceptance criteria:

- [x] Running `pnpm install` at repo root automatically runs `lefthook install`
- [x] `.git/hooks/pre-commit` symlink exists after installation
- [x] Committing valid code: both checks pass, commit succeeds
- [x] Committing code with TypeScript errors: TypeScript fails, ESLint skipped, commit blocked
- [x] Committing code with ESLint errors (valid TypeScript): TypeScript passes, ESLint fails, commit blocked

---

## Notes

- The `root: site/` directive in lefthook.yml ensures commands run from the site/ directory where the JS tooling is installed
- `{staged_files}` is a Lefthook variable that expands to the list of staged files matching the glob pattern
- Developers can create `.lefthook-local.yml` to skip hooks locally (e.g., during rapid prototyping) without affecting the team
