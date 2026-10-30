import { z } from "zod";

export const chatMessageSchema = z.object({
  sessionKey: z.string().trim().min(8).max(64),
  lang: z.enum(["en", "es"]).default("en"),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().trim().min(1).max(4000),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
