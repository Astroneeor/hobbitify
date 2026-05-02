import React from "react";
import { Skill } from "../../types/skill";
import { getDifficultyTier } from "../../types/skill";

interface SkillNodeProps {
  skill: Skill;
  isSelected: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isRoot: boolean;
  childCount: number;
  onSelect: (skillName: string) => void;
  onComplete: (skillName: string) => void;
  compact?: boolean;
}

function tierToNodeClass(
  isRoot: boolean,
  isCompleted: boolean,
  isUnlocked: boolean,
): string {
  if (isCompleted) return "skill-node--completed";
  if (isRoot)      return "skill-node--root";
  if (isUnlocked)  return "skill-node--unlocked";
  return "skill-node--locked";
}

const DIFFICULTY_BAR_COLOR: Record<string, string> = {
  Beginner:      "var(--bio-kelp)",
  Foundational:  "var(--bio-kelp)",
  Intermediate:  "var(--bio-cyan)",
  Advanced:      "var(--bio-amber)",
  Expert:        "var(--bio-amber)",
  Master:        "var(--bio-coral)",
};

const SkillNode: React.FC<SkillNodeProps> = ({
  skill,
  isSelected,
  isCompleted,
  isUnlocked,
  isRoot,
  childCount,
  onSelect,
  onComplete,
  compact = false,
}) => {
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnlocked && !isCompleted) onComplete(skill.Name);
  };

  const tier = getDifficultyTier(skill.Difficulty);
  const tierCls = tierToNodeClass(isRoot, isCompleted, isUnlocked);
  const barColor = DIFFICULTY_BAR_COLOR[tier.label] ?? "var(--bio-cyan)";

  return (
    <div
      data-no-pan
      onClick={() => isUnlocked && onSelect(skill.Name)}
      className={`skill-node ${tierCls} ${isSelected ? "skill-node--selected" : ""}`}
      style={{ width: 200, minHeight: compact ? 110 : 130 }}
    >
      {/* Head row: tier label + status icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span className="font-mono" style={{ fontSize: 9, letterSpacing: "1.5px", color: "var(--ink-dim)" }}>
          {tier.label.toUpperCase()}
        </span>
        <span style={{ width: 12, height: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isCompleted ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bio-kelp)" strokeWidth="3" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : !isUnlocked ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--ink-dim)" strokeWidth="2" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          ) : isRoot ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--bio-cyan)" aria-hidden>
              <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
            </svg>
          ) : null}
        </span>
      </div>

      {/* Name */}
      <h4
        style={{
          fontSize: compact ? 12 : 13,
          fontWeight: 600,
          lineHeight: 1.25,
          color: isUnlocked || isCompleted ? "var(--ink)" : "var(--ink-mute)",
          marginBottom: 5,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {skill.Name}
      </h4>

      {/* Description */}
      <p
        style={{
          fontSize: 11,
          lineHeight: 1.45,
          color: isUnlocked || isCompleted ? "var(--ink-mute)" : "var(--ink-dim)",
          marginBottom: 10,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: compact ? 2 : 3,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}
      >
        {skill.Description}
      </p>

      {/* Footer: difficulty bar + unlock count */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 9,
              letterSpacing: "1.2px",
              padding: "2px 8px",
              borderRadius: "var(--r-pill)",
              border: "1px solid",
              color:        isCompleted ? "var(--bio-kelp)"  : !isUnlocked ? "var(--ink-dim)"  : barColor,
              borderColor:  isCompleted ? "var(--bio-kelp)"  : !isUnlocked ? "var(--clay-edge-soft)" : barColor,
              background:   isCompleted ? "oklch(0.75 0.13 165 / 0.15)" : "oklch(0.10 0.01 240 / 0.5)",
            }}
          >
            {isCompleted ? "CLEARED" : !isUnlocked ? "LOCKED" : `${skill.Difficulty}`}
          </span>
          <div
            style={{
              flex: 1,
              height: 3,
              background: "oklch(0.10 0.01 240)",
              borderRadius: "var(--r-pill)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: isCompleted ? "100%" : !isUnlocked ? "0%" : `${skill.Difficulty}%`,
                background: barColor,
                borderRadius: "var(--r-pill)",
                boxShadow: isUnlocked || isCompleted ? `0 0 5px ${barColor}` : "none",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
        {childCount > 0 && (
          <span className="font-mono" style={{ fontSize: 9, color: "var(--ink-dim)", letterSpacing: "0.5px", flexShrink: 0 }}>
            →{childCount}
          </span>
        )}
      </div>

      {/* Inline complete button when selected + unlocked */}
      {isSelected && isUnlocked && !isCompleted && (
        <button
          onClick={handleComplete}
          className="btn btn--primary"
          style={{ marginTop: 10, width: "100%", justifyContent: "center", padding: "8px 12px", fontSize: 11, borderRadius: "var(--r-md)" }}
        >
          Mark complete
        </button>
      )}
    </div>
  );
};

export default SkillNode;
