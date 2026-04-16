import { Skill } from '../types/skill';
import { parseSkillTreeResponse } from './skillTreeUtils';

const BACKEND_URL = "http://localhost:5000/";

interface SkillTreeRequest {
  input: string;
}

export const generateSkillTree = async (userInput: string): Promise<Skill[]> => {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: userInput.trim() } as SkillTreeRequest),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  const data = await response.json();
  return parseSkillTreeResponse(data);
};

export const validateInput = (input: string): { isValid: boolean; error?: string } => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { isValid: false, error: 'Please enter a learning goal' };
  }
  if (trimmedInput.length < 3) {
    return { isValid: false, error: 'Learning goal must be at least 3 characters' };
  }
  if (trimmedInput.length > 500) {
    return { isValid: false, error: 'Learning goal must be less than 500 characters' };
  }
  return { isValid: true };
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(BACKEND_URL, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
};
