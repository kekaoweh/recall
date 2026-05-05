import { cookies } from "next/headers";

const COOKIE_NAME = "recall_owner";
const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

function makeId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Read the per-browser owner cookie. Returns "anonymous" if not yet set.
 * Safe to call from server components OR route handlers.
 */
export async function getOwnerKey(): Promise<string> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? "anonymous";
}

/**
 * Read or create the owner cookie. ONLY safe to call from route handlers
 * or Server Actions — server components can't write cookies. Returns the
 * stable per-browser ID.
 */
export async function ensureOwnerKey(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) return existing;
  const fresh = makeId();
  jar.set(COOKIE_NAME, fresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: FIVE_YEARS,
  });
  return fresh;
}
