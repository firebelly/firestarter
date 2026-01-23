# CLAUDE.md

## Workflow

This project uses a phased workflow with slash commands. Each phase runs in its own session, with docs as the handoff.

| Phase | Command | Output |
|-------|---------|--------|
| 1. Design | `/design` | `docs/design-plans/YYYY-MM-DD-feature-name.md` |
| 2. Plan | `/plan` | `docs/implementation-plans/YYYY-MM-DD-feature-name.md` |
| 3. Build | `/build` | Code + Build Log in design doc |
| 4. Document | `/document` | Completed docs, changelog update |

**Commands:** `.claude/commands/`
**Templates:** `docs/templates/`

### Documentation Structure

- `docs/design-plans/` — Design documents
- `docs/implementation-plans/` — Implementation plans
- `docs/templates/` — Templates for design docs and implementation plans
- `docs/journal.md` — Project journal

---

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
