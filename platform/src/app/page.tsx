export default function Home() {
  return (
    <main style={{ fontFamily: "ui-monospace, monospace", padding: "2rem", maxWidth: 720 }}>
      <h1>GURU platform</h1>
      <p>API-only foundation for leads, chat history, and future dashboard.</p>
      <ul>
        <li>
          <code>GET /api/health</code> — service check
        </li>
        <li>
          <code>POST /api/leads</code> — create lead from the public terminal
        </li>
        <li>
          <code>POST /api/chat</code> — append message to session log
        </li>
        <li>
          <a href="/leads">/leads</a> — internal leads table (Bearer token)
        </li>
      </ul>
      <p style={{ marginTop: "1.5rem", opacity: 0.75 }}>
        Marketing site stays on GitHub Pages; deploy this app on Vercel with root directory{" "}
        <code>platform</code>.
      </p>
    </main>
  );
}
