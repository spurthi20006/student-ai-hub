import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/hf";

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();
    if (!question || !context) {
      return NextResponse.json({ error: "Both question and context are required." }, { status: 400 });
    }

    const result = await answerQuestion(question, context);
    return NextResponse.json({
      answer: result.answer,
      score: Math.round(result.score * 100),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
