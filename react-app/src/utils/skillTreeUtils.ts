import { Skill, getDifficultyTier } from '../types/skill';

export const getDifficultyColor = (difficulty: number): string => {
  return getDifficultyTier(difficulty).color;
};

export const getDifficultyLabel = (difficulty: number): string => {
  const tier = getDifficultyTier(difficulty);
  return `${tier.label} (${difficulty})`;
};

export const getRootSkills = (skills: Skill[]): Skill[] => {
  return skills.filter(skill =>
    !skills.some(s => s.Children?.includes(skill.Name))
  );
};

export const getChildrenSkills = (parentSkill: Skill, allSkills: Skill[]): Skill[] => {
  if (!parentSkill.Children) return [];
  return allSkills.filter(skill =>
    parentSkill.Children?.includes(skill.Name)
  );
};

export const canUnlockSkill = (
  skill: Skill,
  allSkills: Skill[],
  completedSkills: string[]
): boolean => {
  const parentSkills = allSkills.filter(s =>
    s.Children?.includes(skill.Name)
  );
  if (parentSkills.length === 0) return true;
  return parentSkills.some(parent =>
    completedSkills.includes(parent.Name)
  );
};

export const parseSkillTreeResponse = (response: unknown): Skill[] => {
  try {
    if (typeof response === 'string') {
      const parsed = JSON.parse(response) as unknown;
      return Array.isArray(parsed) ? (parsed as Skill[]) : [];
    }
    return Array.isArray(response) ? (response as Skill[]) : [];
  } catch (error) {
    console.error('Failed to parse skill tree response:', error);
    return [];
  }
};

export const calculateCompletionPercentage = (
  allSkills: Skill[],
  completedSkills: string[]
): number => {
  if (allSkills.length === 0) return 0;
  return Math.round((completedSkills.length / allSkills.length) * 100);
};
