# On-Demand Revalidation

**Created:** 2026-01-27
**Source:** Build session implementing cache invalidation webhook

Learnings from implementing on-demand cache revalidation for Craft CMS + Next.js.

---

## Why On-Demand Revalidation?

Even with dynamic page rendering (via `searchParams`), Next.js still caches at the **fetch level**:

```typescript
// In craftFetch()
next: preview ? { revalidate: 0 } : { revalidate: 86400 }
```

| Cache Layer | What's Cached | Affected by searchParams? |
|-------------|---------------|---------------------------|
| Full Route Cache | Rendered HTML | Yes — disabled when using searchParams |
| Data Cache | fetch() responses | No — still caches for `revalidate` duration |

**Without on-demand revalidation:** Content changes take up to 24 hours to appear (the `revalidate` window).

**With on-demand revalidation:** Content changes appear in seconds.

---

## The Webhook Flow

```
1. Editor saves entry in Craft CMS
            │
            ▼
2. Craft webhook POSTs to /api/revalidate
   Body: { secret: "xxx", uri: "about" }
            │
            ▼
3. Next.js route handler validates secret
            │
            ▼
4. revalidatePath('/about') purges cache
            │
            ▼
5. Next visitor request → fresh fetch from Craft → new cache
```

---

## Key Concepts

### Function Name = HTTP Method

In Next.js route handlers, the exported function name determines which HTTP method it handles:

```typescript
export function GET() { }   // Handles GET requests
export function POST() { }  // Handles POST requests
export function PUT() { }   // Handles PUT requests
```

You can export multiple methods from one `route.ts`.

### revalidatePath is Lazy

`revalidatePath()` doesn't immediately rebuild the page. It marks the cache as stale:

| Step | What Happens |
|------|--------------|
| `revalidatePath('/about')` called | Cache marked stale |
| Next request to `/about` | Next.js sees stale, fetches fresh data |
| Response returned | Fresh data cached |

This avoids unnecessary work for pages that aren't visited often.

### URI Conversion

Craft and Next.js have different homepage conventions:

| Craft URI | Next.js Path |
|-----------|--------------|
| `__home__` | `/` |
| `about` | `/about` |
| `services/web-design` | `/services/web-design` |

---

## Security: The Shared Secret

The `REVALIDATION_SECRET` prevents unauthorized cache purging:

```
site/.env.local:  REVALIDATION_SECRET="your-random-string"
cms/.env:         REVALIDATION_SECRET="your-random-string"  (same value)
```

Without this, anyone could POST to `/api/revalidate` and purge your cache.

### Response Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success — cache purged |
| 400 | Bad Request — missing URI |
| 401 | Unauthorized — invalid secret |

---

## Craft Webhook Configuration

In Craft CP → Settings → Webhooks:

| Field | Value |
|-------|-------|
| Name | Revalidate Next.js |
| Event | `elements.entry.afterSave` |
| URL | `http://localhost:3000/api/revalidate` |
| Method | POST |
| Headers | `Content-Type: application/json` |

**Payload:**
```json
{
  "secret": "{{ getenv('REVALIDATION_SECRET') }}",
  "uri": "{{ entry.uri ?? '__home__' }}"
}
```

---

## Debugging Tips

1. **Check Craft webhook logs:** CP → Utilities → Webhooks shows request/response history

2. **Test manually with curl:**
   ```bash
   curl -X POST http://localhost:3000/api/revalidate \
     -H "Content-Type: application/json" \
     -d '{"secret": "your-secret", "uri": "about"}'
   ```

3. **If content isn't updating:**
   - Is the webhook firing? (Check Craft logs)
   - Is the secret correct? (401 = bad secret)
   - Is the URI format correct? (400 = missing URI)
   - Is the Next.js server running?
