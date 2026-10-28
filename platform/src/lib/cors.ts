const DEFAULT_ORIGINS = [
  "https://gurusoftware.studio",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];

export function allowedOrigins(): string[] {
  const extra = process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];
  return [...DEFAULT_ORIGINS, ...extra];
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const allow = origin && allowedOrigins().includes(origin) ? origin : DEFAULT_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Guru-Session",
    "Access-Control-Max-Age": "86400",
  };
}

export function preflight(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  return null;
}
