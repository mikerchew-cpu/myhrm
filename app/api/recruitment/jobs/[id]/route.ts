import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        applicants: { orderBy: { appliedDate: "desc" } },
        interviews: { include: { applicant: { select: { name: true } } }, orderBy: { date: "desc" } },
      },
    });
    if (!job) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: job } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/recruitment/jobs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        title: body.title,
        department: body.department,
        location: body.location,
        type: body.type,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        description: body.description,
        requirements: body.requirements,
        status: body.status,
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
      },
    });
    return NextResponse.json({ success: true, data: job } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT /api/recruitment/jobs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    await prisma.jobPosting.delete({ where: { id } });
    return NextResponse.json({ success: true } satisfies ApiResponse);
  } catch (error) {
    console.error("DELETE /api/recruitment/jobs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
