import { Skill } from "../types/skill";
import { parseSkillTreeResponse } from "./skillTreeUtils";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787").replace(
  /\/$/,
  "",
);

export interface SimilarMatch {
  id: string;
  query: string;
  source: "generated" | "uploaded";
  score: number;
  createdAt: string;
}

export interface GenerateTreePayload {
  id: string;
  query: string;
  source: "generated" | "uploaded";
  skills: Skill[];
}

export type GenerateResponse =
  | { similar: SimilarMatch[] }
  | { tree: GenerateTreePayload };

export interface MeResponse {
  tier: string;
  generated_count: number;
  total_count: number;
  generated_remaining: number;
  total_remaining: number;
  limits: { total: number; generated: number };
}

export interface UploadTreePayload {
  id: string;
  query: string;
  source: "uploaded";
  skills: Skill[];
}

function buildUrl(path: string): string {
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  const err = data as { error?: string };
  return err.error ?? `Server error (${response.status})`;
}

/**
 * Calls `POST /generate`. Returns either similar matches (no Anthropic call) or
 * a freshly generated tree that has already been persisted.
 */
export async function requestGenerate(
  accessToken: string,
  userInput: string,
  turnstileToken: string,
  force: boolean,
): Promise<GenerateResponse> {
  const response = await fetch(buildUrl("/generate"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      input: userInput.trim(),
      turnstileToken,
      force,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (Array.isArray(data.similar)) {
    return { similar: data.similar as SimilarMatch[] };
  }

  if (data.tree && typeof data.tree === "object") {
    const tree = data.tree as {
      id: string;
      query: string;
      source: "generated" | "uploaded";
      skills: unknown;
    };
    const skills = parseSkillTreeResponse(tree.skills);
    return {
      tree: {
        id: tree.id,
        query: tree.query,
        source: tree.source,
        skills,
      },
    };
  }

  throw new Error("Unexpected response from server");
}

/**
 * Validates and uploads a skill array via `POST /upload`.
 */
export async function requestUpload(
  accessToken: string,
  skills: unknown,
  turnstileToken: string,
  title?: string,
): Promise<UploadTreePayload> {
  const response = await fetch(buildUrl("/upload"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: title,
      skills,
      turnstileToken,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as {
    tree: { id: string; query: string; source: string; skills: unknown };
  };
  const skillsParsed = parseSkillTreeResponse(data.tree.skills);
  return {
    id: data.tree.id,
    query: data.tree.query,
    source: "uploaded",
    skills: skillsParsed,
  };
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const response = await fetch(buildUrl("/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as MeResponse;
}

export const validateInput = (
  input: string,
): { isValid: boolean; error?: string } => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return { isValid: false, error: "Please enter a learning goal" };
  }
  if (trimmedInput.length < 3) {
    return {
      isValid: false,
      error: "Learning goal must be at least 3 characters",
    };
  }
  if (trimmedInput.length > 500) {
    return {
      isValid: false,
      error: "Learning goal must be less than 500 characters",
    };
  }
  return { isValid: true };
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = new URL("/healthz", BACKEND_URL + "/").toString();
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
};
