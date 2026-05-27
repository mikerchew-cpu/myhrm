import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const data = await prisma.training.findMany({ orderBy: { createdAt: "desc" } });
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
    const item = await prisma.training.create({
      data: {
        title: body.title, provider: body.provider || "", type: body.type || "",
        cost: body.cost || 0, employeeId: body.employeeId || "", employeeName: body.employeeName || "",
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "Planned", certification: body.certification || "", notes: body.notes || "",
      },
    });
    return NextResponse.json({ success: true, data: item } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
