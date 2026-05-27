import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const doc = await prisma.document.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        department: body.department,
        employeeId: body.employeeId,
        fileUrl: body.fileUrl,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        status: body.status,
        notes: body.notes,
      },
    });
    return NextResponse.json({ success: true, data: doc } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT /api/documents/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true } satisfies ApiResponse);
  } catch (error) {
    console.error("DELETE /api/documents/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
