import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. " +
      "Auth and library features will be disabled.",
  );
}

/** @supabase/supabase-js throws if URL or key is empty; use placeholders when auth is disabled. */
const PLACEHOLDER_URL = "https://placeholder.invalid";
const PLACEHOLDER_KEY = "anon-placeholder-not-used";

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : PLACEHOLDER_URL,
  isSupabaseConfigured ? supabaseAnonKey : PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
    },
  },
);

export interface SkillTreeRow {
  id: string;
  user_id: string;
  query: string;
  query_normalized: string;
  source: "generated" | "uploaded";
  skills: unknown;
  completed_skills: string[];
  created_at: string;
}

export interface ProfileRow {
  id: string;
  tier: string;
  generated_count: number;
  total_count: number;
  created_at: string;
}
