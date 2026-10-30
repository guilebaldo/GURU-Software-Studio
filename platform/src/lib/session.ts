import { eq } from "drizzle-orm";

import type { getDb } from "@/lib/db";
import { chatSessions } from "@/lib/schema";

type Db = ReturnType<typeof getDb>;

export async function upsertChatSession(
  db: Db,
  sessionKey: string,
  lang: string,
  userAgent: string | undefined,
  leadId?: string | null,
) {
  const [session] = await db
    .insert(chatSessions)
    .values({
      sessionKey,
      leadId: leadId ?? null,
      lang,
      userAgent,
    })
    .onConflictDoUpdate({
      target: chatSessions.sessionKey,
      set: {
        lastSeenAt: new Date(),
        lang,
        ...(leadId ? { leadId } : {}),
      },
    })
    .returning({ id: chatSessions.id });

  return session.id;
}

export async function findSessionId(db: Db, sessionKey: string) {
  const [row] = await db
    .select({ id: chatSessions.id })
    .from(chatSessions)
    .where(eq(chatSessions.sessionKey, sessionKey))
    .limit(1);
  return row?.id;
}
