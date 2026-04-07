"use client";
import { useState } from "react";
import {
  BookOpen, MessageSquare, Layers, TrendingUp, Brain,
  Zap, ChevronRight, Loader2, FolderOpen
} from "lucide-react";
import NoteInput from "@/components/NoteInput";
import SummaryBox from "@/components/SummaryBox";
import AskNotes from "@/components/AskNotes";
import Flashcards from "@/components/Flashcards";
import PlacementPanel from "@/components/PlacementPanel";
import UploadedFiles from "@/components/UploadedFiles";

type Tab = "summarize" | "ask" | "flashcards" | "placement" | "files";

interface Card { question: string; answer: string; }
interface PlacementStats {
  domain: string; rate: string; avgDegreeP: string; avgSalary: string;
  workexWithRate: string; workexWithoutRate: string; overallRate: string;
  placedTotal: number; total: number;
}

const TABS = [
  { id: "summarize" as Tab,  label: "Summarize",   icon: BookOpen,    color: "violet" },
  { id: "ask" as Tab,        label: "Ask Notes",   icon: MessageSquare, color: "blue" },
  { id: "flashcards" as Tab, label: "Flashcards",  icon: Layers,      color: "emerald" },
  { id: "placement" as Tab,  label: "Placement",   icon: TrendingUp,  color: "amber" },
  { id: "files" as Tab,      label: "My Files",    icon: FolderOpen,  color: "pink" },
];

const TAB_COLORS: Record<string, string> = {
  violet:  "bg-violet-500/20 text-violet-300 border-violet-500/40",
  blue:    "bg-blue-500/20 text-blue-300 border-blue-500/40",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  amber:   "bg-amber-500/20 text-amber-300 border-amber-500/40",
  pink:    "bg-pink-500/20 text-pink-300 border-pink-500/40",
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("summarize");
  const [fileRefresh, setFileRefresh] = useState(0);

  // Summarize state
  const [summary, setSummary] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [sumLoading, setSumLoading] = useState(false);
  const [sumError, setSumError] = useState("");

  // Flashcards state
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cardsError, setCardsError] = useState("");

  // Placement state
  const [placementTip, setPlacementTip] = useState("");
  const [placementStats, setPlacementStats] = useState<PlacementStats | null>(null);
  const [placementDomain, setPlacementDomain] = useState("");
  const [placeTopic, setPlaceTopic] = useState("");
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const handleSummarize = async () => {
    if (!notes.trim()) return;
    setSumLoading(true); setSumError(""); setSummary(""); setBullets([]);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.summary);
      setBullets(data.bullets);
    } catch (e) {
      setSumError(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setSumLoading(false);
    }
  };

  const handleFlashcards = async () => {
    const input = summary || notes;
    if (!input.trim()) return;
    setCardsLoading(true); setCardsError(""); setCards([]);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCards(data.cards);
    } catch (e) {
      setCardsError(e instanceof Error ? e.message : "Failed to generate flashcards");
    } finally {
      setCardsLoading(false);
    }
  };

  const handlePlacement = async () => {
    if (!placeTopic.trim() && !notes.trim()) return;
    setPlaceLoading(true); setPlaceError(""); setPlacementTip(""); setPlacementStats(null);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: placeTopic, summary: summary || notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlacementTip(data.tip);
      setPlacementStats(data.stats);
      setPlacementDomain(data.domain);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "Failed to get placement tips");
    } finally {
      setPlaceLoading(false);
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm mb-5">
            <Brain size={15} />
            <span>AI-Powered Study Assistant</span>
            <Zap size={13} className="text-amber-400" />
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            StudyHub AI
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Summarize notes · Ask questions · Generate flashcards · Get data-backed placement tips
          </p>
          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Hugging Face</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Groq Llama 3</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Kaggle Dataset</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-400 inline-block" /> Supabase Storage</span>
          </div>
        </header>

        {/* Notes Input Card */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-violet-400" />
            Your Study Notes
          </h2>
          <NoteInput value={notes} onChange={setNotes} onFileUploaded={() => setFileRefresh((n) => n + 1)} />
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                  active
                    ? TAB_COLORS[tab.color]
                    : "bg-white/[0.03] border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Card */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-sm min-h-[320px]">
          {/* Tab header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <activeTabMeta.icon size={18} className={`text-${activeTabMeta.color}-400`} />
              <h2 className="font-semibold text-slate-200">{activeTabMeta.label}</h2>
            </div>

            {/* Action buttons per tab */}
            {activeTab === "summarize" && (
              <button
                id="btn-summarize"
                onClick={handleSummarize}
                disabled={!notes.trim() || sumLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all"
              >
                {sumLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                {sumLoading ? "Summarizing..." : "Summarize"}
              </button>
            )}

            {activeTab === "flashcards" && (
              <button
                id="btn-flashcards"
                onClick={handleFlashcards}
                disabled={(!notes.trim() && !summary) || cardsLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all"
              >
                {cardsLoading ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
                {cardsLoading ? "Generating..." : "Generate Cards"}
              </button>
            )}
          </div>

          {/* Tab content */}
          {activeTab === "summarize" && (
            <SummaryBox summary={summary} bullets={bullets} loading={sumLoading} error={sumError} />
          )}

          {activeTab === "ask" && (
            <AskNotes context={notes} />
          )}

          {activeTab === "flashcards" && (
            <Flashcards cards={cards} loading={cardsLoading} error={cardsError} />
          )}

          {activeTab === "placement" && (
            <div className="space-y-5">
              {/* Topic input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  id="placement-topic"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm transition-all"
                  placeholder="Enter topic (e.g. DBMS, Operating Systems, Marketing)..."
                  value={placeTopic}
                  onChange={(e) => setPlaceTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePlacement()}
                />
                <button
                  id="btn-placement"
                  onClick={handlePlacement}
                  disabled={(!placeTopic.trim() && !notes.trim()) || placeLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                >
                  {placeLoading ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                  {placeLoading ? "Analyzing..." : "Get Tips"}
                </button>
              </div>

              <PlacementPanel
                tip={placementTip}
                stats={placementStats}
                domain={placementDomain}
                loading={placeLoading}
                error={placeError}
              />
            </div>
          )}

          {activeTab === "files" && (
            <UploadedFiles refreshTrigger={fileRefresh} />
          )}

          {/* Empty state for content tabs */}
          {activeTab === "summarize" && !summary && !sumLoading && !sumError && (
            <div className="text-center py-10 text-slate-600">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Paste your notes above and click <strong className="text-slate-500">Summarize</strong></p>
            </div>
          )}
          {activeTab === "flashcards" && cards.length === 0 && !cardsLoading && !cardsError && (
            <div className="text-center py-10 text-slate-600">
              <Layers size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Paste notes (or summarize first) then click <strong className="text-slate-500">Generate Cards</strong></p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs text-slate-700 space-y-1">
          <p>StudyHub AI · Hugging Face + Groq + Kaggle + Supabase</p>
          <p>Free models only · No paid API calls · Built for students</p>
        </footer>
      </div>
    </main>
  );
}
