# Implementation Plan: Repo Architecture

**Design Doc:** `docs/design-plans/2026-01-24-repo-architecture.md`
**Created:** 2026-01-24

---

## Summary

Set up the foundational monorepo structure for Firestarter: a Next.js + Storybook frontend in `/site` and a Craft CMS installation in `/cms`, with proper gitignore strategy and directory conventions.

---

## Codebase Verification

- [x] `/site` does not exist — Verified: correct, needs to be created
- [x] `/cms` does not exist — Verified: correct, needs to be created
- [x] Root `.gitignore` is minimal — Verified: only contains `.DS_Store`

**Patterns to leverage:**
- None — this is foundational scaffolding

**Discrepancies found:**
- `/docs/implementation-plans/` did not exist (created with this plan)
- Root `.gitignore` needs `.env` added per design doc
- Design doc shows `app/` at root level, but we're using `src/app/` (standard Next.js `src/` convention)

---

## Tasks

### Task 1: Create Next.js app in /site

**Description:** Initialize a new Next.js app with TypeScript and App Router in the `/site` directory using `create-next-app`.

**Files:**
- `/site/*` — create (Next.js scaffolding)

**Commands:**
```bash
cd /Users/tylernford/Sites/_firebelly/firestarter
pnpm create next-app site --typescript --app --use-pnpm --src-dir
```

Note: When prompted, use these options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: No (design tokens will handle styling)
- `src/` directory: Yes
- App Router: Yes
- Customize import alias: No (use default `@/*`)

**Done when:** `cd site && pnpm dev` starts the dev server at localhost:3000

**Commit:** "Add Next.js app in /site"

---

### Task 2: Configure Storybook in /site

**Description:** Add Storybook with the `@storybook/nextjs` framework. Configure `.storybook/main.ts` and `.storybook/preview.ts`.

**Files:**
- `/site/.storybook/main.ts` — create
- `/site/.storybook/preview.ts` — create
- `/site/package.json` — modify (Storybook deps added)

**Commands:**
```bash
cd /Users/tylernford/Sites/_firebelly/firestarter/site
pnpm dlx storybook@latest init --type nextjs
```

**Done when:** `cd site && pnpm storybook` launches Storybook at localhost:6006

**Commit:** "Add Storybook configuration"

---

### Task 3: Set up component structure with example

**Description:** Create the component directory structure and add one example Button component with a co-located story. This establishes the pattern for all future components.

**Files:**
- `/site/src/components/Button/Button.tsx` — create
- `/site/src/components/Button/Button.stories.tsx` — create
- `/site/src/components/Button/Button.module.css` — create

**Code example:**
```tsx
// Button.tsx
import styles from './Button.module.css';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    label: 'Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Button',
    variant: 'secondary',
  },
};
```

**Done when:** Button appears in Storybook with Primary and Secondary variants

**Commit:** "Add component structure with Button example"

---

### Task 4: Create tokens and lib directories

**Description:** Set up the tokens and lib directories with placeholder files to establish the structure.

**Files:**
- `/site/src/tokens/index.ts` — create
- `/site/src/lib/index.ts` — create

**Code example:**
```ts
// tokens/index.ts
// Design tokens will be added here
// Synced from Figma design system

export {};
```

```ts
// lib/index.ts
// Utilities and API helpers

export {};
```

**Done when:** Directories exist with placeholder files; TypeScript compilation succeeds

**Commit:** "Add tokens and lib directory structure"

---

### Task 5: Add .nvmrc and verify /site .gitignore

**Description:** Add `.nvmrc` with current LTS Node version. Verify the `.gitignore` created by Next.js covers necessary patterns.

**Files:**
- `/site/.nvmrc` — create
- `/site/.gitignore` — verify/modify if needed

**Code example:**
```
# .nvmrc
22
```

**Done when:** `.nvmrc` specifies Node version; `.gitignore` covers Next.js and Storybook artifacts

**Commit:** "Add .nvmrc and verify .gitignore for /site"

---

### Task 6: Scaffold Craft CMS in /cms

**Description:** Create the Craft CMS directory structure using Composer. Standard installation configured for headless use.

**Files:**
- `/cms/*` — create (Craft scaffolding)

**Commands:**
```bash
cd /Users/tylernford/Sites/_firebelly/firestarter
composer create-project craftcms/craft cms
```

**Done when:** Craft directory structure exists with `composer.json`, `craft` CLI executable, and `config/` directory

Note: This is scaffolding only. Headless configuration (disabling front-end routing, CORS, etc.) will be done in a future task.

**Commit:** "Add Craft CMS scaffolding in /cms"

---

### Task 7: Update root .gitignore

**Description:** Add `.env` to the root `.gitignore` so environment files are ignored repo-wide.

**Files:**
- `/.gitignore` — modify

**Code example:**
```
.DS_Store
.env
```

**Done when:** Root `.gitignore` contains both `.DS_Store` and `.env`

**Commit:** "Update root .gitignore with .env"

---

## Verification Checklist

- [ ] `cd site && pnpm dev` — Next.js runs at localhost:3000
- [ ] `cd site && pnpm storybook` — Storybook runs at localhost:6006
- [ ] Button component visible in Storybook with both variants
- [ ] `/site/src/app/` contains App Router files
- [ ] `/site/src/components/` contains Button with co-located story
- [ ] `/site/src/tokens/` and `/site/src/lib/` directories exist
- [ ] `/site/.nvmrc` contains Node version
- [ ] `/cms/craft` CLI executable exists
- [ ] `/cms/config/` directory exists with Craft config files
- [ ] Root `.gitignore` includes `.env`

---

## Notes

- Task order matters: Tasks 2-5 depend on Task 1 completing first
- Task 6 (Craft) can run in parallel with Tasks 2-5 if desired
- Storybook init creates example stories — keep these for reference
- Craft installation will prompt for database setup — this can be deferred (structure is what matters for this task)

## Deferred

The following items from the design doc are intentionally deferred to future implementation:

- **API routes for Craft preview** (`src/app/api/preview/`, `src/app/api/exit-preview/`) — requires Craft integration work
- **Craft headless configuration** — CORS, disabled front-end routing, etc.
