import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const data = await prisma.jobChange.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const body = await req.json();
    const item = await prisma.jobChange.create({
      data: {
        employeeId: body.employeeId || "", employeeName: body.employeeName || "",
        changeType: body.changeType, previousValue: body.previousValue || "",
        newValue: body.newValue || "",
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        reason: body.reason || "", approvedBy: body.approvedBy || "", notes: body.notes || "",
      },
    });
    return NextResponse.json({ success: true, data: item } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
