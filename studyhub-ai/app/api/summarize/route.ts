import { NextRequest, NextResponse } from "next/server";
import { summarizeText } from "@/lib/hf";
import { groqChat } from "@/lib/groq";
import { buildBulletPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: "Text too short. Please paste at least a few sentences." }, { status: 400 });
    }

    const summary = await summarizeText(text);

    // Use Groq to extract bullets from the summary
    let bullets: string[] = [];
    try {
      const raw = await groqChat(buildBulletPrompt(summary), 200);
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) bullets = JSON.parse(match[0]);
    } catch {
      // fallback: split summary into sentences
      bullets = summary.split(". ").slice(0, 5).map((s) => s.trim()).filter(Boolean);
    }

    return NextResponse.json({ summary, bullets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
