# Changelog

Project history organized by feature completion.

---

## 2026-01-24: Repo Architecture

Established the foundational monorepo structure for Firestarter with a Next.js + Storybook frontend (`/site`) and Craft CMS backend (`/cms`).

**Design:** [docs/design-plans/2026-01-24-repo-architecture.md](design-plans/2026-01-24-repo-architecture.md)
**Plan:** [docs/implementation-plans/2026-01-24-repo-architecture.md](implementation-plans/2026-01-24-repo-architecture.md)

**Key files:**

- `/site/` — Next.js 15 app with Storybook 10.2
- `/site/src/components/Button/` — Example component with co-located story
- `/site/src/tokens/` — Design tokens directory (placeholder)
- `/site/src/lib/` — Utilities directory (placeholder)
- `/cms/` — Craft CMS 5 with DDEV configuration

---

## 2026-01-25: Craft CMS Content Setup

Configured Craft CMS for headless operation with Next.js. Created Homepage singleton and Pages structure sections with Heading/Body fields. Set up GraphQL public/private schemas with token authentication for draft access. Configured preview targets using the official Pixel & Tonic starter pattern.

This is **Plan 1 of 2** for the Craft + Next.js integration. Plan 2 (Next.js frontend code) will follow.

**Design:** [docs/design-plans/2026-01-25-craft-nextjs-integration.md](design-plans/2026-01-25-craft-nextjs-integration.md)
**Plan:** [docs/implementation-plans/2026-01-25-craft-cms-content-setup.md](implementation-plans/2026-01-25-craft-cms-content-setup.md)

**Key files:**

- `cms/config/project/fields/` — Heading and Body field definitions
- `cms/config/project/sections/` — Homepage and Pages section configs
- `cms/config/project/entryTypes/` — Entry type definitions with field layouts
- `cms/config/project/graphql/schemas/` — Public and Private schema configs
- `cms/.env` — Environment variables for preview and webhooks

**Learnings:**

- [Craft CMS Headless Setup](learnings/2026-01-25-craft-headless-setup.md)
- [Next.js + Craft Fundamentals](learnings/2026-01-25-next-craft-fundamentals.md)

---

## 2026-01-27: Next.js Craft Integration

Connected the Next.js frontend to Craft CMS via GraphQL, completing the end-to-end headless CMS integration. Content authored in Craft now renders on the frontend with live preview and on-demand cache revalidation.

This is **Plan 2 of 2** for the Craft + Next.js integration, completing the feature.

**Design:** [docs/design-plans/2026-01-25-craft-nextjs-integration.md](design-plans/2026-01-25-craft-nextjs-integration.md)
**Plan:** [docs/implementation-plans/2026-01-26-nextjs-craft-integration.md](implementation-plans/2026-01-26-nextjs-craft-integration.md)

**Key files:**

- `site/src/lib/graphql/client.ts` — GraphQL fetch wrapper with preview support
- `site/src/lib/graphql/queries/` — Homepage and Pages queries
- `site/src/lib/graphql/types.ts` — TypeScript types for Craft entries
- `site/src/lib/preview.ts` — Preview mode detection utility
- `site/src/app/page.tsx` — Homepage route consuming Craft data
- `site/src/app/[...slug]/page.tsx` — Catch-all route for Pages section
- `site/src/app/api/revalidate/route.ts` — Webhook endpoint for cache invalidation

**Learnings:**

- [Preview Mode Patterns](learnings/2026-01-26-preview-mode-patterns.md)
- [On-Demand Revalidation](learnings/2026-01-27-on-demand-revalidation.md)
- [Local vs Production Config](learnings/2026-01-27-local-vs-production-config.md)

---

## 2026-01-27: Lefthook Pre-commit Hooks

Added Lefthook v2 pre-commit hooks for TypeScript type checking and ESLint. Hooks use piped execution (fail-fast): TypeScript runs first on the full project; if it passes, ESLint runs on staged files only. Non-code commits skip checks entirely (~0.08s).

**Design:** [docs/design-plans/2026-01-27-lefthook-precommit.md](design-plans/2026-01-27-lefthook-precommit.md)
**Plan:** [docs/implementation-plans/2026-01-27-lefthook-precommit.md](implementation-plans/2026-01-27-lefthook-precommit.md)

**Key files:**

- `package.json` — Root package with Lefthook dependency
- `lefthook.yml` — Pre-commit hook configuration (v2 `jobs:` syntax)
- `pnpm-workspace.yaml` — Workspace config with Lefthook build approval (pnpm v10 requirement)

**Learnings:**

