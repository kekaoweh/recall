import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureOwnerKey } from "@/lib/owner";

export async function GET() {
  const sql = getDb();
  const owner = await ensureOwnerKey();
  const [deckCount] = await sql`SELECT COUNT(*)::int AS n FROM decks WHERE owner_key = ${owner}`;
  const [cardCount] = await sql`
    SELECT COUNT(*)::int AS n FROM cards
    WHERE deck_id IN (SELECT id FROM decks WHERE owner_key = ${owner})
  `;
  const [reviewCount] = await sql`SELECT COUNT(*)::int AS n FROM review_log WHERE owner_key = ${owner}`;
  const [todayCount] = await sql`
    SELECT COUNT(*)::int AS n FROM review_log
    WHERE owner_key = ${owner} AND reviewed_at > now() - interval '24 hours'
  `;
  const recall = await sql`
    SELECT
      COALESCE(AVG(CASE WHEN rating >= 2 THEN 1 ELSE 0 END), 0)::float AS recall_rate
    FROM review_log
    WHERE owner_key = ${owner} AND reviewed_at > now() - interval '30 days'
  `;
  // streak: consecutive days with at least one review (up to 30)
  const days = await sql`
    SELECT DISTINCT date_trunc('day', reviewed_at AT TIME ZONE 'UTC')::date AS d
    FROM review_log
    WHERE owner_key = ${owner} AND reviewed_at > now() - interval '60 days'
    ORDER BY d DESC
  `;
  let streak = 0;
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setUTCDate(today.getUTCDate() - i);
    const dStr = (days[i].d as Date).toISOString().slice(0, 10);
    if (dStr === expected.toISOString().slice(0, 10)) streak++;
    else break;
  }

  return NextResponse.json({
    decks: deckCount.n,
    cards: cardCount.n,
    reviews: reviewCount.n,
    today: todayCount.n,
    recall_rate: Math.round((recall[0]?.recall_rate || 0) * 100),
    streak,
  });
}
