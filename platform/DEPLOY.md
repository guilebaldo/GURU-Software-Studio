# Vercel — guru-platform

| Field | Value |
|--------|--------|
| **Project** | [guru-platform](https://vercel.com/guilebaldos-projects-894e1304/guru-platform) |
| **Production URL** | https://guru-platform-seven.vercel.app |
| **Git** | `guilebaldo/GURU-Software-Studio` · root `platform/` · branch `main` |
| **Health** | https://guru-platform-seven.vercel.app/api/health |
| **Leads API** | `POST https://guru-platform-seven.vercel.app/api/leads` |

## Environment (Vercel dashboard)

- `DATABASE_URL` — Neon pooled URI (see `NEON.md`)
- `LEADS_READ_TOKEN` — optional Bearer for `GET /api/leads`

## Static site wiring

Home pages set `data-leads-api` to the leads URL above so `lead email@…` persists to Neon.

Marketing site remains on **GitHub Pages** (`gurusoftware.studio`); this app is API-only for now.
