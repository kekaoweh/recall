import Link from "next/link";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <div className="text-7xl mb-4">🤔</div>
        <h1 className="font-display text-5xl text-zinc-900 mb-3 tracking-tight">Nothing here</h1>
        <p className="text-zinc-600 mb-8">That deck doesn&apos;t exist, or it isn&apos;t shared with you.</p>
        <Link
          href="/decks"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800"
        >
          Back to library
        </Link>
      </div>
    </div>
  );
}
