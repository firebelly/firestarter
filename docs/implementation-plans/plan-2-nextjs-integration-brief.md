# Plan 2 Brief: Next.js Craft Integration

**Created:** 2026-01-25
**Status:** Pending (waiting for Plan 1 completion)
**Prereq:** `docs/implementation-plans/2026-01-25-craft-cms-content-setup.md`

---

## Context

This brief captures decisions and learnings from the Plan 1 session to inform Plan 2 creation.

---

## Key Learnings from Pixel & Tonic Starter

We reviewed the official Craft + Next.js starter at `starter-next-main/`. Key patterns to adopt:

### 1. Preview via Query Params (No API Routes)

**Instead of** Draft Mode cookies with `/api/preview` and `/api/exit-preview` routes:

```
Craft → /api/preview?token=xxx → sets cookie → redirects → page reads draftMode()
```

**Use** direct query parameter detection in page components:

```
Craft → /about?token=xxx&x-craft-live-preview=true → page detects → fetches with token
```

**Benefits:** Simpler architecture, fewer moving parts, no cookie management.

---

### 2. Page Factory Pattern

Centralize fetch + preview + transform logic in a reusable factory:

```typescript
// lib/createPage.tsx
export function createPage<T>(
  query: string,
  transform: (data: unknown) => T,
  options?: { variables?: (context: PageContext) => Variables }
) {
  return async function Page({ params, searchParams }: PageProps) {
    const isPreview = Boolean(
      searchParams?.token && searchParams['x-craft-live-preview']
    )

    const variables = options?.variables?.({ params, searchParams }) ?? {}

    const data = await craftFetch(query, variables, {
      preview: isPreview,
      cache: isPreview ? 'no-store' : 'force-cache',
      revalidate: isPreview ? 0 : 86400 // 24hr fallback
    })

    const transformed = transform(data)

    return (
      <Suspense fallback={<Loading />}>
        <Preview initialData={transformed} query={query} variables={variables} />
      </Suspense>
    )
  }
}
```

**Usage becomes trivial:**

```typescript
// app/[...slug]/page.tsx
export default createPage(PAGE_QUERY, transformPage, {
  variables: ({ params }) => ({ uri: params.slug?.join("/") || "" }),
});
```

---

### 3. Preview Component for Live Updates

Client component that re-fetches when preview params are present:

```typescript
// components/Preview/Preview.tsx
"use client";

export function Preview({ initialData, query, variables, children }) {
  const [data, setData] = useState(initialData);
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const isPreview = searchParams.has("x-craft-live-preview");

    if (isPreview && token) {
      craftFetch(query, variables, { preview: true, token }).then((newData) =>
        setData(transform(newData)),
      );
    }
  }, [searchParams]);

  return children(data);
}
```

---

### 4. GraphQL Directives

Let Craft handle data transformation server-side:

```graphql
query PageByUri($uri: [String]) {
  entry(section: "pages", uri: $uri) {
    title
    postDate @formatDateTime(format: "F j, Y")
    body @markdown
    image {
      url @transform(handle: "hero")
      width
      height
    }
  }
}
```

---

### 5. Separate Query Files

Organize queries by feature for scalability:

```
lib/graphql/
├── client.ts
├── types.ts
└── queries/
    ├── homepage.ts
    ├── pages.ts
    └── index.ts (re-exports)
```

---

## What We're Keeping From Original Design

| Pattern                  | Why Keep It                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| **Webhook revalidation** | P&T only uses time-based (1hr). Our webhook approach = seconds, not hours. |
| **TypeScript**           | P&T uses plain JS. We want type safety for Craft entries.                  |
| **24hr time fallback**   | Safety net if webhook fails.                                               |
| **Preview bar UI**       | P&T has no clean exit-preview UX. We'll add one.                           |

---

## Plan 2 Task List

