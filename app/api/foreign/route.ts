import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const workers = await prisma.foreignWorker.findMany({
      include: { employee: { select: { name: true, employeeId: true } } },
      orderBy: { permitExpiry: "asc" },
    });
    return NextResponse.json({ success: true, data: workers } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const worker = await prisma.foreignWorker.create({ data: body });
    return NextResponse.json({ success: true, data: worker } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