- [Pre-commit Hooks & JavaScript Tooling](learnings/2026-01-27-precommit-hooks-and-tooling.md)

---

## 2026-01-28: Configure Prettier

Added Prettier as a repo-wide code formatter with explicit config defaults. Integrated into the Lefthook pre-commit pipeline so all code is auto-formatted on commit. Added `eslint-config-prettier` to prevent ESLint/Prettier rule conflicts.

**Design:** [docs/design-plans/2026-01-28-1510-configure-prettier.md](design-plans/2026-01-28-1510-configure-prettier.md)
**Plan:** [docs/implementation-plans/2026-01-28-1510-configure-prettier.md](implementation-plans/2026-01-28-1510-configure-prettier.md)

**Key files:**

- `.prettierrc` — Formatter config with explicit defaults
- `.prettierignore` — Ignore patterns for generated/vendored files
- `lefthook.yml` — Pre-commit pipeline with Prettier as first job
- `site/eslint.config.mjs` — ESLint config with `eslint-config-prettier` added last
- `package.json` — Root scripts (`format`, `format:check`) and Prettier devDependency

---

## 2026-01-28: ESLint Import Sorting

Added `eslint-plugin-simple-import-sort` to enforce consistent, auto-fixable import/export ordering across the `site/` codebase. Both rules set to `"error"` so violations fail CI. Auto-fixed 12 existing files.

**Design:** [docs/design-plans/2026-01-28-1200-eslint-import-sorting.md](design-plans/2026-01-28-1200-eslint-import-sorting.md)
**Plan:** [docs/implementation-plans/2026-01-28-1200-eslint-import-sorting.md](implementation-plans/2026-01-28-1200-eslint-import-sorting.md)

**Key files:**

- `site/eslint.config.mjs` — ESLint config with import sort plugin and rules
- `site/package.json` — `eslint-plugin-simple-import-sort` dev dependency

---

## 2026-02-04: Design Tokens Pipeline

Installed utopia-core and Terrazzo (@terrazzo/cli + @terrazzo/plugin-css), then built a fluid token pipeline that generates CSS custom properties from Figma design tokens. Uses utopia-core for fluid space scale, type scale, and line heights. Terrazzo handles color and font tokens separately. Two parallel builds unified under `npm run tokens`.

**Design:** [docs/design-plans/2026-02-04-1332-design-tokens-pipeline.md](design-plans/2026-02-04-1332-design-tokens-pipeline.md)
**Plan:** [docs/implementation-plans/2026-02-04-2051-design-tokens-pipeline.md](implementation-plans/2026-02-04-2051-design-tokens-pipeline.md)

**Key files:**

- `site/src/tokens/generate-fluid-tokens.js` — Fluid token generator (space, type, line heights)
- `site/src/tokens/fluid-tokens.css` — Generated fluid CSS output
- `site/src/tokens/terrazzo-tokens.css` — Terrazzo-generated color and font tokens
- `site/terrazzo.config.mjs` — Terrazzo configuration with exclude filters
- `site/package.json` — npm scripts (`tokens:fluid`, `tokens:terrazzo`, `tokens`)

---

## 2026-02-05: ESLint Auto-fix in Pre-commit

Updated the ESLint pre-commit hook to auto-fix lint issues and re-stage corrected files, matching the existing Prettier hook pattern.

**Key files:**

- `lefthook.yml` — Added `--fix` flag and `git add` re-stage to lint job

---

## 2026-02-05: Consolidate Token Output

Merged the two token pipeline outputs (`fluid-tokens.css` and `terrazzo-tokens.css`) into a single `tokens.css` file. Terrazzo writes first, then the fluid token generator appends. Three npm scripts consolidated into one.

**Design:** [docs/design-plans/2026-02-05-1102-consolidate-token-output.md](design-plans/2026-02-05-1102-consolidate-token-output.md)
**Plan:** [docs/implementation-plans/2026-02-05-1107-consolidate-token-output.md](implementation-plans/2026-02-05-1107-consolidate-token-output.md)

**Key files:**

- `site/terrazzo.config.mjs` — Output filename changed to `tokens.css`
- `site/src/tokens/generate-fluid-tokens.js` — Appends to `tokens.css` instead of writing separate file
- `site/package.json` — Single `tokens` script replaces three

---

## 2026-02-07: Update Token Pipeline with Default Utopia Variable Names

Updated the token pipeline to match default Figma variable names generated by the Utopia plugin (no manual renaming). Token group names changed (e.g., `_fluid-tokens` → `Fluid tokens`, `_theme-declarations` → `Utopia`), and the generator and Terrazzo config were updated to match.

**Key files:**

