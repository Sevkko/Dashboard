"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePatchPlan, duplicatePatchPlan, updatePatchPlan } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import type { PatchPlan } from "@/lib/types";

export function PatchPlanHeader({ plan }: { plan: PatchPlan }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await updatePatchPlan(plan.id, new FormData(e.currentTarget));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    }
  }

  function handleDelete() {
    if (!confirm("Diesen Patchplan wirklich löschen?")) return;
    startTransition(async () => {
      await deletePatchPlan(plan.id);
      router.push("/dashboard/patchplaene");
    });
  }

  function handleDuplicate() {
    const newName = prompt(
      "Name für die Kopie (z. B. für die nächste Bühne):",
      `${plan.name} (Kopie)`,
    );
    if (newName === null) return;
    startTransition(async () => {
      const id = await duplicatePatchPlan(plan.id, newName);
      router.push(`/dashboard/patchplaene/${id}`);
    });
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 gap-3 rounded-card border border-border bg-bg-elevated p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-2">
          Name des Plans
          <input
            name="name"
            required
            defaultValue={plan.name}
            className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Bühne / Venue
          <input
            name="stage"
            defaultValue={plan.stage ?? ""}
            className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Pult
          <input
            name="console"
            defaultValue={plan.console ?? ""}
            className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Datum
          <input
            name="event_date"
            type="date"
            defaultValue={plan.event_date ?? ""}
            className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-3">
          Notizen
          <input
            name="notes"
            defaultValue={plan.notes ?? ""}
            className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>

        {error && <p className="text-sm text-negative lg:col-span-4">{error}</p>}

        <div className="flex gap-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-[9px] bg-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            Speichern
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-[9px] border border-border bg-bg-subtle px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text"
          >
            Abbrechen
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-bg-elevated p-5 shadow-card print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{plan.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {plan.stage ?? "Bühne unbekannt"}
            {plan.console ? ` · ${plan.console}` : ""}
            {plan.event_date ? ` · ${formatDate(plan.event_date)}` : ""}
          </p>
          {plan.notes && <p className="mt-2 text-sm text-text-muted">{plan.notes}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-[9px] border border-border bg-bg-subtle px-3.5 py-2 text-sm font-semibold text-text-muted hover:bg-accent-soft hover:text-accent"
          >
            Bearbeiten
          </button>
          <button
            onClick={handleDuplicate}
            disabled={isPending}
            className="rounded-[9px] border border-border bg-bg-subtle px-3.5 py-2 text-sm font-semibold text-text-muted hover:bg-accent-soft hover:text-accent disabled:opacity-60"
          >
            Für neue Bühne duplizieren
          </button>
          <Link
            href={`/dashboard/patchplaene/${plan.id}/drucken`}
            target="_blank"
            className="rounded-[9px] border border-border bg-bg-subtle px-3.5 py-2 text-sm font-semibold text-text-muted hover:bg-accent-soft hover:text-accent"
          >
            Drucken
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-[9px] border border-border bg-bg-subtle px-3.5 py-2 text-sm font-semibold text-text-muted hover:text-negative disabled:opacity-60"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
