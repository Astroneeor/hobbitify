import React, { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogoutButton } from "../components/auth/LogoutButton";
import { Turnstile } from "../components/Turnstile";
import { requestUpload } from "../utils/apiUtils";
import { parseSkillTreeResponse } from "../utils/skillTreeUtils";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

const Upload: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const turnstileResetRef = useRef<(() => void) | null>(null);

  const [rawJson, setRawJson] = useState("");
  const [title, setTitle] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify          = useCallback((token: string) => setTurnstileToken(token), []);
  const handleTurnstileFailure = useCallback(() => setTurnstileToken(null), []);
  const handleReady           = useCallback((h: { reset: () => void }) => {
    turnstileResetRef.current = h.reset;
  }, []);

  const parseAndValidate = (): unknown => {
    const trimmed = rawJson.trim();
    if (!trimmed) throw new Error("Paste JSON or drop a file first.");
    const parsed = JSON.parse(trimmed) as unknown;
    let skillsUnknown: unknown = parsed;
    if (parsed && typeof parsed === "object" && "skills" in parsed) {
      skillsUnknown = (parsed as { skills: unknown }).skills;
    }
    const skills = parseSkillTreeResponse(skillsUnknown);
    if (skills.length === 0) throw new Error("Could not find a valid skills array in the JSON.");
    return skillsUnknown;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!session?.access_token) { setError("You need to be signed in."); return; }
    if (TURNSTILE_SITE_KEY && !turnstileToken) { setError("Please complete the verification challenge."); return; }

    setLoading(true);
    try {
      const skillsPayload = parseAndValidate();
      const result = await requestUpload(session.access_token, skillsPayload, turnstileToken ?? "", title.trim() || undefined);
      navigate(`/skill-tree?id=${encodeURIComponent(result.id)}`, {
        replace: true,
        state: { response: result.skills },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      turnstileResetRef.current?.();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setRawJson(reader.result);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const submitDisabled = loading || rawJson.trim() === "" || (TURNSTILE_SITE_KEY !== "" && !turnstileToken);

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
          <LogoutButton className="btn btn--ghost btn-sm" />
        </div>
      </nav>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "48px 24px 80px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span className="hud-tag">
                <span className="dot" style={{ background: "var(--bio-amber)", boxShadow: "0 0 8px var(--bio-amber)" }} />
                upload chart
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 400, color: "var(--ink)", lineHeight: 1.1, marginBottom: 10 }}>
              Import a skill tree
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.55 }}>
              Paste raw JSON (a skill array) or a Hobbitify export file. Uploads count toward your 10-item library but not your 5 AI generation cap.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Title */}
            <div>
              <label className="font-mono" style={{ display: "block", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 8 }}>
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My watercolor path"
                className="sub-input"
              />
            </div>

            {/* JSON area */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label className="font-mono" style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)" }}>
                  JSON payload
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn--ghost"
                  style={{ padding: "5px 12px", fontSize: 11, borderRadius: "var(--r-pill)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Choose file
                </button>
              </div>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder={'[{"Name": "...", "Description": "...", "Completion": "...", "Difficulty": 10, "Children": []}]'}
                rows={10}
                className="sub-input font-mono"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.6 }}
              />
              <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFile} className="hidden" />
            </div>

            {TURNSTILE_SITE_KEY ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Turnstile siteKey={TURNSTILE_SITE_KEY} onVerify={handleVerify} onExpire={handleTurnstileFailure} onError={handleTurnstileFailure} onReady={handleReady} theme="dark" />
              </div>
            ) : (
              <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px", textAlign: "center" }}>
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
              style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 14, borderRadius: "var(--r-lg)" }}
            >
              {loading ? "Saving to library..." : "Save to library"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
