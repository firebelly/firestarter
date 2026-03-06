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
| Frontend   | Next.js 16  | App Router, Server/Client Components |

## Directory Structure

```
/firestarter
├── /site                 # Next.js + Storybook
│   ├── .storybook/       # Storybook configuration
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Components with co-located stories
│   │   ├── stories/      # Storybook default stories
│   │   ├── tokens/       # Design tokens from Figma
│   │   └── lib/          # Utilities and API helpers
│
├── /cms                  # Craft CMS (headless)
│   ├── config/           # Craft configuration
│   ├── templates/        # Twig templates (minimal)
│   └── web/              # Public directory
│
└── /docs                 # Project documentation
```

## Documentation

- **[Backlog](docs/backlog.md)** — Planned work and ideas
- **[Changelog](docs/changelog.md)** — What's been built and when

Design specs and implementation plans live in `docs/design-specs/` and `docs/implementation-plans/`. Each changelog entry links to the relevant spec and plan for deeper context.

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for version)
- DDEV (for local Craft development)

### Install Dependencies

This repo uses a **pnpm workspace** — the root `pnpm-workspace.yaml` defines `site` as a workspace package. A single install from the root handles everything:

```bash
# Set correct Node version
nvm use

# Activate the pinned pnpm version
corepack enable

# Installs all dependencies (root + site workspace)
pnpm install
```

This installs Lefthook and Prettier at the root, site dependencies in `/site`, and automatically configures pre-commit hooks for formatting, type checking, and linting.

### CMS (Craft)

See [`cms/README.md`](cms/README.md) for Craft setup instructions (DDEV, env file, install, license key).

### Frontend (Next.js + Storybook)

The root provides proxy commands for the frontend workspace:

```bash
# Start Next.js at localhost:3000
pnpm dev

# Start Storybook at localhost:6006
pnpm storybook

# Rebuild design tokens
pnpm tokens
```

These proxy to the `site` workspace via `pnpm --filter site`. See [`site/README.md`](site/README.md) for full frontend setup, component structure, design tokens, and testing.

## Craft + Next.js Integration

The frontend fetches content from Craft CMS via GraphQL. The integration includes:

- **GraphQL data fetching** — `site/src/lib/graphql/client.ts` wraps fetch with caching
- **Live preview** — Editors see draft changes in Craft's preview iframe
- **Cache revalidation** — Webhook from Craft invalidates Next.js cache on publish

### Webhook Setup (Cache Revalidation)

When an editor publishes content in Craft, a webhook POSTs to Next.js to purge the cached data so the next visitor sees fresh content.

**1. Add environment variables to `cms/.env`:**

```bash
REVALIDATION_SECRET=your-random-string
REVALIDATION_URL=http://host.docker.internal:3000/api/revalidate  # local dev
```

**2. Configure the webhook in Craft CP → Settings → Webhooks:**

| Field        | Value                            |
| ------------ | -------------------------------- |
| Name         | Revalidate Next.js               |
| Sender Class | `craft\elements\Entry`           |
| Event Name   | `afterSave`                      |
| URL          | `$REVALIDATION_URL`              |
| Method       | POST                             |
| Headers      | `Content-Type: application/json` |

**3. Set the webhook payload (Twig template):**

```twig
{% set entryUri = event.sender.uri %}
{% set revalidationSecret = getenv('REVALIDATION_SECRET') %}

{{
  {
    secret: revalidationSecret,
    uri: entryUri
  }|json_encode|raw
}}
```

You can verify the webhook is working in Craft CP → Utilities → Webhooks, which shows request/response history. See `docs/learnings/2026-01-27-on-demand-revalidation.md` for details on how revalidation works under the hood.

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

1. **Prettier** — Auto-formats staged files and re-stages them
2. **TypeScript** — Full project type check (`tsc --noEmit`)
3. **ESLint** — Lints staged JS/TS files only

Jobs run in order. Prettier runs on all supported file types; TypeScript and ESLint only run on JS/TS files in `/site`.

To format the entire repo manually:

```bash
# Format all files
pnpm format

# Check without writing
pnpm format:check
```

To lint the frontend manually:

```bash
# Check for errors
pnpm lint

# Auto-fix (includes import sorting)
pnpm lint --fix
```

To bypass hooks temporarily (use sparingly):

```bash
git commit --no-verify -m "message"
```

## Key Principles

- **Client safety** — CMS structured so clients can manage content without breaking layouts
- **Off-the-shelf components** — Most projects use existing components, few custom additions
- **Clear separation** — Frontend and CMS are distinct, self-contained directories
- **Clone and go** — New projects clone the repo; no complex setup or shared dependencies
