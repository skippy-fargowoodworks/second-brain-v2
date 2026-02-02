import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_SECRET = process.env.APP_SECRET || "";
const PUBLIC_PATHS = ["/api/auth", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Check for auth cookie or header
  const authCookie = request.cookies.get("sb-auth")?.value;
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
  
  if (authCookie === APP_SECRET || authHeader === APP_SECRET) {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated
  if (!pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Return 401 for API routes
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
