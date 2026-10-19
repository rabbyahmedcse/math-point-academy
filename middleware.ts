import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * OPTIMISTIC check only (cookie presence) so anonymous users bounce quickly.
 * Real authorization (session validity, status, role, permissions) is enforced
 * on the server in layouts, pages and every server action — never rely on this.
 */
export function middleware(req: NextRequest) {
  if (!getSessionCookie(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
