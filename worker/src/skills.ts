export interface SkillRecord {
  Name: string;
  Description: string;
  Completion: string;
  Children?: string[];
  Difficulty: number;
}

export type SkillsValidation =
  | { ok: true; skills: SkillRecord[] }
  | { ok: false; error: string };

const MAX_SKILLS = 50;

/**
 * Validates that an unknown value matches the expected skill-tree shape.
 * Used by `/upload` to refuse anything that wouldn't render correctly.
 */
export function validateSkillsArray(value: unknown): SkillsValidation {
  if (!Array.isArray(value)) {
    return { ok: false, error: "Expected a JSON array of skills" };
  }
  if (value.length === 0) {
    return { ok: false, error: "Skill tree must contain at least one skill" };
  }
  if (value.length > MAX_SKILLS) {
    return {
      ok: false,
      error: `Skill tree has too many entries (max ${MAX_SKILLS})`,
    };
  }

  const seenNames = new Set<string>();
  const skills: SkillRecord[] = [];

  for (let i = 0; i < value.length; i++) {
    const raw = value[i];
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: `Skill #${i + 1} is not an object` };
    }
    const r = raw as Record<string, unknown>;

    if (typeof r.Name !== "string" || r.Name.trim() === "") {
      return { ok: false, error: `Skill #${i + 1} is missing Name` };
    }
    if (seenNames.has(r.Name)) {
      return { ok: false, error: `Duplicate skill name: ${r.Name}` };
    }
    seenNames.add(r.Name);

    if (typeof r.Description !== "string") {
      return { ok: false, error: `Skill ${r.Name} is missing Description` };
    }
    if (typeof r.Completion !== "string") {
      return { ok: false, error: `Skill ${r.Name} is missing Completion` };
    }
    if (
      typeof r.Difficulty !== "number" ||
      !Number.isFinite(r.Difficulty) ||
      r.Difficulty < 1 ||
      r.Difficulty > 100
    ) {
      return {
        ok: false,
        error: `Skill ${r.Name} has invalid Difficulty (must be 1-100)`,
      };
    }

    let children: string[] | undefined;
    if (r.Children !== undefined) {
      if (!Array.isArray(r.Children)) {
        return {
          ok: false,
          error: `Skill ${r.Name} has invalid Children (must be array)`,
        };
      }
      if (!r.Children.every((c) => typeof c === "string")) {
        return {
          ok: false,
          error: `Skill ${r.Name} Children must all be strings`,
        };
      }
      children = r.Children as string[];
    }

    skills.push({
      Name: r.Name,
      Description: r.Description,
      Completion: r.Completion,
      Difficulty: r.Difficulty,
      Children: children,
    });
  }

  // Make sure every referenced child exists.
  for (const skill of skills) {
    for (const child of skill.Children ?? []) {
      if (!seenNames.has(child)) {
        return {
          ok: false,
          error: `Skill ${skill.Name} references unknown child: ${child}`,
        };
      }
    }
  }

  return { ok: true, skills };
}

export function normalizeQuery(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function deriveTitleFromSkills(skills: SkillRecord[]): string {
  const root = skills.find(
    (s) => !skills.some((other) => other.Children?.includes(s.Name)),
  );
  return root?.Name ?? skills[0]?.Name ?? "Untitled tree";
}
