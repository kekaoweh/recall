import { NextRequest, NextResponse } from "next/server";

const COOKIE = "recall_owner";

// Minimal middleware: ensure every visitor has a stable cookie.
// Cookie is set on the response only — server components see it from
// the next request onward. Safe across Edge and Node runtimes.
export function middleware(req: NextRequest) {
  if (req.cookies.has(COOKIE)) return NextResponse.next();

  const res = NextResponse.next();
  const id = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.()
    ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;

  res.cookies.set(COOKIE, id, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365 * 5,
  });
  return res;
}

export const config = {
  matcher: "/((?!_next|api/_next|favicon\\.svg).*)",
};
