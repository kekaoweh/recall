import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";
import { DECK_COLORS } from "@/lib/types";

export async function GET() {
  const sql = getDb();
  const owner = await getOwnerKey();
  const decks = await sql`
    SELECT d.id, d.title, d.description, d.emoji, d.color, d.is_public,
           d.created_at, d.updated_at,
           COALESCE(c.cnt, 0)::int AS card_count
    FROM decks d
    LEFT JOIN (SELECT deck_id, COUNT(*)::int AS cnt FROM cards GROUP BY deck_id) c ON c.deck_id = d.id
    WHERE d.owner_key = ${owner} OR d.is_public = true
    ORDER BY (d.owner_key = ${owner}) DESC, d.updated_at DESC
  `;
  return NextResponse.json({ decks });
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const owner = await getOwnerKey();
  const body = await req.json().catch(() => ({}));
  const title = (body.title || "Untitled deck").toString().slice(0, 80).trim() || "Untitled deck";
  const description = body.description ? String(body.description).slice(0, 300) : null;
  const emoji = body.emoji ? String(body.emoji).slice(0, 4) : "📘";
  const color = DECK_COLORS.includes(body.color) ? body.color : "indigo";
  const sourceText = body.source_text ? String(body.source_text).slice(0, 20000) : null;

  const rows = await sql`
    INSERT INTO decks (title, description, emoji, color, source_text, owner_key)
    VALUES (${title}, ${description}, ${emoji}, ${color}, ${sourceText}, ${owner})
    RETURNING *
  `;
  const deck = rows[0];

  if (Array.isArray(body.cards) && body.cards.length > 0) {
    const cards = body.cards
      .filter((c: { question?: string; answer?: string }) => c?.question && c?.answer)
      .slice(0, 60)
      .map((c: { question: string; answer: string }, i: number) => ({
        deck_id: deck.id,
        question: String(c.question).slice(0, 600),
        answer: String(c.answer).slice(0, 1200),
        position: i,
      }));
    if (cards.length > 0) {
      // bulk insert via unnest
      const questions = cards.map((c: { question: string }) => c.question);
      const answers = cards.map((c: { answer: string }) => c.answer);
      const positions = cards.map((c: { position: number }) => c.position);
      await sql`
        INSERT INTO cards (deck_id, question, answer, position)
        SELECT ${deck.id}::uuid, q, a, p
        FROM unnest(${questions}::text[], ${answers}::text[], ${positions}::int[]) AS t(q, a, p)
      `;
    }
  }

  return NextResponse.json({ deck });
}
