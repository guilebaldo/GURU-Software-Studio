CREATE TYPE "lead_status" AS ENUM('new', 'contacted', 'qualified', 'won', 'lost');

CREATE TABLE "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "status" "lead_status" DEFAULT 'new' NOT NULL,
  "name" text,
  "email" text,
  "phone" text,
  "company" text,
  "lang" text DEFAULT 'en' NOT NULL,
  "source" text DEFAULT 'terminal' NOT NULL,
  "intent" text,
  "summary" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "leads_status_idx" ON "leads" ("status");
CREATE INDEX "leads_created_at_idx" ON "leads" ("created_at");
CREATE INDEX "leads_email_idx" ON "leads" ("email");

CREATE TABLE "chat_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_key" text NOT NULL UNIQUE,
  "lead_id" uuid REFERENCES "leads"("id") ON DELETE SET NULL,
  "lang" text DEFAULT 'en' NOT NULL,
  "user_agent" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "last_seen_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "chat_sessions_lead_id_idx" ON "chat_sessions" ("lead_id");

CREATE TABLE "chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "chat_sessions"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages" ("session_id");
