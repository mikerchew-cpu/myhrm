import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const records = await prisma.attendance.findMany({
      include: { employee: { select: { name: true, employeeId: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: records } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const record = await prisma.attendance.create({ data: body });
    return NextResponse.json({ success: true, data: record } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
