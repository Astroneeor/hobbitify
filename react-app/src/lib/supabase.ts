import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. " +
      "Auth and library features will be disabled.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export interface SkillTreeRow {
  id: string;
  user_id: string;
  query: string;
  query_normalized: string;
  source: "generated" | "uploaded";
  skills: unknown;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  tier: string;
  generated_count: number;
  total_count: number;
  created_at: string;
}
