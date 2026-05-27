import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applicants: true } } },
    });
    return NextResponse.json({ success: true, data: jobs } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/recruitment/jobs error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const job = await prisma.jobPosting.create({
      data: {
        title: body.title,
        department: body.department || "",
        location: body.location || "",
        type: body.type || "Permanent",
        salaryMin: body.salaryMin || 0,
        salaryMax: body.salaryMax || 0,
        description: body.description || "",
        requirements: body.requirements || "",
        status: body.status || "Draft",
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
      },
    });
    return NextResponse.json({ success: true, data: job } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/recruitment/jobs error:", error);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
