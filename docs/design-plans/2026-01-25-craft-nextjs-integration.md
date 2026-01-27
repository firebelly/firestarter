# Craft CMS + Next.js Integration

**Created:** 2026-01-25
**Status:** Complete

---

## Overview

**What:** Connect Craft CMS (headless) to the Next.js frontend via GraphQL, with live preview and on-demand cache revalidation.

**Why:** Establishes the foundational data layer for Firestarter — content authored in Craft rendered by Next.js. This proof of concept validates the end-to-end flow before building out the full component library.

**Type:** Feature

---

## Requirements

### Must Have
- [ ] Craft GraphQL API enabled with public and private schemas
- [ ] Homepage singleton section with heading and body fields
- [ ] Pages structure section (2 levels) with heading and body fields
- [ ] Next.js GraphQL client for fetching content
- [ ] Homepage route (`/`) consuming Craft data
- [ ] Catch-all pages route (`/[...slug]`) consuming Craft data
- [ ] Live Preview via Draft Mode
- [ ] On-demand cache revalidation via webhook
- [ ] 404 handling for missing pages

### Nice to Have
- [ ] Preview bar UI showing "You are in preview mode" with exit link

### Out of Scope
- Full design system / component library
- Matrix page builders
- Navigation / menus
- SEO / meta tags
- Image / asset handling
- Production hosting configuration
- Pre-generation with `generateStaticParams`
- Authentication / protected content

---

## Design Decisions

### Data Fetching Approach
**Options considered:**
1. GraphQL (Craft built-in) — flexible queries, frontend requests only what it needs, industry standard
2. Element API (plugin) — REST-like endpoints, simpler but less flexible, requires PHP config per endpoint

**Decision:** GraphQL. Better fit for a component-based system where different components need different fields. No plugin dependency — built into Craft 5.

---

### GraphQL Client
**Options considered:**
1. Apollo Client — full-featured, caching, dev tools, but heavy
2. urql — lighter than Apollo, still adds complexity
3. Native fetch — no dependencies, works with Next.js App Router caching

**Decision:** Native fetch with a thin wrapper. Keeps the stack simple, no extra dependencies, and App Router handles caching natively via ISR.

---

### Rendering Strategy
**Options considered:**
1. SSG — build-time only, requires redeploy for content changes
2. ISR — static with automatic revalidation, best of both worlds
3. SSR — always fresh but slower, higher server cost

**Decision:** ISR with 24-hour fallback + on-demand revalidation. Pages are cached and fast; webhook from Craft invalidates cache on publish; time-based fallback is a safety net if webhook fails.

---

### URL Structure for Pages
**Options considered:**
1. Channel section with flat URLs (`/about`, `/contact`)
2. Structure section with nested URLs (`/services`, `/services/web-design`)

**Decision:** Structure section with 2 levels of nesting. Allows parent/child page relationships. URI format: `{slug}` for top-level, `{parent.uri}/{slug}` for nested. Next.js catches all depths with `[...slug]`.

---

### GraphQL Schema Security
**Options considered:**
1. Public schema (no token) for all queries
2. Token required for all queries
3. Public schema for published content, private schema for drafts

**Decision:** Public schema for published content, private schema (token required) for preview/drafts. Published content is already visible on the website — no security benefit to hiding it behind a token. Draft content needs protection.

---

## Technical Design

### Craft CMS Configuration

**Sections:**

| Section | Type | Handle | Entry Type | URI Format |
|---------|------|--------|------------|------------|
| Homepage | Single | `homepage` | `homepage` | `__home__` |
| Pages | Structure | `pages` | `pages` | Top: `{slug}` / Nested: `{parent.uri}/{slug}` |

**Fields:**

| Field | Handle | Type | Sections |
|-------|--------|------|----------|
| Heading | `heading` | Plain Text | Homepage, Pages |
| Body | `body` | CKEditor | Homepage, Pages |

**GraphQL Schemas:**

| Schema | Scope | Token |
|--------|-------|-------|
| Public | Published entries only | None required |
| Private | Published + drafts | Required |

**Preview Target (Pages section):**

```
Label: Web Preview
URL Format: {alias('@webUrl')}/api/preview?token={token}&uri={uri}
```

