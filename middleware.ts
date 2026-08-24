// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // Public paths
  const publicPaths = ["/", "/forgot-password", "/reset-password"];
  const isPublicPath = publicPaths.some((path) => pathname === path);

  // If no token and trying to access protected route, redirect to login
  if (
    !token &&
    !isPublicPath &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If token exists and trying to access login page, redirect to events
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
