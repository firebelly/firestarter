# Implementation Plan: Next.js Craft Integration

**Design Spec:** `docs/design-plans/2026-01-25-craft-nextjs-integration.md`
**Created:** 2026-01-26

---

## Summary

Connect the Next.js frontend to Craft CMS via GraphQL. This plan implements data fetching, page routing, live preview, and on-demand cache revalidation.

This is **Plan 2 of 2** for the Craft + Next.js integration. Plan 1 (Craft CMS configuration) is complete. This plan covers all Next.js code.

---

## Codebase Verification

_Confirmed assumptions from design spec match actual codebase_

- [x] Next.js App Router in use — Verified: `site/src/app/` exists
- [x] No existing GraphQL client — Verified: Clean slate
- [x] TypeScript configured — Verified: Strict mode, `@/*` path aliases
- [x] `lib/` directory exists — Verified: Empty placeholder at `site/src/lib/`
- [x] No existing page routes — Verified: Only default boilerplate
- [x] No environment files — Verified: Need to create `.env.local`

**Patterns to leverage:**

- CSS Modules (established in `Button/Button.module.css`)
- Path aliases (`@/lib`, `@/components`)
- TypeScript interfaces (used in Button component)

**Discrepancies found:**

- None. Codebase matches expectations.

**Design change from Plan 2 Brief:**

- Using query parameter preview (simpler) instead of Draft Mode cookies
- No `/api/preview` or `/api/exit-preview` routes needed

---

## Tasks

### Task 1: Set Up Environment Variables

**Description:** Create environment configuration for Craft CMS connection.

**Files:**

- `site/.env.example` — create
- `site/.env.local` — create (gitignored)

**Code example:**

```bash
# site/.env.example

# Craft CMS GraphQL endpoint
CRAFT_URL="https://your-craft-site.ddev.site"

# Private schema token for preview/drafts (from Craft CP → Settings → GraphQL)
CRAFT_PREVIEW_TOKEN=""

# Shared secret for webhook validation (must match cms/.env)
REVALIDATION_SECRET=""
```

**Done when:**

- `.env.example` exists with placeholder values
- `.env.local` exists with real values from Craft setup
- Variables accessible in Next.js

**Commit:** "Add environment configuration for Craft CMS"

---

### Task 2: Create GraphQL Client

**Description:** Build a type-safe fetch wrapper for Craft's GraphQL API with preview and caching support.

**Files:**

- `site/src/lib/graphql/client.ts` — create

**Code example:**

```typescript
type FetchOptions = {
  variables?: Record<string, unknown>;
  preview?: boolean;
  revalidate?: number | false;
};

export async function craftFetch<T>(
  query: string,
  options: FetchOptions = {},
): Promise<T> {
  const { variables, preview = false, revalidate = 86400 } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (preview) {
    headers["Authorization"] = `Bearer ${process.env.CRAFT_PREVIEW_TOKEN}`;
  }

  const res = await fetch(`${process.env.CRAFT_URL}/api`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    next: preview ? { revalidate: 0 } : { revalidate },
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "GraphQL Error");
  }

  return json.data;
}
```

**Done when:**

- Client exports `craftFetch<T>()` function
- Supports `preview: boolean` option (adds auth header)
- Supports `revalidate: number` option (ISR timing)
- Throws on GraphQL errors

**Commit:** "Add GraphQL client for Craft CMS"

---

### Task 3: Create TypeScript Types

**Description:** Define types for Craft CMS entry responses.

**Files:**

- `site/src/lib/graphql/types.ts` — create

**Code example:**

```typescript
// Base entry fields
export interface BaseEntry {
  title: string;
  uri: string | null;
}

// Homepage entry (homepage section, homepage entry type)
export interface HomepageEntry extends BaseEntry {
  heading: string | null;
  body: string | null;
}

// Page entry (pages section, page entry type)
export interface PageEntry extends BaseEntry {
  heading: string | null;
  body: string | null;
}

// GraphQL response wrapper
export interface EntryResponse<T> {
  entry: T | null;
}
```

**Done when:**

- Types match Craft's GraphQL schema
- Types use correct nullability (Craft fields can be null)

**Commit:** "Add TypeScript types for Craft CMS entries"

---

### Task 4: Create GraphQL Queries

**Description:** Define queries for Homepage and Pages sections.

**Files:**

- `site/src/lib/graphql/queries/homepage.ts` — create
- `site/src/lib/graphql/queries/pages.ts` — create
- `site/src/lib/graphql/queries/index.ts` — create

**Code example (homepage.ts):**