| #   | Task                         | Files                                         | Notes                                               |
| --- | ---------------------------- | --------------------------------------------- | --------------------------------------------------- |
| 1   | Create GraphQL client        | `lib/graphql/client.ts`                       | Native fetch, preview support, caching              |
| 2   | Create TypeScript types      | `lib/graphql/types.ts`                        | Entry types for Homepage, Page                      |
| 3   | Create GraphQL queries       | `lib/graphql/queries/homepage.ts`, `pages.ts` | With directives                                     |
| 4   | Set up environment variables | `.env.example`, `.env.local`                  | CRAFT_URL, CRAFT_PREVIEW_TOKEN, REVALIDATION_SECRET |
| 5   | Create page factory          | `lib/createPage.tsx`                          | Adopt P&T pattern                                   |
| 6   | Create Preview component     | `components/Preview/Preview.tsx`              | Client-side live updates                            |
| 7   | Update homepage route        | `app/page.tsx`                                | Use factory                                         |
| 8   | Create catch-all route       | `app/[...slug]/page.tsx`                      | Use factory, handle 404                             |
| 9   | Create revalidation API      | `app/api/revalidate/route.ts`                 | Webhook endpoint                                    |
| 10  | Add preview bar UI           | `components/PreviewBar/`                      | Nice to have                                        |

---

## Environment Variables Needed

```bash
# site/.env.local

# Craft GraphQL endpoint
CRAFT_URL="http://api.firestarter.ddev.site"

# Private schema token (from Craft CP → Settings → GraphQL)
CRAFT_PREVIEW_TOKEN="xxxxx"

# Shared secret (must match cms/.env REVALIDATION_SECRET)
REVALIDATION_SECRET="xxxxx"
```

---

## File Structure After Plan 2

```
site/src/
├── app/
│   ├── page.tsx                      # Homepage (uses createPage)
│   ├── [...slug]/
│   │   └── page.tsx                  # Catch-all (uses createPage)
│   └── api/
│       └── revalidate/
│           └── route.ts              # Webhook endpoint
├── components/
│   ├── Preview/
│   │   └── Preview.tsx               # Live preview wrapper
│   └── PreviewBar/
│       ├── PreviewBar.tsx            # "You are previewing" banner
│       └── PreviewBar.module.css
└── lib/
    ├── createPage.tsx                # Page factory
    └── graphql/
        ├── client.ts                 # Fetch wrapper
        ├── types.ts                  # TypeScript types
        └── queries/
            ├── homepage.ts
            ├── pages.ts
            └── index.ts
```

---

## Reference Files

When creating Plan 2, reference these for patterns:

| File                                                    | What to Learn              |
| ------------------------------------------------------- | -------------------------- |
| `starter-next-main/frontend/src/lib/graphql.js`         | Fetch wrapper with caching |
| `starter-next-main/frontend/src/lib/createPage.js`      | Page factory pattern       |
| `starter-next-main/frontend/src/components/Preview.jsx` | Live preview component     |
| `starter-next-main/frontend/src/queries/pages.mjs`      | Query structure            |
| `starter-next-main/frontend/src/app/[...slug]/page.jsx` | Catch-all usage            |

---

## Acceptance Criteria (from Design Doc)

Plan 2 is complete when:

- [ ] Next.js homepage (`/`) displays content from Craft Homepage entry
- [ ] Next.js page (`/about`) displays content from Craft Pages entry
- [ ] Nested page (`/services/web-design`) displays correctly
- [ ] Non-existent page (`/does-not-exist`) returns 404
- [ ] Live Preview shows unpublished changes in Craft's preview iframe
- [ ] Publishing an entry triggers webhook and updates the live site within seconds
- [ ] Preview mode shows indicator bar with exit link

---

## How to Start Plan 2

After Plan 1 is complete and verified:

```bash
# Start new Claude Code session
/plan docs/design-plans/2026-01-25-craft-nextjs-integration.md docs/implementation-plans/plan-2-nextjs-integration-brief.md
```
