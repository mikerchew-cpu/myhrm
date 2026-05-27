import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, ClaimInput } from "@/lib/types";

export async function GET() {
  try {
    const claims = await prisma.claim.findMany({
      include: { employee: { select: { name: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: claims } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/claims error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ClaimInput = await req.json();
    const claim = await prisma.claim.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        date: new Date(body.date),
        fromLocation: body.fromLocation || "",
        toLocation: body.toLocation || "",
        distance: body.distance || 0,
        rate: body.rate || 0.6,
        amount: body.amount || 0,
        remarks: body.remarks || "",
        status: "Pending",
      },
    });
    return NextResponse.json({ success: true, data: claim, message: "Claim submitted" } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/claims error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
