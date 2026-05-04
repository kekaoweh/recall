import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";

// Append one or more cards to a deck.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await getOwnerKey();
  const body = await req.json().catch(() => ({}));

  const existing = await sql`SELECT id FROM decks WHERE id = ${id} AND owner_key = ${owner} LIMIT 1`;
  if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const incoming: Array<{ question?: string; answer?: string }> = Array.isArray(body.cards)
    ? body.cards
    : body.question && body.answer
      ? [{ question: body.question, answer: body.answer }]
      : [];

  const valid = incoming
    .filter((c) => c.question && c.answer)
    .map((c) => ({
      question: String(c.question).slice(0, 600),
      answer: String(c.answer).slice(0, 1200),
    }));

  if (valid.length === 0) return NextResponse.json({ error: "No valid cards" }, { status: 400 });

  const startRows = await sql`
    SELECT COALESCE(MAX(position), -1)::int AS max_pos FROM cards WHERE deck_id = ${id}
  `;
  const startPos = (startRows[0]?.max_pos ?? -1) + 1;

  const questions = valid.map((c) => c.question);
  const answers = valid.map((c) => c.answer);
  const positions = valid.map((_, i) => startPos + i);

  const rows = await sql`
    INSERT INTO cards (deck_id, question, answer, position)
    SELECT ${id}::uuid, q, a, p
    FROM unnest(${questions}::text[], ${answers}::text[], ${positions}::int[]) AS t(q, a, p)
    RETURNING *
  `;

  await sql`UPDATE decks SET updated_at = now() WHERE id = ${id}`;
  return NextResponse.json({ cards: rows });
}
