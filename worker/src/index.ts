import { generateSkillTreeFromAnthropic } from "./anthropic";
import { readBearerToken, verifySupabaseJwt, type AuthenticatedUser } from "./auth";
import { corsHeaders, jsonResponse } from "./cors";
import {
  countGlobalGeneratedTrees,
  createSkillTree,
  fetchProfile,
  findSimilarTrees,
  makeAdminClient,
} from "./supabase";
import {
  deriveTitleFromSkills,
  normalizeQuery,
  validateSkillsArray,
  type SkillRecord,
} from "./skills";
import { verifyTurnstile } from "./turnstile";
import type { SupabaseClient } from "@supabase/supabase-js";

interface Env {
  ANTHROPIC_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  ALLOWED_ORIGIN: string;
  SUPABASE_URL: string;
  SUPABASE_JWT_SECRET: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RATE_LIMITER: RateLimit;
}

const MIN_INPUT = 3;
const MAX_INPUT = 500;
const MAX_TIER_TOTAL = 10;
const MAX_TIER_GENERATED = 5;
/** All users combined; must match `0002_global_generation_cap.sql`. */
const MAX_GLOBAL_AI_GENERATIONS = 10;

interface GenerateBody {
  input?: unknown;
  turnstileToken?: unknown;
  force?: unknown;
}

interface UploadBody {
  query?: unknown;
  skills?: unknown;
  turnstileToken?: unknown;
}

/**
 * Opaque response when the platform-wide generation budget is exhausted.
 * Does not reveal limits or caps to the client.
 */
function opaquePlatformBusyResponse(origin: string): Response {
  return jsonResponse(
    {
      error:
        "We're handling a lot of activity right now. Please try again in a little while.",
    },
    503,
    origin,
  );
}

/**
 * Maps a `create_skill_tree` RPC failure to an HTTP response.
 */
function tierErrorResponse(
  code: string,
  origin: string,
): Response {
  if (code === "GLOBAL_GENERATION_CAP") {
    return opaquePlatformBusyResponse(origin);
  }
  if (code === "TIER_TOTAL_LIMIT") {
    return jsonResponse(
      {
        error:
          `You've hit the free-tier library cap of ${MAX_TIER_TOTAL} items. Delete one to add another.`,
        code,
      },
      403,
      origin,
    );
  }
  if (code === "TIER_GENERATED_LIMIT") {
    return jsonResponse(
      {
        error:
          `You've used all ${MAX_TIER_GENERATED} of your free AI generations. You can still upload JSONs.`,
        code,
      },
      403,
      origin,
    );
  }
  return jsonResponse({ error: "Could not save skill tree" }, 500, origin);
}

/**
 * Per-IP rate limit. Returns a Response if the limit was hit, otherwise null.
 */
async function rateLimit(
  env: Env,
  request: Request,
  origin: string,
): Promise<Response | null> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "anonymous";
  const { success } = await env.RATE_LIMITER.limit({ key: ip });
  if (!success) {
    return jsonResponse(
      { error: "Rate limit exceeded. Try again in a minute." },
      429,
      origin,
    );
  }
  return null;
}

/**
 * Resolves the authenticated user, or returns a 401 response.
 */
async function authenticate(
  request: Request,
  env: Env,
  origin: string,
): Promise<{ user: AuthenticatedUser } | { response: Response }> {
  const token = readBearerToken(request);
  if (!token) {
    return {
      response: jsonResponse({ error: "Authentication required" }, 401, origin),
    };
  }
  try {
    const user = await verifySupabaseJwt(token, {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_JWT_SECRET: env.SUPABASE_JWT_SECRET,
    });
    return { user };
  } catch {
    return {
      response: jsonResponse({ error: "Invalid or expired session" }, 401, origin),
    };
  }
}

/**
 * Reads JSON body, returning the parsed body or a 400 response.
 */
async function readJsonBody<T>(
  request: Request,
  origin: string,
): Promise<{ body: T } | { response: Response }> {
  try {
    const body = (await request.json()) as T;
    return { body };
  } catch {
    return {
      response: jsonResponse({ error: "Invalid JSON body" }, 400, origin),
    };
  }
}

