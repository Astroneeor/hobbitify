import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogoutButton } from "../components/auth/LogoutButton";
import SkillTreeGraph from "../components/skill-tree/SkillTreeGraph";
import { Skill, getDifficultyTier } from "../types/skill";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { parseSkillTreeResponse } from "../utils/skillTreeUtils";

interface ExportedSkillTree {
  skills: Skill[];
  progress: { completedSkills: string[]; incompleteSkills: string[] };
}

const SkillTree: React.FC = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [completedSkills, setCompletedSkills] = useState<Set<string>>(new Set());
  const [treeId, setTreeId] = useState<string | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    setTreeId(id);

    if (location.state?.response) { loadSkills(location.state.response); return; }

    if (id && session?.access_token) {
      setLoadingDb(true);
      setError(null);
      void (async () => {
        const { data, error: qError } = await supabase
          .from("skill_trees")
          .select("skills")
          .eq("id", id)
          .single();
        setLoadingDb(false);
        if (qError || !data) { setError("Could not load this skill tree from your library."); return; }
        loadSkills(parseSkillTreeResponse(data.skills));
      })();
      return;
    }

    if (!id) setError("No skill tree data found. Please go back and generate a skill tree first.");
    else if (!session?.access_token) setError("Sign in to open saved trees from your library.");
  }, [searchParams, location.state, session?.access_token]);

  const loadSkills = (data: unknown) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (Array.isArray(parsed)) {
        setSkills(parsed as Skill[]); setCompletedSkills(new Set()); setSelectedSkill(null); setError(null);
        return;
      }
      if (parsed && typeof parsed === "object" && "skills" in parsed) {
        const exported = parsed as ExportedSkillTree;
        if (!Array.isArray(exported.skills)) { setError("Invalid saved format: skills array is missing."); return; }
        setSkills(exported.skills);
        setCompletedSkills(new Set(Array.isArray(exported.progress?.completedSkills) ? exported.progress.completedSkills : []));
        setSelectedSkill(null); setError(null);
        return;
      }
      setError("Expected a skill array or saved export file.");
    } catch { setError("Invalid JSON format."); }
  };

  const isRoot          = (skill: Skill) => !skills.some((s) => s.Children?.includes(skill.Name));
  const getParent       = (name: string)  => skills.find((s) => s.Children?.includes(name));
  const isSkillUnlocked = (name: string): boolean => {
    const parent = getParent(name);
    return !parent || completedSkills.has(parent.Name);
  };

  const handleSkillComplete = (name: string) =>
    setCompletedSkills((prev) => new Set([...prev, name]));

  const handleExport = () => {
    const completed  = Array.from(completedSkills);
    const payload: ExportedSkillTree = {
      skills,
      progress: {
        completedSkills: completed,
        incompleteSkills: skills.map((s) => s.Name).filter((n) => !completedSkills.has(n)),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${(skills.find(isRoot)?.Name || "skill-tree").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { loadSkills(ev.target?.result as string); } catch { setError("Failed to read the uploaded file."); } };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDeleteFromLibrary = async () => {
    if (!treeId || !session) return;
    if (!window.confirm("Remove this tree from your library? This cannot be undone.")) return;
    const { error: delError } = await supabase.from("skill_trees").delete().eq("id", treeId);
    if (delError) { setError(delError.message); return; }
    navigate("/library");
  };

  const selectedData = skills.find((s) => s.Name === selectedSkill);
  const pct          = skills.length ? Math.round((completedSkills.size / skills.length) * 100) : 0;

  /* ── Loading state ── */
  if (loadingDb && skills.length === 0 && !error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <nav className="chrome">
          <Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link>
        </nav>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="hud-tag">
            <span className="dot" style={{ animation: "glowPulse 2s ease-in-out infinite" }} />
            scanning biome…
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state (no skills loaded) ── */
  if (error && skills.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <nav className="chrome">
          <Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link>
          <div className="nav-actions">
            <button className="btn btn--ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Load JSON</button>
            <Link to="/getting-started" className="btn btn--primary btn-sm">Generate new</Link>
          </div>
        </nav>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div
            className="clay-card"
            style={{ maxWidth: 480, width: "100%", padding: "40px 32px", textAlign: "center", borderRadius: "var(--r-xl)" }}
          >
            <div
              style={{ width: 56, height: 56, borderRadius: "50%", background: "oklch(0.70 0.17 35 / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bio-coral)" strokeWidth="2" aria-hidden>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="font-display" style={{ fontSize: "1.4rem", color: "var(--ink)", marginBottom: 10 }}>Unable to load skill tree</h2>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 24 }}>{error}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn btn--ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Upload a saved tree</button>
              <Link to="/getting-started" className="btn btn--primary btn-sm">Generate new</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh", maxHeight: "100dvh", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Chrome nav */}
      <nav className="chrome">
        <Link to="/" className="brand"><span className="brand-glyph" />hobbitify</Link>
        <div className="nav-actions">
          {/* Depth meter */}
          <div className="depth-meter">
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: "2px", color: "var(--ink-dim)" }}>DEPTH</span>
            <div className="depth-track">
              <div className="depth-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
              {completedSkills.size}/{skills.length}
            </span>
          </div>

          <button className="btn btn--ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Load</button>
          <button className="btn btn--ghost btn-sm" onClick={handleExport}>Export</button>
          <Link to="/getting-started" className="btn btn--primary btn-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
            </svg>
            New
          </Link>
          {treeId && session && (
            <button type="button" onClick={handleDeleteFromLibrary} className="btn btn--danger btn-sm">Delete</button>
          )}
          {session && <LogoutButton className="btn btn--ghost btn-sm" />}
        </div>
      </nav>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      {/* Canvas area — full remaining height, relative for overlay */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex" }}>
        <SkillTreeGraph
          skills={skills}
          completedSkills={completedSkills}
          selectedSkill={selectedSkill}
          isRoot={isRoot}
          isSkillUnlocked={isSkillUnlocked}
          onSelect={setSelectedSkill}
          onComplete={handleSkillComplete}
        />

        {/* Floating detail panel — overlays the canvas */}
        {selectedData && (
          <DetailPanel
            skill={selectedData}
            completedSkills={completedSkills}
            getParent={getParent}
            isSkillUnlocked={isSkillUnlocked}
            onSelectSkill={setSelectedSkill}
            onComplete={handleSkillComplete}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════
   Floating detail panel
   ═══════════════════════════ */
interface DetailPanelProps {
  skill: Skill;
  completedSkills: Set<string>;
  getParent: (name: string) => Skill | undefined;
  isSkillUnlocked: (name: string) => boolean;
  onSelectSkill: (name: string) => void;
  onComplete: (name: string) => void;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  skill, completedSkills, getParent, isSkillUnlocked, onSelectSkill, onComplete, onClose,
}) => {
  const tier   = getDifficultyTier(skill.Difficulty);
  const parent = getParent(skill.Name);
  const done   = completedSkills.has(skill.Name);
  const unlocked = isSkillUnlocked(skill.Name);

  const TIER_COLORS: Record<string, string> = {
    Beginner:    "var(--bio-kelp)",
    Foundational:"var(--bio-kelp)",
    Intermediate:"var(--bio-cyan)",
    Advanced:    "var(--bio-amber)",
    Expert:      "var(--bio-amber)",
    Master:      "var(--bio-coral)",
  };
  const barColor = TIER_COLORS[tier.label] ?? "var(--bio-cyan)";

  return (
    <div className="detail-panel" data-no-pan>
      {/* Head */}
      <div className="detail-head">
        <span className="detail-htag">◉ NODE.SCAN // {tier.label.toUpperCase()}</span>
        <button className="detail-close" onClick={onClose} aria-label="Close">×</button>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px", overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
        {/* Difficulty bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>{tier.label}</span>
            <span className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px" }}>{skill.Difficulty}/100</span>
          </div>
          <div style={{ width: "100%", height: 4, background: "oklch(0.10 0.01 240)", borderRadius: "var(--r-pill)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${skill.Difficulty}%`, background: barColor, boxShadow: `0 0 8px ${barColor}`, borderRadius: "var(--r-pill)", transition: "width 0.3s" }} />
          </div>
        </div>

        {/* Name */}
        <h3 className="font-display" style={{ fontSize: 20, fontWeight: 400, color: "var(--ink)", lineHeight: 1.15, marginBottom: 8 }}>
          {skill.Name}
        </h3>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <div className="font-mono" style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 6 }}>Description</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-mute)" }}>{skill.Description}</p>
        </div>

        {/* Completion criteria */}
        <div style={{ marginBottom: 16 }}>
          <div className="font-mono" style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 6 }}>How to complete</div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>{skill.Completion}</p>
        </div>

        {/* Unlocks */}
        {skill.Children && skill.Children.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="font-mono" style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 8 }}>Unlocks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {skill.Children.map((childName) => {
                const childCompleted = completedSkills.has(childName);
                const childUnlocked  = isSkillUnlocked(childName);
                return (
                  <button
                    key={childName}
                    onClick={() => childUnlocked && onSelectSkill(childName)}
                    disabled={!childUnlocked}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: "var(--r-sm)",
                      border: `1px solid ${childCompleted ? "oklch(0.55 0.12 165 / 0.5)" : childUnlocked ? "var(--clay-edge)" : "var(--clay-edge-soft)"}`,
                      background: childCompleted ? "oklch(0.28 0.04 165 / 0.3)" : childUnlocked ? "oklch(0.24 0.014 230 / 0.5)" : "oklch(0.12 0.01 240 / 0.3)",
                      color: childCompleted ? "var(--bio-kelp)" : childUnlocked ? "var(--ink)" : "var(--ink-dim)",
                      fontSize: 12,
                      cursor: childUnlocked ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.15s",
                      opacity: childUnlocked ? 1 : 0.6,
                    }}
                  >
                    <span>{childName}</span>
                    {childCompleted && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bio-kelp)" strokeWidth="3" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Requires */}
        {parent && (
          <div style={{ marginBottom: 16 }}>
            <div className="font-mono" style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", marginBottom: 6 }}>Requires</div>
            <button
              onClick={() => onSelectSkill(parent.Name)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: "var(--bio-cyan)", display: "flex", alignItems: "center", gap: 4 }}
            >
              ← {parent.Name}
            </button>
          </div>
        )}

        {/* Action */}
        <div style={{ borderTop: "1px solid var(--clay-edge-soft)", paddingTop: 14 }}>
          {done ? (
            <div
              style={{ width: "100%", padding: "11px 16px", borderRadius: "var(--r-md)", background: "oklch(0.75 0.13 165 / 0.15)", border: "1px solid oklch(0.55 0.12 165 / 0.5)", color: "var(--bio-kelp)", fontSize: 13, fontWeight: 600, textAlign: "center" }}
            >
              ✓ Cleared
            </div>
          ) : unlocked ? (
            <button
              onClick={() => onComplete(skill.Name)}
              className="btn btn--primary"
              style={{ width: "100%", justifyContent: "center", padding: "11px 16px" }}
            >
              Mark as complete
            </button>
          ) : (
            <div
              style={{ width: "100%", padding: "11px 16px", borderRadius: "var(--r-md)", background: "oklch(0.12 0.01 240 / 0.5)", border: "1px solid var(--clay-edge-soft)", color: "var(--ink-dim)", fontSize: 12, textAlign: "center" }}
            >
              ◌ Sealed by current — complete prerequisites first
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
