import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const records = await prisma.payrollRecord.findMany({
      include: { employee: { select: { name: true, employeeId: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    return NextResponse.json({ success: true, data: records } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
