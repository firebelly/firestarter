# GraphQL Client Patterns

**Date:** 2026-01-26
**Context:** Building `craftFetch` client for Craft CMS integration

---

## TypeScript Generics

Generics (`<T>`) are type placeholders filled in at call time:

```typescript
// Function signature
async function craftFetch<T>(query: string): Promise<T>;

// Call with specific type
const data = await craftFetch<EntryResponse<HomepageEntry>>(HOMEPAGE_QUERY);
// TypeScript now knows data.entry.heading exists
```

**Key point:** Generics are compile-time only. TypeScript trusts you about what the API returns — it doesn't validate at runtime.

---

## GraphQL Variables

Variables parameterize queries for reusability:

```graphql
# Hardcoded (bad - need separate query per page)
query {
  entry(uri: ["about"]) {
    title
  }
}

# Variables (good - one query, pass different values)
query PageByUri($uri: [String]) {
  entry(uri: $uri) {
    title
  }
}
```

Pass values separately when calling:

```typescript
craftFetch(PAGE_BY_URI_QUERY, { variables: { uri: ["about"] } });
```

---

## Promises & Async/Await

A Promise = "value that will exist later" (after API responds).

```typescript
// Returns Promise immediately (not data)
const promise = craftFetch(...);

// await pauses until Promise resolves
const data = await craftFetch(...);
```

While awaiting, the server handles other requests — nothing blocks.

---

## Next.js Fetch Extension

Next.js extends native `fetch` with caching options:

```typescript
fetch(url, {
  next: {
    revalidate: 86400, // ISR: cache 24 hours
    tags: ["homepage"], // For tag-based invalidation
  },
});
```

- `revalidate: 0` — no cache (preview mode)
- `revalidate: 86400` — cache 24 hours
- `revalidate: false` — cache forever

The `next` option is specific to `fetch` in Server Components.

---

## GraphQL Error Handling

GraphQL returns HTTP 200 even on errors — errors come in the response body:

```json
{
  "data": null,
  "errors": [{ "message": "Cannot query field 'headng'" }]
}
```

Always check `json.errors`, not HTTP status codes.

---

## HTTP Methods

- **GET** — retrieve data (params in URL)
- **POST** — send data in body

GraphQL uses POST even for "read" operations because queries go in the request body (URLs have length limits).

---

## GraphQL Inline Fragments

When a query could return different types, use fragments to specify type-specific fields:

```graphql
query Homepage {
  entry(section: "homepage") {
    title # common to all entries
    ... on homepage_Entry {
      # only for this type
      heading
      body
    }
  }
}
```

Craft 5 uses simplified type naming: `{section}_Entry` (not `{section}_{entryType}_Entry`).

---

## entry() vs entries()

- **`entry()`** — returns single entry or null
- **`entries()`** — returns array of entries

```graphql
# Single entry by URI
entry(section: "pages", uri: ["about"]) { title }

# All entries in section
entries(section: "pages") { title }
```

The `[String]` array type is for flexible matching, not multiple returns.

---

## Barrel Exports

An `index.ts` that re-exports from sibling files:

```typescript
// queries/index.ts
export { HOMEPAGE_QUERY } from "./homepage";
export { PAGE_BY_URI_QUERY } from "./pages";
```

Allows cleaner imports:

```typescript
import { HOMEPAGE_QUERY } from "@/lib/graphql/queries";
// instead of '@/lib/graphql/queries/homepage'
```

---

## TypeScript Interfaces

Interfaces define the shape of objects:

```typescript
interface BaseEntry {
  title: string;
  uri: string | null; // nullable — Craft fields can be empty
}

interface HomepageEntry extends BaseEntry {
  heading: string | null;
  body: string | null;
}
```

- **`extends`** — inherit fields from another interface (avoids repetition)
- **`string | null`** — union type, can be either. Forces you to handle null cases
- **Separate similar types** — `HomepageEntry` and `PageEntry` are identical now but represent different Craft sections. Keeps code readable and allows them to diverge later

---

## Quick Syntax Reference

```typescript
// Object shorthand: { query } === { query: query }
body: JSON.stringify({ query, variables });

// Nullish coalescing: use left if exists, else right
json.errors[0]?.message ?? "GraphQL Error";

// Ternary in object
next: preview ? { revalidate: 0 } : { revalidate };
```
