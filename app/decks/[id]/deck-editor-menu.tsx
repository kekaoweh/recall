"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Globe, Lock, Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export function DeckEditorMenu({ deckId, isPublic }: { deckId: string; isPublic: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function togglePublic() {
    setBusy(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: !isPublic }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(isPublic ? "Made private" : "Made public");
      router.refresh();
    } catch {
      toast.error("Couldn't update");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function deleteDeck() {
    if (!confirm("Delete this deck and all its cards?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Deck deleted");
      router.push("/decks");
    } catch {
      toast.error("Couldn't delete");
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-3 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 inline-flex items-center gap-1.5"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-zinc-200 shadow-lg z-20 py-1 text-sm">
            <button
              onClick={togglePublic}
              disabled={busy}
              className="w-full px-3 py-2 hover:bg-zinc-50 text-left flex items-center gap-2 text-zinc-700"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPublic ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
              {isPublic ? "Make private" : "Make public"}
            </button>
            <button
              onClick={deleteDeck}
              disabled={busy}
              className="w-full px-3 py-2 hover:bg-rose-50 text-left flex items-center gap-2 text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete deck
            </button>
          </div>
        </>
      )}
    </div>
  );
}
