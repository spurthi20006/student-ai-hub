import { NextRequest, NextResponse } from "next/server";
import { groqChat } from "@/lib/groq";
import { buildFlashcardPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { summary } = await req.json();
    if (!summary || summary.trim().length < 30) {
      return NextResponse.json({ error: "Summary too short to generate flashcards." }, { status: 400 });
    }

    const raw = await groqChat(buildFlashcardPrompt(summary), 500);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Could not parse flashcard response");

    const cards = JSON.parse(match[0]);
    return NextResponse.json({ cards });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
