"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePatchPlan } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import type { PatchPlan } from "@/lib/types";

export function PatchPlanList({ plans }: { plans: PatchPlan[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Diesen Patchplan wirklich löschen?")) return;
    startTransition(async () => {
      await deletePatchPlan(id);
    });
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-card border border-border bg-bg-elevated p-10 text-center text-sm text-text-muted shadow-card">
        Noch keine Patchpläne vorhanden.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="flex flex-col gap-3 rounded-card border border-border bg-bg-elevated p-5 shadow-card"
        >
          <div>
            <Link
              href={`/dashboard/patchplaene/${plan.id}`}
              className="font-display text-base font-bold hover:text-accent"
            >
              {plan.name}
            </Link>
            <p className="mt-1 text-xs text-text-muted">
              {plan.stage ?? "Bühne unbekannt"}
              {plan.console ? ` · ${plan.console}` : ""}
            </p>
            {plan.event_date && (
              <p className="mt-1 text-xs text-text-muted">{formatDate(plan.event_date)}</p>
            )}
          </div>
          <div className="mt-auto flex items-center gap-3">
            <Link
              href={`/dashboard/patchplaene/${plan.id}`}
              className="rounded-[9px] border border-border bg-bg-subtle px-3 py-1.5 text-xs font-semibold hover:bg-accent-soft hover:text-accent"
            >
              Öffnen
            </Link>
            <button
              onClick={() => handleDelete(plan.id)}
              disabled={isPending}
              className="text-xs font-semibold text-text-muted hover:text-negative disabled:opacity-50"
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
