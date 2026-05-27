import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const interviews = await prisma.interview.findMany({
      orderBy: { date: "desc" },
      include: {
        applicant: { select: { name: true } },
        jobPosting: { select: { title: true } },
      },
    });
    return NextResponse.json({ success: true, data: interviews } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/recruitment/interviews error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const interview = await prisma.interview.create({
      data: {
        applicantId: body.applicantId,
        jobPostingId: body.jobPostingId,
        interviewer: body.interviewer || "",
        type: body.type || "HR",
        mode: body.mode || "Video",
        date: body.date ? new Date(body.date) : null,
        duration: body.duration || 60,
        feedback: body.feedback || "",
        rating: body.rating || 0,
        status: body.status || "Scheduled",
      },
    });
    return NextResponse.json({ success: true, data: interview } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/recruitment/interviews error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
