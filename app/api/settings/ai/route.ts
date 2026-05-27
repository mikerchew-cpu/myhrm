import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, AiProviderInput } from "@/lib/types";

const PROVIDERS = ["deepseek", "gemini", "claude"] as const;

export async function GET() {
  try {
    const providers = await prisma.aiProvider.findMany({ orderBy: { createdAt: "asc" } });
    const masked = providers.map(p => ({
      ...p,
      apiKey: p.apiKey ? p.apiKey.slice(0, 8) + "..." + p.apiKey.slice(-4) : "",
    }));
    return NextResponse.json({ success: true, data: masked } satisfies ApiResponse);
  } catch (error) {
    console.error("GET /api/settings/ai error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch AI settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: { provider: string; config: AiProviderInput } = await req.json();
    if (!PROVIDERS.includes(body.provider as typeof PROVIDERS[number])) {
      return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 });
    }
    const existing = await prisma.aiProvider.findUnique({ where: { provider: body.provider } });
    const record = await prisma.aiProvider.upsert({
      where: { provider: body.provider },
      update: {
        apiKey: body.config.apiKey || existing?.apiKey || "",
        endpoint: body.config.endpoint,
        enabled: body.config.enabled,
      },
      create: {
        provider: body.provider,
        apiKey: body.config.apiKey,
        endpoint: body.config.endpoint,
        enabled: body.config.enabled,
      },
    });
    return NextResponse.json({
      success: true,
      data: { ...record, apiKey: record.apiKey ? record.apiKey.slice(0, 8) + "..." + record.apiKey.slice(-4) : "" },
      message: `${body.provider} settings saved`,
    } satisfies ApiResponse);
  } catch (error) {
    console.error("PUT /api/settings/ai error:", error);
    return NextResponse.json({ success: false, error: "Failed to update AI settings" }, { status: 500 });
  }
}
