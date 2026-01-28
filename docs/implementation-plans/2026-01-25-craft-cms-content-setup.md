# Implementation Plan: Craft CMS Content Setup

**Design Doc:** `docs/design-plans/2026-01-25-craft-nextjs-integration.md`
**Created:** 2026-01-25

---

## Summary

Configure Craft CMS with the foundational content structure needed for the Next.js integration: Homepage singleton, Pages structure section, required fields, GraphQL schemas, preview targets, and revalidation webhook.

This is **Plan 1 of 2** for the Craft + Next.js integration. All tasks are manual configuration in the Craft Control Panel. Plan 2 (Next.js code) depends on this plan being complete.

---

## Codebase Verification

_Confirm assumptions from design doc match actual codebase_

- [x] Craft CMS 5 installed in `/cms` directory - Verified: Yes
- [x] DDEV configured for local development - Verified: Yes
- [x] No existing content sections configured - Verified: Correct, fresh install

**Patterns to leverage:**

- Craft's Project Config (`config/project/`) will store all configuration as YAML, making it version-controllable
- Reference: Pixel & Tonic starter at `starter-next-main/backend/config/project/` for YAML structure examples

**Discrepancies found:**

- None. Fresh Craft install ready for configuration.

---

## Tasks

### Task 1: Create Content Fields

**Description:** Create the reusable fields that will be assigned to entry types. Start with fields so they're available when creating sections.

**Work in Craft CP:**

1. Navigate to **Settings → Fields**
2. Create field group "Page Content"
3. Create fields:

| Field Name | Handle    | Type       | Settings                                   |
| ---------- | --------- | ---------- | ------------------------------------------ |
| Heading    | `heading` | Plain Text | -                                          |
| Body       | `body`    | CKEditor   | Default config, allow headings/lists/links |

**Done when:**

- Fields appear in Settings → Fields
- Project Config files created at `cms/config/project/fields/`

**Commit:** "Add Heading and Body fields to Craft CMS"

---

### Task 2: Create Homepage Section

**Description:** Create the Homepage singleton section with its entry type and assign fields.

**Work in Craft CP:**

