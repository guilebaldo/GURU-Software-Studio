# Platform roadmap (bases)

| Phase | What | Status |
|-------|------|--------|
| 0 | Public terminal on GitHub Pages | Live |
| 1 | Postgres + `POST /api/leads` (Vercel, `platform/`) | Live |
| 2 | Chat session + message log linked to leads | Live (`POST /api/chat`, terminal fire-and-forget) |
| 3 | Auth (Clerk) + `/app` dashboard | In progress (`/leads` token UI stub) |
| 4 | Stripe + invoicing (CFDI provider) | Planned |

**Dual deploy:** `gurusoftware.studio` → GitHub Pages (static). API → Vercel project rooted at `platform/`. Same repo, two targets.

**Ops:** https://guru-platform-seven.vercel.app/leads — paste `LEADS_READ_TOKEN` to review leads.

**AEO/SEO:** unchanged on static home; platform subdomain can stay `noindex` until there is a public product.
