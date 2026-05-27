import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const submissions = await prisma.eSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, data: submissions } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/e-submissions error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
