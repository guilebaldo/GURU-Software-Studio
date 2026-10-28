# Platform roadmap (bases)

| Phase | What | Status |
|-------|------|--------|
| 0 | Public terminal on GitHub Pages | Live |
| 1 | Postgres + `POST /api/leads` (Vercel, `platform/`) | In progress |
| 2 | Chat session + message log linked to leads | Schema ready |
| 3 | Auth (Clerk) + `/app` dashboard | Planned |
| 4 | Stripe + invoicing (CFDI provider) | Planned |

**Dual deploy:** `gurusoftware.studio` → GitHub Pages (static). API → Vercel project rooted at `platform/`. Same repo, two targets.

**AEO/SEO:** unchanged on static home; platform subdomain can stay `noindex` until there is a public product.
