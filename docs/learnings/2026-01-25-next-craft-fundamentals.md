# Next.js + Craft CMS Fundamentals

**Created:** 2026-01-25
**Source:** Design session for Craft CMS + Next.js Integration

Foundational concepts for the headless architecture. Reference this when onboarding or troubleshooting.

---

## Data Fetching: GraphQL vs Element API

### GraphQL (Craft Built-in)

- Single endpoint (`/api`) handles all queries
- Frontend requests exactly the fields it needs
- Schema auto-generates from your content model
- Industry standard, transferable knowledge

### Element API (Plugin)

- REST-like endpoints defined in PHP config
- Each endpoint returns a fixed shape
- Simpler mental model but less flexible
- Good for simple, stable APIs

**Firestarter uses GraphQL** — better fit for component-based systems where different components need different fields.

---

## Next.js Rendering Strategies

```
◄─────────────────────────────────────────────────────────────────────────►
 SSG                              ISR                                   SSR
 (Static)                    (Hybrid)                              (Dynamic)

 Build once                  Static + auto-refresh               Render every request
 Never changes               Revalidates on schedule             Always fresh
 Fastest                     Fast (cached most of time)          Slower
 Redeploy to update          Self-healing cache                  No cache
```

| Strategy | When Page Renders          | Good For                                 |
| -------- | -------------------------- | ---------------------------------------- |
| **SSG**  | Build time only            | Docs, sites that rarely change           |
| **ISR**  | Build + background refresh | CMS-driven content, blogs                |
| **SSR**  | Every request              | User-specific data, real-time dashboards |

**Firestarter uses ISR** — static performance with automatic freshness.

---

## ISR: Stale-While-Revalidate

ISR doesn't block visitors while rebuilding. The pattern:

1. Page is generated and cached
2. For `revalidate` seconds, all visitors get cached version
3. After expiry, cache is "stale"
4. Next visitor **still gets stale cache** (fast!)
5. Rebuild happens in background
6. Once complete, new cache replaces old
7. Subsequent visitors get fresh version

**You never wait for a rebuild.** Worst case: content is `revalidate` seconds old.

---

## Caching Strategy Layers

| Layer        | Mechanism                      | Purpose                               |
| ------------ | ------------------------------ | ------------------------------------- |
| **Primary**  | On-demand webhook              | Instant cache invalidation on publish |
| **Fallback** | Time-based revalidation (24hr) | Safety net if webhook fails           |
| **Reset**    | New deployment                 | Fresh cache, all pages rebuild        |

The time-based fallback is "disaster recovery" — if everything works correctly (webhooks fire), you'll never hit it.

---

## Next.js Catch-All Routes

For variable-depth URLs from a CMS:

| Pattern       | Matches                           | Doesn't Match |
| ------------- | --------------------------------- | ------------- |
| `[slug]`      | `/about` (single segment)         | `/about/team` |
| `[...slug]`   | `/about`, `/about/team`, `/a/b/c` | `/` (root)    |
| `[[...slug]]` | `/`, `/about`, `/about/team`      | —             |

The double brackets `[[...slug]]` make the segment **optional**.

### Route Specificity

More specific routes win:

```
app/
├── page.tsx              # / (exact match wins)
├── about/
│   └── [[...slug]]/
│       └── page.tsx      # /about, /about/team, /about/team/leadership
└── [...slug]/
    └── page.tsx          # Everything else
```

`/about` → matches `about/[[...slug]]` (more specific than root catch-all)
`/services` → matches `[...slug]` (no specific route exists)

---

## Live Preview with Draft Mode

**The problem:** ISR caches published content. Editors need to see unpublished drafts.

**The solution:** Draft Mode — a cookie-based flag that tells the page to skip cache and fetch fresh.

```
Normal visitor:     ISR cache → Published content
Editor in preview:  Draft Mode → Bypass cache → Fetch drafts from Craft
```

### Preview Flow

1. Editor clicks "Preview" in Craft
2. Craft opens iframe to `/api/preview?token=xxx&uri=about`
3. Next.js validates token, enables Draft Mode (sets cookie)
4. Redirects to `/about`
5. Page checks `draftMode()`, fetches with preview token
6. Editor sees unpublished content

---

## GraphQL Schema Security

| Schema      | Token    | Can Query              |
| ----------- | -------- | ---------------------- |
| **Public**  | None     | Published content only |
| **Private** | Required | Published + drafts     |

**Why public is okay:** The content is already visible on your website. No security benefit to hiding it behind a token. The token protects _unpublished_ content.

---

## Deployment and Cache Behavior

**Each deployment gets a fresh cache.** Old cached pages don't carry over.

### What about mixed versions?

Modern platforms (Vercel, Netlify) handle this:

- Deployments are immutable and atomic
- Traffic switches all at once (no mixing)
- Next.js detects JS mismatches and forces reload

You won't see a Frankenstein mix of old frontend and new frontend.

### Build-time vs On-demand Generation

| Approach                 | When Pages Build | Deploy Speed |
| ------------------------ | ---------------- | ------------ |
| `generateStaticParams()` | At build time    | Slower       |
| No pre-generation        | On first request | Fast         |

For small sites, pre-generation is fine. For large sites, on-demand makes sense.

---

## Environment Variables

| Variable              | Purpose                                 |
| --------------------- | --------------------------------------- |
| `CRAFT_GRAPHQL_URL`   | Craft's GraphQL endpoint                |
| `CRAFT_PREVIEW_TOKEN` | Token for draft/preview queries         |
| `REVALIDATION_SECRET` | Shared secret to validate webhook calls |

The revalidation secret prevents abuse — without it, anyone could POST to `/api/revalidate` and force cache invalidation.

---

## Quick Reference: The Content Loop

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CONTENT LOOP                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Author content in Craft                                            │
│         │                                                           │
│         ▼                                                           │
│  Preview (Draft Mode) ◄─── Editor reviews unpublished changes       │
│         │                                                           │
│         ▼                                                           │
│  Publish entry                                                      │
│         │                                                           │
│         ▼                                                           │
│  Webhook fires ──► /api/revalidate ──► Cache invalidated            │
│         │                                                           │
│         ▼                                                           │
│  Next visitor ──► Fresh page generated ──► Cached (ISR)             │
│         │                                                           │
│         ▼                                                           │
│  Subsequent visitors ──► Served from cache (fast!)                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