**Webhook (on Entry save):**

```
URL: {frontend}/api/revalidate
Method: POST
Body: { "uri": "{entry.uri}", "secret": "{secret}" }
```

---

### Next.js File Structure

```
site/src/
├── app/
│   ├── page.tsx                    # Homepage route
│   ├── [...slug]/
│   │   └── page.tsx                # Catch-all pages route
│   └── api/
│       ├── preview/
│       │   └── route.ts            # Enable Draft Mode
│       ├── exit-preview/
│       │   └── route.ts            # Disable Draft Mode
│       └── revalidate/
│           └── route.ts            # On-demand cache invalidation
└── lib/
    └── graphql/
        ├── client.ts               # GraphQL fetch wrapper
        ├── queries.ts              # Query definitions
        └── types.ts                # TypeScript types
```

---

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `CRAFT_GRAPHQL_URL` | Craft GraphQL endpoint | `https://firestarter.ddev.site/api` |
| `CRAFT_PREVIEW_TOKEN` | Token for draft/preview queries | (generated in Craft) |
| `REVALIDATION_SECRET` | Shared secret for webhook validation | (random string) |

---

### Caching Strategy

| Trigger | Behavior |
|---------|----------|
| Normal request | Serve from ISR cache |
| Cache > 24 hours old | Next request triggers background rebuild |
| Content published | Webhook invalidates that page's cache immediately |
| New deployment | Fresh cache, pages build on first request |
| Preview mode | Bypasses cache, fetches drafts directly |

---

### GraphQL Queries

**Homepage:**
```graphql
query Homepage {
  entry(section: "homepage") {
    title
    ... on homepage_homepage_Entry {
      heading
      body
    }
  }
}
```

**Page by URI:**
```graphql
query PageByUri($uri: [String]) {
  entry(section: "pages", uri: $uri) {
    title
    uri
    ... on pages_pages_Entry {
      heading
      body
    }
  }
}
```

---

## Acceptance Criteria

- [ ] Craft GraphQL endpoint responds to queries at `/api`
- [ ] Homepage section exists with heading and body fields
- [ ] Pages structure section exists with heading and body fields, supports nesting
- [ ] Next.js homepage (`/`) displays content from Craft Homepage entry
- [ ] Next.js page (`/about`) displays content from Craft Pages entry
- [ ] Nested page (`/services/web-design`) displays correctly
- [ ] Non-existent page (`/does-not-exist`) returns 404
- [ ] Live Preview shows unpublished changes in Craft's preview iframe
- [ ] Publishing an entry triggers webhook and updates the live site within seconds
- [ ] Preview mode can be exited via `/api/exit-preview`

---

## Files to Create/Modify

### Craft CMS (manual configuration in Control Panel)
```
- Create Homepage section (Single)
- Create Pages section (Structure, 2 levels max)
- Create Heading field (Plain Text)
- Create Body field (CKEditor)
- Configure GraphQL schemas (public + private)
- Configure preview targets
- Install/configure webhook plugin (or custom module)
```

### Next.js (code changes)
```
site/src/lib/graphql/client.ts      # GraphQL fetch wrapper
site/src/lib/graphql/queries.ts     # Query definitions
site/src/lib/graphql/types.ts       # TypeScript types
site/src/app/page.tsx               # Update homepage to fetch from Craft
site/src/app/[...slug]/page.tsx     # New catch-all route for pages
site/src/app/api/preview/route.ts   # New preview entry route
site/src/app/api/exit-preview/route.ts  # New exit preview route
site/src/app/api/revalidate/route.ts    # New revalidation webhook route
site/.env.local                     # Environment variables
```

---

## Build Log

*Filled in during `/build` phase*

