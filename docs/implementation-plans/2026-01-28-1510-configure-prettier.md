# Implementation Plan: Configure Prettier

**Design Doc:** docs/design-plans/2026-01-28-1510-configure-prettier.md
**Created:** 2026-01-28

---

## Summary

Add Prettier as a repo-wide code formatter with explicit config, ESLint conflict prevention, and Lefthook pre-commit integration.

---

## Codebase Verification

- [x] Root `package.json` exists with `lefthook` as only devDependency — Verified
- [x] `lefthook.yml` has piped pre-commit with `typecheck` → `lint` — Verified
- [x] `site/eslint.config.mjs` uses flat config with `defineConfig` — Verified
- [x] No existing `.prettierrc` or `.prettierignore` at repo root — Verified
- [x] Site uses `pnpm` as package manager — Verified

**Patterns to leverage:**

- Lefthook piped job structure already established in `lefthook.yml`
- ESLint flat config pattern with spread arrays in `site/eslint.config.mjs`

**Discrepancies found:**

- None

---

## Tasks

### Task 1: Install Prettier and create config files

**Description:** Install `prettier` as a root devDependency. Create `.prettierrc` with explicit defaults and `.prettierignore` for generated/vendored files.

**Files:**

- `package.json` — modified by install
- `.prettierrc` — create
- `.prettierignore` — create

**Code example:**

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 80
}
```

`.prettierignore`:

```
# Dependencies
node_modules/

# Build output
.next/
out/
build/
dist/
storybook-static/

# Package manager
pnpm-lock.yaml

# Generated
*.min.js
*.min.css
```

**Done when:** `pnpm prettier --check .` runs from repo root without config errors (files may fail the format check — that's expected before Task 3).

**Commit:** `"Add Prettier config and ignore files"`

---

### Task 2: Install eslint-config-prettier and update ESLint config

**Description:** Install `eslint-config-prettier` as a devDependency in `/site`. Import it and add it as the last entry in the ESLint flat config so it disables any rules that conflict with Prettier.

**Files:**

- `site/package.json` — modified by install
- `site/eslint.config.mjs` — modify

**Code example:**

Add to `site/eslint.config.mjs`:

```js
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  ...storybook.configs["flat/recommended"],
  prettierConfig,
]);
```

**Done when:** ESLint runs without errors from `/site` and `eslint-config-prettier` is the last config entry.

**Commit:** `"Add eslint-config-prettier to prevent ESLint/Prettier conflicts"`

---

### Task 3: Run Prettier across repo and add format script

**Description:** Run `pnpm prettier --write .` from repo root to format all existing files. Add `format` and `format:check` scripts to root `package.json` for manual use.

**Files:**

- `package.json` — modify (add scripts)
- Various files — auto-formatted by Prettier

**Code example:**

Root `package.json` scripts:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Done when:** `pnpm prettier --check .` passes with no errors from repo root.

**Commit:** `"Format existing codebase with Prettier"`

---

### Task 4: Add Prettier to Lefthook pre-commit pipeline

**Description:** Add a `prettier` job as the first step in the piped pre-commit in `lefthook.yml`. It should format staged files and re-stage them before typecheck and lint run.

**Files:**

- `lefthook.yml` — modify

**Code example:**

```yaml
pre-commit:
  piped: true
  jobs:
    - name: prettier
      glob: "*.{ts,tsx,mts,js,jsx,mjs,json,css,md,yml,yaml}"
      run: pnpm prettier --write {staged_files} && git add {staged_files}

    - name: typecheck
      root: site/
      run: pnpm tsc --noEmit

    - name: lint
      root: site/
      glob: "*.{ts,tsx,mts,js,jsx,mjs}"
      run: pnpm eslint {staged_files}
```

**Done when:** Committing an unformatted file results in Prettier auto-formatting it before typecheck and lint run.

**Commit:** `"Add Prettier to Lefthook pre-commit pipeline"`

---

## Verification Checklist

- [x] `prettier` listed in root `package.json` devDependencies
- [x] `.prettierrc` exists at repo root with explicit config values
- [x] `.prettierignore` exists at repo root, excluding generated files
- [x] `pnpm prettier --check .` passes from repo root
- [x] `eslint-config-prettier` installed in `/site` and last in ESLint config
- [x] Lefthook pre-commit runs Prettier first, then typecheck, then lint
- [x] Committing an unformatted file results in auto-format and clean commit

---

## Notes

- Prettier is installed at the repo root (not `/site`) since it's a repo-wide tool like Lefthook. The Lefthook prettier job runs from repo root by default (no `root:` override), which is where the binary lives.
- `eslint-config-prettier` is installed in `/site` where ESLint lives
- No Prettier plugins are included — starting vanilla per design doc
