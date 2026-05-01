import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SkillRecord } from "./skills";

export interface SupabaseProfile {
  id: string;
  tier: string;
  generated_count: number;
  total_count: number;
  created_at: string;
}

export interface SimilarTreeRow {
  id: string;
  query: string;
  source: "generated" | "uploaded";
  score: number;
  created_at: string;
}

export type CreateTreeResult =
  | { ok: true; id: string }
  | {
      ok: false;
      code:
        | "TIER_TOTAL_LIMIT"
        | "TIER_GENERATED_LIMIT"
        | "GLOBAL_GENERATION_CAP"
        | "PROFILE_MISSING"
        | "INVALID_SOURCE"
        | "UNKNOWN";
      message: string;
    };

const TIER_CODES = new Set([
  "TIER_TOTAL_LIMIT",
  "TIER_GENERATED_LIMIT",
  "GLOBAL_GENERATION_CAP",
  "PROFILE_MISSING",
  "INVALID_SOURCE",
]);

export function makeAdminClient(
  url: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function findSimilarTrees(
  client: SupabaseClient,
  userId: string,
  queryNormalized: string,
  threshold = 0.4,
): Promise<SimilarTreeRow[]> {
  const { data, error } = await client.rpc("find_similar_trees", {
    p_user: userId,
    p_query_normalized: queryNormalized,
    p_threshold: threshold,
  });
  if (error) {
    console.error("find_similar_trees failed", error);
    return [];
  }
  return (data ?? []) as SimilarTreeRow[];
}

export async function createSkillTree(
  client: SupabaseClient,
  args: {
    userId: string;
    query: string;
    queryNormalized: string;
    source: "generated" | "uploaded";
    skills: SkillRecord[];
  },
): Promise<CreateTreeResult> {
  const { data, error } = await client.rpc("create_skill_tree", {
    p_user: args.userId,
    p_query: args.query,
    p_query_normalized: args.queryNormalized,
    p_source: args.source,
    p_skills: args.skills,
  });

  if (!error) {
    return { ok: true, id: data as string };
  }

  // The RPC raises P0001 with the upper-snake-case code as the message.
  const message = error.message ?? "";
  for (const code of TIER_CODES) {
    if (message.includes(code)) {
      return {
        ok: false,
        code: code as
          | "TIER_TOTAL_LIMIT"
          | "TIER_GENERATED_LIMIT"
          | "GLOBAL_GENERATION_CAP"
          | "PROFILE_MISSING"
          | "INVALID_SOURCE",
        message: code,
      };
    }
  }
  console.error("create_skill_tree failed", error);
  return { ok: false, code: "UNKNOWN", message: "Database error" };
}

/** Count of AI-generated trees across all users (for pre-check before LLM). */
export async function countGlobalGeneratedTrees(
  client: SupabaseClient,
): Promise<number> {
  const { count, error } = await client
    .from("skill_trees")
    .select("*", { count: "exact", head: true })
    .eq("source", "generated");
  if (error) {
    console.error("countGlobalGeneratedTrees failed", error);
    return 0;
  }
  return count ?? 0;
}

export async function fetchProfile(
  client: SupabaseClient,
  userId: string,
): Promise<SupabaseProfile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, tier, generated_count, total_count, created_at")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("fetchProfile failed", error);
    return null;
  }
  return data as SupabaseProfile;
}
