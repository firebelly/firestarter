# Firestarter

A duplicatable starter system for mid-tier client projects. Bridges the gap between full custom Craft CMS builds and Squarespace/Framer sites.

## Tech Stack

```
Figma Design System → Storybook → Craft CMS (headless) → Next.js Frontend
```

| Layer      | Tool        | Purpose                              |
| ---------- | ----------- | ------------------------------------ |
| Design     | Figma       | Design system source of truth        |
| Components | Storybook   | Component library with Figma tokens  |
| CMS        | Craft CMS 5 | Headless content management          |
| Frontend   | Next.js 15  | App Router, Server/Client Components |

## Directory Structure

```
/firestarter
├── /site                 # Next.js + Storybook
│   ├── .storybook/       # Storybook configuration
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Components with co-located stories
│   │   ├── tokens/       # Design tokens from Figma
│   │   └── lib/          # Utilities and API helpers
│   └── .nvmrc            # Node version (use with nvm)
│
├── /cms                  # Craft CMS (headless)
│   ├── config/           # Craft configuration
│   ├── modules/          # Custom Craft modules
│   ├── templates/        # Twig templates (minimal)
│   └── web/              # Public directory
│
└── /docs                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (see `/site/.nvmrc` for version)
- pnpm
- DDEV (for local Craft development)
- Composer

### Initial Setup

```bash
pnpm install         # Install Lefthook (sets up pre-commit hooks)
```

This installs Lefthook at the repo root, which automatically configures pre-commit hooks for TypeScript and ESLint checks.

### Frontend (Next.js + Storybook)

```bash
cd site
nvm use              # Use correct Node version
pnpm install         # Install dependencies
pnpm dev             # Start Next.js at localhost:3000
pnpm storybook       # Start Storybook at localhost:6006
```

### CMS (Craft)

```bash
cd cms
ddev start           # Start DDEV environment
ddev launch          # Open Craft in browser
```

## Component Structure

Components live in `/site/src/components/` with co-located files:

```
/site/src/components/Button/
├── Button.tsx              # Component
├── Button.stories.tsx      # Storybook story
└── Button.module.css       # Styles
```

This pattern keeps related files together and ensures Storybook documents the actual production components.

## Design Tokens

Design tokens from Figma live in `/site/src/tokens/`. These are consumed by components and available in Storybook.

## Craft + Next.js Integration

The frontend fetches content from Craft CMS via GraphQL. The integration includes:

- **GraphQL data fetching** — `site/src/lib/graphql/client.ts` wraps fetch with caching
- **Live preview** — Editors see draft changes in Craft's preview iframe
- **Cache revalidation** — Webhook from Craft invalidates Next.js cache on publish

### Environment Variables

Copy the example file and fill in values:

```bash
cd site
cp .env.example .env.local
```

| Variable              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `CRAFT_URL`           | Craft CMS URL (e.g., `http://cms.ddev.site`) |
| `REVALIDATION_SECRET` | Shared secret for webhook validation         |

The CMS also needs `REVALIDATION_SECRET` in `cms/.env` (same value).

### Local Development Notes

- Use HTTP (not HTTPS) for `CRAFT_URL` locally — Node rejects self-signed certs
- To test Craft's live preview feature, you need HTTPS (the CP iframe won't load HTTP content). Run `pnpm dev --experimental-https` and update `PRIMARY_SITE_URL=https://localhost:3000` in `cms/.env`. Revert to HTTP when done — webhooks won't work over HTTPS locally.
- See `docs/learnings/2026-01-27-local-vs-production-config.md` for details

## Pre-commit Hooks

Lefthook runs automated checks before each commit:

1. **TypeScript** — Full project type check (`tsc --noEmit`)
2. **ESLint** — Lints staged JS/TS files only

If TypeScript fails, ESLint is skipped (fail-fast). Non-code commits (markdown, JSON, etc.) skip checks entirely.

To bypass hooks temporarily (use sparingly):

```bash
git commit --no-verify -m "message"
```

## Key Principles

- **Client safety** — CMS structured so clients can manage content without breaking layouts
- **Off-the-shelf components** — Most projects use existing components, few custom additions
- **Clear separation** — Frontend and CMS are distinct, self-contained directories
- **Clone and go** — New projects clone the repo; no complex setup or shared dependencies
