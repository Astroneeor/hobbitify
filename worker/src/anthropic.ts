import Anthropic from "@anthropic-ai/sdk";
import type { SkillRecord } from "./skills";
import { validateSkillsArray } from "./skills";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 4096;

const SYSTEM_PROMPT = `You are an expert skill tree designer. Given a learning goal, generate a structured skill tree as a JSON array.

Each skill in the array must have:
- "Name": A concise skill/topic name
- "Description": A 1-2 sentence description of what this skill covers
- "Completion": A specific, concrete project or task that proves mastery of this skill
- "Children": An array of child skill names (strings) that this skill unlocks. Leaf nodes should have an empty array [].
- "Difficulty": A number from 1-100 representing the progression from hobbyist to master

Difficulty scale:
- 1-15: Complete beginner. Casual hobbyist picking up the basics for the first time.
- 16-30: Developing hobbyist. Building foundational skills through simple projects.
- 31-50: Serious enthusiast. Intermediate techniques, starting to develop personal style.
- 51-70: Advanced practitioner. Complex projects, deep understanding of theory and practice.
- 71-85: Professional/expert level. Portfolio-worthy work, teaching others, pushing boundaries.
- 86-100: Master level. Original research, thesis-level projects, contributions to the field. Very few skills should reach this level.

Rules:
- Generate 10-18 skills total
- Create a tree structure with 1-2 root skills and 3-5 levels of depth
- Every name referenced in a "Children" array MUST exist as a skill in the array
- Difficulty should generally increase as you go deeper in the tree
- Root skills should start at 5-20, deepest leaf skills can reach 80-100
- Completion tasks should be concrete projects, not vague instructions (e.g. "Build a dovetail jewelry box without power tools" not "Practice dovetail joints")
- The highest-difficulty skills should feel like master's thesis projects or professional milestones
- Keep most skills (70%+) under difficulty 60 — mastery is rare

Respond with ONLY the JSON array, no markdown formatting, no code blocks, no explanation.`;

function stripCodeFences(text: string): string {
  let trimmed = text.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  const newlineIdx = trimmed.indexOf("\n");
  if (newlineIdx === -1) return trimmed;
  trimmed = trimmed.slice(newlineIdx + 1);
  if (trimmed.endsWith("```")) {
    trimmed = trimmed.slice(0, -3);
  }
  return trimmed.trim();
}

export type GenerationResult =
  | { ok: true; skills: SkillRecord[] }
  | { ok: false; error: string; status: number };

export async function generateSkillTreeFromAnthropic(
  apiKey: string,
  userInput: string,
): Promise<GenerationResult> {
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a skill tree for learning: ${userInput}`,
        },
      ],
    });

    const firstBlock = message.content[0];
    if (!firstBlock || firstBlock.type !== "text") {
      return { ok: false, error: "AI returned no text content", status: 502 };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(firstBlock.text));
    } catch {
      return {
        ok: false,
        error: "Failed to parse AI response as JSON",
        status: 502,
      };
    }

    const validation = validateSkillsArray(parsed);
    if (!validation.ok) {
      return {
        ok: false,
        error: `AI returned invalid tree: ${validation.error}`,
        status: 502,
      };
    }

    return { ok: true, skills: validation.skills };
  } catch (err) {
    console.error("Anthropic call failed", err);
    return { ok: false, error: "Failed to generate skill tree", status: 500 };
  }
}
