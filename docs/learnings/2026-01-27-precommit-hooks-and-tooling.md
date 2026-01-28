# Pre-commit Hooks & JavaScript Tooling

**Date:** 2026-01-27
**Context:** Setting up Lefthook for TypeScript and ESLint pre-commit checks

---

## TypeScript vs ESLint: What Each Catches

These tools complement each other — they catch different classes of problems.

### TypeScript (`tsc --noEmit`)

- **Type errors** — wrong types, missing properties, null/undefined issues
- **Import errors** — importing things that don't exist
- **Syntax errors** — malformed code that won't compile
- **Missing return types** (if configured strictly)

```typescript
// TypeScript catches this:
const userName = user.nmae;  // ❌ 'nmae' doesn't exist on type User
```

### ESLint

- **Code quality issues** — unused variables, unreachable code, console.log statements
- **React-specific problems** — missing keys in lists, hooks rules violations, accessibility issues
- **Import organization** — unused imports, wrong import order
- **Potential bugs** — comparing with `==` instead of `===`, accidental assignments in conditionals
- **Framework-specific rules** — Next.js `<Image>` usage, `<Link>` patterns

```typescript
// ESLint catches these:
if (condition) {
  const [state, setState] = useState();  // ❌ Hooks can't be called conditionally
}

const unusedThing = 'hello';  // ❌ Unused variable

<img src="/photo.jpg" />  // ❌ Missing alt text (a11y)
```

### The Overlap

ESLint with TypeScript configs (`eslint-config-next/typescript`) uses TypeScript's parser, so it catches some type-adjacent issues. But **ESLint doesn't replace `tsc`** — it doesn't do full type checking.

**Best practice:** Run both. TypeScript first (catches hard errors), ESLint second (catches quality issues).

---

## Next.js and ESLint

Next.js projects come with ESLint pre-configured via `create-next-app`.

### What `eslint-config-next` Provides

- React best practices (hooks rules, JSX patterns)
- Next.js-specific rules (proper `<Image>`, `<Link>`, `<Script>` usage)
- Core Web Vitals hints (performance-related warnings)
- Basic accessibility checks via `eslint-plugin-jsx-a11y`
- TypeScript integration via the `/typescript` variant

### `next lint` vs `eslint`

| Command | Behavior |
|---------|----------|
| `next lint` | Next.js wrapper around ESLint. Auto-detects config, only lints specific directories by default (`pages/`, `app/`, `components/`, `lib/`, `src/`), provides guided setup. |
| `eslint` | Standard ESLint CLI. Lints whatever you tell it, requires config to exist, more explicit control. |

**When to use which:**
- Use `next lint` if you want Next.js to manage ESLint setup with its directory-scoping defaults
- Use `eslint` directly when you want explicit control or have non-Next tooling (like Storybook) in the mix

Both use the same config file and rules — the difference is in defaults and discoverability.

---

## Why TypeScript Can't Check Just Staged Files

You might think: "I only changed one file, why check the whole project?"

**The problem:** TypeScript files depend on each other.

```typescript
// fileA.ts imports from fileB.ts
import { User } from './fileB';

const name = user.name;  // Is this valid? Depends on fileB's User type
```

To know if `fileA.ts` is valid, TypeScript needs to read `fileB.ts` (and everything it imports). You can't type-check in isolation.

**Why it's still fast:**
- TypeScript uses **incremental compilation** (`"incremental": true` in tsconfig)
- It caches previous results in `.tsbuildinfo`
- Subsequent runs only re-check what actually changed
- Typical pre-commit: 1-3 seconds, not minutes

ESLint, by contrast, can lint files in isolation — so staged-only linting works there.

---

## Lefthook `piped: true`

Lefthook can run commands in parallel or in sequence. The `piped: true` option enables **fail-fast behavior**.

```yaml
pre-commit:
  piped: true  # Commands run in sequence; stop on first failure
  commands:
    typecheck:
      run: pnpm tsc --noEmit
    lint:
      run: pnpm eslint {staged_files}
```

**Without `piped: true`:**
- Both commands run (potentially in parallel)
- Both report their errors
- Commit blocked if either fails

**With `piped: true`:**
- Commands run in defined order (typecheck → lint)
- If typecheck fails, lint is skipped entirely
- Saves time — no point linting code that won't compile

---

## Monorepo Package Structure

When you have multiple directories (like `site/` for Next.js and `cms/` for Craft), you have options for where `package.json` lives.

### Option A: Separate Package Files

```
project/
├── package.json      # Root (just Lefthook)
├── site/
│   └── package.json  # Next.js dependencies
└── cms/              # PHP, no package.json
```

- Two `pnpm install` steps (root and site/)
- Clear separation of concerns
- Simple to understand

### Option B: pnpm Workspaces

```
project/
├── package.json         # Root with workspaces
├── pnpm-workspace.yaml  # Declares site/ as a workspace
├── site/
│   └── package.json     # Next.js dependencies
└── cms/
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'site'
```

- Single `pnpm install` at root installs everything
- Can run commands from anywhere: `pnpm --filter site dev`
- More "proper" monorepo setup

### Migration Path

Starting with Option A doesn't lock you in. To migrate to Option B later:

1. Add `pnpm-workspace.yaml` at root
2. That's it — pnpm auto-detects it

The `lefthook.yml` and individual `package.json` files don't need to change.

---

## Key Takeaways

1. **TypeScript and ESLint are complementary** — run both for comprehensive coverage
2. **Next.js includes ESLint** — you likely already have a solid config out of the box
3. **TypeScript needs full project context** — but incremental compilation keeps it fast
4. **Fail-fast saves time** — skip downstream checks when upstream fails
5. **Start simple, migrate later** — you can add workspaces without restructuring existing configs
