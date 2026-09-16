"use client";

import { useRef, useState } from "react";
import { addEntry } from "@/lib/actions";
import type { EntryType } from "@/lib/types";

const TODAY = new Date().toISOString().slice(0, 10);

export function EntryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<EntryType>("expense");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addEntry(new FormData(e.currentTarget));
      formRef.current?.reset();
      setType("expense");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-card border border-border bg-bg-elevated p-5 shadow-card sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-1">
        Typ
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as EntryType)}
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="income">Einnahme</option>
          <option value="expense">Ausgabe</option>
          <option value="fixed_cost">Fixkosten</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-2">
        Bezeichnung
        <input
          name="label"
          required
          placeholder="z. B. Miete, Gehalt, Einkauf"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-1">
        Kategorie
        <input
          name="category"
          placeholder="optional"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-1">
        Betrag (€)
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0,00"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-1">
        Datum
        <input
          name="entry_date"
          type="date"
          defaultValue={TODAY}
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      {error && <p className="text-sm text-negative lg:col-span-6">{error}</p>}

      <div className="lg:col-span-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[9px] bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Wird gespeichert …" : "Eintrag hinzufügen"}
        </button>
      </div>
    </form>
  );
}
