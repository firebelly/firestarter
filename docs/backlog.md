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
