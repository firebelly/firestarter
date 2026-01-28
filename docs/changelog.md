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