| Date | Task | Files | Notes |
|------|------|-------|-------|
| 2026-01-25 | Task 1: Create Content Fields | `cms/config/project/fields/heading--*.yaml`, `cms/config/project/fields/body--*.yaml` | Deviated: Had to install CKEditor plugin first (not in plan) |
| 2026-01-25 | Task 2: Create Homepage Section | `cms/config/project/sections/homepage--*.yaml`, `cms/config/project/entryTypes/homepage--*.yaml` | Deviated: GraphQL type is `homepage_Entry` not `homepage_homepage_Entry` (Craft 5 simplified naming) |
| 2026-01-25 | Task 3: Create Pages Section | `cms/config/project/sections/pages--*.yaml`, `cms/config/project/entryTypes/page--*.yaml` | Completed as planned. GraphQL type is `page_Entry`. |
| 2026-01-25 | Task 4: Configure GraphQL Schemas | `cms/config/project/graphql/schemas/*.yaml` | Public Schema built-in (not renamed). Created "Private Schema" with drafts/revisions access + token. Deviated: In headless mode, GraphQL endpoint is `/actions/graphql/api` (custom routes disabled). Verified: Public rejects drafts, Private returns them with token. |
| 2026-01-25 | Task 5: Configure Preview Targets | `cms/.env`, `cms/config/project/sections/*.yaml` | Simplified: Using `{url}` as preview target (per official starter). Set `CRAFT_BASE_CP_URL=https://cms.ddev.site`. Set `PRIMARY_SITE_URL=http://localhost:3000`. Full testing deferred to Plan 2. |
| 2026-01-25 | Task 6: Configure Revalidation Webhook | — | **Deferred to Plan 2.** No endpoint to receive webhook yet. Will configure when building Next.js frontend. |
| 2026-01-26 | Plan 2, Task 1: Set Up Environment Variables | `site/.env.example`, `site/.env.local`, `site/.gitignore` | Created env files. Updated .gitignore to track .env.example but not .env.local. Deviated: CRAFT_URL is `https://cms.ddev.site` not `https://cms.firestarter.ddev.site` (implementation plan had wrong DDEV project name). |
| 2026-01-26 | Plan 2, Task 2: Create GraphQL Client | `site/src/lib/graphql/client.ts` | Used `/actions/graphql/api` endpoint per Plan 1 learnings (headless mode disables custom routes). |
| 2026-01-26 | Plan 2, Task 3: Create TypeScript Types | `site/src/lib/graphql/types.ts` | BaseEntry, HomepageEntry, PageEntry, EntryResponse<T>. Fields nullable per Craft schema. |
| 2026-01-26 | Plan 2, Task 4: Create GraphQL Queries | `site/src/lib/graphql/queries/*.ts` | HOMEPAGE_QUERY, PAGE_BY_URI_QUERY. Used Craft 5 type naming: `homepage_Entry`, `page_Entry`. |
| 2026-01-26 | Plan 2, Task 6 (Part 1): Update Homepage Route | `site/src/app/page.tsx`, `types.ts`, `queries/*.ts` | Deviated: Reordered tasks to test live before adding preview. Discoveries: (1) Use HTTP not HTTPS for local DDEV (Node rejects self-signed certs), (2) CKEditor fields need sub-selection `body { html }` not just `body`. Added CKEditorField type. |
| 2026-01-26 | Preview Config Setup | `cms/.env`, `site/package.json` | Required for Craft→Next.js preview iframe: (1) Set `PRIMARY_SITE_URL=https://localhost:3000` in `cms/.env` (overrides DDEV default), (2) Removed `CRAFT_BASE_CP_URL` (not needed), (3) Added `--experimental-https` to dev script in package.json. HTTPS required to avoid mixed-content blocking. |
| 2026-01-26 | Plan 2, Task 5: Create Preview Utility | `site/src/lib/preview.ts` | Created `isPreviewMode()` and `getPreviewToken()` helpers. Detects Craft preview via URL params. |
| 2026-01-26 | Plan 2, Task 6: Update Homepage Route | `site/src/app/page.tsx`, `site/src/lib/graphql/client.ts` | Added preview support. **Deviated:** Preview token must be passed as query param to GraphQL endpoint (`?token=xxx`), NOT as Authorization header. The preview token authorizes access to a specific draft, different from schema tokens. |
| 2026-01-26 | Architectural Pivot: Draft Mode | — | **Major deviation:** Query param preview works but opts page into dynamic rendering (no static caching for normal visitors). Decided to pivot to Draft Mode approach: API routes (`/api/preview`, `/api/exit-preview`) set cookies, page checks `draftMode()`. This keeps pages static for visitors while allowing dynamic preview for editors. Will revert `searchParams` changes and implement Draft Mode. See `docs/learnings/2026-01-26-preview-mode-patterns.md`. |
| 2026-01-27 | Draft Mode Abandoned | — | Cross-origin iframe cookie blocking made Draft Mode unworkable. Browsers block third-party cookies regardless of `SameSite=None; Secure` settings. Published tutorials confirm this is a known unsolved problem. Reverted to query param approach. |
| 2026-01-27 | Plan 2, Task 6: Update Homepage Route | `site/src/app/page.tsx`, `site/src/lib/preview.ts`, `site/src/lib/graphql/client.ts` | Final implementation uses query params (`searchParams`). Preview token passed to GraphQL as `?token=xxx`. Updated `isPreviewMode()` to detect both `x-craft-live-preview` (iframe) and `x-craft-preview` (view link). Both preview modes working. |
| 2026-01-27 | Plan 2, Task 7: Create Catch-All Pages Route | `site/src/app/[...slug]/page.tsx` | Completed as planned. Uses same preview pattern as homepage. Slug array joined to URI string for Craft GraphQL lookup. |
| 2026-01-27 | Plan 2, Task 8: Create Revalidation API Route | `site/src/app/api/revalidate/route.ts` | Completed as planned. Validates shared secret, converts `__home__` to `/`, calls `revalidatePath()`. Learning: [On-Demand Revalidation](../learnings/2026-01-27-on-demand-revalidation.md) |
| 2026-01-27 | Plan 2, Task 9: Configure Craft Webhook | Craft CP config, `cms/.env` | Installed craftcms/webhooks plugin. Created "Revalidate Next.js" webhook on `elements.entry.afterSave`. **Deviation:** Reverted to HTTP for local dev — DDEV can't reach Next.js HTTPS (self-signed cert rejected). Webhook URL: `http://host.docker.internal:3000/api/revalidate`. Production will use proper HTTPS. Learning: [Local vs Production Config](../learnings/2026-01-27-local-vs-production-config.md) |
| 2026-01-27 | Discovery: Unused Private Schema | — | **Documentation cleanup needed.** Design planned for Private Schema + `CRAFT_PREVIEW_TOKEN` to access drafts during preview. Implementation pivoted to using Craft's dynamic per-session preview token (from URL params) instead. Result: Private Schema configured but unused, `CRAFT_PREVIEW_TOKEN` env var is dead code. Docs referencing it: design plan, implementation plan, learnings, `.env.example`. Needs cleanup in `/document` phase. |

