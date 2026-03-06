# Backlog

Future work identified during builds. Items here are captured but not yet scheduled.

---

## Setup & Tooling

### Repo clone setup script

**Source:** Repo Architecture build (2026-01-24)

When cloning Firestarter for a new project, several values need to be regenerated:

- `license.key` — Fresh Craft license
- `CRAFT_APP_ID` — Unique application identifier
- `CRAFT_SECURITY_KEY` — New security key
- DDEV project name — Rename from `firestarter` to project-specific name

A setup script would automate this process, making "clone and go" truly seamless.

---

## Code Quality and Formatting

- Prettier format on save
- Stylelint for CSS linting (property order)

---

## Update set up flow

- lefthook pre-commits didn't run after a fresh install. Manually ran "lefthook install" when I realized this.

---

## Install Knip

- knip.dev
- Declutter your JavaScript & TypeScript projects

---

## Site-level tests

Vitest is configured and Terrazzo plugin tests exist. Site code isn't complex enough to benefit from tests yet. Revisit when:

- **Preview strategy is finalized** — Current `preview.ts` uses a query-param approach documented as interim (`docs/learnings/2026-01-26-preview-mode-patterns.md`). If migrating to Draft Mode, the file gets replaced. Test after the approach is settled.
- **GraphQL client grows** — `client.ts` is a thin fetch wrapper. Worth testing once it has query helpers, response transforms, or retry logic.
- **Components gain logic** — Button and similar components are too simple now. Test once they have conditional rendering, state, or accessibility behavior.
