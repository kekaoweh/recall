export type Deck = {
  id: string;
  title: string;
  description: string | null;
  source_text: string | null;
  owner_key: string;
  is_public: boolean;
  emoji: string;
  color: string;
  created_at: string;
  updated_at: string;
  card_count?: number;
};

export type Card = {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  position: number;
  created_at: string;
};

export type ReviewRating = 0 | 1 | 2 | 3; // again | hard | good | easy

export const DECK_COLORS = [
  "indigo",
  "violet",
  "rose",
  "amber",
  "emerald",
  "sky",
  "fuchsia",
  "orange",
] as const;

export type DeckColor = (typeof DECK_COLORS)[number];

export const COLOR_CLASSES: Record<string, { bg: string; text: string; ring: string; border: string; soft: string }> = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", ring: "ring-indigo-200", border: "border-indigo-200", soft: "bg-indigo-50" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", ring: "ring-violet-200", border: "border-violet-200", soft: "bg-violet-50" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", ring: "ring-rose-200", border: "border-rose-200", soft: "bg-rose-50" },
  amber: { bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200", border: "border-amber-200", soft: "bg-amber-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200", border: "border-emerald-200", soft: "bg-emerald-50" },
  sky: { bg: "bg-sky-500", text: "text-sky-600", ring: "ring-sky-200", border: "border-sky-200", soft: "bg-sky-50" },
  fuchsia: { bg: "bg-fuchsia-500", text: "text-fuchsia-600", ring: "ring-fuchsia-200", border: "border-fuchsia-200", soft: "bg-fuchsia-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", ring: "ring-orange-200", border: "border-orange-200", soft: "bg-orange-50" },
};

export function colorOf(name: string) {
  return COLOR_CLASSES[name] || COLOR_CLASSES.indigo;
}
