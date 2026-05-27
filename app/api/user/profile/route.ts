import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { givenName, surname, email, password } = await req.json();

    const updateData: Record<string, string> = {};
    if (givenName) updateData.givenName = givenName.trim();
    if (surname) updateData.surname = surname.trim();
    if (email) updateData.email = email.trim();
    if (password) updateData.passwordHash = await hashPassword(password);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: "Profile updated" } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
