import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const approvals = await prisma.approval.findMany({
      include: { employee: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: approvals } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const appr = await prisma.approval.create({ data: body });
    return NextResponse.json({ success: true, data: appr } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
