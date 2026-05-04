-- Recall — schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source_text TEXT,
  owner_key TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  emoji TEXT NOT NULL DEFAULT '📘',
  color TEXT NOT NULL DEFAULT 'indigo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS decks_owner_idx ON decks(owner_key);
CREATE INDEX IF NOT EXISTS decks_public_idx ON decks(is_public);

CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cards_deck_idx ON cards(deck_id, position);

CREATE TABLE IF NOT EXISTS review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  owner_key TEXT NOT NULL,
  rating SMALLINT NOT NULL, -- 0=again, 1=hard, 2=good, 3=easy
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS review_log_owner_idx ON review_log(owner_key, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS review_log_deck_idx ON review_log(deck_id);
