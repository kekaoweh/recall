import Link from "next/link";
import { colorOf, type Deck } from "@/lib/types";
import { Layers } from "lucide-react";

export function DeckCard({ deck, sample }: { deck: Deck; sample?: boolean }) {
  const color = colorOf(deck.color);
  return (
    <Link
      href={`/decks/${deck.id}`}
      className="deck-tile relative group block bg-white rounded-2xl border border-zinc-200/80 overflow-hidden hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
    >
      <div className={`h-2 ${color.bg}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${color.soft} flex items-center justify-center text-2xl`}>
            {deck.emoji || "📘"}
          </div>
          {sample && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
              Sample
            </span>
          )}
        </div>
        <h3 className="font-semibold text-zinc-900 text-base leading-snug mb-1 line-clamp-2">{deck.title}</h3>
        {deck.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">{deck.description}</p>
        )}
        {!deck.description && <div className="min-h-[2.5rem] mb-4" />}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Layers className="w-3.5 h-3.5" />
          <span>{deck.card_count ?? 0} {(deck.card_count ?? 0) === 1 ? "card" : "cards"}</span>
        </div>
      </div>
    </Link>
  );
}
