import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ProfileRow, SkillTreeRow } from "../lib/supabase";
import { supabase } from "../lib/supabase";

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

      if (profileRes.error) {
        setProfile(null);
      } else {
        setProfile(profileRes.data as ProfileRow);
      }
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const totalRemaining = profile
    ? Math.max(10 - profile.total_count, 0)
    : null;
  const genRemaining = profile
    ? Math.max(5 - profile.generated_count, 0)
    : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-3">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">
            hobbitify
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/getting-started"
              className="px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-medium transition-colors"
            >
              Generate
            </Link>
            <Link
              to="/upload"
              className="px-3 py-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary text-xs transition-colors"
            >
              Upload JSON
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your library</h1>
            <p className="text-text-secondary text-sm mt-1">
              Free tier: up to 10 saved trees, of which at most 5 may be AI-generated.
            </p>
          </div>
          {profile && (
            <div className="text-xs text-text-muted space-y-1 text-right">
              <div>
                Library slots: <span className="text-text-primary font-medium">{totalRemaining}</span>{" "}
                left ({profile.total_count}/10 used)
              </div>
              <div>
                AI generations left: <span className="text-text-primary font-medium">{genRemaining}</span>{" "}
                ({profile.generated_count}/5 used)
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-text-muted text-sm animate-pulse">Loading your trees...</div>
        )}
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 text-error text-sm px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && trees.length === 0 && (
          <div className="rounded-2xl border border-border-primary bg-bg-tertiary p-10 text-center">
            <p className="text-text-secondary mb-4">No trees yet. Generate one or upload a JSON export.</p>
            <Link
              to="/getting-started"
              className="inline-flex px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-sm font-semibold transition-colors"
            >
              Create your first tree
            </Link>
          </div>
        )}

        {!loading && trees.length > 0 && (
          <ul className="grid sm:grid-cols-2 gap-4">
            {trees.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/skill-tree?id=${encodeURIComponent(t.id)}`}
                  className="block rounded-xl border border-border-primary bg-bg-tertiary hover:border-accent-primary/40 p-5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-text-primary line-clamp-2">{t.query}</h2>
                    <span
                      className={`flex-shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        t.source === "generated"
                          ? "bg-accent-primary/15 text-accent-light"
                          : "bg-bg-primary text-text-muted border border-border-primary"
                      }`}
                    >
                      {t.source}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Library;
