# GURU platform (API foundation)

Next.js app for **leads**, future **auth**, **billing**, and **dashboard**. The public terminal on GitHub Pages stays as-is; point it at this API when deployed.

## Setup

1. Create a Neon (or Postgres) database and run `drizzle/0000_init.sql`.
2. Copy `.env.example` → `.env.local` and set `DATABASE_URL`.
3. `npm install && npm run dev` → http://localhost:3000

## Deploy (Vercel)

- **Root directory:** `platform`
- **Env:** `DATABASE_URL`, optional `CORS_ORIGINS`, `LEADS_READ_TOKEN`

## API

### `GET /api/health`

Service + DB config probe (CORS enabled for studio origins).

### `POST /api/leads`

Body (JSON):

```json
{
  "email": "ops@company.com",
  "name": "Alex",
  "phone": "+52...",
  "lang": "es",
  "source": "terminal",
  "intent": "contact",
  "summary": "Wants inventory + WhatsApp alerts",
  "sessionKey": "abc-123"
}
```

At least one of `email`, `phone`, or `summary` is required.

### `GET /api/leads`

Requires `LEADS_READ_TOKEN` and header `Authorization: Bearer <token>`. Returns last 50 leads (temporary until Clerk dashboard exists).

## Wire the terminal

On `index.html` / `es/index.html`, set:

```html
data-leads-api="https://YOUR-PLATFORM.vercel.app/api/leads"
```

Users can run **`lead tu@email.com`** or **`lead`** + follow-up in chat (see `agente.js`).
