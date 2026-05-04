import Anthropic from "@anthropic-ai/sdk";

export type GeneratedCard = { question: string; answer: string };
export type GeneratedDeck = {
  title: string;
  description: string;
  emoji: string;
  cards: GeneratedCard[];
};

const SYSTEM = `You are an expert tutor who creates flashcards from study material.
Rules:
- Each card has ONE clear question and ONE concise answer (1-3 sentences).
- Cover the most important, testable concepts. Skip filler.
- Questions should be specific, not "What is this about?".
- No markdown in question/answer fields. Plain prose only.
- If material is short, generate fewer cards. If long, up to ~20.
- Return JSON ONLY, no commentary, no code fences.`;

const userPrompt = (text: string, count: number) => `Generate flashcards from the following study material.
Return strict JSON of shape:
{
  "title": "<short title, 2-6 words>",
  "description": "<one sentence describing the deck>",
  "emoji": "<single emoji that fits the topic>",
  "cards": [
    { "question": "...", "answer": "..." }
  ]
}
Aim for ${count} cards.

MATERIAL:
"""
${text}
"""`;

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text.trim();
}

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  _client = new Anthropic({ apiKey });
  return _client;
}

const MODELS = ["claude-haiku-4-5-20251001", "claude-sonnet-4-5-20250929"];

export async function generateDeckFromText(text: string, target: number = 12): Promise<GeneratedDeck> {
  const trimmed = text.trim().slice(0, 12000);
  if (trimmed.length < 30) {
    throw new Error("Need at least a few sentences of source material.");
  }

  let raw = "";
  let lastErr: string | null = null;
  for (const model of MODELS) {
    try {
      const res = await client().messages.create({
        model,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt(trimmed, target) }],
      });
      const block = res.content.find((b) => b.type === "text");
      if (block && block.type === "text" && block.text) {
        raw = block.text;
        break;
      }
      lastErr = "empty model output";
    } catch (e) {
      lastErr = (e as Error).message;
      continue;
    }
  }
  if (!raw) throw new Error(`AI request failed: ${lastErr || "unknown"}`);

  const json = extractJson(raw);
  let parsed: GeneratedDeck;
  try {
    parsed = JSON.parse(json) as GeneratedDeck;
  } catch {
    throw new Error("AI response was not valid JSON.");
  }
  if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    throw new Error("AI did not produce any cards.");
  }
  return {
    title: (parsed.title || "Untitled deck").slice(0, 80),
    description: (parsed.description || "").slice(0, 200),
    emoji: (parsed.emoji || "📘").slice(0, 4),
    cards: parsed.cards
      .filter((c) => c && c.question && c.answer)
      .slice(0, 30)
      .map((c) => ({
        question: String(c.question).slice(0, 600),
        answer: String(c.answer).slice(0, 1200),
      })),
  };
}
