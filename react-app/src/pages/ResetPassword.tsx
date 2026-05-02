import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function hashLooksLikeRecovery(): boolean {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return false;
  const params = new URLSearchParams(raw);
  return params.get("type") === "recovery";
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    if (hashLooksLikeRecovery()) setRecoveryReady(true);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [configured]);

  if (!configured) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <nav className="chrome"><Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link></nav>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "var(--ink)", marginBottom: 12 }}>Auth not configured</h1>
            <Link to="/login" className="btn btn--ghost btn-sm">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) { setError(updateError.message); return; }
    setMessage("Password updated. Redirecting…");
    window.setTimeout(() => navigate("/getting-started", { replace: true }), 800);
  };

  const navChrome = (
    <nav className="chrome">
      <Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link>
      <div className="nav-actions">
        <Link to="/login" className="btn btn--ghost btn-sm">Sign in</Link>
      </div>
    </nav>
  );

  if (!recoveryReady) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {navChrome}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px 80px" }}>
          <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
            <div className="hud-tag" style={{ display: "inline-flex", marginBottom: 18 }}>
              <span className="dot" style={{ animation: "glowPulse 2s ease-in-out infinite" }} />
              waiting for link
            </div>
            <h1 className="font-display" style={{ fontSize: "2rem", color: "var(--ink)", marginBottom: 12 }}>
              Waiting for reset link…
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.55, marginBottom: 24 }}>
              Open this page from the link in your email. If nothing happens, request a new link below.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/forgot-password" className="btn btn--primary btn-sm">Request new link</Link>
              <Link to="/login" className="btn btn--ghost btn-sm">← Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {navChrome}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px 80px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 className="font-display" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--ink)", marginBottom: 10 }}>
              Choose a new password
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-mute)" }}>Use at least 8 characters.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { id: "new-password",     label: "New password",     val: password, setter: setPassword },
              { id: "confirm-password", label: "Confirm password", val: confirm,  setter: setConfirm },
            ].map(({ id, label, val, setter }) => (
              <div key={id}>
                <label className="font-mono" htmlFor={id} style={{ display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 8 }}>
                  {label}
                </label>
                <input
                  id={id} type="password" autoComplete="new-password"
                  value={val} onChange={(e) => setter(e.target.value)}
                  className="sub-input"
                />
              </div>
            ))}

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
              {submitting ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