async function handleGenerate(
  request: Request,
  env: Env,
  origin: string,
  user: AuthenticatedUser,
  admin: SupabaseClient,
): Promise<Response> {
  const parsed = await readJsonBody<GenerateBody>(request, origin);
  if ("response" in parsed) return parsed.response;
  const body = parsed.body;

  if (typeof body.input !== "string") {
    return jsonResponse({ error: "Missing 'input' field" }, 400, origin);
  }
  const userInput = body.input.trim();
  if (userInput.length < MIN_INPUT) {
    return jsonResponse(
      { error: `Input must be at least ${MIN_INPUT} characters` },
      400,
      origin,
    );
  }
  if (userInput.length > MAX_INPUT) {
    return jsonResponse(
      { error: `Input must be less than ${MAX_INPUT} characters` },
      400,
      origin,
    );
  }

  if (typeof body.turnstileToken !== "string" || body.turnstileToken === "") {
    return jsonResponse({ error: "Missing Turnstile token" }, 400, origin);
  }

  const clientIp = request.headers.get("CF-Connecting-IP");
  const turnstileOk = await verifyTurnstile(
    body.turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    clientIp,
  );
  if (!turnstileOk) {
    return jsonResponse(
      { error: "Turnstile verification failed" },
      403,
      origin,
    );
  }

  const force = body.force === true;
  const queryNormalized = normalizeQuery(userInput);

  if (!force) {
    const matches = await findSimilarTrees(admin, user.id, queryNormalized);
    if (matches.length > 0) {
      return jsonResponse(
        {
          similar: matches.map((m) => ({
            id: m.id,
            query: m.query,
            source: m.source,
            score: Number(m.score.toFixed(3)),
            createdAt: m.created_at,
          })),
        },
        200,
        origin,
      );
    }
  }

  if (
    (await countGlobalGeneratedTrees(admin)) >= MAX_GLOBAL_AI_GENERATIONS
  ) {
    return opaquePlatformBusyResponse(origin);
  }

  const result = await generateSkillTreeFromAnthropic(
    env.ANTHROPIC_API_KEY,
    userInput,
  );
  if (!result.ok) {
    return jsonResponse({ error: result.error }, result.status, origin);
  }

  const insert = await createSkillTree(admin, {
    userId: user.id,
    query: userInput,
    queryNormalized,
    source: "generated",
    skills: result.skills,
  });
  if (!insert.ok) {
    return tierErrorResponse(insert.code, origin);
  }

  return jsonResponse(
    {
      tree: {
        id: insert.id,
        query: userInput,
        source: "generated" as const,
        skills: result.skills,
      },
    },
    200,
    origin,
  );
}

async function handleUpload(
  request: Request,
  env: Env,
  origin: string,
  user: AuthenticatedUser,
  admin: SupabaseClient,
): Promise<Response> {
  const parsed = await readJsonBody<UploadBody>(request, origin);
  if ("response" in parsed) return parsed.response;
  const body = parsed.body;

  if (typeof body.turnstileToken !== "string" || body.turnstileToken === "") {
    return jsonResponse({ error: "Missing Turnstile token" }, 400, origin);
  }
  const clientIp = request.headers.get("CF-Connecting-IP");
  const turnstileOk = await verifyTurnstile(
    body.turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    clientIp,
  );
  if (!turnstileOk) {
    return jsonResponse(
      { error: "Turnstile verification failed" },
      403,
      origin,
    );
  }

  const validation = validateSkillsArray(body.skills);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400, origin);
  }

  let title: string;
  if (typeof body.query === "string" && body.query.trim() !== "") {
    title = body.query.trim();
  } else {
    title = deriveTitleFromSkills(validation.skills);
  }
  if (title.length > MAX_INPUT) title = title.slice(0, MAX_INPUT);

  const queryNormalized = normalizeQuery(title);

  const insert = await createSkillTree(admin, {
    userId: user.id,
    query: title,
    queryNormalized,
    source: "uploaded",
    skills: validation.skills as SkillRecord[],
  });
  if (!insert.ok) {
    return tierErrorResponse(insert.code, origin);
  }

  return jsonResponse(
    {
      tree: {
        id: insert.id,
        query: title,
        source: "uploaded" as const,
        skills: validation.skills,
      },
    },
    200,
    origin,
  );
}

async function handleMe(
  origin: string,
  user: AuthenticatedUser,
  admin: SupabaseClient,
): Promise<Response> {
  const profile = await fetchProfile(admin, user.id);
  if (!profile) {
    return jsonResponse({ error: "Profile not found" }, 404, origin);
  }
  return jsonResponse(
    {
      tier: profile.tier,
      generated_count: profile.generated_count,
      total_count: profile.total_count,
      generated_remaining: Math.max(
        MAX_TIER_GENERATED - profile.generated_count,
        0,
      ),
      total_remaining: Math.max(MAX_TIER_TOTAL - profile.total_count, 0),
      limits: {
        total: MAX_TIER_TOTAL,
        generated: MAX_TIER_GENERATED,
      },
    },
    200,
    origin,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN;
    const url = new URL(request.url);

    // CORS preflight first.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Public liveness probe — no auth, no rate limit.
    if (request.method === "GET" && url.pathname === "/healthz") {
      return jsonResponse({ status: "ok" }, 200, origin);
    }

    // Origin allowlist for everything beyond healthz/preflight.
    const requestOrigin = request.headers.get("Origin");
    if (requestOrigin && requestOrigin !== origin) {
      return jsonResponse({ error: "Origin not allowed" }, 403, origin);
    }

    // Per-IP rate limit on the privileged routes.
    const limited = await rateLimit(env, request, origin);
    if (limited) return limited;

    const auth = await authenticate(request, env, origin);
    if ("response" in auth) return auth.response;
    const { user } = auth;

    const admin = makeAdminClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    if (request.method === "POST" && url.pathname === "/generate") {
      return handleGenerate(request, env, origin, user, admin);
    }
    if (request.method === "POST" && url.pathname === "/upload") {
      return handleUpload(request, env, origin, user, admin);
    }
    if (request.method === "GET" && url.pathname === "/me") {
      return handleMe(origin, user, admin);
    }

    return jsonResponse({ error: "Not found" }, 404, origin);
  },
} satisfies ExportedHandler<Env>;
