# Hobbitify — agent context

Use this file (and `CLAUDE.md`) when working in this repo. **The React app expresses product UX; the Cloudflare Worker is the stable API and quota layer.** If you refactor or replace the frontend, keep calls aligned with the Worker contract below and with Supabase read patterns.

## What this project is

Hobbitify turns learning goals into RPG-style skill trees. Users authenticate with **Supabase Auth**, read their library from **Supabase** (anon key + user JWT, RLS), and use a **Cloudflare Worker** for AI generation, JSON upload, and tier enforcement (service role + RPCs).

## Hosting (Cloudflare)

| Piece | Role |
|-------|------|
| **Cloudflare Pages** | Static Vite build from `react-app/`; env vars are build-time `VITE_*`. |
| **Cloudflare Worker** | `worker/` — HTTP API, Anthropic, Turnstile, rate limits, JWT verify, Supabase admin RPCs. |
| **Supabase** | Postgres + Auth; not on Cloudflare. |

**CORS:** The Worker only allows `Origin` matching `ALLOWED_ORIGIN` in `worker/wrangler.toml`. Production Pages URL must match.

**Bindings:** Worker uses `RATE_LIMITER` (per-IP) and `nodejs_compat`. Secrets via `wrangler secret put`, not committed.

## Repository layout

| Path | Purpose |
|------|---------|
| `react-app/` | Vite + React + TypeScript + Tailwind. **Volatile** — UI may be heavily refactored. |
| `worker/` | Authoritative backend for writes that consume quotas or call Claude. See `worker/README.md`. |
| `supabase/migrations/` | Schema, RLS, RPCs (`0001_init.sql`, `0002_global_generation_cap.sql`). |

## Data flow (do not invert)

1. **Browser → Supabase (direct):** List/load/delete own skill trees, profile reads — **anon key + user session JWT**. RLS scopes to `auth.uid()`.
2. **Browser → Worker:** `POST /generate`, `POST /upload`, `GET /me` — **Bearer = Supabase access token** + **Turnstile token in JSON body** for POSTs. Worker uses **service role** for RPCs only inside the Worker.

## Worker HTTP API (contract for any new frontend)

Base URL: local `http://localhost:8787`, prod `VITE_BACKEND_URL` (Pages env → built into the client).

| Method | Path | Auth | Body | Success shape / notes |
|--------|------|------|------|------------------------|
| `GET` | `/healthz` | None | — | `{ "status": "ok" }` — public, no rate limit |
| `GET` | `/me` | `Authorization: Bearer <access_token>` | — | Tier counters — see **GET /me response** below |
| `POST` | `/generate` | Same | `{ "input": string, "turnstileToken": string, "force"?: boolean }` | Either **`{ similar: [...] }`** (no Claude call) or **`{ tree: { id, query, source, skills } }`** |
| `POST` | `/upload` | Same | `{ "skills": unknown, "turnstileToken": string, "query"?: string }` | **`{ tree: { id, query, source, skills } }`** — `query` optional title |

**Generate flow:**

- `input`: trimmed learning goal, **3–500** characters (Worker validates).
- `force: false` (default): runs **similarity search** (`pg_trgm`) on the user’s library. If matches ≥ threshold (**0.4**), returns **`similar`** only — no Anthropic call. Client should offer reuse vs generate anyway.
- `force: true`: skips similarity, calls **Claude**, then persists via `create_skill_tree` RPC.
- Global platform cap on AI generations may return **503** with an opaque busy message (see Worker).

**Upload:** `skills` must pass Worker validation (`worker/src/skills.ts`): array of objects with `Name`, `Description`, `Completion`, `Difficulty` (1–100), optional `Children` (string names); max **50** skills; names unique; all child names must exist. Optional `query` sets title; else title derived from root skill name.

### GET /me response

```json
{
  "tier": "string",
  "generated_count": 0,
  "total_count": 0,
  "generated_remaining": 0,
  "total_remaining": 0,
  "limits": { "total": 10, "generated": 5 }
}
```

### Similar match entry (`POST /generate` when not forcing)

`id`, `query`, `source` (`generated` | `uploaded`), `score` (number), `createdAt` (ISO string).

### Skill tree JSON (generated and uploaded)

Array of skills; each skill:

- `Name` (string, unique in tree)
- `Description` (string)
- `Completion` (string)
- `Difficulty` (number, 1–100)
- `Children` (optional string[] — child **names**)

Claude system prompt and model live in `worker/src/anthropic.ts` (`claude-haiku-4-5-20251001`). Output is validated with the same rules as upload.

### Error responses (typical)

JSON body often includes `{ "error": string }`; tier RPC failures may include `{ "error", "code" }`.

| HTTP | Meaning |
|------|---------|
| 400 | Bad JSON, missing fields, validation failed |
| 401 | Missing/invalid Bearer token |
| 403 | Turnstile failed, origin not allowed, or tier limit (`TIER_TOTAL_LIMIT`, `TIER_GENERATED_LIMIT`) |
| 404 | `/me` with no profile |
| 429 | Per-IP rate limit (Worker binding) |
| 503 | Global generation cap / platform busy (opaque message) |

## Free tier (enforced in DB + Worker)

- **10** skill trees total per user; **5** may be AI-generated; uploads count toward 10 but not toward the 5 AI cap.
- Enforced atomically in Postgres via `create_skill_tree` RPC (see `supabase/README.md`).

## Frontend integration reference (current code)

When rebuilding the UI, reimplement against:

- **Worker client:** `react-app/src/utils/apiUtils.ts` — `requestGenerate`, `requestUpload`, `fetchMe`, `checkBackendHealth`, `validateInput`.
- **Skill type:** `react-app/src/types/skill.ts`.
- **Parsing:** `react-app/src/utils/skillTreeUtils.ts` (`parseSkillTreeResponse`).

Env: `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY` — see `react-app/.env.example` and root `README.md` (set Supabase URL + anon key together for auth flows).

## Deploy reminders (Cloudflare)

- **Pages:** Root `react-app`, output **`dist`**, build `npm ci && npm run build` (or equivalent).
- **Worker:** `wrangler deploy --env production`; secrets and `ALLOWED_ORIGIN` / `SUPABASE_URL` in `wrangler.toml` per env.

## Further reading

- Root `README.md` — setup, smoke tests, blank-page troubleshooting for Pages.
- `worker/README.md` — env table and API summary.
- `supabase/README.md` — migrations and RPC behavior.