```typescript
export const HOMEPAGE_QUERY = `
  query Homepage {
    entry(section: "homepage") {
      title
      uri
      ... on homepage_Entry {
        heading
        body
      }
    }
  }
`;
```

**Code example (pages.ts):**

```typescript
export const PAGE_BY_URI_QUERY = `
  query PageByUri($uri: [String]) {
    entry(section: "pages", uri: $uri) {
      title
      uri
      ... on page_Entry {
        heading
        body
      }
    }
  }
`;
```

**Note:** Uses Craft 5 simplified type naming (`homepage_Entry`, `page_Entry`) per learnings from Plan 1.

**Done when:**

- Queries return expected data when tested against Craft GraphQL endpoint
- Queries use correct fragment types for Craft 5

**Commit:** "Add GraphQL queries for Homepage and Pages"

---

### Task 5: Create Preview Utility

**Description:** Build helper to detect preview mode from URL search params.

**Files:**

- `site/src/lib/preview.ts` — create

**Code example:**

```typescript
type SearchParams = { [key: string]: string | string[] | undefined };

export function isPreviewMode(searchParams: SearchParams): boolean {
  return Boolean(searchParams?.token && searchParams["x-craft-live-preview"]);
}

export function getPreviewToken(searchParams: SearchParams): string | null {
  const token = searchParams?.token;
  return typeof token === "string" ? token : null;
}
```

**Done when:**

- `isPreviewMode()` returns `true` when both params present
- `isPreviewMode()` returns `false` otherwise
- `getPreviewToken()` extracts token string

**Commit:** "Add preview mode detection utility"

---

### Task 6: Update Homepage Route

**Description:** Connect homepage to Craft CMS data.

**Files:**

- `site/src/app/page.tsx` — modify (replace boilerplate)

**Code example:**

```typescript
import { craftFetch } from '@/lib/graphql/client';
import { HOMEPAGE_QUERY } from '@/lib/graphql/queries';
import { EntryResponse, HomepageEntry } from '@/lib/graphql/types';
import { isPreviewMode } from '@/lib/preview';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const preview = isPreviewMode(params);

  const data = await craftFetch<EntryResponse<HomepageEntry>>(
    HOMEPAGE_QUERY,
    { preview }
  );

  const entry = data.entry;

  if (!entry) {
    return <div>Homepage not found</div>;
  }

  return (
    <main>
      <h1>{entry.heading ?? entry.title}</h1>
      {entry.body && (
        <div dangerouslySetInnerHTML={{ __html: entry.body }} />
      )}
    </main>
  );
}
```

**Done when:**

- Homepage displays Craft content at `http://localhost:3000`
- Preview mode works with `?token=xxx&x-craft-live-preview=true`
- Content updates when Craft entry changes (after revalidation)

**Commit:** "Connect homepage to Craft CMS"

---

### Task 7: Create Catch-All Pages Route

**Description:** Build dynamic route for all Pages section entries.

**Files:**

- `site/src/app/[...slug]/page.tsx` — create

**Code example:**

```typescript
import { notFound } from 'next/navigation';
import { craftFetch } from '@/lib/graphql/client';
import { PAGE_BY_URI_QUERY } from '@/lib/graphql/queries';
import { EntryResponse, PageEntry } from '@/lib/graphql/types';
import { isPreviewMode } from '@/lib/preview';

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;
  const preview = isPreviewMode(search);

  // Convert slug array to URI string: ['services', 'web-design'] → 'services/web-design'
  const uri = slug.join('/');

  const data = await craftFetch<EntryResponse<PageEntry>>(
    PAGE_BY_URI_QUERY,
    {
      variables: { uri: [uri] },
      preview,
    }
  );

  const entry = data.entry;

  if (!entry) {
    notFound();
  }

  return (
    <main>
      <h1>{entry.heading ?? entry.title}</h1>
      {entry.body && (
        <div dangerouslySetInnerHTML={{ __html: entry.body }} />
      )}
    </main>
  );
}
```

**Done when:**

- `/about` displays About page content
- `/services/web-design` displays nested page content
- `/does-not-exist` returns 404 page
- Preview mode works on all pages

**Commit:** "Add catch-all route for Craft Pages"

---

### Task 8: Create Revalidation API Route

**Description:** Build webhook endpoint for on-demand cache invalidation.

**Files:**

- `site/src/app/api/revalidate/route.ts` — create

**Code example:**

```typescript
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { secret, uri } = body;

  // Validate secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  // Validate URI
  if (!uri) {
    return NextResponse.json({ message: "Missing uri" }, { status: 400 });
  }

  // Revalidate the path
  const path = uri === "__home__" ? "/" : `/${uri}`;
  revalidatePath(path);

  return NextResponse.json({
    revalidated: true,
    path,
    timestamp: Date.now(),
  });
}
```

