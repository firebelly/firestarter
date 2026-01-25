# Firestarter

A duplicatable starter system for mid-tier client projects. Bridges the gap between full custom Craft CMS builds and Squarespace/Framer sites.

## Tech Stack

```
Figma Design System → Storybook → Craft CMS (headless) → Next.js Frontend
```

| Layer | Tool | Purpose |
|-------|------|---------|
| Design | Figma | Design system source of truth |
| Components | Storybook | Component library with Figma tokens |
| CMS | Craft CMS 5 | Headless content management |
| Frontend | Next.js 15 | App Router, Server/Client Components |

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

## Key Principles

- **Client safety** — CMS structured so clients can manage content without breaking layouts
- **Off-the-shelf components** — Most projects use existing components, few custom additions
- **Clear separation** — Frontend and CMS are distinct, self-contained directories
- **Clone and go** — New projects clone the repo; no complex setup or shared dependencies
