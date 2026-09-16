"use client";

import { useState, useTransition } from "react";
import { deleteEntry } from "@/lib/actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { ENTRY_TYPE_LABEL, type Entry } from "@/lib/types";

const BADGE_CLASS: Record<Entry["type"], string> = {
  income: "bg-positive-soft text-positive",
  expense: "bg-warning-soft text-warning",
  fixed_cost: "bg-negative-soft text-negative",
};

export function EntryTable({ entries }: { entries: Entry[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await deleteEntry(id);
      setPendingId(null);
    });
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-card border border-border bg-bg-elevated p-10 text-center text-sm text-text-muted shadow-card">
        Noch keine Einträge vorhanden.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-elevated shadow-card">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-t border-border px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
              Bezeichnung
            </th>
            <th className="border-b border-t border-border px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
              Typ
            </th>
            <th className="border-b border-t border-border px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
              Datum
            </th>
            <th className="border-b border-t border-border px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
              Betrag
            </th>
            <th className="border-b border-t border-border px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="last:[&>td]:border-b-0">
              <td className="border-b border-border px-5 py-3.5 text-sm">
                <div className="font-semibold">{entry.label}</div>
                {entry.category && (
                  <div className="text-xs text-text-muted">{entry.category}</div>
                )}
              </td>
              <td className="border-b border-border px-5 py-3.5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_CLASS[entry.type]}`}
                >
                  {ENTRY_TYPE_LABEL[entry.type]}
                </span>
              </td>
              <td className="border-b border-border px-5 py-3.5 text-sm">
                {formatDate(entry.entry_date)}
              </td>
              <td className="border-b border-border px-5 py-3.5 font-display text-sm font-bold">
                {formatCurrency(entry.amount)}
              </td>
              <td className="border-b border-border px-5 py-3.5 text-right">
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={isPending && pendingId === entry.id}
                  className="text-xs font-semibold text-text-muted hover:text-negative disabled:opacity-50"
                >
                  {isPending && pendingId === entry.id ? "…" : "Löschen"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
