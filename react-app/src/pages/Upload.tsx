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

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileFailure = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleReady = useCallback((h: { reset: () => void }) => {
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
    if (skills.length === 0) {
      throw new Error("Could not find a valid skills array in the JSON.");
    }
    return skillsUnknown;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!session?.access_token) {
      setError("You need to be signed in.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    setLoading(true);
    try {
      const skillsPayload = parseAndValidate();
      const token = turnstileToken ?? "";
      const result = await requestUpload(
        session.access_token,
        skillsPayload,
        token,
        title.trim() || undefined,
      );
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
      if (typeof reader.result === "string") {
        setRawJson(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const submitDisabled =
    loading ||
    rawJson.trim() === "" ||
    (TURNSTILE_SITE_KEY !== "" && !turnstileToken);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
            hobbitify
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/library"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Library
            </Link>
            <LogoutButton className="text-sm text-text-secondary hover:text-text-primary transition-colors" />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Upload a skill tree</h1>
        <p className="text-text-secondary text-sm mb-8">
          Paste raw Claude output (a JSON array) or a Hobbitify export file. This counts toward your 10-item library cap but not your 5 AI generations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My watercolor path"
              className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border-primary text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-text-muted">JSON</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-accent-light hover:text-accent-primary transition-colors"
              >
                Choose file
              </button>
            </div>
            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder='[{"Name": "...", "Description": "...", ...}]'
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border-primary text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none font-mono text-xs"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFile}
              className="hidden"
            />
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
            <p className="text-xs text-text-muted text-center">
              Turnstile disabled locally — set <code>VITE_TURNSTILE_SITE_KEY</code> for production.
            </p>
          )}

          {error && (
            <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitDisabled}
            className="w-full py-3 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:bg-bg-hover disabled:text-text-muted text-white font-semibold text-sm transition-colors"
          >
            {loading ? "Saving..." : "Save to library"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
