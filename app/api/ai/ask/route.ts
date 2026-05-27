import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callAi } from "@/lib/ai";
import type { ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { question, department } = await req.json();
    if (!question) {
      return NextResponse.json({ success: false, error: "question is required" }, { status: 400 });
    }

    const words = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    const skills = await prisma.skill.findMany({
      where: department ? { department } : {},
      orderBy: { createdAt: "desc" },
    });

    const matches: { id: string; title: string; department: string; content: string; score: number }[] = [];
    for (const skill of skills) {
      const lower = skill.content.toLowerCase() + " " + skill.title.toLowerCase();
      const score = words.filter((w: string) => lower.includes(w)).length / words.length;
      if (score > 0) {
        matches.push({ ...skill, score });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 3);

    if (topMatches.length > 0) {
      const context = topMatches.map(m =>
        `[${m.title} (${m.department || "General"})]\n${m.content.slice(0, 2000)}`
      ).join("\n\n---\n\n");

      const provider = await prisma.aiProvider.findFirst({ where: { enabled: true } });
      if (provider) {
        const answer = await callAi(provider.provider, provider.apiKey, [
          { role: "system", content: `You are an HR assistant. Answer using the provided skill documents first. If the answer isn't in the documents, use your own knowledge.\n\nRelevant skill documents:\n${context}` },
          { role: "user", content: question },
        ], provider.endpoint);
        return NextResponse.json({
          success: true,
          data: { answer, source: "ai", skills: topMatches.map(m => ({ title: m.title, department: m.department })) },
        } satisfies ApiResponse);
      }

      const answer = topMatches.map(m =>
        `**${m.title}** (${m.department || "General"}):\n${m.content.slice(0, 500)}`
      ).join("\n\n");
      return NextResponse.json({
        success: true,
        data: { answer, source: "local", skills: topMatches.map(m => ({ title: m.title, department: m.department })) },
      } satisfies ApiResponse);
    }

    const provider = await prisma.aiProvider.findFirst({ where: { enabled: true } });
    if (!provider) {
      return NextResponse.json({
        success: true,
        data: { answer: "No skill documents found and no AI provider is configured. Please add skill files or configure an AI provider in Admin → AI Connectors.", source: "none" },
      } satisfies ApiResponse);
    }

    const answer = await callAi(provider.provider, provider.apiKey, [
      { role: "system", content: "You are an HR assistant for Malaysia HR management. Answer helpfully and concisely." },
      { role: "user", content: question },
    ], provider.endpoint);
    return NextResponse.json({
      success: true,
      data: { answer, source: "ai", skills: [] },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("POST /api/ai/ask error:", error);
    return NextResponse.json({ success: false, error: "Failed to process question" }, { status: 500 });
  }
}
