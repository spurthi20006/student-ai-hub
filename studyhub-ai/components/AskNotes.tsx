"use client";
import { useState } from "react";
import { MessageSquare, Send, Loader2, AlertCircle } from "lucide-react";

interface AskNotesProps {
  context: string;
}

const SAMPLE_QUESTIONS = [
  "What is normalization?",
  "What are ACID properties?",
  "What is an index in DBMS?",
  "What is an ER diagram?",
];

export default function AskNotes({ context }: AskNotesProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (q?: string) => {
    const query = q || question;
    if (!query.trim() || !context.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setScore(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnswer(data.answer);
      setScore(data.score);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor =
    score === null ? "" : score >= 70 ? "text-emerald-400" : score >= 40 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            id="question-input"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all"
            placeholder="Ask a question from your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
          />
        </div>
        <button
          onClick={() => ask()}
          disabled={loading || !question.trim() || !context.trim()}
          className="px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>

      {/* Sample Questions */}
      {context && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => { setQuestion(q); ask(q); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/30 text-slate-400 hover:text-violet-300 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
          <div className="h-4 bg-white/10 rounded-full w-2/3 mb-2" />
          <div className="h-4 bg-white/10 rounded-full w-1/2" />
          <p className="text-xs text-slate-500 mt-3">Extracting answer with DistilBERT...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Answer */}
      {answer && !loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Answer</span>
            {score !== null && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${confidenceColor}`}>
                <div className={`w-2 h-2 rounded-full ${score >= 70 ? "bg-emerald-400" : score >= 40 ? "bg-yellow-400" : "bg-red-400"}`} />
                {score}% confidence
              </div>
            )}
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">{answer}</p>
          <p className="text-xs text-slate-600">
            Answer extracted directly from your notes using DistilBERT-SQuAD
          </p>
        </div>
      )}

      {!context && (
        <p className="text-sm text-slate-500 text-center py-4">
          Paste your notes first, then ask questions from them.
        </p>
      )}
    </div>
  );
}
