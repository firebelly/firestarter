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
