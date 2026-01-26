# Learnings: Craft CMS Headless Setup

**Date:** 2026-01-25
**Context:** Configuring Craft CMS 5 for headless use with Next.js frontend

---

## GraphQL Type Naming (Craft 5)

Craft 5 simplifies GraphQL type names when a section has only one entry type:

| Scenario | Type Name |
|----------|-----------|
| Single entry type | `{sectionHandle}_Entry` |
| Multiple entry types | `{sectionHandle}_{entryTypeHandle}_Entry` |

**Example:** Homepage section with one entry type → `homepage_Entry` (not `homepage_homepage_Entry`)

Use `__typename` in queries to discover the actual type name:
```graphql
{
  entry(section: "homepage") {
    __typename
  }
}
```

---

## GraphQL Endpoint in Headless Mode

When `headlessMode(true)` is enabled in `config/general.php`:

- **Custom routes in `routes.php` are disabled**
- Must use built-in action URL: `/actions/graphql/api`
- Cannot use `/api` shortcut without disabling headless mode

**For Next.js integration:**
```
CRAFT_GRAPHQL_URL=https://cms.ddev.site/actions/graphql/api
```

---

## GraphiQL in CP Uses Admin Auth

The GraphiQL explorer at `/admin/graphiql` uses your admin session authentication, which **bypasses schema restrictions**.

**To properly test schema permissions**, use external requests:

```bash
# Public Schema (no token)
curl -s -X POST 'https://cms.ddev.site/actions/graphql/api' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ entries(section: \"pages\") { title } }"}'

# Private Schema (with token)
curl -s -X POST 'https://cms.ddev.site/actions/graphql/api' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -d '{"query":"{ entries(section: \"pages\", drafts: true) { title } }"}'
```

---

## Drafts vs Disabled Entries

These are **different concepts** in Craft:

| Concept | Description | GraphQL Parameter |
|---------|-------------|-------------------|
| **Enabled** | Published, live content | Default behavior |
| **Disabled** | Entry exists but hidden | `status: null` or `status: ["disabled"]` |
| **Draft** | Unpublished working copy | `drafts: true` |
| **Revision** | Historical snapshot | `revisions: true` |

To query drafts, use `drafts: true` — not status filters.

---

## Schema Permissions

- **Public Schema** is built-in and cannot be renamed
- **Tokens** are created separately and linked to schemas
- To allow draft queries, the schema must have "Query for element drafts" enabled
- If a schema doesn't have draft permission, the `drafts` argument is completely hidden (not just unauthorized)

---

## Site URL Configuration for Headless

In a headless setup, you need **two separate URLs** in your `.env`:

```bash
# Where Craft's Control Panel is accessed
CRAFT_BASE_CP_URL="https://cms.ddev.site"

# The site's base URL (used for entry URLs, preview targets)
PRIMARY_SITE_URL="http://localhost:3000"
```

| Variable | Purpose | Points To |
|----------|---------|-----------|
| `CRAFT_BASE_CP_URL` | Craft admin/CP access | Craft backend |
| `PRIMARY_SITE_URL` | Entry URLs (`{url}`), preview targets | Next.js frontend |

**Key insight:** Setting `PRIMARY_SITE_URL` to your frontend means `{url}` on entries automatically generates frontend URLs. This is the official Craft + Next.js starter pattern — preview targets can simply use `{url}` instead of complex alias syntax.
