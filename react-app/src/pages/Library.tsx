import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../components/auth/LogoutButton";
import { useAuth } from "../contexts/AuthContext";
import type { ProfileRow, SkillTreeRow } from "../lib/supabase";
import { supabase } from "../lib/supabase";

const BANNER_CLASSES = [
  "biome-banner--cyan",
  "biome-banner--kelp",
  "biome-banner--amber",
  "biome-banner--coral",
  "biome-banner--violet",
];

const Library: React.FC = () => {
  const { session } = useAuth();
  const [trees, setTrees] = useState<SkillTreeRow[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }
      setError(null);
      const [treesRes, profileRes] = await Promise.all([
        supabase
          .from("skill_trees")
          .select("id, user_id, query, query_normalized, source, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, tier, generated_count, total_count, created_at")
          .single(),
      ]);

      if (cancelled) return;

      if (treesRes.error) {
        setError(treesRes.error.message);
        setTrees([]);
      } else {
        setTrees((treesRes.data ?? []) as SkillTreeRow[]);
      }

      setProfile(profileRes.error ? null : (profileRes.data as ProfileRow));
      setLoading(false);
    };

    void load();
    return () => { cancelled = true; };
  }, [session?.access_token]);

  const totalRemaining = profile ? Math.max(10 - profile.total_count, 0)     : null;
  const genRemaining   = profile ? Math.max(5  - profile.generated_count, 0) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Chrome nav */}
      <nav className="chrome">
        <Link to="/" className="brand">
          <span className="brand-glyph" />
          hobbitify
        </Link>
        <div className="nav-actions">
          <Link to="/getting-started" className="btn btn--primary btn-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
            </svg>
            Generate
          </Link>
          <Link to="/upload" className="btn btn--ghost btn-sm">Upload JSON</Link>
          <LogoutButton className="btn btn--ghost btn-sm" />
        </div>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 48px 80px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "40px 0 28px" }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 34, fontWeight: 400, color: "var(--ink)", marginBottom: 6 }}>
              Your library
            </h1>
            <p className="font-mono" style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)" }}>
              Free tier — 10 total, 5 AI-generated
            </p>
          </div>

          {profile && (
            <div style={{ display: "flex", gap: 12 }}>
              <div className="hud-tag">
                <span className="dot" />
                {totalRemaining} library slots left
              </div>
              <div className="hud-tag" style={{ borderColor: "oklch(0.55 0.14 210 / 0.3)" }}>
                <span className="dot" style={{ background: "var(--bio-amber)", boxShadow: "0 0 8px var(--bio-amber)" }} />
                {genRemaining} AI gens left
              </div>
            </div>
          )}
        </div>

        {loading && (
          <p className="font-mono" style={{ fontSize: 11, color: "var(--ink-dim)", letterSpacing: "1.5px", animation: "pulse 2s ease-in-out infinite" }}>
            SCANNING LIBRARY...
          </p>
        )}

        {error && (
          <div
            style={{
              background: "oklch(0.70 0.17 35 / 0.1)",
              border: "1px solid oklch(0.70 0.17 35 / 0.3)",
              borderRadius: "var(--r-md)",
              padding: "12px 16px",
              marginBottom: 24,
              color: "var(--bio-coral)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && trees.length === 0 && (
          <div
            className="clay-card"
            style={{ padding: "60px 40px", textAlign: "center", borderRadius: "var(--r-xl)" }}
          >
            <p style={{ color: "var(--ink-mute)", marginBottom: 24, fontSize: 15 }}>
              No biomes yet. Generate one or upload a JSON chart.
            </p>
            <Link to="/getting-started" className="btn btn--primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
              </svg>
              Chart your first biome
            </Link>
          </div>
        )}

        {!loading && trees.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {trees.map((t, idx) => (
              <Link
                key={t.id}
                to={`/skill-tree?id=${encodeURIComponent(t.id)}`}
                className="biome-card"
              >
                <div className={`biome-banner ${BANNER_CLASSES[idx % BANNER_CLASSES.length]}`}>
                  <div className="biome-depth-bar">
                    <div className="biome-depth-fill" style={{ width: "60%" }} />
                  </div>
                  <div className="biome-depth-label">
                    {t.source === "generated" ? "AI·GEN" : "UPLOAD"}
                  </div>
                </div>
                <div style={{ padding: "12px 16px 16px" }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: 6,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    } as React.CSSProperties}
                  >
                    {t.query}
                  </h4>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px" }}>
                    {new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
