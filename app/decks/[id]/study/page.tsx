import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";
import { StudyClient } from "./study-client";

export const dynamic = "force-dynamic";

async function loadDeck(id: string) {
  const sql = getDb();
  const owner = await getOwnerKey();
  const decks = await sql`
    SELECT * FROM decks WHERE id = ${id} AND (owner_key = ${owner} OR is_public = true) LIMIT 1
  `;
  if (decks.length === 0) return null;
  const deck = decks[0];
  const cards = await sql`SELECT id, question, answer, position FROM cards WHERE deck_id = ${id} ORDER BY position ASC, created_at ASC`;
  return { deck, cards };
}

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadDeck(id);
  if (!data) return notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StudyClient
        deckId={data.deck.id}
        title={data.deck.title}
        emoji={data.deck.emoji}
        color={data.deck.color}
        cards={data.cards as { id: string; question: string; answer: string; position: number }[]}
      />
    </div>
  );
}
