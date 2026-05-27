import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const applicants = await prisma.applicant.findMany({
      orderBy: { appliedDate: "desc" },
      include: { jobPosting: { select: { title: true, department: true } } },
    });
    return NextResponse.json({ success: true, data: applicants } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/recruitment/applicants error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const applicant = await prisma.applicant.create({
      data: {
        jobPostingId: body.jobPostingId,
        name: body.name,
        email: body.email || "",
        phone: body.phone || "",
        source: body.source || "",
        stage: body.stage || "New",
        status: body.status || "New",
        rating: body.rating || 0,
        resume: body.resume || "",
        coverLetter: body.coverLetter || "",
        notes: body.notes || "",
        appliedDate: body.appliedDate ? new Date(body.appliedDate) : new Date(),
      },
    });
    return NextResponse.json({ success: true, data: applicant } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/recruitment/applicants error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
