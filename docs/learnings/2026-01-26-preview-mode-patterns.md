# Preview Mode Patterns

**Created:** 2026-01-26
**Source:** Build session debugging Craft live preview

Learnings from implementing and then rethinking the preview approach for Craft CMS + Next.js.

---

## Two Types of Craft Tokens

| Token Type        | What It Is                              | Where It Lives                | What It Authorizes                         |
| ----------------- | --------------------------------------- | ----------------------------- | ------------------------------------------ |
| **Schema Token**  | Static token for Private GraphQL Schema | `CRAFT_PREVIEW_TOKEN` env var | Access to _all_ drafts via Private Schema  |
| **Preview Token** | Dynamic per-session token               | URL param `?token=xxx`        | Access to _specific_ draft being previewed |

**Key insight:** These are different things. The schema token goes in an `Authorization` header. The preview token goes as a query param to the GraphQL endpoint.

---

## Preview Token Flow (Query Param Approach)

When using the dynamic preview token from Craft's live preview:

```
Craft CP → iframe loads → /?token=xxx&x-craft-live-preview=yyy
                                │
                                ▼
                    Page extracts token from URL
                                │
                                ▼
                    GraphQL request to: /actions/graphql/api?token=xxx
                                │
                                ▼
                    Craft validates token, returns draft content
```

**The gotcha:** The token must be passed as a **query parameter** to the GraphQL endpoint, NOT as an Authorization header. Craft uses this token to identify and authorize access to the specific draft.

---

## Why searchParams Breaks Static Rendering

Using `searchParams` in a Next.js page opts into **dynamic rendering**:

```tsx
// This makes the entire page dynamic
export default async function Page({ searchParams }: Props) {
  const params = await searchParams; // ← Dynamic API
  // ...
}
```

**What "dynamic" means:**

- Page won't be pre-built at build time
- Page component runs on every request
- Full Route Cache is disabled

**What's still cached:**

- Individual `fetch()` calls with `revalidate` are cached in the Data Cache
- So data fetching is fast, but page rendering happens per-request

**The tradeoff:** For most content sites, this is fine (<50ms renders). But if you want true static HTML at the edge (~5ms), you need a different approach.

---

## Draft Mode: The Better Pattern

Draft Mode uses a **cookie** instead of query params, allowing the page to stay static for normal visitors.

### Flow

```
1. Craft preview target: /api/preview?uri={uri}
2. API route validates, enables draft mode (sets cookie), redirects to page
3. Page checks draftMode() — if enabled, fetch drafts
4. Normal visitors: no cookie → static page from cache
5. Editors: cookie present → dynamic fetch of drafts
```

### Why It's Better

| Approach     | Normal Visitors              | Editors |
| ------------ | ---------------------------- | ------- |
| searchParams | Dynamic (per-request render) | Dynamic |
| Draft Mode   | Static (cached HTML)         | Dynamic |

**The page component doesn't need `searchParams`** — it only checks `draftMode()`, which returns quickly for normal visitors.

---

## Craft Preview Target Configuration

### For Query Param Approach (dynamic)

```
{url}
→ https://localhost:3000/about?token=xxx&x-craft-live-preview=yyy
```

### For Draft Mode Approach (static)

```
{alias('@web')}/api/preview?uri={uri ?? '__home__'}
→ https://localhost:3000/api/preview?uri=about&token=xxx&x-craft-live-preview=yyy
```

The key difference: Draft Mode routes through an API endpoint first, which sets the cookie before redirecting to the actual page.

---

## Summary: When to Use What

| Scenario                                 | Approach                     |
| ---------------------------------------- | ---------------------------- |
| Quick prototype, don't care about static | Query param (`searchParams`) |
| Production site, want static + preview   | Draft Mode with API routes   |
| Need edge flexibility, complex routing   | Middleware + Draft Mode      |

**Firestarter uses query params** — simpler, works in all environments.

---

## Future Consideration: Draft Mode in Production

The cookie blocking we encountered is specific to **local development** with mismatched domains (`cms.ddev.site` → `localhost:3000`).

In production with subdomains of the same root domain, Draft Mode would work:

| Setup                                     | Cookie context | Draft Mode works? |
| ----------------------------------------- | -------------- | ----------------- |
| `cms.ddev.site` → `localhost:3000`        | Cross-site     | ❌ No             |
| `cms.firestarter.com` → `firestarter.com` | Same-site      | ✅ Yes            |

Browsers treat subdomains of the same root domain as "same-site" for cookie purposes. You could set the cookie domain to `.firestarter.com` to share across all subdomains.

**If static rendering becomes important:** Consider a hybrid approach — Draft Mode for production (static pages), query params as fallback for local dev. But this adds complexity and is only worth it if performance becomes a real issue.
