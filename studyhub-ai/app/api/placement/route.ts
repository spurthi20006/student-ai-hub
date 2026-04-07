import { NextRequest, NextResponse } from "next/server";
import { getDomainForTopic, getStatsForDomain } from "@/lib/placement-lookup";
import { buildPlacementPrompt } from "@/lib/prompts";
import { groqChat } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { topic, summary } = await req.json();
    if (!topic && !summary) {
      return NextResponse.json({ error: "Topic or summary is required." }, { status: 400 });
    }

    const inputTopic = topic || summary?.slice(0, 100) || "Computer Science";
    const domain = getDomainForTopic(inputTopic);
    const stats = getStatsForDomain(domain);

    const prompt = buildPlacementPrompt(inputTopic, stats);
    const tip = await groqChat(prompt, 300);

    return NextResponse.json({ tip, stats, domain });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
