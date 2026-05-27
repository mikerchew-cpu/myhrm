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
    const data: any = {
      title: body.title, content: body.content, category: body.category,
      priority: body.priority, author: body.author, status: body.status,
    };
    if (body.publishDate) data.publishDate = new Date(body.publishDate);
    if (body.expiryDate) data.expiryDate = new Date(body.expiryDate);
    else data.expiryDate = null;
    const item = await prisma.announcement.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: item } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true } satisfies ApiResponse);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
