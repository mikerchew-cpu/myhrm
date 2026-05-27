import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const data = await prisma.asset.findMany({ orderBy: { createdAt: "desc" } });
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
    const item = await prisma.asset.create({
      data: {
        name: body.name, type: body.type || "", serialNo: body.serialNo || "",
        employeeId: body.employeeId || "", employeeName: body.employeeName || "",
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice || 0,
        status: body.status || "Assigned", notes: body.notes || "",
      },
    });
    return NextResponse.json({ success: true, data: item } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