**Done when:**

- POST to `/api/revalidate` with valid secret returns 200
- Invalid secret returns 401
- Missing URI returns 400
- `revalidatePath()` is called with correct path

**Commit:** "Add revalidation webhook endpoint"

---

### Task 9: Configure Craft Webhook

**Description:** Complete the webhook configuration in Craft CMS (deferred from Plan 1).

**Work in Craft CP:**

1. Install webhooks plugin (if not already):

   ```bash
   cd cms && ddev composer require craftcms/webhooks && ddev craft plugin/install webhooks
   ```

2. Navigate to **Settings → Webhooks**

3. Create webhook group "Cache Invalidation"

4. Create webhook:
   - **Name:** Revalidate Next.js
   - **Events:** `elements.entry.afterSave`
   - **URL:** `http://localhost:3000/api/revalidate`
   - **Method:** POST
   - **Headers:** `Content-Type: application/json`
   - **Payload:**
     ```json
     {
       "secret": "{{ getenv('REVALIDATION_SECRET') }}",
       "uri": "{{ entry.uri ?? '__home__' }}"
     }
     ```

5. Add to `cms/.env`:
   ```bash
   REVALIDATION_SECRET="your-secret-here"
   ```
   (Use same value as `site/.env.local`)

**Done when:**

- Saving an entry in Craft triggers POST to Next.js
- Next.js logs show revalidation occurring
- Site content updates within seconds of publish

**Commit:** "Configure Craft webhook for cache revalidation"

---

### Task 10: Add Preview Bar Component (Nice to Have)

**Description:** Show a visual indicator when in preview mode with an exit link.

**Files:**

- `site/src/components/PreviewBar/PreviewBar.tsx` — create
- `site/src/components/PreviewBar/PreviewBar.module.css` — create
- `site/src/app/layout.tsx` — modify

**Code example (PreviewBar.tsx):**

```typescript
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import styles from './PreviewBar.module.css';

export function PreviewBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isPreview = searchParams.has('token') &&
                    searchParams.has('x-craft-live-preview');

  if (!isPreview) return null;

  // Build exit URL (same path, no preview params)
  const exitUrl = pathname;

  return (
    <div className={styles.bar}>
      <span>You are viewing draft content</span>
      <a href={exitUrl} className={styles.exit}>
        Exit Preview
      </a>
    </div>
  );
}
```

**Code example (PreviewBar.module.css):**

```css
.bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a1a;
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  z-index: 9999;
}

.exit {
  color: #60a5fa;
  text-decoration: underline;
}
```

**Done when:**

- Preview bar appears at bottom of page in preview mode
- "Exit Preview" link removes preview params
- Bar does not appear in normal mode

**Commit:** "Add preview mode indicator bar"

---

## Verification Checklist

After all tasks complete, verify:

- [ ] Homepage (`/`) displays Craft Homepage content
- [ ] Page (`/about`) displays Craft Pages content
- [ ] Nested page (`/services/web-design`) displays correctly
- [ ] Non-existent page (`/does-not-exist`) returns 404
- [ ] Preview mode shows draft content with `?token=xxx&x-craft-live-preview=true`
- [ ] Publishing an entry updates site within seconds
- [ ] Preview bar appears in preview mode (if Task 10 completed)
- [ ] Preview bar "Exit" link works

---

## Environment Variables Summary

**site/.env.local:**

```bash
CRAFT_URL="https://cms.firestarter.ddev.site"
CRAFT_PREVIEW_TOKEN="<from Craft GraphQL settings>"
REVALIDATION_SECRET="<shared secret>"
```

**cms/.env (add):**

```bash
REVALIDATION_SECRET="<same shared secret>"
```

---

## Notes

- **GraphQL endpoint:** In headless mode, Craft uses `/actions/graphql/api`. Verify the correct endpoint during Task 2.

- **CKEditor HTML:** The `body` field returns HTML from CKEditor. We use `dangerouslySetInnerHTML` for now; a proper HTML sanitizer or MDX approach can be added later.

- **No `generateStaticParams`:** Per design spec, we're not pre-generating pages. ISR handles caching.

- **Webhook debugging:** Check Craft CP → Utilities → Webhooks for logs if revalidation isn't working.

---

## Next Steps

After completing this plan:

1. Commit all changes
2. Verify all acceptance criteria pass
3. Update design spec Build Log with completion notes
4. Run `/document` to update project documentation
