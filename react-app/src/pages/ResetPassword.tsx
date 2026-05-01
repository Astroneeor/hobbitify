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

    if (hashLooksLikeRecovery()) {
      setRecoveryReady(true);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryReady(true);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  if (!configured) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-2xl font-semibold">Auth not configured</h1>
          <Link to="/login" className="text-accent-light hover:text-accent-primary text-sm">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. Redirecting…");
    window.setTimeout(() => {
      navigate("/getting-started", { replace: true });
    }, 800);
  };

  if (!recoveryReady) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
        <nav className="border-b border-border-primary">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
              hobbitify
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold">Waiting for reset link…</h1>
            <p className="text-text-secondary text-sm">
              Open this page from the link in your email. If nothing happens, request a new link
              below.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-accent-light hover:text-accent-primary text-sm font-medium"
            >
              Request a new reset link
            </Link>
            <p>
              <Link to="/login" className="text-text-muted hover:text-text-secondary text-sm">
                ← Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
            hobbitify
          </Link>
          <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Choose a new password</h1>
            <p className="text-text-secondary text-sm">Use at least 8 characters.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-medium text-text-muted mb-1.5">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border-primary text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-medium text-text-muted mb-1.5">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border-primary text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm"
              />
            </div>

            {error && (
              <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {message && (
              <div className="text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:bg-bg-hover disabled:text-text-muted text-white font-semibold text-sm transition-colors"
            >
              {submitting ? "Saving…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
