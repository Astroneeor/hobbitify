import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const ForgotPassword: React.FC = () => {
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <nav className="chrome">
          <Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link>
        </nav>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "var(--ink)", marginBottom: 12 }}>Auth not configured</h1>
            <Link to="/login" className="btn btn--ghost btn-sm">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const redirectTo = `${window.location.origin}/reset-password`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);
    if (!email.trim()) { setError("Enter your email address."); return; }
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setSubmitting(false);
    if (resetError) { setError(resetError.message); return; }
    setMessage("If an account exists for that email, you'll get a link to choose a new password.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <nav className="chrome">
        <Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link>
        <div className="nav-actions">
          <Link to="/login" className="btn btn--ghost btn-sm">Sign in</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px 80px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--ink)", marginBottom: 10 }}>
              Reset password
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.55 }}>
              We'll email you a link to set a new password. Magic-link sign-in still works if you prefer not to use a password.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="font-mono" htmlFor="forgot-email" style={{ display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 8 }}>
                Email
              </label>
              <input
                id="forgot-email" type="email" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="sub-input"
              />
            </div>

            {error && (
              <div style={{ padding: "11px 14px", borderRadius: "var(--r-md)", background: "oklch(0.70 0.17 35 / 0.1)", border: "1px solid oklch(0.70 0.17 35 / 0.3)", color: "var(--bio-coral)", fontSize: 13 }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ padding: "11px 14px", borderRadius: "var(--r-md)", background: "oklch(0.75 0.13 165 / 0.1)", border: "1px solid oklch(0.75 0.13 165 / 0.3)", color: "var(--bio-kelp)", fontSize: 13 }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn--primary" style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}>
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20 }}>
            <Link to="/login" style={{ fontSize: 13, color: "var(--bio-cyan)", textDecoration: "none" }}>
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
