import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, LeaveInput } from "@/lib/types";

export async function GET() {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      include: { employee: { select: { name: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: leaves } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: LeaveInput = await req.json();
    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        halfDay: body.halfDay || "Full day",
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        reason: body.reason || "",
        status: "Pending",
      },
    });
    return NextResponse.json({ success: true, data: leave, message: "Leave submitted" } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
