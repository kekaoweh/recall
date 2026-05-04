import { NextRequest, NextResponse } from "next/server";
import { generateDeckFromText } from "@/lib/ai";

export const maxDuration = 60;

// Preview-only: returns generated deck + cards without persisting.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text = (body.text || "").toString();
  const targetCount = Math.min(Math.max(Number(body.count) || 12, 4), 24);

  if (!text.trim()) return NextResponse.json({ error: "Text is required" }, { status: 400 });

  try {
    const generated = await generateDeckFromText(text, targetCount);
    return NextResponse.json({ generated });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Generation failed" },
      { status: 500 },
    );
  }
}
