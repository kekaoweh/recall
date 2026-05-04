import { cookies } from "next/headers";

const COOKIE_NAME = "recall_owner";

/**
 * Returns the per-browser owner key set by middleware.
 * Middleware guarantees the cookie exists on every request, so this never returns null
 * in normal flow. The fallback is defensive.
 */
export async function getOwnerKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME);
  if (existing?.value) return existing.value;
  // Defensive fallback: should never hit because middleware sets the cookie.
  return "anonymous";
}
