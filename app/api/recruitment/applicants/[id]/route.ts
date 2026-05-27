import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: { jobPosting: true, interviews: { orderBy: { date: "desc" } } },
    });
    if (!applicant) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: applicant } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/recruitment/applicants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        stage: body.stage,
        status: body.status,
        rating: body.rating,
        resume: body.resume,
        coverLetter: body.coverLetter,
        notes: body.notes,
      },
    });
    return NextResponse.json({ success: true, data: applicant } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT /api/recruitment/applicants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    await prisma.applicant.delete({ where: { id } });
    return NextResponse.json({ success: true } satisfies ApiResponse);
  } catch (error) {
    console.error("DELETE /api/recruitment/applicants/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
