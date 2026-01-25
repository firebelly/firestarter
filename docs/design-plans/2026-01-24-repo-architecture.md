# Repo Architecture

**Created:** 2026-01-24
**Status:** Design

---

## Overview

**What:** The monorepo architecture for Firestarter — how the codebase is organized and why.

**Why:** Documents the structural decisions for the project so the team has a shared reference for where things live and the rationale behind the layout.

**Type:** Process

---

## Architectural Principles

- **Clear separation** — Frontend (`/site`) and CMS (`/cms`) are distinct, self-contained directories
- **Storybook inside Next.js** — Components exist once; Storybook views them, doesn't duplicate them
- **Tokens in frontend** — Design tokens live in `/site/src/tokens/`, accessible to components and Storybook
- **Standard Craft structure** — Composer-based, project config committed, familiar to Craft developers
- **Per-directory .gitignore** — Each app manages its own ignores; root handles only common patterns
- **Clone and go** — New projects clone the entire repo; no complex setup or shared dependencies

---

## Design Decisions

### Directory Naming
**Options considered:**
1. `/web` + `/cms` — generic, tech-agnostic
2. `/frontend` + `/craft` — role + tech explicit
3. `/site` + `/cms` — clear, website-focused

**Decision:** `/site` + `/cms`. Firestarter builds websites, and "site" reads naturally alongside "cms".

---

### Storybook Placement
**Options considered:**
1. Sibling directory (`/storybook`) — separate from Next.js
2. Inside Next.js (`/site/.storybook`) — Storybook views the same components

**Decision:** Inside `/site`. Storybook uses `@storybook/nextjs` framework and documents the actual components used in production. No duplication.

---

### Stories Structure
**Options considered:**
1. Co-located — `Button/Button.stories.tsx` next to component
2. Separate folder — `/site/stories/Button.stories.tsx`

**Decision:** Co-located. Keeps related files together, easier to maintain.

---

### Design Tokens Location
**Options considered:**
1. Shared package (`/packages/tokens`) — if multiple consumers need raw tokens
2. Inside `/site` (`/site/src/tokens/`) — simpler, frontend-owned

**Decision:** Inside `/site/src/tokens/`. Craft's live preview renders via Next.js (iframe), so tokens don't need to be shared. The frontend is the sole consumer.

---

### Package Manager
**Options considered:**
1. pnpm with workspaces — root coordinates multiple packages
2. pnpm without workspaces — each app manages its own dependencies

**Decision:** No workspace for now. Only one JavaScript package (`/site`) exists. Can add workspace later if shared packages emerge.

---

### .gitignore Strategy
**Options considered:**
1. Single root `.gitignore` — one file, verbose paths
2. Per-directory `.gitignore` — each app self-contained

**Decision:** Per-directory. Each app (site, cms) has its own `.gitignore` matching standard patterns. Root `.gitignore` handles only common files (`.DS_Store`, `.env`).

---

### Node Version Management
**Options considered:**
1. `.nvmrc` at root
2. `.nvmrc` in `/site`

**Decision:** In `/site`. That's where Node is used; keeps root clean.

---

## Structure

```
/firestarter
│
├── /site                     # Next.js + Storybook
│   ├── .storybook/
│   │   ├── main.ts           # Storybook config
│   │   └── preview.ts        # Global decorators, styles
│   │
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       ├── preview/      # Craft live preview
│   │       └── exit-preview/
│   │
│   ├── src/
│   │   ├── components/       # Shared components (co-located stories)
│   │   │   └── Button/
│   │   │       ├── Button.tsx
│   │   │       ├── Button.stories.tsx
│   │   │       └── Button.module.css
│   │   │
│   │   ├── tokens/           # Design tokens from Figma
│   │   └── lib/              # Utilities, API helpers
│   │
│   ├── public/               # Static assets
│   ├── .nvmrc                # Node version
│   ├── .gitignore            # Next.js + Storybook ignores
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── /cms                      # Craft CMS (headless)
│   ├── config/
│   │   ├── general.php
│   │   ├── db.php
│   │   ├── app.php
│   │   └── project/          # Project config YAML
│   │
│   ├── modules/              # Custom Craft modules
│   ├── templates/            # Twig templates (minimal for headless)
│   ├── migrations/           # Content migrations
│   │
│   ├── web/                  # Public directory
│   │   ├── index.php
│   │   └── .htaccess
│   │
│   ├── .gitignore            # Craft ignores
│   ├── composer.json
│   ├── composer.lock
│   └── craft                 # CLI executable
│
├── /docs                     # Documentation
│   ├── design-plans/
│   ├── implementation-plans/
│   ├── templates/
│   └── journal.md
│
├── /.claude                  # Claude workflow commands
│
├── .gitignore                # Common ignores (.DS_Store, .env)
├── CLAUDE.md
└── README.md
```

---

## Acceptance Criteria

The structure is correct when:

- `/site` and `/cms` exist as sibling directories at root
- `/site` is a working Next.js app with Storybook configured
- `/site/src/components/` contains components with co-located stories
- `/site/src/tokens/` is the home for design tokens
- `/cms` is a standard Craft CMS installation
- Each app has its own `.gitignore`; root `.gitignore` covers common patterns
- A developer can clone the repo and understand the layout without explanation

---

## Structure Reference

| Path | Purpose |
|------|---------|
| `/site` | Next.js + Storybook (frontend) |
| `/site/.storybook` | Storybook configuration |
| `/site/app` | Next.js App Router pages and API routes |
| `/site/src/components` | Shared components with co-located stories |
| `/site/src/tokens` | Design tokens from Figma |
| `/site/src/lib` | Utilities, API helpers |
| `/cms` | Craft CMS (headless) |
| `/cms/config` | Craft configuration and project config |
| `/cms/modules` | Custom Craft modules |
| `/cms/templates` | Twig templates (minimal for headless) |
| `/docs` | Design docs, implementation plans, templates |
| `/.claude` | Claude workflow commands |

---

## Build Log

| Date | Task | Files | Notes |
|------|------|-------|-------|
| 2026-01-24 | Task 1: Create Next.js app | `/site/*` | Used npx/npm initially, switched to pnpm |
| 2026-01-24 | Task 2: Configure Storybook | `/site/.storybook/*` | Storybook 10.2 used nextjs-vite framework (faster than planned nextjs) |
| 2026-01-24 | Task 3: Component structure | `/site/src/components/Button/*` | Button example with co-located story and CSS module |
| 2026-01-24 | Task 4: Tokens and lib dirs | `/site/src/tokens/`, `/site/src/lib/` | Placeholder files establish structure |
| 2026-01-24 | Task 5: .nvmrc and .gitignore | `/site/.nvmrc` | Node 24; .gitignore already covered Next.js + Storybook |
| 2026-01-24 | Task 6: Scaffold Craft CMS | `/cms/*` | Used DDEV + PostgreSQL; Craft 5 + DDEV auto-inject CRAFT_DB_* vars locally (no db.php needed), but production requires them in .env. **Future work:** Create a repo-wide setup script to generate fresh license.key, CRAFT_APP_ID, CRAFT_SECURITY_KEY, and rename DDEV project for cloned projects. |
| 2026-01-24 | Task 7: Root .gitignore | Skipped | Both /site and /cms already ignore .env; root addition unnecessary per "per-directory .gitignore" principle |

---

## Completion

**Completed:** [Date]
**Final Status:** [Complete | Partial | Abandoned]

**Summary:** [Brief description of what was actually built]

**Deviations from Plan:** [Any significant changes from original design]
