import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const APP_SECRET = process.env.APP_SECRET || "";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "skippy2026";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === LOGIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("sb-auth", APP_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
