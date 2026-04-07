"use client";
import { Sparkles, ChevronRight } from "lucide-react";

interface SummaryBoxProps {
  summary: string;
  bullets: string[];
  loading: boolean;
  error?: string;
}

export default function SummaryBox({ summary, bullets, loading, error }: SummaryBoxProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded-full w-3/4" />
        <div className="h-4 bg-white/10 rounded-full w-full" />
        <div className="h-4 bg-white/10 rounded-full w-5/6" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-white/5 rounded-full" style={{ width: `${75 + i * 5}%` }} />
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">Summarizing with DistilBART...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-300 text-sm">
        ⚠ {error}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Summary paragraph */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-violet-300 uppercase tracking-wide">Summary</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
      </div>

      {/* Key takeaways */}
      {bullets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
            Key Takeaways
          </h3>
          <div className="space-y-2">
            {bullets.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/3 border border-white/5 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
