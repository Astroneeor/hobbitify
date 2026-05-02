import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const AuthCard: React.FC<{ children: React.ReactNode; title: string; subtitle: string }> = ({
  children, title, subtitle,
}) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <nav className="chrome">
      <Link to="/" className="brand">
        <span className="brand-glyph" />
        hobbitify
      </Link>
    </nav>
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px 80px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="hud-tag" style={{ display: "inline-flex", marginBottom: 18 }}>
            <span className="dot" />
            auth
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: 400, color: "var(--ink)", lineHeight: 1.1, marginBottom: 10 }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.55 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const AlertBox: React.FC<{ type: "error" | "success"; children: React.ReactNode }> = ({ type, children }) => (
  <div style={{
    padding: "11px 14px",
    borderRadius: "var(--r-md)",
    background:  type === "error" ? "oklch(0.70 0.17 35 / 0.1)"  : "oklch(0.75 0.13 165 / 0.1)",
    border: `1px solid ${type === "error" ? "oklch(0.70 0.17 35 / 0.3)" : "oklch(0.75 0.13 165 / 0.3)"}`,
    color:  type === "error" ? "var(--bio-coral)" : "var(--bio-kelp)",
    fontSize: 13,
  }}>
    {children}
  </div>
);

const Login: React.FC = () => {
  const { session, loading, configured } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/getting-started";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <AuthCard title="Auth not configured" subtitle="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.">
        <div style={{ textAlign: "center" }}>
          <Link to="/" className="btn btn--ghost btn-sm">Back home</Link>
        </div>
      </AuthCard>
    );
  }

  if (!loading && session) return <Navigate to={from} replace />;

  const redirectTo = `${window.location.origin}/login`;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);
    if (!email.trim()) { setError("Enter your email address."); return; }
    setSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSubmitting(false);
    if (otpError) { setError(otpError.message); return; }
    setMessage("Check your inbox for the magic link.");
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null); setMessage(null); setSubmitting(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    setSubmitting(false);
    if (oauthError) setError(oauthError.message);
  };

  return (
    <AuthCard
      title="Sign in or sign up"
      subtitle="Use Google, GitHub, or email. Your library syncs once you're signed in."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => void handleOAuth("google")}
          disabled={submitting}
          className="btn"
          style={{ justifyContent: "center", width: "100%", padding: "12px 20px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => void handleOAuth("github")}
          disabled={submitting}
          className="btn btn--ghost"
          style={{ justifyContent: "center", width: "100%", padding: "12px 20px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          Continue with GitHub
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 20px" }}>
        <div style={{ flex: 1, height: 1, background: "var(--clay-edge-soft)" }} />
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: "1.5px", color: "var(--ink-dim)" }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "var(--clay-edge-soft)" }} />
      </div>

      <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label className="font-mono" htmlFor="email" style={{ display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 8 }}>
            Email address
          </label>
          <input
            id="email" type="email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="sub-input"
          />
        </div>

        {error   && <AlertBox type="error">{error}</AlertBox>}
        {message && <AlertBox type="success">{message}</AlertBox>}

        <button
          type="submit" disabled={submitting}
          className="btn btn--primary"
          style={{ width: "100%", justifyContent: "center", padding: "13px 20px" }}
        >
          {submitting ? "Sending…" : "Email me a magic link"}
        </button>

        <p style={{ textAlign: "center" }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: "var(--bio-cyan)", textDecoration: "none" }}>
            Forgot password?
          </Link>
        </p>
      </form>

      <p className="font-mono" style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: "var(--ink-dim)", letterSpacing: "0.5px" }}>
        Continuing means you accept auth cookies for your session.
      </p>
    </AuthCard>
  );
};

export default Login;
