import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  lang: z.enum(["en", "es"]).default("en"),
  source: z.string().trim().max(64).default("terminal"),
  intent: z.string().trim().max(120).optional(),
  summary: z.string().trim().max(4000).optional(),
  sessionKey: z.string().trim().max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
