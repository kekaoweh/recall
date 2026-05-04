import Link from "next/link";
import { Sparkles } from "lucide-react";

export function EmptyDecks() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/40 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 mx-auto flex items-center justify-center text-yellow-300 mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">Create your first deck</h3>
      <p className="text-sm text-zinc-500 mb-5 max-w-sm mx-auto">
        Paste your notes, an article, or any text. Recall turns it into flashcards in seconds.
      </p>
      <Link
        href="/decks/new"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
      >
        <Sparkles className="w-3.5 h-3.5" /> Generate a deck
      </Link>
    </div>
  );
}
