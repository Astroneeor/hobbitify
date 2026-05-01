const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
}

export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (remoteIp) form.append("remoteip", remoteIp);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
