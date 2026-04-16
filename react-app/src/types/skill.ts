export interface Skill {
  Name: string;
  Description: string;
  Completion: string;
  Children?: string[];
  /** Difficulty from 1-100 (1=beginner hobbyist, 100=master's level) */
  Difficulty: number;
}

export interface SkillComponentProps {
  skill: Skill;
  allSkills: Skill[];
  level: number;
  onSelect: (skillName: string) => void;
  selectedSkill: string | null;
  completedSkills?: Set<string>;
  onComplete?: (skillName: string) => void;
}

export const getDifficultyTier = (difficulty: number): { label: string; color: string } => {
  if (difficulty <= 15) return { label: "Beginner", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" };
  if (difficulty <= 30) return { label: "Foundational", color: "bg-teal-500/20 border-teal-500/30 text-teal-300" };
  if (difficulty <= 50) return { label: "Intermediate", color: "bg-blue-500/20 border-blue-500/30 text-blue-300" };
  if (difficulty <= 70) return { label: "Advanced", color: "bg-amber-500/20 border-amber-500/30 text-amber-300" };
  if (difficulty <= 85) return { label: "Expert", color: "bg-orange-500/20 border-orange-500/30 text-orange-300" };
  return { label: "Master", color: "bg-red-500/20 border-red-500/30 text-red-300" };
};
