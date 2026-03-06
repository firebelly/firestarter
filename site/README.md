# Frontend

Next.js + Storybook frontend. Components are built and documented in Storybook, then assembled into pages that pull content from Craft CMS via GraphQL.

## Setup

```bash
# Create local env file from example env (Add the Craft URL
# to CRAFT_URL)
cp .env.example .env.local

# Start Next.js at localhost:3000
pnpm dev

# Start Storybook at localhost:6006
pnpm storybook
```

> **Note:** Common commands (`dev`, `storybook`, `tokens`) also work from the repo root — root-level scripts proxy to this workspace via `pnpm --filter site`.

## Component Structure

Components live in `src/components/` with co-located files:

```
src/components/Button/
├── Button.tsx              # Component
├── Button.stories.tsx      # Storybook story
└── Button.module.css       # Styles
```

This pattern keeps related files together and ensures Storybook documents the actual production components.

## Design Tokens

Design tokens from Figma live in `src/tokens/`. Run `pnpm tokens` to regenerate `tokens.css` from the Figma export (`design.tokens.json`).

Storybook includes token browsing pages under **Tokens** in the sidebar (Color, Typography, Spacing). Fluid tokens (space scale, type scale, line heights) display min/max px values and scale live with the viewport.

## Testing

Vitest is configured with two test projects:

| Project       | Matches                       | Purpose                                     |
| ------------- | ----------------------------- | ------------------------------------------- |
| **tokens**    | `src/**/*.test.ts`            | Unit and integration tests for token plugin |
| **storybook** | `src/**/*.stories.?(m)[jt]s*` | Storybook interaction tests                 |

```bash
# Run all tests
pnpm vitest

# Run a specific project
pnpm vitest --project tokens
pnpm vitest --project storybook
```
