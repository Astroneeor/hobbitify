import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SimilarityDialog } from "../components/SimilarityDialog";
import { Turnstile } from "../components/Turnstile";
import {
  fetchMe,
  requestGenerate,
  validateInput,
  type MeResponse,
  type SimilarMatch,
} from "../utils/apiUtils";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

const GettingStarted: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const turnstileResetRef = useRef<(() => void) | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [quota, setQuota] = useState<MeResponse | null>(null);
  const [similarOpen, setSimilarOpen] = useState(false);
  const [similarMatches, setSimilarMatches] = useState<SimilarMatch[]>([]);

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileFailure = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleReady = useCallback((h: { reset: () => void }) => {
    turnstileResetRef.current = h.reset;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!session?.access_token) return;
      try {
        const me = await fetchMe(session.access_token);
        if (!cancelled) setQuota(me);
      } catch {
        if (!cancelled) setQuota(null);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const runGenerate = async (force: boolean) => {
    if (!session?.access_token) {
      setError("You need to be signed in.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = turnstileToken ?? "";
      const result = await requestGenerate(
        session.access_token,
        inputValue,
        token,
        force,
      );

      if ("similar" in result && result.similar.length > 0) {
        setSimilarMatches(result.similar);
        setSimilarOpen(true);
        setLoading(false);
        return;
      }

      if ("tree" in result) {
        navigate(`/skill-tree?id=${encodeURIComponent(result.tree.id)}`, {
          state: { response: result.tree.skills },
        });
        return;
      }

      throw new Error("Unexpected server response");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate skill tree. Please try again.",
      );
      turnstileResetRef.current?.();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateInput(inputValue);
    if (!validation.isValid) {
      setError(validation.error || "Invalid input");
      return;
    }

    await runGenerate(false);
  };

  const handleUseExisting = (id: string) => {
    setSimilarOpen(false);
    navigate(`/skill-tree?id=${encodeURIComponent(id)}`);
  };

  const handleGenerateNewAnyway = async () => {
    setSimilarOpen(false);
    await runGenerate(true);
  };

  const submitDisabled =
    loading ||
    inputValue.trim() === "" ||
    (TURNSTILE_SITE_KEY !== "" && !turnstileToken);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-3">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
            hobbitify
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/library"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Library
            </Link>
            <Link
              to="/upload"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Upload
            </Link>
          </div>
        </div>
      </nav>

      <SimilarityDialog
        open={similarOpen}
        matches={similarMatches}
        onUseExisting={handleUseExisting}
        onGenerateNew={handleGenerateNewAnyway}
        onClose={() => setSimilarOpen(false)}
      />

      <div className="flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="max-w-xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              What do you want to learn?
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Describe any skill or hobby, and we'll generate a personalized learning path with clear milestones.
            </p>
            {quota && (
              <p className="text-xs text-text-muted mt-4">
                Free tier:{" "}
                <span className="text-text-primary font-medium">
                  {quota.generated_remaining}
                </span>{" "}
                AI generations left ({quota.generated_count}/{quota.limits.generated} used) ·{" "}
                <span className="text-text-primary font-medium">
                  {quota.total_remaining}
                </span>{" "}
                library slots left ({quota.total_count}/{quota.limits.total} used)
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. I want to learn watercolor painting, starting from the basics..."
                className="w-full h-32 px-5 py-4 rounded-xl bg-bg-tertiary border-2 border-border-primary text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all duration-200 resize-none text-base"
              />
              <div className="flex justify-between mt-2 text-xs text-text-muted">
                <span>{inputValue.length}/500 characters</span>
                <span>Be as specific as you like</span>
              </div>
            </div>

            {TURNSTILE_SITE_KEY ? (
              <div className="flex justify-center">
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={handleVerify}
                  onExpire={handleTurnstileFailure}
                  onError={handleTurnstileFailure}
                  onReady={handleReady}
                  theme="dark"
                />
              </div>
            ) : (
              <div className="text-xs text-text-muted text-center">
                Turnstile is disabled (no <code>VITE_TURNSTILE_SITE_KEY</code> set).
                Set it for production deploys.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitDisabled}
              className="w-full px-6 py-4 bg-accent-primary hover:bg-accent-hover disabled:bg-bg-hover disabled:text-text-muted text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating your skill tree...
                </span>
              ) : (
                "Generate Skill Tree"
              )}
            </button>
          </form>

          <div className="mt-10">
            <p className="text-text-muted text-sm mb-3 text-center">Try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Learn to play guitar", "Master sourdough baking", "Get into rock climbing", "Start digital illustration"].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-bg-tertiary border border-border-primary text-text-secondary text-sm hover:border-accent-primary/50 hover:text-text-primary transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
