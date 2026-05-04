import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";
import { colorOf } from "@/lib/types";
import { ArrowLeft, Play, Layers, Globe, Lock } from "lucide-react";
import { DeckEditor } from "./deck-editor";
import { DeckEditorMenu } from "./deck-editor-menu";

export const dynamic = "force-dynamic";

async function getDeck(id: string) {
  const sql = getDb();
  const owner = await getOwnerKey();
  const deckRows = await sql`
    SELECT * FROM decks
    WHERE id = ${id} AND (owner_key = ${owner} OR is_public = true)
    LIMIT 1
  `;
  if (deckRows.length === 0) return null;
  const deck = deckRows[0];
  const cards = await sql`SELECT * FROM cards WHERE deck_id = ${id} ORDER BY position ASC, created_at ASC`;
  return { deck, cards, isOwner: deck.owner_key === owner };
}

export default async function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDeck(id);
  if (!data) return notFound();
  const { deck, cards, isOwner } = data;
  const color = colorOf(deck.color);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/decks" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to library
        </Link>

        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden mb-8">
          <div className={`h-2 ${color.bg}`} />
          <div className="p-8 sm:p-10">
            <div className="flex items-start gap-5 mb-6">
              <div className={`w-16 h-16 rounded-2xl ${color.soft} flex items-center justify-center text-4xl shrink-0`}>
                {deck.emoji || "📘"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-4xl sm:text-5xl text-zinc-900 tracking-tight leading-tight mb-2">
                  {deck.title}
                </h1>
                {deck.description && <p className="text-zinc-600 text-lg">{deck.description}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> {cards.length} {cards.length === 1 ? "card" : "cards"}
              </span>
              <span className="text-zinc-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                {deck.is_public
                  ? <><Globe className="w-4 h-4" /> Public</>
                  : <><Lock className="w-4 h-4" /> Private</>}
              </span>
              {!isOwner && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="inline-flex items-center gap-1.5 text-zinc-500">Shared deck — read only</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/decks/${deck.id}/study`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg ${color.bg} text-white font-medium hover:opacity-90 transition-opacity`}
              >
                <Play className="w-4 h-4 fill-current" /> Study deck
              </Link>
              {isOwner && <DeckEditorMenu deckId={deck.id} isPublic={deck.is_public} />}
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/40 p-12 text-center">
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">No cards yet</h3>
            <p className="text-sm text-zinc-500 mb-5">{isOwner ? "Add the first one below." : "This deck is empty."}</p>
          </div>
        ) : (
          <DeckEditor deckId={deck.id} initialCards={cards as { id: string; question: string; answer: string; position: number }[]} canEdit={isOwner} />
        )}
      </div>
    </div>
  );
}

