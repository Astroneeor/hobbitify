import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
} from "jose";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

const encoder = new TextEncoder();

function supabaseIssuer(supabaseUrl: string): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  return `${base}/auth/v1`;
}

export interface SupabaseAuthEnv {
  SUPABASE_URL: string;
  SUPABASE_JWT_SECRET: string;
}

/**
 * Validates a Supabase-issued user access token.
 *
 * - **HS256**: legacy projects (shared JWT secret in dashboard).
 * - **ES256 / other asymmetric**: current Supabase default; verified via JWKS
 *   at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`.
 */
export async function verifySupabaseJwt(
  token: string,
  env: SupabaseAuthEnv,
): Promise<AuthenticatedUser> {
  if (!token) throw new Error("Missing token");

  const { SUPABASE_URL, SUPABASE_JWT_SECRET } = env;
  const issuer = supabaseIssuer(SUPABASE_URL);
  const header = decodeProtectedHeader(token);
  const alg = header.alg;

  let payload: JWTPayload;

  if (alg === "HS256") {
    if (!SUPABASE_JWT_SECRET) throw new Error("Missing JWT secret");
    ({ payload } = await jwtVerify(
      token,
      encoder.encode(SUPABASE_JWT_SECRET),
      { algorithms: ["HS256"] },
    ));
  } else {
    const base = SUPABASE_URL.replace(/\/+$/, "");
    const jwks = createRemoteJWKSet(
      new URL(`${base}/auth/v1/.well-known/jwks.json`),
    );
    ({ payload } = await jwtVerify(token, jwks, { issuer }));
  }

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) throw new Error("Invalid token: no sub");

  const role = typeof payload.role === "string" ? payload.role : undefined;
  if (role && role !== "authenticated") {
    throw new Error("Invalid token: wrong role");
  }

  const email =
    typeof payload.email === "string" ? payload.email : undefined;

  return { id: sub, email, role };
}

/**
 * Extracts a bearer token from the Authorization header, or returns null if
 * none is present.
 */
export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const captured = match?.[1];
  return captured ? captured.trim() : null;
}
