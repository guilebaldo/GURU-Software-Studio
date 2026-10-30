import { desc } from "drizzle-orm";

import { corsHeaders, preflight } from "@/lib/cors";
import { getDb } from "@/lib/db";
import { createLeadSchema } from "@/lib/leads";
import { upsertChatSession } from "@/lib/session";
import { leads } from "@/lib/schema";

export async function OPTIONS(request: Request) {
  return preflight(request) ?? new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const headers = { ...corsHeaders(request), "Content-Type": "application/json" };

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400, headers });
  }

  const parsed = createLeadSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "validation", details: parsed.error.flatten() }, { status: 400, headers });
  }

  const data = parsed.data;
  if (!data.email && !data.phone && !data.summary) {
    return Response.json(
      { error: "validation", message: "Provide email, phone, or summary" },
      { status: 400, headers },
    );
  }

  try {
    const db = getDb();
    const [lead] = await db
      .insert(leads)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        lang: data.lang,
        source: data.source,
        intent: data.intent,
        summary: data.summary,
        metadata: data.metadata ?? {},
      })
      .returning({ id: leads.id, status: leads.status, createdAt: leads.createdAt });

    if (data.sessionKey) {
      const ua = request.headers.get("User-Agent") ?? undefined;
      await upsertChatSession(db, data.sessionKey, data.lang, ua, lead.id);
    }

    return Response.json({ ok: true, lead }, { status: 201, headers });
  } catch (error) {
    console.error("create lead failed", error);
    const message = error instanceof Error ? error.message : "unknown";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return Response.json({ error: "server_error", message: status === 503 ? "database_not_configured" : "create_failed" }, { status, headers });
  }
}

export async function GET(request: Request) {
  const headers = { ...corsHeaders(request), "Content-Type": "application/json" };
  const token = process.env.LEADS_READ_TOKEN;
  if (!token) {
    return Response.json({ error: "not_enabled" }, { status: 501, headers });
  }
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${token}`) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers });
  }

  try {
    const db = getDb();
    const rows = await db
      .select({
        id: leads.id,
        status: leads.status,
        name: leads.name,
        email: leads.email,
        phone: leads.phone,
        lang: leads.lang,
        source: leads.source,
        intent: leads.intent,
        summary: leads.summary,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(50);

    return Response.json({ ok: true, leads: rows }, { headers });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500, headers });
  }
}
