import Link from "next/link";
import { Header } from "@/components/header";
import { ArrowRight, Sparkles, Zap, Brain, Layers, Check } from "lucide-react";
import { getDb } from "@/lib/db";
import { DeckCard } from "@/components/deck-card";
import type { Deck } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPublicDecks(): Promise<Deck[]> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT d.id, d.title, d.description, d.emoji, d.color, d.is_public, d.owner_key,
             d.created_at, d.updated_at,
             COALESCE(c.cnt, 0)::int AS card_count
      FROM decks d
      LEFT JOIN (SELECT deck_id, COUNT(*)::int AS cnt FROM cards GROUP BY deck_id) c ON c.deck_id = d.id
      WHERE d.is_public = true
      ORDER BY d.created_at ASC
      LIMIT 6
    `;
    return rows as unknown as Deck[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const samples = await getPublicDecks();

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" /> AI-powered flashcards
            </div>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-zinc-900 leading-[0.95] tracking-tight mb-6">
              Turn anything you read<br />
              into flashcards <span className="italic text-zinc-500">that stick.</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed mb-9 max-w-2xl">
              Paste a chapter, an article, your messy lecture notes — Recall generates a
              clean deck in seconds, then helps you actually remember it.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/decks/new"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Create a deck
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/decks"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-zinc-200 text-zinc-900 font-medium hover:border-zinc-300 transition-colors"
              >
                Browse my decks
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> No signup</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Free to use</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Auto-saves to your browser</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200/70 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            <Step
              icon={<Zap className="w-5 h-5" />}
              n="01"
              title="Paste any text"
              body="Lecture notes, a textbook chapter, a Wikipedia article, a transcript. Up to 12,000 characters per deck."
            />
            <Step
              icon={<Brain className="w-5 h-5" />}
              n="02"
              title="AI builds the deck"
              body="Claude reads it, pulls out testable concepts, and writes specific question-and-answer cards. You review before saving."
            />
            <Step
              icon={<Layers className="w-5 h-5" />}
              n="03"
              title="Study and remember"
              body="Flip cards, rate your recall, track streaks. Cards you bomb come back; cards you nail get spaced out."
            />
          </div>
        </div>
      </section>

      {samples.length > 0 && (
        <section className="bg-[#fafaf7]">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-4xl sm:text-5xl text-zinc-900 tracking-tight mb-2">
                  Try a sample deck
                </h2>
                <p className="text-zinc-600">No setup. Click any deck and start studying.</p>
              </div>
              <Link href="/decks" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:gap-2 transition-all">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {samples.map((deck) => (
                <DeckCard key={deck.id} deck={deck} sample />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display text-5xl sm:text-6xl tracking-tight mb-5">
            Ready to <span className="italic text-yellow-300">remember</span>?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            One paste. One click. A whole deck. You&apos;ll wonder why you ever made flashcards by hand.
          </p>
          <Link
            href="/decks/new"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Create your first deck
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-500 text-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Recall</div>
          <div className="flex items-center gap-2 text-zinc-500">
            <span>Built as a personal project ·</span>
            <span className="text-zinc-300">Next.js + Postgres + Claude</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ icon, n, title, body }: { icon: React.ReactNode; n: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">{icon}</div>
        <span className="text-xs font-mono text-zinc-400">{n}</span>
      </div>
      <h3 className="font-semibold text-lg text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-600 leading-relaxed text-[15px]">{body}</p>
    </div>
  );
}
