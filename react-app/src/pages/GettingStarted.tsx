import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogoutButton } from "../components/auth/LogoutButton";
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

const SUGGESTIONS = [
  "Learn to play guitar",
  "Master sourdough baking",
  "Get into rock climbing",
  "Start digital illustration",
];

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

  const handleVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileFailure = useCallback(() => setTurnstileToken(null), []);
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
    return () => { cancelled = true; };
  }, [session?.access_token]);

  const runGenerate = async (force: boolean) => {
    if (!session?.access_token) { setError("You need to be signed in."); return; }
    if (TURNSTILE_SITE_KEY && !turnstileToken) { setError("Please complete the verification challenge."); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await requestGenerate(session.access_token, inputValue, turnstileToken ?? "", force);

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
      setError(err instanceof Error ? err.message : "Failed to generate skill tree. Please try again.");
      turnstileResetRef.current?.();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validateInput(inputValue);
    if (!v.isValid) { setError(v.error || "Invalid input"); return; }
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

  const submitDisabled = loading || inputValue.trim() === "" || (TURNSTILE_SITE_KEY !== "" && !turnstileToken);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Chrome nav */}
      <nav className="chrome">
        <Link to="/" className="brand">
          <span className="brand-glyph" />
          hobbitify
        </Link>
        <div className="nav-actions">
          <Link to="/library" className="btn btn--ghost btn-sm">Library</Link>
          <Link to="/upload"  className="btn btn--ghost btn-sm">Upload JSON</Link>
          <LogoutButton className="btn btn--ghost btn-sm" />
        </div>
      </nav>

      <SimilarityDialog
        open={similarOpen}
        matches={similarMatches}
        onUseExisting={handleUseExisting}
        onGenerateNew={handleGenerateNewAnyway}
        onClose={() => setSimilarOpen(false)}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px 80px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Header */}
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span className="hud-tag">
                <span className="dot" />
                new scan
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 400, color: "var(--ink)", lineHeight: 1.1, marginBottom: 14 }}>
              What do you want to <span style={{ fontStyle: "italic", color: "var(--bio-cyan)" }}>learn?</span>
            </h1>
            <p style={{ fontSize: 15, color: "var(--ink-mute)", lineHeight: 1.55, maxWidth: 420, margin: "0 auto" }}>
              Describe any skill or hobby and we'll chart a navigable skill tree — one beacon at a time.
            </p>

            {quota && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <div className="hud-tag">
                  <span className="dot" style={{ background: "var(--bio-amber)", boxShadow: "0 0 8px var(--bio-amber)" }} />
                  {quota.generated_remaining} AI gens left
                </div>
                <div className="hud-tag">
                  <span className="dot" />
                  {quota.total_remaining} library slots
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div
              className="clay-card"
              style={{ borderRadius: "var(--r-xl)", overflow: "hidden", padding: "2px 2px 0", marginBottom: 16 }}
            >
              {/* Mock terminal header */}
              <div
                className="scan-panel-head"
                style={{ borderRadius: "calc(var(--r-xl) - 2px) calc(var(--r-xl) - 2px) 0 0", borderBottom: "1px solid var(--clay-edge-soft)" }}
              >
                <span>INPUT.GOAL</span>
                <div className="scan-panel-dots">
                  <span className="scan-dot scan-dot-live" />
                  <span className="scan-dot" />
                  <span className="scan-dot" />
                </div>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. I want to learn watercolor painting, starting from the basics..."
                rows={4}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--ink)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.6,
                  padding: "16px 18px",
                  resize: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 18px 14px",
                  borderTop: "1px solid var(--clay-edge-soft)",
                }}
              >
                <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px" }}>
                  {inputValue.length}/500
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px" }}>
                  3–500 chars
                </span>
              </div>
            </div>

            {TURNSTILE_SITE_KEY ? (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
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
              <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px", textAlign: "center", marginBottom: 16 }}>
                TURNSTILE DISABLED — set VITE_TURNSTILE_SITE_KEY for production
              </div>
            )}

            {error && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: "var(--r-md)",
                  background: "oklch(0.70 0.17 35 / 0.1)",
                  border: "1px solid oklch(0.70 0.17 35 / 0.3)",
                  color: "var(--bio-coral)",
                  fontSize: 13,
                  marginBottom: 16,
                  alignItems: "flex-start",
                }}
              >
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitDisabled}
              className="btn btn--primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15, borderRadius: "var(--r-lg)" }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Charting biome...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
                  </svg>
                  Generate skill tree
                </>
              )}
            </button>
          </form>

          {/* Suggestions */}
          <div style={{ marginTop: 28 }}>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 10, textAlign: "center" }}>
              Try one of these
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInputValue(s)}
                  className="btn btn--ghost btn-sm"
                  style={{ borderRadius: "var(--r-pill)", fontSize: 12 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GettingStarted;
