"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Repeat, Sparkles, Trophy } from "lucide-react";
import { colorOf } from "@/lib/types";

type Card = { id: string; question: string; answer: string; position: number };
type Rating = 0 | 1 | 2 | 3;

const RATING_META: Record<Rating, { label: string; color: string; key: string }> = {
  0: { label: "Again", color: "bg-rose-500 hover:bg-rose-600 text-white", key: "1" },
  1: { label: "Hard", color: "bg-amber-500 hover:bg-amber-600 text-white", key: "2" },
  2: { label: "Good", color: "bg-emerald-500 hover:bg-emerald-600 text-white", key: "3" },
  3: { label: "Easy", color: "bg-sky-500 hover:bg-sky-600 text-white", key: "4" },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function StudyClient({
  deckId, title, emoji, color, cards,
}: { deckId: string; title: string; emoji: string; color: string; cards: Card[] }) {
  const colorClasses = colorOf(color);
  const [queue, setQueue] = useState<Card[]>(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [againPile, setAgainPile] = useState<Card[]>([]);
  const totalThisSession = useMemo(() => cards.length, [cards.length]);

  const current = queue[index];

  const advance = useCallback(
    (rating: Rating) => {
      if (!current) return;
      // log async, don't block UI
      fetch(`/api/decks/${deckId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: current.id, rating }),
      }).catch(() => {});

      setSeen((s) => s + 1);
      if (rating >= 2) setCorrect((c) => c + 1);
      const newAgain = rating === 0 ? [...againPile, current] : againPile;
      setAgainPile(newAgain);

      if (index + 1 >= queue.length) {
        if (newAgain.length > 0) {
          // Re-queue the "again" cards for another pass
          setQueue(shuffle(newAgain));
          setAgainPile([]);
          setIndex(0);
          setFlipped(false);
        } else {
          setDone(true);
        }
      } else {
        setIndex(index + 1);
        setFlipped(false);
      }
    },
    [index, queue.length, current, deckId, againPile],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      if (e.key === "1") advance(0);
      if (e.key === "2") advance(1);
      if (e.key === "3") advance(2);
      if (e.key === "4") advance(3);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, advance, done]);

  function restart() {
    setQueue(shuffle(cards));
    setIndex(0);
    setFlipped(false);
    setSeen(0);
    setCorrect(0);
    setDone(false);
    setAgainPile([]);
  }

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <h2 className="font-display text-4xl text-zinc-900 mb-3">No cards in this deck</h2>
          <p className="text-zinc-600 mb-6">Add some cards before you can study.</p>
          <Link
            href={`/decks/${deckId}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
          >
            Back to deck
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    const percent = totalThisSession > 0 ? Math.round((correct / Math.max(seen, 1)) * 100) : 0;
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-lg">
          <div className={`w-20 h-20 rounded-3xl ${colorClasses.bg} mx-auto flex items-center justify-center text-white mb-6`}>
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="font-display text-5xl sm:text-6xl text-zinc-900 mb-3 tracking-tight">
            Session complete
          </h2>
          <p className="text-zinc-600 text-lg mb-8">
            You reviewed <strong className="text-zinc-900">{seen}</strong> cards and recalled{" "}
            <strong className="text-zinc-900">{percent}%</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800"
            >
              <Repeat className="w-4 h-4" /> Study again
            </button>
            <Link
              href={`/decks/${deckId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium hover:border-zinc-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back to deck
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = totalThisSession > 0 ? Math.round((seen / totalThisSession) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar with progress */}
      <div className="border-b border-zinc-200/60 bg-[#fafaf7]/80">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href={`/decks/${deckId}`} className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Exit
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{emoji}</span>
            <span className="text-sm font-medium text-zinc-900 truncate">{title}</span>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden max-w-xs ml-auto">
              <div className={`h-full ${colorClasses.bg} transition-[width] duration-300`} style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs font-mono text-zinc-500 tabular-nums">
              {seen} / {totalThisSession}
            </div>
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => setFlipped(!flipped)}
            className="perspective-1000 w-full h-[26rem] sm:h-[30rem] block"
            aria-label="Flip card"
          >
            <div
              className={`relative w-full h-full preserve-3d transition-transform duration-500 ease-out ${flipped ? "rotate-y-180" : ""}`}
            >
              {/* Front: question */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 sm:p-12 flex flex-col">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-medium mb-6">
                  <Sparkles className="w-3 h-3" /> Question
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-2xl sm:text-3xl font-medium text-zinc-900 text-center leading-snug">
                    {current?.question}
                  </p>
                </div>
                <div className="text-xs text-zinc-400 text-center">Click or press space to flip</div>
              </div>
              {/* Back: answer */}
              <div className={`absolute inset-0 backface-hidden rotate-y-180 ${colorClasses.soft} rounded-3xl border ${colorClasses.border} p-8 sm:p-12 flex flex-col`}>
                <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${colorClasses.text} font-medium mb-6`}>
                  Answer
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xl sm:text-2xl text-zinc-800 text-center leading-relaxed">
                    {current?.answer}
                  </p>
                </div>
                <div className="text-xs text-zinc-500 text-center">How well did you recall?</div>
              </div>
            </div>
          </button>

          {/* Rating row */}
          <div className="mt-8">
            {flipped ? (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {([0, 1, 2, 3] as Rating[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => advance(r)}
                    className={`py-3 px-3 rounded-xl text-sm font-semibold transition-colors ${RATING_META[r].color} flex flex-col items-center gap-0.5`}
                  >
                    <span>{RATING_META[r].label}</span>
                    <span className="text-[10px] font-mono opacity-70">{RATING_META[r].key}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setFlipped(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800"
                >
                  <RotateCcw className="w-4 h-4" /> Reveal answer
                </button>
                <div className="text-xs text-zinc-400">or press <kbd className="font-mono px-1.5 py-0.5 bg-white border border-zinc-200 rounded">space</kbd></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
