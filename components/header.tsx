import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#fafaf7]/70 border-b border-zinc-200/70">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-yellow-300 group-hover:rotate-3 transition-transform">
            <span className="text-base font-bold">R</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Recall</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/decks"
            className="px-3 py-2 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors"
          >
            My decks
          </Link>
          <Link
            href="/decks/new"
            className="ml-1 px-3.5 py-2 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New deck
          </Link>
        </nav>
      </div>
    </header>
  );
}
