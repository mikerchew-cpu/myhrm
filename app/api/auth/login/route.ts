import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    if (user.status !== "Active") {
      return NextResponse.json({ success: false, error: "Account is inactive" }, { status: 403 });
    }
    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      givenName: user.givenName,
      surname: user.surname,
      role: user.role,
    };
    const token = await createSession(sessionUser);
    const res = NextResponse.json({ success: true, data: sessionUser } satisfies ApiResponse);
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 });
  }
}
