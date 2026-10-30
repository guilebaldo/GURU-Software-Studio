import { corsHeaders, preflight } from "@/lib/cors";
import { chatMessageSchema } from "@/lib/chat";
import { getDb } from "@/lib/db";
import { findSessionId, upsertChatSession } from "@/lib/session";
import { chatMessages } from "@/lib/schema";

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

  const parsed = chatMessageSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "validation", details: parsed.error.flatten() }, { status: 400, headers });
  }

  const data = parsed.data;
  const ua = request.headers.get("User-Agent") ?? undefined;

  try {
    const db = getDb();
    let sessionId = await findSessionId(db, data.sessionKey);
    if (!sessionId) {
      sessionId = await upsertChatSession(db, data.sessionKey, data.lang, ua);
    } else {
      await upsertChatSession(db, data.sessionKey, data.lang, ua);
    }

    await db.insert(chatMessages).values({
      sessionId,
      role: data.role,
      content: data.content,
    });

    return Response.json({ ok: true }, { status: 201, headers });
  } catch (error) {
    console.error("chat log failed", error);
    const message = error instanceof Error ? error.message : "unknown";
    const status = message.includes("DATABASE_URL") ? 503 : 500;
    return Response.json(
      { error: "server_error", message: status === 503 ? "database_not_configured" : "log_failed" },
      { status, headers },
    );
  }
}
