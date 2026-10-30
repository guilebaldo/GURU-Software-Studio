"use client";

import { useCallback, useEffect, useState } from "react";

type LeadRow = {
  id: string;
  status: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  lang: string;
  source: string;
  intent: string | null;
  summary: string | null;
  createdAt: string;
};

const TOKEN_KEY = "guru-leads-read-token";

export default function LeadsPage() {
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored) setToken(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "failed");
        setLeads([]);
        return;
      }
      setLeads(data.leads || []);
    } catch {
      setError("network");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <main style={{ fontFamily: "ui-monospace, monospace", padding: "1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>GURU leads</h1>
      <p style={{ opacity: 0.75, maxWidth: 560 }}>
        Internal view. Paste your <code>LEADS_READ_TOKEN</code> from Vercel (stored in this browser only).
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Bearer token"
          style={{ flex: 1, minWidth: 220, padding: 8, font: "inherit" }}
        />
        <button type="button" onClick={load} disabled={loading || !token} style={{ padding: "8px 14px", font: "inherit" }}>
          {loading ? "Loading…" : "Load leads"}
        </button>
      </div>
      {error ? <p style={{ color: "#c0392b" }}>{error}</p> : null}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th align="left">When</th>
            <th align="left">Status</th>
            <th align="left">Contact</th>
            <th align="left">Summary</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} style={{ borderTop: "1px solid #ccc" }}>
              <td style={{ padding: "8px 4px", verticalAlign: "top" }}>
                {new Date(lead.createdAt).toLocaleString()}
              </td>
              <td style={{ padding: "8px 4px" }}>{lead.status}</td>
              <td style={{ padding: "8px 4px", verticalAlign: "top" }}>
                {[lead.name, lead.email, lead.phone].filter(Boolean).join(" · ") || "—"}
              </td>
              <td style={{ padding: "8px 4px", verticalAlign: "top" }}>{lead.summary || lead.intent || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && !error && leads.length === 0 ? <p style={{ opacity: 0.6 }}>No leads loaded yet.</p> : null}
    </main>
  );
}
