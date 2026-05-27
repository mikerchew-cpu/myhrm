import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, UserInput } from "@/lib/types";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: users } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: UserInput = await req.json();
    if (!body.username || !body.email || !body.givenName || !body.surname) {
      return NextResponse.json({ success: false, error: "username, email, givenName, and surname are required" }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: body.username }, { email: body.email }] },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "Username or email already exists" }, { status: 409 });
    }
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        givenName: body.givenName,
        surname: body.surname,
        role: body.role || "Viewer",
        department: body.department || "",
        hierarchyLevel: body.hierarchyLevel ?? 1,
        approvalLevel: body.approvalLevel ?? 1,
        status: body.status || "Active",
      },
    });
    return NextResponse.json({ success: true, data: user, message: "User created" } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}
