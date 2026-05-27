import { NextRequest, NextResponse } from "next/server";
import { testConnection } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, endpoint } = await req.json();
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider is required" }, { status: 400 });
    }
    let key = apiKey;
    if (!key) {
      const saved = await prisma.aiProvider.findUnique({ where: { provider } });
      key = saved?.apiKey || "";
    }
    if (!key) {
      return NextResponse.json({ success: false, error: "No API key found. Enter one first." }, { status: 400 });
    }
    const result = await testConnection(provider, key, endpoint);
    return NextResponse.json({ success: true, data: result } satisfies ApiResponse);
  } catch (error) {
    console.error("POST /api/ai/test error:", error);
    return NextResponse.json({ success: false, error: "Test failed" }, { status: 500 });
  }
}