1. Navigate to **Settings → Sections**
2. Click **+ New Section**
3. Configure:
   - **Name:** Homepage
   - **Handle:** `homepage`
   - **Type:** Single
   - **URI:** `__home__` (Craft's reserved homepage URI)
   - **Template:** (leave blank — headless)

4. Click **Entry Types** tab, edit the auto-created entry type:
   - **Name:** Homepage
   - **Handle:** `homepage`
   - **Field Layout:** Add Heading and Body fields

5. Save the section

6. Navigate to **Entries → Homepage**
7. Add sample content:
   - **Title:** "Welcome to Firestarter"
   - **Heading:** "Build faster with Firestarter"
   - **Body:** A paragraph of placeholder text

**Done when:**

- Homepage entry exists with content
- GraphQL query returns data:
  ```graphql
  {
    entry(section: "homepage") {
      title
      ... on homepage_homepage_Entry {
        heading
        body
      }
    }
  }
  ```

**Commit:** "Add Homepage section to Craft CMS"

---

### Task 3: Create Pages Section

**Description:** Create the Pages structure section for hierarchical content pages.

**Work in Craft CP:**

1. Navigate to **Settings → Sections**
2. Click **+ New Section**
3. Configure:
   - **Name:** Pages
   - **Handle:** `pages`
   - **Type:** Structure
   - **Max Levels:** 2
   - **URI Format (top-level):** `{slug}`
   - **URI Format (nested):** `{parent.uri}/{slug}`
   - **Template:** (leave blank — headless)

4. Click **Entry Types** tab, edit the auto-created entry type:
   - **Name:** Page
   - **Handle:** `page`
   - **Field Layout:** Add Heading and Body fields

5. Save the section

6. Navigate to **Entries** and create sample pages:

| Title      | Slug         | Parent   | Heading               |
| ---------- | ------------ | -------- | --------------------- |
| About      | `about`      | —        | "About Us"            |
| Services   | `services`   | —        | "Our Services"        |
| Web Design | `web-design` | Services | "Web Design Services" |
| Contact    | `contact`    | —        | "Get in Touch"        |

**Done when:**

- Pages structure exists with 4 sample entries (1 nested)
- GraphQL query returns data:
  ```graphql
  {
    entry(section: "pages", uri: ["about"]) {
      title
      uri
      ... on page_page_Entry {
        heading
        body
      }
    }
  }
  ```
- Nested page query works:
  ```graphql
  {
    entry(section: "pages", uri: ["services/web-design"]) {
      title
      uri
    }
  }
  ```

**Commit:** "Add Pages structure section to Craft CMS"

---

### Task 4: Configure GraphQL Schemas

**Description:** Create public and private GraphQL schemas with appropriate permissions.

**Work in Craft CP:**

1. Navigate to **Settings → GraphQL**

2. **Create Public Schema:**
   - Click **+ New Schema**
   - **Name:** Public
   - **Scope:**
     - ✅ All entries (published only — this is default)
     - ❌ Drafts
     - ❌ Revisions
   - **Public:** ✅ Yes (no token required)
   - Save

3. **Create Private Schema:**
   - Click **+ New Schema**
   - **Name:** Private
   - **Scope:**
     - ✅ All entries
     - ✅ Drafts
     - ✅ Revisions
   - **Public:** ❌ No
   - Click **Generate Token** and copy the token
   - Save
   - Store token securely (will be used as `CRAFT_PREVIEW_TOKEN` in Next.js)

4. **Test in GraphiQL:**
   - Navigate to **GraphQL → Explore**
   - Test public schema (no auth): Query should return published entries
   - Test private schema (with token): Query should return drafts too

**Done when:**

- Public schema responds without authentication
- Private schema requires Bearer token
- Draft content only visible with private schema
- Token saved for Next.js configuration

**Commit:** "Configure Craft GraphQL public and private schemas"

---

### Task 5: Configure Preview Targets

**Description:** Set up preview targets so editors can preview content in the Next.js frontend.

**Reference:** Pixel & Tonic starter uses query parameter approach:

```
{url}?token={token}&x-craft-live-preview=true
```

**Work in Craft CP:**

1. Navigate to **Settings → Sections → Homepage**
2. Click **Preview Targets** tab
3. Add preview target:
   - **Label:** Web Preview
   - **URL Format:** `{alias('@frontendUrl')}?token={token}&x-craft-live-preview=true`

4. Navigate to **Settings → Sections → Pages**
5. Click **Preview Targets** tab
6. Add preview target:
   - **Label:** Web Preview
   - **URL Format:** `{alias('@frontendUrl')}/{uri}?token={token}&x-craft-live-preview=true`

7. **Configure the `@frontendUrl` alias:**
   - Edit `cms/config/general.php`
   - Add alias pointing to Next.js URL:
     ```php
     'aliases' => [
         '@frontendUrl' => getenv('FRONTEND_URL') ?: 'http://localhost:3000',
     ],
     ```
   - Add `FRONTEND_URL` to `cms/.env`:
     ```
     FRONTEND_URL="http://localhost:3000"
     ```

**Done when:**

- Clicking "Preview" on Homepage opens `http://localhost:3000?token=...&x-craft-live-preview=true`
- Clicking "Preview" on a Page opens `http://localhost:3000/about?token=...&x-craft-live-preview=true`

**Commit:** "Configure Craft preview targets for Next.js"

---

### Task 6: Configure Revalidation Webhook

**Description:** Set up a webhook that fires when entries are saved, triggering Next.js cache invalidation.

**Options:**

1. **Craft Webhooks Plugin** (recommended for simplicity)
2. **Custom Module** (more control, no plugin dependency)

**Work in Craft CP (using Webhooks plugin):**

1. Install the Webhooks plugin:

   ```bash
   cd cms && ddev composer require craftcms/webhooks && ddev craft plugin/install webhooks
   ```

2. Navigate to **Settings → Webhooks**
3. Click **+ New Webhook Group** → Name it "Cache Invalidation"
4. Click **+ New Webhook**
5. Configure:
   - **Name:** Revalidate Next.js
   - **Group:** Cache Invalidation
   - **Events:**
     - ✅ `elements.entry.afterSave`
   - **Request URL:** `{alias('@frontendUrl')}/api/revalidate`
   - **Method:** POST
   - **Headers:**
     ```
     Content-Type: application/json
     ```
   - **Payload (JSON):**
     ```json
     {
       "secret": "{{ getenv('REVALIDATION_SECRET') }}",
       "uri": "{{ entry.uri ?? '__home__' }}"
     }
     ```

6. **Add revalidation secret to environment:**
   - Generate a random string (e.g., `openssl rand -hex 32`)
   - Add to `cms/.env`:
     ```
     REVALIDATION_SECRET="your-random-secret-here"
     ```

**Done when:**

- Saving an entry in Craft triggers a POST request
- Request includes the entry's URI and secret
- (Full verification requires Next.js endpoint — tested in Plan 2)

**Commit:** "Configure Craft webhook for Next.js cache revalidation"

---

## Verification Checklist

After all tasks complete, verify in Craft's GraphiQL explorer:

- [ ] Homepage query returns title, heading, body

  ```graphql
  {
    entry(section: "homepage") {
      title
      ... on homepage_homepage_Entry {
        heading
        body
      }
    }
  }
  ```

- [ ] Pages query returns data for top-level page

  ```graphql
  {
    entry(section: "pages", uri: ["about"]) {
      title
      uri
      ... on page_page_Entry {
        heading
        body
      }
    }
  }
  ```

- [ ] Pages query returns data for nested page

  ```graphql
  {
    entry(section: "pages", uri: ["services/web-design"]) {
      title
      uri
    }
  }
  ```

- [ ] Public schema works without token
- [ ] Private schema requires token and returns drafts
- [ ] Preview targets are configured (URLs shown in section settings)
- [ ] Webhook plugin installed and configured

---

## Environment Variables Created

Add these to `cms/.env`:

```bash
# Frontend URL for preview targets and webhooks
FRONTEND_URL="http://localhost:3000"

# Shared secret for webhook validation
REVALIDATION_SECRET="your-random-secret-here"
```

Save the **Private GraphQL Token** — it will be used as `CRAFT_PREVIEW_TOKEN` in the Next.js `.env.local` file (Plan 2).

---

## Notes

- **Project Config:** All changes are stored in `cms/config/project/` as YAML files. These should be committed to version control so the configuration is reproducible.

- **CKEditor Config:** The default CKEditor configuration should be sufficient for Body fields. Custom configs can be added later if needed.

- **Webhook Debugging:** If webhooks aren't firing, check **Utilities → Webhooks** in Craft CP for logs.

- **GraphQL Endpoint:** By default, Craft's GraphQL endpoint is at `/api`. This is configured in `cms/config/routes.php` if it needs to change.

---

## Next Steps

After completing this plan:

1. Commit all Craft Project Config changes
2. Start a new Claude Code session
3. Run `/plan` with reference to this plan and the design doc
4. Create **Plan 2: Next.js Craft Integration**
