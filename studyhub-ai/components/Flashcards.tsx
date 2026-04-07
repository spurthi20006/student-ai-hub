"use client";
import { useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface Card {
  question: string;
  answer: string;
}

interface FlashcardsProps {
  cards: Card[];
  loading: boolean;
  error?: string;
}

function FlipCard({ card, index, total }: { card: Card; index: number; total: number }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative w-full" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full transition-transform duration-500 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "180px",
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Question {index + 1}/{total}</span>
            <RotateCw size={14} className="text-slate-500" />
          </div>
          <p className="text-slate-200 text-base font-medium leading-relaxed text-center mt-4">{card.question}</p>
          <p className="text-xs text-slate-600 text-center">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 p-6 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Answer</span>
            <RotateCw size={14} className="text-slate-500" />
          </div>
          <p className="text-slate-200 text-sm leading-relaxed text-center mt-4">{card.answer}</p>
          <p className="text-xs text-slate-600 text-center">Click to see question</p>
        </div>
      </div>
    </div>
  );
}

export default function Flashcards({ cards, loading, error }: FlashcardsProps) {
  const [current, setCurrent] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 bg-white/5 border border-white/10 rounded-2xl animate-pulse flex items-center justify-center">
          <p className="text-slate-500 text-sm">Generating flashcards with Llama 3...</p>
        </div>
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

  if (cards.length === 0) return null;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-violet-400" />
          <span className="text-sm text-slate-400">{cards.length} cards generated</span>
        </div>
        <button
          onClick={() => setViewAll(!viewAll)}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 transition-all"
        >
          {viewAll ? "Single View" : "View All"}
        </button>
      </div>

      {viewAll ? (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <FlipCard key={i} card={card} index={i} total={cards.length} />
          ))}
        </div>
      ) : (
        /* Single card view with navigation */
        <div className="space-y-4">
          <FlipCard card={cards[current]} index={current} total={cards.length} />

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-violet-400 w-5" : "bg-white/20"}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrent((c) => Math.min(cards.length - 1, c + 1))}
              disabled={current === cards.length - 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
