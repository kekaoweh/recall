import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOwnerKey } from "@/lib/owner";
import { DECK_COLORS } from "@/lib/types";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await getOwnerKey();
  const deckRows = await sql`
    SELECT * FROM decks
    WHERE id = ${id} AND (owner_key = ${owner} OR is_public = true)
    LIMIT 1
  `;
  if (deckRows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const deck = deckRows[0];
  const cards = await sql`
    SELECT * FROM cards WHERE deck_id = ${id} ORDER BY position ASC, created_at ASC
  `;
  const isOwner = deck.owner_key === owner;
  return NextResponse.json({ deck: { ...deck, is_owner: isOwner }, cards });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await getOwnerKey();
  const body = await req.json().catch(() => ({}));

  const existing = await sql`SELECT * FROM decks WHERE id = ${id} AND owner_key = ${owner} LIMIT 1`;
  if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const title = body.title !== undefined ? String(body.title).slice(0, 80).trim() : existing[0].title;
  const description = body.description !== undefined ? (body.description ? String(body.description).slice(0, 300) : null) : existing[0].description;
  const emoji = body.emoji !== undefined ? String(body.emoji).slice(0, 4) : existing[0].emoji;
  const color = body.color !== undefined && DECK_COLORS.includes(body.color) ? body.color : existing[0].color;
  const isPublic = body.is_public !== undefined ? Boolean(body.is_public) : existing[0].is_public;

  const rows = await sql`
    UPDATE decks
    SET title = ${title}, description = ${description}, emoji = ${emoji}, color = ${color},
        is_public = ${isPublic}, updated_at = now()
    WHERE id = ${id} AND owner_key = ${owner}
    RETURNING *
  `;
  return NextResponse.json({ deck: rows[0] });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getDb();
  const owner = await getOwnerKey();
  const result = await sql`DELETE FROM decks WHERE id = ${id} AND owner_key = ${owner} RETURNING id`;
  if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
