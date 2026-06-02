"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", animation: "slideUp 0.3s ease" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <CheckCircle2 size={36} color="var(--color-success)" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Account Created!
          </h2>
          <p style={{ color: "var(--color-text-muted)" }}>
            Welcome to ALLTHINGS. Redirecting to login...
          </p>
        </div>
      </div>
    );
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
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 460, position: "relative", animation: "slideUp 0.3s ease" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.625rem",
            textDecoration: "none",
            marginBottom: "2rem",
          }}
        >
          <div className="navbar-logo-icon">AT</div>
          <span className="navbar-logo-text">ALLTHINGS</span>
        </Link>

        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.375rem" }}>
              Join as a Writer
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Publish your stories and reach a global audience
            </p>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: "var(--color-danger)",
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="input"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="reg-password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  className="input"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-subtle)",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "0.5rem", width: "100%", padding: "0.75rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", textAlign: "center" }}>
              By registering you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>
                Privacy Policy
              </Link>
            </p>
          </form>

          <div className="divider" style={{ margin: "1.5rem 0" }} />

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "var(--color-primary-light)", fontWeight: 600, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
