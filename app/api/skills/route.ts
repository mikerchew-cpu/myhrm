import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: skills } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ success: false, error: "title and content are required" }, { status: 400 });
    }
    const skill = await prisma.skill.create({
      data: {
        title: body.title,
        department: body.department || "",
        content: body.content,
        filename: body.filename || "",
      },
    });
    return NextResponse.json({ success: true, data: skill, message: "Skill saved" } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    console.error("POST /api/skills error:", error);
    return NextResponse.json({ success: false, error: "Failed to create skill" }, { status: 500 });
  }
}
