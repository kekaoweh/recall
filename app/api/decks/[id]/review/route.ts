import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await getOwnerKey();
  const body = await req.json().catch(() => ({}));
  const cardId = body.card_id;
  const rating = Number(body.rating);
  if (!cardId || ![0, 1, 2, 3].includes(rating)) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  // verify card lives under this deck
  const exists = await sql`SELECT id FROM cards WHERE id = ${cardId} AND deck_id = ${id} LIMIT 1`;
  if (exists.length === 0) return NextResponse.json({ error: "Card not in deck" }, { status: 404 });

  await sql`
    INSERT INTO review_log (card_id, deck_id, owner_key, rating)
    VALUES (${cardId}, ${id}, ${owner}, ${rating})
  `;
  return NextResponse.json({ ok: true });
}
