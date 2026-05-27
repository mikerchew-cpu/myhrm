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
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        interviewer: body.interviewer,
        type: body.type,
        mode: body.mode,
        date: body.date ? new Date(body.date) : null,
        duration: body.duration,
        feedback: body.feedback,
        rating: body.rating,
        status: body.status,
      },
    });
    return NextResponse.json({ success: true, data: interview } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT /api/recruitment/interviews/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    await prisma.interview.delete({ where: { id } });
    return NextResponse.json({ success: true } satisfies ApiResponse);
  } catch (error) {
    console.error("DELETE /api/recruitment/interviews/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
