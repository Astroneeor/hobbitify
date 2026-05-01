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

  const redirectTo = `${window.location.origin}/reset-password`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage(
      "If an account exists for that email, you’ll get a link to choose a new password.",
    );
  };

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
            <h1 className="text-3xl font-bold">Reset password</h1>
            <p className="text-text-secondary text-sm">
              We’ll email you a link to set a new password. Magic-link sign-in still works if you
              prefer not to use a password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="forgot-email"
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
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted">
            <Link to="/login" className="text-accent-light hover:text-accent-primary">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
