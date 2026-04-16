import React from "react";
import { Skill } from "../../types/skill";
import { getDifficultyColor, getDifficultyLabel } from "../../utils/skillTreeUtils";

interface SkillNodeProps {
  skill: Skill;
  isSelected: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isRoot: boolean;
  childCount: number;
  onSelect: (skillName: string) => void;
  onComplete: (skillName: string) => void;
}

const SkillNode: React.FC<SkillNodeProps> = ({
  skill,
  isSelected,
  isCompleted,
  isUnlocked,
  isRoot,
  childCount,
  onSelect,
  onComplete,
}) => {
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnlocked && !isCompleted) onComplete(skill.Name);
  };

  const difficultyText = isCompleted ? "Completed" : getDifficultyLabel(skill.Difficulty);
  const difficultyColorClass = isCompleted
    ? "bg-success/20 border-success/50 text-success"
    : getDifficultyColor(skill.Difficulty);

  const borderColor = isCompleted
    ? "border-success/50"
    : !isUnlocked
    ? "border-border-primary"
    : isSelected
    ? "border-accent-primary"
    : "border-border-secondary hover:border-accent-primary/50";

  const bgColor = isCompleted
    ? "bg-success/10"
    : !isUnlocked
    ? "bg-bg-secondary opacity-50"
    : isSelected
    ? "bg-accent-primary/10"
    : "bg-bg-tertiary hover:bg-bg-hover";

  return (
    <div
      onClick={() => isUnlocked && onSelect(skill.Name)}
      className={`
        relative border rounded-xl p-4 transition-all duration-200 flex flex-col
        ${borderColor} ${bgColor}
        ${isUnlocked ? "cursor-pointer" : "cursor-not-allowed"}
        ${isSelected ? "ring-1 ring-accent-primary/40 shadow-lg shadow-accent-primary/10" : ""}
      `}
    >
      {/* Top row: name + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`font-semibold text-sm leading-snug flex-1 ${!isUnlocked ? "text-text-muted" : "text-text-primary"}`}>
          {isRoot && <span className="text-accent-light mr-1">◆</span>}
          {skill.Name}
        </h3>
        {isCompleted ? (
          <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : !isUnlocked ? (
          <svg className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : null}
      </div>

      {/* Description */}
      <p className={`text-xs leading-relaxed mb-3 flex-1 ${!isUnlocked ? "text-text-muted/60" : "text-text-secondary"}`}>
        {skill.Description}
      </p>

      {/* Bottom row: difficulty badge + unlocks count */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyColorClass}`}>
          {difficultyText}
        </div>
        {childCount > 0 && (
          <span className="text-[10px] text-text-muted">
            → {childCount}
          </span>
        )}
      </div>

      {/* Inline complete button when selected */}
      {isSelected && isUnlocked && !isCompleted && (
        <button
          onClick={handleComplete}
          className="mt-3 w-full px-3 py-1.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-all duration-150"
        >
          Mark Complete
        </button>
      )}
    </div>
  );
};

export default SkillNode;
