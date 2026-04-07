import type { DomainStats } from "./placement-lookup";

export function buildPlacementPrompt(topic: string, stats: DomainStats): string {
  return `You are a campus placement advisor. Use ONLY the data below to answer.

Topic: ${topic}
Domain: ${stats.domain}

Real campus recruitment data (215 students, MBA institute):
- Overall placement rate: ${stats.overallRate}%
- Placement rate for ${stats.domain} degree: ${stats.rate}%
- Average UG degree % of placed students (${stats.domain}): ${stats.avgDegreeP}%
- With work experience: ${stats.workexWithRate}% got placed
- Without work experience: ${stats.workexWithoutRate}% got placed
- Average salary offered: Rs.${parseInt(stats.avgSalary).toLocaleString("en-IN")}

In exactly 5 numbered lines:
1. Why is ${topic} important for campus placements based on this data?
2. What score/profile should the student target?
3. How does work experience affect chances in ${stats.domain}?
4. What specific sub-topics within ${topic} appear in technical rounds?
5. One actionable step the student should take this week.

Keep it practical, concise, and grounded in the data above. No generic advice.`.trim();
}

export function buildFlashcardPrompt(summary: string): string {
  return `You are a study assistant. Create exactly 5 flashcards from the following study notes summary.

Summary:
${summary}

Return ONLY a valid JSON array with exactly this structure, no extra text:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]

Make questions clear and concise. Answers should be 1-2 sentences max.`.trim();
}

export function buildBulletPrompt(summary: string): string {
  return `Extract exactly 5 key bullet-point takeaways from the following summary. 
Return ONLY a JSON array of 5 strings, no extra text:
["point 1", "point 2", "point 3", "point 4", "point 5"]

Summary: ${summary}`.trim();
}
