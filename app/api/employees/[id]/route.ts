import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: emp } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const emp = await prisma.employee.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: emp, message: "Updated" } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" } satisfies ApiResponse);
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
