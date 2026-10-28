import { corsHeaders, preflight } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return preflight(request) ?? new Response(null, { status: 204 });
}

export async function GET(request: Request) {
  const headers = { ...corsHeaders(request), "Content-Type": "application/json" };
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  return Response.json(
    {
      ok: true,
      service: "guru-platform",
      version: "0.1.0",
      db: dbConfigured ? "configured" : "missing_database_url",
    },
    { headers },
  );
}
