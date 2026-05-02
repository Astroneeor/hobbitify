# Hobbitify (Claude Code)

Quick orientation for Claude. **Full detail:** [AGENTS.md](./AGENTS.md).

## One-line summary

**Cloudflare Pages** (Vite React in `react-app/`) + **Cloudflare Worker** (`worker/`) + **Supabase** (Auth + Postgres RLS). The Worker owns Claude calls, Turnstile, quotas, and similarity checks; the browser talks to Supabase directly for library CRUD reads.

## If you are refactoring the frontend

Treat **`worker/src/index.ts`** and **`react-app/src/utils/apiUtils.ts`** as the integration surface. Do not change Worker request/response shapes without updating the Worker and any clients. New UI should still:

- Send **`Authorization: Bearer <Supabase access_token>`** to the Worker.
- Include **`turnstileToken`** in **`POST /generate`** and **`POST /upload`** bodies.
- Handle **`{ similar: [...] }` vs `{ tree: {...} }`** from **`POST /generate`** when `force` is false.

## Worker routes (memory)

| Route | Notes |
|-------|--------|
| `GET /healthz` | Public `{ status: "ok" }` |
| `GET /me` | Quota / tier counters |
| `POST /generate` | Body: `input`, `turnstileToken`, optional `force` |
| `POST /upload` | Body: `skills`, `turnstileToken`, optional `query` |

Input length **3–500**. Skills schema and Claude model: `worker/src/skills.ts`, `worker/src/anthropic.ts`.

## Cloudflare

Worker: `wrangler.toml`, secrets via `wrangler secret put`. Pages build from `react-app` with output directory **`dist`** and `VITE_*` env vars.

## Repo pointers

- **AGENTS.md** — API tables, errors, tier limits, data-flow diagram in prose.
- **README.md** — local dev, deploy, troubleshooting.
- **worker/README.md** — environment variables.
