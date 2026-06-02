"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard/writer";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      <div className="hero-glow" style={{ top: -300 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", animation: "slideUp 0.3s ease" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", textDecoration: "none", marginBottom: "2rem" }}>
          <div className="navbar-logo-icon">AT</div>
          <span className="navbar-logo-text">ALLTHINGS</span>
        </Link>

        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.375rem" }}>Welcome back</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Sign in to your ALLTHINGS account</p>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--color-danger)" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input id="password" type={showPass ? "text" : "password"} className="input" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" style={{ paddingRight: "2.75rem" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-subtle)", padding: 0, display: "flex" }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" id="login-submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem", width: "100%", padding: "0.75rem" }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="divider" style={{ margin: "1.5rem 0" }} />

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "var(--color-primary-light)", fontWeight: 600, textDecoration: "none" }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
