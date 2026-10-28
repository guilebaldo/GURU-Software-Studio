# Neon — GURU platform

| Field | Value |
|--------|--------|
| **Project name** | `guru-platform` |
| **Project ID** | `hidden-scene-02811516` |
| **Region** | `aws-us-east-1` |
| **Database** | `neondb` (default) |
| **Console** | https://console.neon.tech/app/projects/hidden-scene-02811516 |

Schema applied: `drizzle/0000_init.sql` (`leads`, `chat_sessions`, `chat_messages`).

## Connection string

Copy from Neon console → **Connect** (use the **pooled** URI for serverless/Vercel).

Set as `DATABASE_URL` in Vercel (platform project) and locally in `platform/.env.local` (gitignored).

Optional: `LEADS_READ_TOKEN` for `GET /api/leads` (Bearer token).
