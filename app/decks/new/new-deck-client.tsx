"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Loader2, ArrowLeft, Wand2, Pencil, X, Plus, Check,
} from "lucide-react";
import { toast } from "sonner";
import { DECK_COLORS, colorOf, type DeckColor } from "@/lib/types";

type Mode = "input" | "generating" | "review";
type Card = { question: string; answer: string };

const SAMPLE_PROMPT = `The mitochondrion is a double-membrane-bound organelle found in most eukaryotic cells. Often called the "powerhouse of the cell," its primary function is to produce adenosine triphosphate (ATP) through the process of cellular respiration.

Mitochondria have their own DNA (mtDNA), which is inherited maternally. They reproduce by binary fission, similar to bacteria. The inner membrane is folded into structures called cristae, which increase surface area for ATP production.

Key processes that occur in mitochondria include the citric acid cycle (Krebs cycle) in the matrix, and the electron transport chain on the inner membrane. These work together to generate ATP from glucose, producing roughly 30-32 ATP molecules per glucose molecule.`;

export function NewDeckClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("input");
  const [text, setText] = useState("");
  const [count, setCount] = useState(12);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📘");
  const [color, setColor] = useState<DeckColor>("indigo");
  const [cards, setCards] = useState<Card[]>([]);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"ai" | "manual">("ai");

  async function generate() {
    if (text.trim().length < 30) {
      toast.error("Paste a few sentences to get good cards.");
      return;
    }
    setMode("generating");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const g = data.generated;
      setTitle(g.title);
      setDescription(g.description);
      setEmoji(g.emoji);
      setCards(g.cards);
      setMode("review");
    } catch (err) {
      toast.error((err as Error).message);
      setMode("input");
    }
  }

  async function save() {
    if (cards.length === 0) {
      toast.error("Add at least one card.");
      return;
    }
    if (!title.trim()) {
      toast.error("Give your deck a title.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, emoji, color,
          source_text: text || null,
          cards: cards.filter((c) => c.question.trim() && c.answer.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("Deck saved");
      router.push(`/decks/${data.deck.id}`);
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  }

  function startManual() {
    setMode("review");
    setTitle("");
    setDescription("");
    setEmoji("📘");
    setCards([{ question: "", answer: "" }]);
  }

  if (mode === "generating") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 text-yellow-300 mb-6 animate-pulse">
          <Wand2 className="w-7 h-7" />
        </div>
        <h2 className="font-display text-4xl sm:text-5xl text-zinc-900 mb-3">
          Reading your material...
        </h2>
        <p className="text-zinc-600 mb-8">Pulling out concepts and writing your cards. Takes about 10 seconds.</p>
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (mode === "review") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => setMode("input")}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to source
        </button>

        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-zinc-900 tracking-tight mb-2">
            Review and save
          </h1>
          <p className="text-zinc-600">Edit any card, then save the deck.</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 mb-6">
          <div className="grid grid-cols-[auto_1fr] gap-4 items-start mb-5">
            <button
              type="button"
              onClick={() => {
                const next = prompt("Pick an emoji for this deck", emoji);
                if (next) setEmoji(next.slice(0, 4));
              }}
              className={`w-14 h-14 rounded-xl ${colorOf(color).soft} text-3xl flex items-center justify-center hover:ring-2 hover:ring-zinc-200`}
              title="Change emoji"
            >
              {emoji}
            </button>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Deck title"
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-1 text-2xl font-semibold focus:outline-none focus:border-zinc-900"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-1 text-zinc-600 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">Color</div>
            <div className="flex gap-1.5">
              {DECK_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  type="button"
                  className={`w-7 h-7 rounded-full ${colorOf(c).bg} ring-offset-2 transition-all ${color === c ? "ring-2 ring-zinc-900" : "hover:scale-110"}`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {cards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200/80 p-4 group">
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono text-zinc-400 mt-2 w-6">{(i + 1).toString().padStart(2, "0")}</span>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={c.question}
                    onChange={(e) => {
                      const next = [...cards]; next[i] = { ...next[i], question: e.target.value }; setCards(next);
                    }}
                    placeholder="Question"
                    rows={2}
                    className="w-full resize-none bg-transparent border-0 text-zinc-900 font-medium focus:outline-none placeholder:text-zinc-300"
                  />
                  <textarea
                    value={c.answer}
                    onChange={(e) => {
                      const next = [...cards]; next[i] = { ...next[i], answer: e.target.value }; setCards(next);
                    }}
                    placeholder="Answer"
                    rows={2}
                    className="w-full resize-none bg-transparent border-0 border-t border-zinc-100 pt-2 text-zinc-600 focus:outline-none placeholder:text-zinc-300"
                  />
                </div>
                <button
                  onClick={() => setCards(cards.filter((_, j) => j !== i))}
                  type="button"
                  className="text-zinc-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCards([...cards, { question: "", answer: "" }])}
            className="w-full bg-white rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add card
          </button>
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={() => setMode("input")}
            className="px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium hover:border-zinc-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/decks" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to library
      </Link>

      <h1 className="font-display text-5xl sm:text-6xl text-zinc-900 tracking-tight mb-3">
        New deck
      </h1>
      <p className="text-zinc-600 mb-8">Paste any text and AI will build the deck. Or start blank and add cards by hand.</p>

      <div className="inline-flex items-center bg-zinc-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setTab("ai")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "ai" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
        >
          <Sparkles className="w-3.5 h-3.5 inline mr-1.5" /> Generate with AI
        </button>
        <button
          onClick={() => setTab("manual")}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "manual" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
        >
          <Pencil className="w-3.5 h-3.5 inline mr-1.5" /> Start blank
        </button>
      </div>

      {tab === "ai" ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6">
          <label className="block text-sm font-medium text-zinc-900 mb-2">Source material</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes, a chapter, an article, a transcript..."
            rows={12}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 leading-relaxed text-[15px] resize-none"
            maxLength={12000}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="text-xs text-zinc-500">{text.length.toLocaleString()} / 12,000 characters</div>
            <button
              type="button"
              onClick={() => setText(SAMPLE_PROMPT)}
              className="text-xs text-zinc-500 hover:text-zinc-900 underline-offset-2 hover:underline"
            >
              Use sample text
            </button>
          </div>

          <div className="border-t border-zinc-100 mt-5 pt-5">
            <label className="block text-sm font-medium text-zinc-900 mb-3">Cards to generate</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={4} max={24} value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="flex-1 accent-zinc-900"
              />
              <div className="text-sm font-medium text-zinc-900 w-12 text-right tabular-nums">{count}</div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={generate}
              disabled={text.trim().length < 30}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" /> Generate deck <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 mx-auto flex items-center justify-center text-zinc-700 mb-4">
            <Pencil className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">Start with a blank deck</h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-sm mx-auto">
            Build cards one at a time. Best for quick decks of 5-10 cards.
          </p>
          <button
            onClick={startManual}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4" /> New blank deck
          </button>
        </div>
      )}
    </div>
  );
}
