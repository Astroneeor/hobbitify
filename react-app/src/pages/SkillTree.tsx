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
  progress: {
    completedSkills: string[];
    incompleteSkills: string[];
  };
}

const SkillTree: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

    if (location.state?.response) {
      loadSkills(location.state.response);
      return;
    }

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
        if (qError || !data) {
          setError("Could not load this skill tree from your library.");
          return;
        }
        loadSkills(parseSkillTreeResponse(data.skills));
      })();
      return;
    }

    if (!id) {
      setError("No skill tree data found. Please go back and generate a skill tree first.");
    } else if (!session?.access_token) {
      setError("Sign in to open saved trees from your library.");
    }
  }, [searchParams, location.state, session?.access_token]);

  const loadSkills = (data: unknown) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (Array.isArray(parsed)) {
        setSkills(parsed as Skill[]);
        setCompletedSkills(new Set());
        setSelectedSkill(null);
        setError(null);
        return;
      }

      if (parsed && typeof parsed === "object" && "skills" in parsed) {
        const exported = parsed as ExportedSkillTree;
        if (!Array.isArray(exported.skills)) {
          setError("Invalid saved format: skills array is missing.");
          return;
        }

        const completedFromFile = Array.isArray(exported.progress?.completedSkills)
          ? exported.progress.completedSkills
          : [];

        setSkills(exported.skills);
        setCompletedSkills(new Set(completedFromFile));
        setSelectedSkill(null);
        setError(null);
        return;
      }

      setError("Expected a skill array or saved export file.");
    } catch {
      setError("Invalid JSON format.");
    }
  };

  // --- Tree structure helpers ---
  const isRoot = (skill: Skill) =>
    !skills.some((s) => s.Children?.includes(skill.Name));

  const getParent = (skillName: string) =>
    skills.find((s) => s.Children?.includes(skillName));

  const isSkillUnlocked = (skillName: string): boolean => {
    const parent = getParent(skillName);
    if (!parent) return true; // root
    return completedSkills.has(parent.Name);
  };

  const handleSkillComplete = (skillName: string) => {
    setCompletedSkills((prev) => new Set([...prev, skillName]));
  };

  // --- Export ---
  const handleExport = () => {
    const completed = Array.from(completedSkills);
    const completedSet = new Set(completed);
    const incomplete = skills
      .map((skill) => skill.Name)
      .filter((skillName) => !completedSet.has(skillName));

    const payload: ExportedSkillTree = {
      skills,
      progress: {
        completedSkills: completed,
        incompleteSkills: incomplete,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const rootName = skills.find(isRoot)?.Name || "skill-tree";
    a.download = `${rootName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Import ---
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        loadSkills(ev.target?.result as string);
      } catch {
        setError("Failed to read the uploaded file.");
      }
    };
    reader.readAsText(file);
    // reset so same file can be re-uploaded
    e.target.value = "";
  };

  const handleDeleteFromLibrary = async () => {
    if (!treeId) return;
    if (!session) {
      setError("Sign in to manage library trees.");
      return;
    }
    if (!window.confirm("Remove this tree from your library? This cannot be undone.")) {
      return;
    }
    const { error: delError } = await supabase
      .from("skill_trees")
      .delete()
      .eq("id", treeId);
    if (delError) {
      setError(delError.message);
      return;
    }
    navigate("/library");
  };

  // --- Sidebar data ---
  const selectedData = skills.find((s) => s.Name === selectedSkill);

  if (loadingDb && skills.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center">
        <div className="text-text-muted text-sm animate-pulse">Loading skill tree...</div>
      </div>
    );
  }

  // --- Error state ---
  if (error && skills.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <nav className="border-b border-border-primary">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">hobbitify</Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-border-secondary hover:border-border-primary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-sm"
              >
                Load JSON
              </button>
              <Link to="/getting-started" className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200 text-sm">
                Generate New
              </Link>
            </div>
          </div>
        </nav>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <div className="max-w-2xl mx-auto px-6 pt-16">
          <div className="bg-error/10 border border-error/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-error">Unable to Load Skill Tree</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-border-secondary hover:border-accent-primary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200"
              >
                Upload a saved tree
              </button>
              <Link to="/getting-started" className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200">
                Generate New
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border-primary sticky top-0 bg-bg-primary/95 backdrop-blur-sm z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold hover:text-accent-light transition-colors">hobbitify</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">
              {completedSkills.size}/{skills.length} done
            </span>
            {/* Progress pill */}
            <div className="w-24 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-success rounded-full transition-all duration-500"
                style={{ width: `${skills.length ? (completedSkills.size / skills.length) * 100 : 0}%` }}
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 border border-border-secondary hover:border-border-primary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-xs"
            >
              Load
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 border border-border-secondary hover:border-border-primary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-xs"
            >
              Export
            </button>
            <Link
              to="/getting-started"
              className="px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200 text-xs font-medium"
            >
              New
            </Link>
            {treeId && session && (
              <button
                type="button"
                onClick={handleDeleteFromLibrary}
                className="px-3 py-1.5 border border-error/40 text-error hover:bg-error/10 rounded-lg transition-all duration-200 text-xs"
              >
                Delete
              </button>
            )}
            {session && (
              <LogoutButton className="px-3 py-1.5 text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-xs" />
            )}
          </div>
        </div>
      </nav>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      <div className="flex flex-1 overflow-hidden">
        <SkillTreeGraph
          skills={skills}
          completedSkills={completedSkills}
          selectedSkill={selectedSkill}
          isRoot={isRoot}
          isSkillUnlocked={isSkillUnlocked}
          onSelect={setSelectedSkill}
          onComplete={handleSkillComplete}
        />

        {/* Detail sidebar */}
        {selectedData && (
          <div className="w-80 border-l border-border-primary bg-bg-secondary flex-shrink-0 overflow-y-auto">
            <div className="p-5 space-y-5">
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                ← close
              </button>

              {/* Difficulty bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-medium ${getDifficultyTier(selectedData.Difficulty).color.split(" ").pop()}`}>
                    {getDifficultyTier(selectedData.Difficulty).label}
                  </span>
                  <span className="text-xs text-text-muted">{selectedData.Difficulty}/100</span>
                </div>
                <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      selectedData.Difficulty <= 30 ? "bg-emerald-400" :
                      selectedData.Difficulty <= 50 ? "bg-blue-400" :
                      selectedData.Difficulty <= 70 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${selectedData.Difficulty}%` }}
                  />
                </div>
              </div>

              <h2 className="text-lg font-bold leading-snug">{selectedData.Name}</h2>

              <div>
                <h3 className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wide">Description</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedData.Description}</p>
              </div>

              <div>
                <h3 className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wide">How to Complete</h3>
                <p className="text-sm text-text-primary leading-relaxed">{selectedData.Completion}</p>
              </div>

              {selectedData.Children && selectedData.Children.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Unlocks</h3>
                  <div className="space-y-1.5">
                    {selectedData.Children.map((childName) => {
                      const childCompleted = completedSkills.has(childName);
                      const childUnlocked = isSkillUnlocked(childName);
                      return (
                        <button
                          key={childName}
                          onClick={() => childUnlocked && setSelectedSkill(childName)}
                          disabled={!childUnlocked}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                            childCompleted ? "bg-success/10 text-success border border-success/20" :
                            childUnlocked ? "bg-bg-tertiary hover:bg-bg-hover text-text-primary border border-border-secondary" :
                            "bg-bg-primary text-text-muted border border-border-primary opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{childName}</span>
                            {childCompleted && (
                              <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Parent link */}
              {(() => {
                const parent = getParent(selectedData.Name);
                if (!parent) return null;
                return (
                  <div>
                    <h3 className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wide">Requires</h3>
                    <button
                      onClick={() => setSelectedSkill(parent.Name)}
                      className="text-xs text-accent-light hover:text-accent-primary transition-colors"
                    >
                      ← {parent.Name}
                    </button>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-border-primary">
                {completedSkills.has(selectedData.Name) ? (
                  <div className="w-full px-4 py-2.5 bg-success/10 border border-success/20 text-success rounded-lg text-sm font-medium text-center">
                    ✓ Completed
                  </div>
                ) : isSkillUnlocked(selectedData.Name) ? (
                  <button
                    onClick={() => handleSkillComplete(selectedData.Name)}
                    className="w-full px-4 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Mark as Complete
                  </button>
                ) : (
                  <div className="w-full px-4 py-2.5 bg-bg-tertiary border border-border-primary text-text-muted rounded-lg text-sm font-medium text-center">
                    Complete prerequisites first
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTree;
