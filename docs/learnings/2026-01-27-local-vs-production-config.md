# Local vs Production Configuration

**Created:** 2026-01-27
**Source:** Build session debugging webhook and preview connectivity

Configuration differences between local development and production for Craft CMS + Next.js.

---

## Environment URLs

### Local Development

| Variable | Location | Value |
|----------|----------|-------|
| `PRIMARY_SITE_URL` | `cms/.env` | `http://localhost:3000` |
| `CRAFT_URL` | `site/.env.local` | `http://cms.ddev.site` |
| `REVALIDATION_URL` | `cms/.env` | `http://host.docker.internal:3000/api/revalidate` |

**Notes:**
- Use HTTP (not HTTPS) for local dev
- `host.docker.internal` allows DDEV (Docker) to reach Next.js on the host machine
- `localhost` from inside Docker refers to the container, not your Mac

### Production

| Variable | Location | Value |
|----------|----------|-------|
| `PRIMARY_SITE_URL` | `cms/.env` | `https://www.example.com` |
| `CRAFT_URL` | `site/.env.local` | `https://cms.example.com` |
| `REVALIDATION_URL` | `cms/.env` | `https://www.example.com/api/revalidate` |

**Notes:**
- Use HTTPS with valid certificates
- No Docker networking workarounds needed
- Both domains should have proper SSL

---

## Preview Mode Limitations (Local)

**The problem:** Craft's live preview loads the Next.js site in an iframe. Browsers block mixed content (HTTPS iframe loading HTTP content).

| Craft CP | Next.js | Preview Works? |
|----------|---------|----------------|
| `https://cms.ddev.site` | `http://localhost:3000` | ❌ Mixed content blocked |
| `https://cms.ddev.site` | `https://localhost:3000` | ✅ Works |

**The tradeoff:**

| Next.js Mode | Preview | Webhooks |
|--------------|---------|----------|
| HTTP (`next dev`) | ❌ Broken | ✅ Works |
| HTTPS (`next dev --experimental-https`) | ✅ Works | ❌ DDEV can't reach (self-signed cert) |

### Workaround for Local Dev

Switch between modes as needed:

```json
// package.json
"scripts": {
  "dev": "next dev",
  "dev:https": "next dev --experimental-https"
}
```

- **Testing webhooks/content updates:** `pnpm dev` (HTTP)
- **Testing preview mode:** `pnpm dev:https` (HTTPS)

When using HTTPS, also update `PRIMARY_SITE_URL` in `cms/.env`:
```bash
PRIMARY_SITE_URL=https://localhost:3000
```

### Production

In production, both preview and webhooks work because:
- Both Craft and Next.js use valid HTTPS certificates
- No mixed-content issues
- No self-signed certificate rejections

---

## GraphQL Endpoint

Craft in headless mode uses a different GraphQL endpoint:

| Mode | Endpoint |
|------|----------|
| Normal Craft | `/api` (custom route) |
| Headless Craft | `/actions/graphql/api` |

The `craftFetch` client uses:
```typescript
`${process.env.CRAFT_URL}/actions/graphql/api`
```

---

## Quick Reference

### Local Dev Checklist

- [ ] `cms/.env`: `PRIMARY_SITE_URL=http://localhost:3000`
- [ ] `cms/.env`: `REVALIDATION_URL=http://host.docker.internal:3000/api/revalidate`
- [ ] `cms/.env`: `REVALIDATION_SECRET=<your-secret>`
- [ ] `site/.env.local`: `CRAFT_URL=http://cms.ddev.site`
- [ ] `site/.env.local`: `REVALIDATION_SECRET=<same-secret>`
- [ ] Craft webhook URL field: `$REVALIDATION_URL`
- [ ] Next.js running: `pnpm dev` (HTTP)

### Testing Preview Locally

1. Stop Next.js
2. Change `cms/.env`: `PRIMARY_SITE_URL=https://localhost:3000`
3. Start Next.js with `pnpm dev:https`
4. Test preview in Craft CP
5. Revert when done (webhooks won't work in HTTPS mode)
