# hobbitify-worker

Cloudflare Worker for Hobbitify. It verifies Supabase JWTs, enforces free-tier
quotas in Postgres (via Supabase RPCs), checks Turnstile, rate-limits by IP,
runs **pg_trgm** similarity search before burning an Anthropic call, and
persists trees with the service role.

## Environment variables

| Name | Where | Purpose |
|------|-------|---------|
| `ALLOWED_ORIGIN` | `wrangler.toml` `[vars]` | CORS allowlist (your Pages URL). |
| `SUPABASE_URL` | `wrangler.toml` `[vars]` | Supabase project URL. |
| `ANTHROPIC_API_KEY` | `wrangler secret put` | Claude API. |
| `TURNSTILE_SECRET_KEY` | `wrangler secret put` | Turnstile `siteverify`. |
| `SUPABASE_JWT_SECRET` | `wrangler secret put` | JWT HS256 secret from Supabase (API settings). |
| `SUPABASE_SERVICE_ROLE_KEY` | `wrangler secret put` | Calls RPCs; never expose to the browser. |

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars
# Fill ANTHROPIC_API_KEY, SUPABASE_JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY,
# TURNSTILE_SECRET_KEY (sandbox: 1x0000...AA always passes).
# Set top-level SUPABASE_URL in wrangler.toml to your project URL.
npm run dev   # http://localhost:8787
```

Point the React app at `http://localhost:8787` via `VITE_BACKEND_URL` in
`react-app/.env.local`.

## Deploy

```bash
wrangler login
wrangler secret put ANTHROPIC_API_KEY        --env production
wrangler secret put TURNSTILE_SECRET_KEY     --env production
wrangler secret put SUPABASE_JWT_SECRET      --env production
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
# Edit [env.production.vars] ALLOWED_ORIGIN + SUPABASE_URL in wrangler.toml
npm run deploy -- --env production
```

## HTTP API

All write routes require `Authorization: Bearer <supabase_access_token>` and a
Turnstile token in the JSON body.

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/healthz` | — | `{ "status": "ok" }` (public) |
| `GET` | `/me` | — | Tier counters + remaining quota |
| `POST` | `/generate` | `{ "input", "turnstileToken", "force"?: boolean }` | `{ similar: [...] }` or `{ tree: { id, query, source, skills } }` |
| `POST` | `/upload` | `{ "skills", "turnstileToken", "query"?: string }` | `{ tree: { id, query, source, skills } }` |

Similarity matches are returned when `force` is false and `pg_trgm` score ≥ 0.4
for the user's own library. The browser then lets the user reuse a tree or call
again with `force: true`.

## Security

- CORS locked to `ALLOWED_ORIGIN`.
- Turnstile verified with client IP before Anthropic or quota-consuming RPCs.
- Rate limiting binding (see `wrangler.toml`, default 20 req / 60s / IP).
- Service role used only inside the Worker; end users never see it.
- Set an Anthropic **monthly spend cap** in the Anthropic console.
