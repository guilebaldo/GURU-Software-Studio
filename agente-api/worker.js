/**
 * Optional API for /agente — deploy on Cloudflare Workers.
 * Set OPENAI_API_KEY (OpenAI or OpenRouter) or enable Workers AI binding "AI".
 */

const SITE = "https://gurusoftware.studio";
const ALLOWED_ORIGINS = new Set([SITE, "http://127.0.0.1:8080", "http://localhost:8080"]);

let knowledgeCache = { at: 0, text: "" };

const PERSONA = {
  en: `You are Guilebaldo Ruiz Reyes, founder of GURU Software Studio — a software studio in Puebla, Mexico.
Speak in first person, concise and friendly, terminal-adjacent tone (no markdown tables).
Answer only from the knowledge base when possible. If unsure, suggest email hello@gurusoftware.studio or WhatsApp.
Never invent client names, prices, or projects not in the knowledge base.`,
  es: `Eres Guilebaldo Ruiz Reyes, fundador de GURU Software Studio — estudio de software en Puebla, México.
Habla en primera persona, claro y cercano, tono tipo terminal (sin tablas markdown).
Responde solo con la base de conocimiento cuando puedas. Si no sabes, sugiere hello@gurusoftware.studio o WhatsApp.
No inventes clientes, precios ni proyectos que no estén en la base.`,
};

async function loadKnowledge() {
  const now = Date.now();
  if (knowledgeCache.text && now - knowledgeCache.at < 3600_000) return knowledgeCache.text;
  const res = await fetch(`${SITE}/llms.txt`);
  if (!res.ok) throw new Error("knowledge");
  const text = await res.text();
  knowledgeCache = { at: now, text };
  return text;
}

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : SITE;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function runOpenAI(env, system, messages) {
  const base = env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error("openai");
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function runWorkersAI(env, system, messages) {
  const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [{ role: "system", content: system }, ...messages],
  });
  return (result.response || "").trim();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, origin);
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: "forbidden_origin" }, 403, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400, origin);
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lang = body.lang === "es" ? "es" : "en";
    const trimmed = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12);

    if (!trimmed.length) {
      return json({ error: "empty_messages" }, 400, origin);
    }

    let knowledge;
    try {
      knowledge = await loadKnowledge();
    } catch {
      return json({ error: "knowledge_unavailable" }, 503, origin);
    }

    const system = `${PERSONA[lang]}\n\n--- Knowledge base (llms.txt) ---\n${knowledge}`;

    try {
      let reply = "";
      if (env.OPENAI_API_KEY) {
        reply = await runOpenAI(env, system, trimmed);
      } else if (env.AI) {
        reply = await runWorkersAI(env, system, trimmed);
      } else {
        return json({ error: "not_configured" }, 503, origin);
      }
      return json({ reply }, 200, origin);
    } catch {
      return json({ error: "upstream_failed" }, 502, origin);
    }
  },
};
