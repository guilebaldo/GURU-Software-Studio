# Guilebaldo agent terminal (`/agente`)

Experimental page — does not replace the main landing.

## Stack (v0.1)

| Layer | Choice | Why |
|--------|--------|-----|
| UI | Static HTML + `site.css` + `agente.css` + `agente.js` | Same hosting as the rest of gurusoftware.studio (GitHub Pages) |
| Knowledge | `/llms.txt` | Already maintained for humans and LLMs |
| Chat (now) | Local “guide” in the browser | Works with no API keys; contact via mailto + WhatsApp |
| Chat (next) | Cloudflare Worker in `agente-api/` | Hides keys, adds real model replies with RAG-lite via `llms.txt` |

## Enable real AI

1. Deploy `agente-api/` (Wrangler): set `OPENAI_API_KEY` secret, or enable Workers AI in `wrangler.toml`.
2. Point the page at your worker URL — on both `agente/index.html` and `es/agente/index.html`, set `data-api="https://your-worker.workers.dev"` on the `<body>` tag.

## URLs

- English: `/agente/`
- Spanish: `/es/agente/`

Pages use `noindex` until you are ready to promote them.
