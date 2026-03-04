# CLAUDE.md

## Firestarter

Firestarter is a duplicatable starter system for mid-tier client projects. It bridges the gap between full custom Craft CMS builds and Squarespace/Framer sites.

### Tech Stack

```
Figma Design System → Storybook → Craft CMS (headless) → Next.js Frontend
```

- **Figma** — Design system source of truth (tokens, components, layouts)
- **Storybook** — Component library, integrated with Figma tokens
- **Craft CMS 5** — Headless CMS with Matrix page builders
- **Next.js** — Frontend (App Router, Server/Client Components)

### Design System Structure

| Layer | Contents |
|-------|----------|
| Tokens | Typography, color, spacing, icons |
| Elements | Buttons, images, text groups |
| Components | Navigation, heroes, CTAs, card grids, filters, footers |
| Pages | Assembled layouts |

### Key Principles

- **Client safety** — CMS structured so clients can manage content without breaking layouts
- **Off-the-shelf components** — Most projects use existing components, few custom additions
- **Automate what we can** — Token sync from Figma to code; manual work where automation isn't feasible

### Status

Project scope documented. Implementation not started.
