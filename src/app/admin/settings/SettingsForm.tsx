"use client";

import { useState } from "react";
import { Save, AlertCircle, CheckCircle } from "lucide-react";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [form, setForm] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess("Settings updated successfully!");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800, animation: "fadeIn 0.3s ease" }}>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--color-danger)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--color-success)", padding: "0.75rem 1rem", borderRadius: "var(--radius)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* General Settings */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>General Configuration</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="label">Platform Name</label>
            <input
              type="text"
              className="input"
              value={form.platformName || ""}
              onChange={(e) => setForm({ ...form, platformName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Platform Description (SEO default meta)</label>
            <textarea
              className="input"
              rows={2}
              value={form.platformDescription || ""}
              onChange={(e) => setForm({ ...form, platformDescription: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Adsterra Integration Settings */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>Adsterra Ad Code Placements</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-subtle)", marginBottom: "1.25rem" }}>
          Paste your Adsterra integration HTML script tags. These will load dynamically on the public reading views.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label">Popunder Script</label>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>Injected in page header</span>
            </div>
            <textarea
              className="input"
              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
              rows={4}
              placeholder="<!-- Adsterra Popunder Script -->"
              value={form.adsterra_popunder || ""}
              onChange={(e) => setForm({ ...form, adsterra_popunder: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label">Social Bar Script</label>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>Sticky push notifications ad</span>
            </div>
            <textarea
              className="input"
              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
              rows={4}
              placeholder="<!-- Adsterra Social Bar Script -->"
              value={form.adsterra_social_bar || ""}
              onChange={(e) => setForm({ ...form, adsterra_social_bar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label">Banner 728x90 Script</label>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>Top banner on reader layout</span>
            </div>
            <textarea
              className="input"
              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
              rows={4}
              placeholder="<!-- Adsterra 728x90 banner code -->"
              value={form.adsterra_banner_728x90 || ""}
              onChange={(e) => setForm({ ...form, adsterra_banner_728x90: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label">Banner 300x250 Script</label>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>Sidebar ad block</span>
            </div>
            <textarea
              className="input"
              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
              rows={4}
              placeholder="<!-- Adsterra 300x250 banner code -->"
              value={form.adsterra_banner_300x250 || ""}
              onChange={(e) => setForm({ ...form, adsterra_banner_300x250: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label className="label">Native Banners Script</label>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>Injected below the article body</span>
            </div>
            <textarea
              className="input"
              style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
              rows={4}
              placeholder="<!-- Adsterra Native Ads code -->"
              value={form.adsterra_native_ad || ""}
              onChange={(e) => setForm({ ...form, adsterra_native_ad: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "0.75rem 2.5rem" }}>
          {loading ? "Saving..." : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </form>
  );
}
