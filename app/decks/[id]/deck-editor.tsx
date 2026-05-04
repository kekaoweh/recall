"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Card = { id: string; question: string; answer: string; position: number };

export function DeckEditor({
  deckId, initialCards, canEdit,
}: { deckId: string; initialCards: Card[]; canEdit: boolean }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [busy, setBusy] = useState(false);

  function startEdit(c: Card) {
    setEditingId(c.id);
    setEditQ(c.question);
    setEditA(c.answer);
  }
  function cancelEdit() { setEditingId(null); }

  async function saveEdit(id: string) {
    if (!editQ.trim() || !editA.trim()) {
      toast.error("Both sides need text.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editQ, answer: editA }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setCards(cards.map((c) => (c.id === id ? data.card : c)));
      setEditingId(null);
      toast.success("Card updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteCard(id: string) {
    if (!confirm("Delete this card?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCards(cards.filter((c) => c.id !== id));
      toast.success("Card deleted");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function addCard() {
    if (!newQ.trim() || !newA.trim()) {
      toast.error("Both sides need text.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ, answer: newA }),
      });
      if (!res.ok) throw new Error("Add failed");
      const data = await res.json();
      setCards([...cards, ...data.cards]);
      setNewQ(""); setNewA(""); setAdding(false);
      toast.success("Card added");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-zinc-500 font-medium px-1 mb-1">
        Cards in this deck
      </div>
      {cards.map((c, i) => (
        <div key={c.id} className="bg-white rounded-xl border border-zinc-200/80 group">
          {editingId === c.id ? (
            <div className="p-4">
              <textarea
                value={editQ} onChange={(e) => setEditQ(e.target.value)}
                rows={2}
                className="w-full resize-none bg-transparent border-0 text-zinc-900 font-medium focus:outline-none"
                placeholder="Question"
              />
              <div className="border-t border-zinc-100 my-2" />
              <textarea
                value={editA} onChange={(e) => setEditA(e.target.value)}
                rows={2}
                className="w-full resize-none bg-transparent border-0 text-zinc-600 focus:outline-none"
                placeholder="Answer"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900">
                  Cancel
                </button>
                <button
                  onClick={() => saveEdit(c.id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-start gap-3">
              <span className="text-xs font-mono text-zinc-400 mt-1 w-6">{(i + 1).toString().padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-900 mb-1.5 leading-snug">{c.question}</div>
                <div className="text-zinc-600 text-[15px] leading-relaxed">{c.answer}</div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(c)} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteCard(c.id)} className="p-1.5 rounded-md hover:bg-rose-50 text-zinc-500 hover:text-rose-600" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {canEdit && (
        adding ? (
          <div className="bg-white rounded-xl border-2 border-zinc-900/10 p-4">
            <textarea
              value={newQ} onChange={(e) => setNewQ(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent border-0 text-zinc-900 font-medium focus:outline-none placeholder:text-zinc-300"
              placeholder="Question"
              autoFocus
            />
            <div className="border-t border-zinc-100 my-2" />
            <textarea
              value={newA} onChange={(e) => setNewA(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent border-0 text-zinc-600 focus:outline-none placeholder:text-zinc-300"
              placeholder="Answer"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setAdding(false); setNewQ(""); setNewA(""); }}
                className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={addCard}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Add card
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full bg-white rounded-xl border border-dashed border-zinc-300 p-3.5 text-sm text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add card
          </button>
        )
      )}
    </div>
  );
}
