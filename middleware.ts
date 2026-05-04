import { NextRequest, NextResponse } from "next/server";

const COOKIE = "recall_owner";

// Ensure every visitor has a stable owner cookie before any server component or
// route handler runs. Setting cookies in server components isn't allowed, so we
// do it here once.
export function middleware(req: NextRequest) {
  const existing = req.cookies.get(COOKIE)?.value;
  if (existing) return NextResponse.next();

  // randomUUID isn't available in edge by default in older runtimes; use crypto.randomUUID
  const fresh = crypto.randomUUID();
  const res = NextResponse.next();
  res.cookies.set(COOKIE, fresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 5,
  });
  // Mirror into request so this same request can read it.
  req.cookies.set(COOKIE, fresh);
  return res;
}

export const config = {
  matcher: ["/((?!_next/|favicon|.*\\.svg$|.*\\.png$|.*\\.ico$).*)"],
};