---

## Completion

**Completed:** 2026-01-25
**Final Status:** Partial (5/6 tasks — Task 6 deferred)

**Summary:** Configured Craft CMS for headless operation with Next.js. Created Homepage singleton and Pages structure sections with Heading/Body fields. Set up GraphQL public/private schemas with token authentication. Configured preview targets using official starter pattern. Task 6 (webhooks) deferred to Plan 2 when Next.js endpoint exists.

**Deviations from Plan:**
- CKEditor required plugin installation (not built-in)
- GraphQL types use simplified naming in Craft 5: `{section}_Entry` not `{section}_{entryType}_Entry`
- GraphQL endpoint is `/actions/graphql/api` in headless mode (custom routes disabled)
- Preview targets simplified to `{url}` using `PRIMARY_SITE_URL` pattern from official starter
- Task 6 deferred — webhook configuration requires Next.js endpoint to test

**Learnings documented:**
- [Craft CMS Headless Setup](../learnings/2026-01-25-craft-headless-setup.md) — GraphQL types, headless mode gotchas, schema permissions, site URL configuration
- [Next.js + Craft Fundamentals](../learnings/2026-01-25-next-craft-fundamentals.md) — Rendering strategies, ISR patterns, preview flow, catch-all routes
- [Preview Mode Patterns](../learnings/2026-01-26-preview-mode-patterns.md) — Token types, searchParams vs Draft Mode, static rendering tradeoffs
- [On-Demand Revalidation](../learnings/2026-01-27-on-demand-revalidation.md) — Webhook flow, route handler anatomy, revalidatePath behavior, debugging tips
- [Local vs Production Config](../learnings/2026-01-27-local-vs-production-config.md) — Environment URLs, HTTP/HTTPS tradeoff, GraphQL endpoint, quick reference checklists
