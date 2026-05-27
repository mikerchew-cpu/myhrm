import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const docs = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: docs } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const doc = await prisma.document.create({
      data: {
        title: body.title,
        type: body.type || "",
        department: body.department || "",
        employeeId: body.employeeId || "",
        fileUrl: body.fileUrl || "",
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        status: body.status || "Active",
        notes: body.notes || "",
      },
    });
    return NextResponse.json({ success: true, data: doc } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
