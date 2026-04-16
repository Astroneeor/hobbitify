import React, { useState } from "react";
import { Skill } from "../../types/skill";
import { getDifficultyColor, getDifficultyLabel } from "../../utils/skillTreeUtils";

interface SkillNodeProps {
  skill: Skill;
  allSkills: Skill[];
  level: number;
  onSelect: (skillName: string) => void;
  selectedSkill: string | null;
  completedSkills?: Set<string>;
  onComplete?: (skillName: string) => void;
}

const SkillNode: React.FC<SkillNodeProps> = ({ 
  skill, 
  allSkills, 
  level, 
  onSelect, 
  selectedSkill,
  completedSkills = new Set(),
  onComplete
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const childSkills = skill.Children?.map((childName) =>
    allSkills.find((s) => s.Name === childName)
  ).filter((s): s is Skill => s !== undefined) || [];

  const isSelected = selectedSkill === skill.Name;
  const isCompleted = completedSkills.has(skill.Name);
  const isUnlocked = level === 0 || isParentCompleted();

  function isParentCompleted(): boolean {
    // Find if any parent skill is completed
    const parentSkill = allSkills.find(s => s.Children?.includes(skill.Name));
    return !parentSkill || completedSkills.has(parentSkill.Name);
  }

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComplete && isUnlocked && !isCompleted) {
      onComplete(skill.Name);
    }
  };

  const getNodeColor = () => {
    if (isCompleted) return "bg-success/20 border-success/50 text-success";
    if (!isUnlocked) return "bg-bg-secondary border-border-primary text-text-muted cursor-not-allowed opacity-60";
    if (isSelected) return "bg-accent-primary/20 border-accent-primary text-text-primary shadow-lg shadow-accent-primary/25";
    return "bg-bg-tertiary border-border-secondary text-text-primary hover:border-accent-primary/50 hover:bg-bg-hover";
  };

  const difficultyText = isCompleted ? "Completed" : getDifficultyLabel(skill.Difficulty);
  const difficultyColorClass = isCompleted ? "bg-success/20 border-success/50 text-success" : getDifficultyColor(skill.Difficulty);

  return (
    <div className="flex flex-col items-center relative">
      {/* Skill Node */}
      <div 
        className={`skill-node group relative transition-all duration-300 cursor-pointer ${
          isSelected ? 'scale-105' : 'hover:scale-102'
        }`}
        onClick={() => onSelect(skill.Name)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Card */}
        <div className={`
          w-72 p-6 rounded-2xl border-2 transition-all duration-300
          ${getNodeColor()}
        `}>
          
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                {skill.Name}
              </h3>
              
              {/* Difficulty Badge */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${difficultyColorClass}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isCompleted ? 'bg-success' : 'bg-current'
                }`}></div>
                {difficultyText}
              </div>
            </div>
            
            {/* Status Icon */}
            <div className="ml-3 flex-shrink-0">
              {isCompleted ? (
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : isUnlocked ? (
                <div className="w-8 h-8 border-2 border-current rounded-full opacity-60 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-current rounded-full"></div>
                </div>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm opacity-80 line-clamp-3 mb-4">
            {skill.Description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-60">
              {childSkills.length > 0 && `Unlocks ${childSkills.length} skills`}
            </span>
            
            {isSelected && (
              <span className="text-accent-primary font-medium">
                View details →
              </span>
            )}
          </div>
          
          {/* Complete Button - only show if skill is selected, unlocked and not completed */}
          {isUnlocked && !isCompleted && isSelected && (
            <button
              onClick={handleComplete}
              className="mt-4 w-full px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Mark as Complete
            </button>
          )}
        </div>

        {/* Hover Tooltip */}
        {!isSelected && isHovered && isUnlocked && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-bg-secondary border border-border-secondary rounded-lg px-3 py-1 text-xs opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Click to view details
          </div>
        )}

        {/* Locked Tooltip */}
        {!isUnlocked && isHovered && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-bg-secondary border border-border-secondary rounded-lg px-3 py-1 text-xs opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Complete prerequisites first
          </div>
        )}
      </div>

      {/* Connection Lines and Child Skills */}
      {childSkills.length > 0 && (
        <div className="flex flex-col items-center mt-8">
          {/* Vertical Line */}
          <div className="w-px h-12 bg-border-secondary"></div>
          
          {/* Horizontal Line and Children */}
          <div className="relative">
            {/* Horizontal connector */}
            {childSkills.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-px bg-border-secondary" 
                   style={{ 
                     width: `${(childSkills.length - 1) * 320}px`,
                     left: '50%',
                     transform: 'translateX(-50%)'
                   }}>
              </div>
            )}
            
            {/* Child Skills */}
            <div className="flex space-x-8 pt-4">
              {childSkills.map((childSkill, index) => (
                <div key={index} className="relative">
                  {/* Vertical connector to child */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border-secondary"></div>
                  
                  <SkillNode
                    skill={childSkill}
                    allSkills={allSkills}
                    level={level + 1}
                    onSelect={onSelect}
                    selectedSkill={selectedSkill}
                    completedSkills={completedSkills}
                    onComplete={onComplete}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillNode;