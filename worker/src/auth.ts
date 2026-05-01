import { jwtVerify } from "jose";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

const encoder = new TextEncoder();

/**
 * Validates a Supabase-issued JWT (HS256, signed with the project's JWT
 * secret) and returns the authenticated user. Throws a generic Error on any
 * failure so callers can map a single 401 response.
 */
export async function verifySupabaseJwt(
  token: string,
  jwtSecret: string,
): Promise<AuthenticatedUser> {
  if (!token) throw new Error("Missing token");
  if (!jwtSecret) throw new Error("Missing JWT secret");

  const { payload } = await jwtVerify(token, encoder.encode(jwtSecret), {
    algorithms: ["HS256"],
  });

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) throw new Error("Invalid token: no sub");

  const role = typeof payload.role === "string" ? payload.role : undefined;
  if (role && role !== "authenticated") {
    // Reject anon / service tokens reaching the user-facing routes.
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
