import Link from "next/link";
import { Header } from "@/components/header";
import { DeckCard } from "@/components/deck-card";
import { EmptyDecks } from "@/components/empty-state";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";
import type { Deck } from "@/lib/types";
import { Sparkles, Flame, Layers, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDecks(): Promise<{ owned: Deck[]; samples: Deck[] }> {
  const sql = getDb();
  const owner = await getOwnerKey();
  const rows = await sql`
    SELECT d.id, d.title, d.description, d.emoji, d.color, d.is_public, d.owner_key,
           d.created_at, d.updated_at,
           COALESCE(c.cnt, 0)::int AS card_count
    FROM decks d
    LEFT JOIN (SELECT deck_id, COUNT(*)::int AS cnt FROM cards GROUP BY deck_id) c ON c.deck_id = d.id
    WHERE d.owner_key = ${owner} OR d.is_public = true
    ORDER BY (d.owner_key = ${owner}) DESC, d.updated_at DESC
  `;
  const decks = rows as unknown as Deck[];
  return {
    owned: decks.filter((d) => d.owner_key === owner),
    samples: decks.filter((d) => d.is_public && d.owner_key !== owner),
  };
}

async function getStats() {
  const sql = getDb();
  const owner = await getOwnerKey();
  const [d] = await sql`SELECT COUNT(*)::int AS n FROM decks WHERE owner_key = ${owner}`;
  const [c] = await sql`SELECT COUNT(*)::int AS n FROM cards WHERE deck_id IN (SELECT id FROM decks WHERE owner_key = ${owner})`;
  const [r] = await sql`SELECT COUNT(*)::int AS n FROM review_log WHERE owner_key = ${owner}`;
  return { decks: d.n, cards: c.n, reviews: r.n };
}

export default async function DecksPage() {
  const [{ owned, samples }, stats] = await Promise.all([getDecks(), getStats()]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-5xl sm:text-6xl text-zinc-900 tracking-tight mb-2">
              Your library
            </h1>
            <p className="text-zinc-600">
              {owned.length === 0
                ? "Nothing here yet. Create your first deck below."
                : `${owned.length} ${owned.length === 1 ? "deck" : "decks"} you've built.`}
            </p>
          </div>
          <Link
            href="/decks/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> New deck
          </Link>
        </div>

        {owned.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <Stat icon={<Layers className="w-4 h-4" />} label="Decks" value={stats.decks} />
            <Stat icon={<BookOpen className="w-4 h-4" />} label="Cards" value={stats.cards} />
            <Stat icon={<Flame className="w-4 h-4" />} label="Reviews" value={stats.reviews} />
          </div>
        )}

        {owned.length === 0 ? (
          <EmptyDecks />
        ) : (
          <div className="mb-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {owned.map((d) => (
                <DeckCard key={d.id} deck={d} />
              ))}
            </div>
          </div>
        )}

        {samples.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-xl font-semibold text-zinc-900">Sample decks</h2>
              <p className="text-sm text-zinc-500">Pre-built decks you can study right now.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {samples.map((d) => (
                <DeckCard key={d.id} deck={d} sample />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">{icon}</div>
      <div>
        <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</div>
        <div className="text-2xl font-semibold text-zinc-900 leading-tight">{value}</div>
      </div>
    </div>
  );
}