- `site/src/tokens/design.tokens.json` — New Figma export with Utopia plugin naming
- `site/src/tokens/generate-fluid-tokens.js` — Updated token path references
- `site/terrazzo.config.mjs` — Updated exclude patterns
- `site/src/tokens/tokens.css` — Regenerated output

---

## 2026-02-09: Refactor Fluid Token Generator to TypeScript

Converted `generate-fluid-tokens.js` to TypeScript and added a new `XS—M` custom space pair. The generator was refactored for clarity, then renamed to `.ts` with type annotations added. The `tokens` script now uses `npx tsx` instead of `node`.

**Key files:**

- `site/src/tokens/generate-fluid-tokens.ts` — Fluid token generator (converted from JS)
- `site/src/tokens/design.tokens.json` — Added `XS—M` custom space pair
- `site/package.json` — Updated `tokens` script to use `npx tsx`

---

## 2026-02-11: Fluid Tokens Terrazzo Plugin

Replaced the standalone `generate-fluid-tokens.ts` script with a custom Terrazzo plugin. Fluid `clamp()` values are now computed inside the Terrazzo build pipeline, producing a single `:root` block with proper `var()` alias resolution for downstream component tokens. The `tokens` script simplifies from two steps to `tz build`.

**Design:** [docs/design-plans/2026-02-11-0928-fluid-tokens-terrazzo-plugin.md](design-plans/2026-02-11-0928-fluid-tokens-terrazzo-plugin.md)
**Plan:** [docs/implementation-plans/2026-02-11-1009-fluid-tokens-terrazzo-plugin.md](implementation-plans/2026-02-11-1009-fluid-tokens-terrazzo-plugin.md)

**Key files:**

- `site/src/tokens/terrazzo-plugin-fluid.mjs` — Custom Terrazzo plugin for fluid token computation
- `site/terrazzo.config.mjs` — Updated with plugin, `variableName()`, and revised exclude list
- `site/package.json` — Simplified `tokens` script to `tz build`
- `site/src/tokens/generate-fluid-tokens.ts` — Deleted

---

## 2026-02-12: Fluid Token Modes

Refactored the Terrazzo fluid tokens plugin to unify all token categories (space, type, line heights) on a single mode-based approach using only `calculateClamp()`. Replaced the `variableName` if/startsWith chain with ordered regex patterns. Plugin reduced from ~100 lines (3 strategies, 3 utopia-core functions) to ~43 lines (1 loop, 1 function).

**Design:** [docs/design-plans/2026-02-12-1317-fluid-token-modes.md](design-plans/2026-02-12-1317-fluid-token-modes.md)
**Plan:** [docs/implementation-plans/2026-02-12-1327-fluid-token-modes.md](implementation-plans/2026-02-12-1327-fluid-token-modes.md)

**Key files:**

- `site/src/tokens/terrazzo-plugin-fluid.mjs` — Rewritten to unified mode-based loop
- `site/terrazzo.config.mjs` — `variableName` replaced with ordered regex patterns

---

## 2026-02-12: Storybook Token Display

Custom React viewer components displayed via MDX pages in Storybook for browsing design tokens (colors, typography, spacing). Six focused viewer components composed by three MDX pages under a "Tokens" sidebar group. Hand-authored `token-data.ts` provides metadata with min/max px values. All fluid viewers use CSS vars and respond to viewport resizing.

**Design:** [docs/design-plans/2026-02-12-1651-storybook-token-display.md](design-plans/2026-02-12-1651-storybook-token-display.md)
**Plan:** [docs/implementation-plans/2026-02-12-1743-storybook-token-display.md](implementation-plans/2026-02-12-1743-storybook-token-display.md)

**Key files:**

- `site/src/stories/tokens/token-data.ts` — Hand-authored token metadata (names, groups, min/max values)
- `site/src/stories/tokens/ColorSwatches.tsx` — Color swatch grid component
- `site/src/stories/tokens/FontSpecimen.tsx` — Font family/weight specimen renderer
- `site/src/stories/tokens/TypeScale.tsx` — Fluid type scale renderer
- `site/src/stories/tokens/LineHeightScale.tsx` — Fluid line height renderer
- `site/src/stories/tokens/SpaceSizes.tsx` — Fluid space size bar renderer
- `site/src/stories/tokens/SpacePairs.tsx` — Fluid space pair bar renderer
- `site/src/stories/tokens/Color.mdx` — Color tokens page
- `site/src/stories/tokens/Typography.mdx` — Typography tokens page
- `site/src/stories/tokens/Spacing.mdx` — Spacing tokens page
- `site/.storybook/preview.ts` — Added `tokens.css` import
