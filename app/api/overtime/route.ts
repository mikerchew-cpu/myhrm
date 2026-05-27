import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const logs = await prisma.overtimeLog.findMany({
      include: { employee: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: logs } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const log = await prisma.overtimeLog.create({ data: body });
    return NextResponse.json({ success: true, data: log } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
