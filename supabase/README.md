# Supabase setup

Hobbitify stores users and skill trees in Supabase Postgres. This folder holds
the SQL migration; the runtime configuration lives in the Cloudflare Worker
and the React app.

## One-time setup

1. **Create a project** at <https://supabase.com>. Note the values you'll need:
   - `Project URL` -> `SUPABASE_URL` (Worker) and `VITE_SUPABASE_URL` (frontend)
   - `anon public` key -> `VITE_SUPABASE_ANON_KEY` (frontend)
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (Worker secret only;
     never expose to the browser)
   - `JWT secret` (Project Settings -> API -> JWT settings) ->
     `SUPABASE_JWT_SECRET` (Worker secret)
2. **Apply the migration.** Either:
   - Paste the contents of `migrations/0001_init.sql` into the Supabase SQL
     Editor and run it, or
   - Run `supabase db push` if you've linked the CLI.
3. **Auth providers.** In Authentication -> Providers:
   - Enable **Email** with "Email confirmations" off and "Email OTP" on (magic
     link flow).
   - Enable **Google** and supply OAuth credentials. Add your Pages URL to the
     allowed redirect URLs (e.g. `https://hobbitify.pages.dev/login`).
4. **Site URL / redirects.** Authentication -> URL Configuration:
   - Site URL: your production Pages URL.
   - Additional redirect URLs: `http://localhost:5173/login` for local dev.

## What the migration does

- Creates `public.profiles` (1:1 with `auth.users`) and `public.skill_trees`.
- Enables `pg_trgm` and a GIN trigram index on the normalized query text so
  similarity search is fast.
- Locks both tables down with Row Level Security so users can only see and
  delete their own rows.
- Auto-inserts a `profiles` row whenever a new user signs up.
- Defines two security-definer RPCs the Worker calls with the service role:
  - `create_skill_tree(...)` — atomic quota check + insert + counter bump.
    Raises `TIER_TOTAL_LIMIT` (10 items) or `TIER_GENERATED_LIMIT` (5 AI
    generations) on overflow.
  - `find_similar_trees(...)` — top 5 trigram matches above the threshold,
    scoped to a single user.

## Tier semantics

- `tier = 'free'`: at most **10 skill trees** in the library, of which at most
  **5 may be AI-generated**. Uploaded JSONs fill any of the remaining slots.
  Counts are lifetime, not rolling.
- Adding more tiers later only requires updating the limit checks in
  `create_skill_tree` (or replacing the literals with a `tier_limits` table
  lookup).
