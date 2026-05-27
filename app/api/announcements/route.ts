import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const data = await prisma.announcement.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, data } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const body = await req.json();
    const item = await prisma.announcement.create({
      data: {
        title: body.title, content: body.content || "", category: body.category || "General",
        priority: body.priority || "Normal", author: body.author || "",
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        status: body.status || "Active",
      },
    });
    return NextResponse.json({ success: true, data: item } satisfies ApiResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
