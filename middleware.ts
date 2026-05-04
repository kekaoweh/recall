import { NextRequest, NextResponse } from "next/server";

const COOKIE = "recall_owner";

function makeId(): string {
  const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const buf = new Uint8Array(16);
    c.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function middleware(req: NextRequest) {
  try {
    const existing = req.cookies.get(COOKIE)?.value;
    if (existing) return NextResponse.next();

    const fresh = makeId();

    const requestHeaders = new Headers(req.headers);
    const cookieHeader = requestHeaders.get("cookie");
    requestHeaders.set(
      "cookie",
      cookieHeader ? `${cookieHeader}; ${COOKIE}=${fresh}` : `${COOKIE}=${fresh}`,
    );

    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.cookies.set({
      name: COOKIE,
      value: fresh,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 5,
    });
    return res;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next|favicon\\.svg|.*\\..*).*)"],
};
