# Recall

AI-powered flashcards. Paste any text — notes, an article, a chapter — and Recall generates a clean study deck in seconds. Then it helps you remember it: flip cards, rate your recall, track streaks.

Built as a portfolio project to learn modern full-stack development end-to-end.

## Stack

- **Next.js 16** (App Router, React Server Components, Server Actions)
- **TypeScript** — strict mode, end-to-end types
- **PostgreSQL** (Neon serverless) — three tables: `decks`, `cards`, `review_log`
- **Tailwind CSS v4** + **shadcn/ui** for the UI
- **Anthropic Claude** (Haiku 4.5 with Sonnet 4.5 fallback) for deck generation
- **Vercel** for hosting

## Architecture notes

- **Per-browser identity, no auth.** A cookie set by `middleware.ts` issues a stable owner key on first visit. Server components can't write cookies, so middleware does it before any handler runs. Each visitor's library is private to their browser.
- **Database guard pattern.** `lib/db.ts` exposes `getDb()` which checks `DATABASE_URL` *inside* the function, not at module top level. Top-level throws break Next.js's "Collecting page data" build phase even on routes that never query the DB.
- **AI generation has a fallback chain.** `lib/ai.ts` calls Haiku first (fast, cheap) and falls back to Sonnet on rate limit / empty output. Every model response is sanity-checked for valid JSON before saving.
- **Self-correcting study queue.** When you rate a card "Again," it goes back into the queue for the same session. The session ends only when every card is rated "Hard" or better at least once.

## Local setup

You need accounts at:

1. [Neon](https://neon.tech) — free Postgres
2. [Anthropic Console](https://console.anthropic.com) — Claude API key

Then:

```bash
git clone https://github.com/YOUR-USERNAME/recall.git
cd recall
npm install
cp .env.example .env.local
# Fill in DATABASE_URL and ANTHROPIC_API_KEY in .env.local
node scripts/migrate.mjs   # apply schema + seed sample decks
npm run dev
```

Visit `http://localhost:3000`.

## Deploy

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the two env vars (`DATABASE_URL`, `ANTHROPIC_API_KEY`) in Vercel's project settings
4. Deploy

The schema migration runs once locally (or you can run it from any machine that can reach the database).

## File map

```
app/
  page.tsx                      Landing page
  decks/
    page.tsx                    Library (your decks + sample decks)
    new/                        Create deck (paste text → AI generates)
    [id]/
      page.tsx                  Deck detail with editable card list
      study/                    Flip-card study mode
  api/
    decks/                      CRUD for decks
    decks/[id]/cards/           Append cards to a deck
    decks/[id]/review/          Log a review rating
    cards/[id]/                 Edit / delete a single card
    generate/                   Preview AI-generated deck (no DB write)
    stats/                      Per-user stats (decks, cards, reviews, streak)

lib/
  db.ts                         Neon Postgres client
  ai.ts                         Claude prompt + JSON extraction
  owner.ts                      Reads the per-browser owner cookie
  types.ts                      Shared types + color palette
  schema.sql                    Database schema

components/
  header.tsx                    Top navigation
  deck-card.tsx                 Library tile
  empty-state.tsx               First-run placeholder
  ui/                           shadcn/ui primitives

middleware.ts                   Issues owner cookie on first visit
```

## Why I built this

I wanted a single project that exercised every layer of a modern web app: data modeling, server-side rendering, client interactivity, third-party API integration, deployment. Flashcards turned out to be a great fit — the surface is small enough to ship, but the interaction (flip + rate + queue) has real product feel.

Things I'd add next: a proper SM-2 spaced-repetition scheduler, deck import from PDF, Anki export, and an option to generate cards from a YouTube transcript URL.
