import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureOwnerKey } from "@/lib/owner";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await ensureOwnerKey();
  const body = await req.json().catch(() => ({}));

  // ensure card belongs to a deck owned by this user
  const ownerCheck = await sql`
    SELECT c.id, d.id AS deck_id
    FROM cards c
    JOIN decks d ON d.id = c.deck_id
    WHERE c.id = ${id} AND d.owner_key = ${owner}
    LIMIT 1
  `;
  if (ownerCheck.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const existing = await sql`SELECT * FROM cards WHERE id = ${id} LIMIT 1`;
  const cur = existing[0];
  const question = body.question !== undefined ? String(body.question).slice(0, 600) : cur.question;
  const answer = body.answer !== undefined ? String(body.answer).slice(0, 1200) : cur.answer;
  const position = body.position !== undefined ? Number(body.position) : cur.position;

  const rows = await sql`
    UPDATE cards SET question = ${question}, answer = ${answer}, position = ${position}
    WHERE id = ${id}
    RETURNING *
  `;
  await sql`UPDATE decks SET updated_at = now() WHERE id = ${ownerCheck[0].deck_id}`;
  return NextResponse.json({ card: rows[0] });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await ensureOwnerKey();
  const result = await sql`
    DELETE FROM cards
    WHERE id = ${id} AND deck_id IN (SELECT id FROM decks WHERE owner_key = ${owner})
    RETURNING id, deck_id
  `;
  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await sql`UPDATE decks SET updated_at = now() WHERE id = ${result[0].deck_id}`;
  return NextResponse.json({ ok: true });
}
