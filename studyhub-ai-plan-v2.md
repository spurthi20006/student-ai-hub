# StudyHub AI — Project Document

> A Vercel-hostable, student-first multi-model study assistant combining note summarization, ask-from-notes, flashcard generation, and **data-backed placement suggestions powered by a real Kaggle campus recruitment dataset** — built with Hugging Face models and free APIs.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Why This Project](#2-why-this-project)
3. [Core Features](#3-core-features)
4. [How Kaggle Powers Placement Suggestions](#4-how-kaggle-powers-placement-suggestions)
5. [Tech Stack](#5-tech-stack)
6. [AI Models](#6-ai-models)
7. [Folder Structure](#7-folder-structure)
8. [Environment Variables](#8-environment-variables)
9. [Kaggle Setup](#9-kaggle-setup)
10. [API Routes](#10-api-routes)
11. [Placement Engine — Logic Design](#11-placement-engine--logic-design)
12. [App Workflow](#12-app-workflow)
13. [Build Checklist A–Z](#13-build-checklist-az)
14. [Minimum Viable Version](#14-minimum-viable-version)
15. [Demo Script](#15-demo-script)
16. [One-Line Description](#16-one-line-description)

---

## 1. Problem Statement

Students have scattered notes, no single revision workspace, and generic placement advice that doesn't account for their actual academic profile. **StudyHub AI** solves all three: it lets students upload or paste study notes, uses Hugging Face models to summarize and answer questions, generates flashcards, and — crucially — gives **placement suggestions that are grounded in real campus recruitment data** from Kaggle, not just generic interview tips.

The difference: when a student asks "is this topic important for placements?", the app looks at what actually got students placed in the dataset — their academic scores, work experience, test performance — and tailors the advice based on that signal.

---

## 2. Why This Project

| Ordinary chatbot | StudyHub AI |
|---|---|
| Generic "this topic is important for interviews" | Data-backed: "Students with strong scores in this domain had a 92% placement rate in the dataset" |
| No study workflow | Full workflow: summarize → ask → flashcards → placement |
| No real data integration | Real Kaggle dataset actively used at runtime |
| Single feature | Multi-feature, deployable, demo-ready |

The Kaggle dataset is not decoration — it is the backbone of the placement feature, making the suggestions **evidence-based and specific** rather than generic filler text.

---

## 3. Core Features

### Feature 1 — Summarize Notes
Student pastes or uploads notes. The app returns a short summary with 5 bullet-point key takeaways using a Hugging Face summarization model.

**Model:** `sshleifer/distilbart-cnn-12-6`
**Fallback:** `facebook/bart-large-cnn`

---

### Feature 2 — Ask Questions From Notes
Student asks any question. The app answers using only the pasted notes as context — no hallucination, no external knowledge.

**Model:** `distilbert/distilbert-base-cased-distilled-squad`
**Output:** answer text + confidence score

---

### Feature 3 — Flashcard Generator
Converts the summary into 5 question-answer revision cards shown in a flippable card format. Uses a free LLM API prompt or simple JS logic to structure the output.

---

### Feature 4 — Placement Suggestions *(Kaggle-powered — core feature)*
This is the upgraded placement feature. Instead of a hardcoded "this topic is important" response, the app:

1. Takes the **topic** from the student's notes (e.g., "Database Management", "Operating Systems", "OOP")
2. Looks up that topic's **domain** against the Kaggle placement dataset
3. Computes **what profile of students got placed** in that domain (degree type, scores, work experience)
4. Passes that data + the topic into a free LLM API prompt
5. Returns a placement suggestion that is **specific, data-backed, and actionable**

**Example output:**
> "Based on campus recruitment data, students in Computer Science with a degree percentage above 65% and any internship/work experience had a placement rate of 88%. For DBMS specifically, it appears frequently in technical rounds for software roles. Focus on normalization, indexing, and transaction management — these are the concepts that show up most in aptitude and technical tests."

---

## 4. How Kaggle Powers Placement Suggestions

### Dataset
**`benroshan/factors-affecting-campus-placement`**
Download: `kaggle datasets download -d benroshan/factors-affecting-campus-placement`

This is a real campus recruitment dataset from an MBA institute. It is the best available free dataset for this use case because every row is a student with academic scores across multiple stages, work experience, and a confirmed placed/not-placed outcome.

### Columns

| Column | Description |
|---|---|
| `ssc_p` | 10th grade percentage |
| `ssc_b` | 10th board (Central / Others) |
| `hsc_p` | 12th grade percentage |
| `hsc_b` | 12th board (Central / Others) |
| `hsc_s` | 12th stream (Science / Commerce / Arts) |
| `degree_p` | UG degree percentage |
| `degree_t` | UG degree field (Sci&Tech / Comm&Mgmt / Others) |
| `workex` | Work experience (Yes / No) |
| `etest_p` | Employability test percentage |
| `specialisation` | MBA specialisation (Mkt&HR / Mkt&Fin) |
| `mba_p` | MBA percentage |
| `status` | **Placed / Not Placed** ← target variable |
| `salary` | Salary offered (only for placed students) |

### What gets computed from the dataset

The app pre-computes the following stats from the dataset and stores them as a JSON lookup file at build time:

| Stat | How it is used |
|---|---|
| Placement rate by `degree_t` | "X% of Sci&Tech students got placed" |
| Average `degree_p` of placed students | "Placed students averaged 72% in UG" |
| Impact of `workex` on placement | "Students with work experience placed at 2× the rate" |
| Impact of `etest_p` on placement | "Employability test score strongly correlates with placement" |
| Placement rate by `hsc_s` stream | "Science stream students had the highest placement rate" |
| Salary range for placed students | "Average package was ₹X for Sci&Tech students" |

### How the prompt is built

When a student clicks "Placement Relevance" after pasting notes on, say, *Operating Systems*, the API route does this:

```
1. Extract topic from notes summary (e.g., "Operating Systems → CS/Sci&Tech domain")
2. Pull pre-computed stats for Sci&Tech degree type from placement-stats.json
3. Build prompt:
   "Topic: Operating Systems
    Domain: Computer Science / Sci&Tech
    Placement data for this domain:
    - 85% placement rate
    - Placed students averaged 68.4% in UG degree
    - Work experience increased placement odds by 2.1x
    - Avg salary: ₹2.8L for non-MBA, ₹3.5L for MBA specialisation
    
    Given this data, explain in 5 lines why this topic matters for placements,
    what score/profile the student should aim for, and what to focus on technically."
4. Return response from free LLM API
```

This turns a vague "this topic is important" into a grounded, profile-specific, data-backed answer.

---

## 5. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) | Full-stack, Vercel-native |
| Deployment | Vercel | Free tier, instant deploy |
| Backend | Next.js API routes | No separate server needed |
| AI — Summarization | Hugging Face Inference API | Free, no GPU needed |
| AI — QA | Hugging Face Inference API | Lightweight extractive model |
| AI — Placement prompt | Free LLM API (Groq / Together / OpenRouter free tier) | Low token usage, fast |
| Dataset | Kaggle (`benroshan/factors-affecting-campus-placement`) | Real placement data |
| Styling | Tailwind CSS | Fast, utility-first |
| Data format | CSV → JSON (pre-processed once at setup) | Static, no runtime Kaggle calls |

---

## 6. AI Models

### Summarization
**Primary:** `sshleifer/distilbart-cnn-12-6`
**Fallback:** `facebook/bart-large-cnn`

Use the primary first — it is lighter, faster on the free HF inference tier, and sufficient for student note length.

### Question Answering
**Model:** `distilbert/distilbert-base-cased-distilled-squad`

Extractive QA — the answer is pulled directly from the pasted notes. This means no hallucination. Includes a confidence score in the response.

### Placement Suggestions
**Use a free LLM API** (Groq with `llama3-8b-8192` on free tier, or Together AI, or OpenRouter free credits).

Keep the prompt short: inject only the pre-computed stats and the topic. Max 200 tokens output. This keeps usage within free tier limits.

---

## 7. Folder Structure

```
studyhub-ai/
├── app/
│   ├── page.tsx                        # Main page with tab navigation
│   └── api/
│       ├── summarize/route.ts          # HF summarization endpoint
│       ├── ask/route.ts                # HF QA endpoint
│       ├── flashcards/route.ts         # Flashcard generation endpoint
│       └── placement/route.ts          # Placement suggestion endpoint
│
├── components/
│   ├── NoteInput.tsx                   # Paste / upload notes area
│   ├── SummaryBox.tsx                  # Summary + bullet output
│   ├── AskNotes.tsx                    # Question + answer UI
│   ├── Flashcards.tsx                  # Flippable flashcard renderer
│   └── PlacementPanel.tsx              # Placement suggestion display
│
├── lib/
│   ├── hf.ts                           # Hugging Face API helper
│   ├── prompts.ts                      # Prompt templates (placement, flashcards)
│   └── placement-lookup.ts             # Loads and queries placement-stats.json
│
├── data/
│   ├── raw/
│   │   └── placement.csv               # Original Kaggle CSV (gitignored)
│   ├── placement-stats.json            # Pre-computed stats committed to repo
│   └── placement-full.json             # Full cleaned dataset (optional)
│
├── scripts/
│   └── process-placement-data.js       # One-time CSV → stats JSON script
│
├── public/
├── .env.local
├── package.json
└── README.md
```

---

## 8. Environment Variables

```env
# Hugging Face
HUGGINGFACE_API_KEY=your_hf_token

# Free LLM API for placement suggestions and flashcards
# Use Groq (free tier) or any OpenRouter/Together free model
FREE_LLM_API_KEY=your_free_llm_key
FREE_LLM_BASE_URL=https://api.groq.com/openai/v1
FREE_LLM_MODEL=llama3-8b-8192
```

Kaggle credentials are used **only once locally** to download the dataset. They are never committed or sent to Vercel.

---

## 9. Kaggle Setup

### Install Kaggle CLI
```bash
pip install kaggle
```

### Add credentials
```bash
# Download kaggle.json from kaggle.com/settings
~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

### Download the dataset
```bash
kaggle datasets download -d benroshan/factors-affecting-campus-placement
unzip factors-affecting-campus-placement.zip -d data/raw
```

### Run the processing script (once)
```bash
node scripts/process-placement-data.js
```

This script reads `data/raw/Placement_Data_Full_Class.csv`, computes placement stats by degree type, work experience, etest score bands, and stream, then writes two output files:
- `data/placement-stats.json` — aggregated stats used in placement prompts
- `data/placement-full.json` — cleaned full dataset (optional, for richer lookups)

Both files are committed to the repo. No Kaggle calls happen at runtime.

### Sample `process-placement-data.js`

```js
const fs = require("fs");
const Papa = require("papaparse");

const csv = fs.readFileSync("data/raw/Placement_Data_Full_Class.csv", "utf8");
const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

const placed = data.filter(r => r.status === "Placed");
const total = data.length;

// Placement rate by degree type
const byDegree = {};
["Sci&Tech", "Comm&Mgmt", "Others"].forEach(type => {
  const group = data.filter(r => r.degree_t === type);
  const placedGroup = group.filter(r => r.status === "Placed");
  byDegree[type] = {
    total: group.length,
    placed: placedGroup.length,
    rate: ((placedGroup.length / group.length) * 100).toFixed(1),
    avgDegreeP: (placedGroup.reduce((s, r) => s + parseFloat(r.degree_p), 0) / placedGroup.length).toFixed(1),
    avgSalary: (placedGroup.filter(r => r.salary).reduce((s, r) => s + parseFloat(r.salary), 0) / placedGroup.filter(r => r.salary).length).toFixed(0),
  };
});

// Work experience impact
const withWorkex = data.filter(r => r.workex === "Yes");
const withoutWorkex = data.filter(r => r.workex === "No");
const workexStats = {
  withWorkex: ((withWorkex.filter(r => r.status === "Placed").length / withWorkex.length) * 100).toFixed(1),
  withoutWorkex: ((withoutWorkex.filter(r => r.status === "Placed").length / withoutWorkex.length) * 100).toFixed(1),
};

const stats = { total, placedTotal: placed.length, overallRate: ((placed.length / total) * 100).toFixed(1), byDegree, workexStats };

fs.writeFileSync("data/placement-stats.json", JSON.stringify(stats, null, 2));
console.log("placement-stats.json written.");
```

---

## 10. API Routes

### `/api/summarize`
- **Input:** `{ text: string }`
- **Calls:** HF `sshleifer/distilbart-cnn-12-6`
- **Output:** `{ summary: string, bullets: string[] }`

### `/api/ask`
- **Input:** `{ question: string, context: string }`
- **Calls:** HF `distilbert/distilbert-base-cased-distilled-squad`
- **Output:** `{ answer: string, score: number }`

### `/api/flashcards`
- **Input:** `{ summary: string }`
- **Calls:** Free LLM API with a structured prompt
- **Output:** `{ cards: { question: string, answer: string }[] }`

### `/api/placement`
- **Input:** `{ topic: string, summary: string }`
- **Logic:**
  1. Map topic to a degree domain (`Sci&Tech` / `Comm&Mgmt`)
  2. Load matching stats from `placement-stats.json`
  3. Build a short, data-rich prompt
  4. Call Free LLM API
- **Output:** `{ tip: string }` — 5-line placement suggestion with data references

---

## 11. Placement Engine — Logic Design

### Topic → Domain Mapping
A simple lookup in `lib/placement-lookup.ts`:

```ts
const TOPIC_DOMAIN_MAP: Record<string, "Sci&Tech" | "Comm&Mgmt" | "Others"> = {
  "dbms": "Sci&Tech",
  "database": "Sci&Tech",
  "operating systems": "Sci&Tech",
  "data structures": "Sci&Tech",
  "algorithms": "Sci&Tech",
  "networking": "Sci&Tech",
  "oops": "Sci&Tech",
  "marketing": "Comm&Mgmt",
  "finance": "Comm&Mgmt",
  "management": "Comm&Mgmt",
};

export function getDomainForTopic(topic: string): "Sci&Tech" | "Comm&Mgmt" | "Others" {
  const key = topic.toLowerCase();
  for (const [k, v] of Object.entries(TOPIC_DOMAIN_MAP)) {
    if (key.includes(k)) return v;
  }
  return "Sci&Tech"; // default for CS students
}
```

### Prompt Template
```ts
export function buildPlacementPrompt(topic: string, stats: DomainStats): string {
  return `
Topic: ${topic}
Domain: ${stats.domain} (Engineering / CS)

Real campus placement data for this domain:
- Overall placement rate: ${stats.rate}%
- Average UG degree % of placed students: ${stats.avgDegreeP}%
- With work experience: ${stats.workexWithRate}% placed
- Without work experience: ${stats.workexWithoutRate}% placed
- Average salary offered: ₹${stats.avgSalary}

In 5 concise lines:
1. Why is ${topic} important for campus placements?
2. What score/profile should a student aim for based on this data?
3. What specific sub-topics or skills within ${topic} matter most in interviews?
Keep it direct, practical, and grounded in the data above.
  `.trim();
}
```

---

## 12. App Workflow

```
Student opens StudyHub AI
        │
        ▼
Pastes or uploads notes
        │
        ├──► [Summarize] → HF summarization → bullet summary
        │
        ├──► [Ask Notes] → DistilBERT QA → answer + confidence
        │
        ├──► [Flashcards] → Free LLM → 5 Q&A cards
        │
        └──► [Placement Tips]
                  │
                  ├─ Extract topic from summary
                  ├─ Map topic to domain (Sci&Tech / Comm&Mgmt)
                  ├─ Load pre-computed Kaggle stats for that domain
                  ├─ Build data-rich prompt
                  └─ Free LLM → 5-line data-backed placement suggestion
```

---

## 13. Build Checklist A–Z

| Step | Task |
|---|---|
| A | Finalise project name, features, and Kaggle dataset choice |
| B | `npx create-next-app@latest studyhub-ai` |
| C | `npm install axios papaparse` |
| D | Set up Tailwind CSS |
| E | Build tab navigation UI: Summarize / Ask / Flashcards / Placement |
| F | Create `/api/summarize` route → HF distilbart |
| G | Create `/api/ask` route → HF distilbert-squad |
| H | Create `/api/flashcards` route → free LLM structured prompt |
| I | Set up Kaggle CLI and download `benroshan/factors-affecting-campus-placement` |
| J | Write and run `scripts/process-placement-data.js` |
| K | Verify `data/placement-stats.json` has correct aggregated values |
| L | Write `lib/placement-lookup.ts` (topic → domain mapping + stat loader) |
| M | Write `lib/prompts.ts` (placement prompt builder + flashcard prompt) |
| N | Create `/api/placement` route using stats + free LLM |
| O | Build `PlacementPanel.tsx` — shows data reference + 5-line tip |
| P | Build `NoteInput.tsx` with paste area and example note preloaded |
| Q | Build `SummaryBox.tsx` with bullet output |
| R | Build `AskNotes.tsx` with confidence score display |
| S | Build `Flashcards.tsx` with flippable card UI |
| T | Handle all loading states and API error fallbacks |
| U | Keep all API keys server-side only — never expose to frontend |
| V | Keep LLM output capped at 200 tokens to stay within free tier |
| W | Add sample questions: "What is DBMS?", "Why is this important for placements?" |
| X | Push to GitHub |
| Y | Import to Vercel, add all env variables |
| Z | Test all 4 features in production, record demo |

---

## 14. Minimum Viable Version

If build time is tight, ship only these four in order:

1. **Paste notes** — basic text input
2. **Summarize** — HF distilbart, show 5 bullets
3. **Ask from notes** — HF distilbert, show answer + score
4. **Placement suggestion** — pre-computed Kaggle stats + free LLM, show 5-line tip

This is enough for a strong demo and covers all the key technologies: Hugging Face, Kaggle data integration, and a free LLM API.

---

## 15. Demo Script

> Use this flow during presentation — takes under 2 minutes.

1. Open the app. Show the clean single-page layout with 4 tabs.
2. Paste a sample note on **Database Management Systems**.
3. Click **Summarize** → show the 5-bullet summary.
4. Type "What is normalization?" → click **Ask** → show the answer extracted from the note with confidence score.
5. Click **Flashcards** → show 5 generated Q&A cards.
6. Click **Placement Tips** → show the suggestion:
   - Mention that it references real placement data
   - Point out the placement rate, avg score, and work experience stat from the dataset
   - Explain that this is not generic advice — it is grounded in the Kaggle dataset
7. Close by explaining: "This app combines 4 study tools in one place, the placement feature uses real campus recruitment data from Kaggle to give data-backed advice, and the whole thing is deployed free on Vercel."

---

## 16. One-Line Description

**StudyHub AI is a Vercel-hosted student study assistant that uses Hugging Face models for note summarization and QA, and a real Kaggle campus recruitment dataset to power data-backed placement suggestions — all in one lightweight, free-to-deploy Next.js app.**
