import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const { session, loading, configured } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/getting-started";

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-2xl font-semibold">Auth not configured</h1>
          <p className="text-text-secondary text-sm">
            Set <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.
          </p>
          <Link to="/" className="text-accent-light hover:text-accent-primary text-sm">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/login`;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSubmitting(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setMessage("Check your inbox for the magic link.");
  };

  const handleGoogle = async () => {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    setSubmitting(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
            hobbitify
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Sign in</h1>
            <p className="text-text-secondary text-sm">
              Save skill trees to your library and sync across devices.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-primary bg-bg-tertiary hover:bg-bg-hover text-text-primary text-sm font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-bg-primary text-text-muted">or</span>
            </div>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-muted mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border-primary text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm"
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
              {submitting ? "Sending..." : "Email me a magic link"}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted">
            By continuing you agree to our use of authentication cookies for your session.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
