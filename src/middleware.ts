import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_SECRET = process.env.APP_SECRET || "";
const SKIPPY_API_KEY = process.env.SKIPPY_API_KEY || "";
const PUBLIC_PATHS = ["/api/auth", "/login", "/manifest.json", "/icon"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Check for auth cookie or header
  const authCookie = request.cookies.get("sb-auth")?.value;
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");
  const apiKey = request.headers.get("x-api-key");
  
  // Allow if valid session cookie
  if (authCookie === APP_SECRET) {
    return NextResponse.next();
  }
  
  // Allow if valid bearer token (APP_SECRET)
  if (authHeader === APP_SECRET) {
    return NextResponse.next();
  }
  
  // Allow if valid Skippy API key (for automated sync)
  if (apiKey === SKIPPY_API_KEY && SKIPPY_API_KEY !== "") {
    return NextResponse.next();
  }
  
  // Redirect to login if not authenticated (non-API routes)
  if (!pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Return 401 for API routes
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
