"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPatchPlan } from "@/lib/actions";

export function PatchPlanForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const id = await createPatchPlan(new FormData(e.currentTarget));
      formRef.current?.reset();
      router.push(`/dashboard/patchplaene/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-card border border-border bg-bg-elevated p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-2">
        Name des Plans
        <input
          name="name"
          required
          placeholder="z. B. Club Mitte – FOH SQ7"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Bühne / Venue
        <input
          name="stage"
          placeholder="z. B. Hauptbühne"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Pult
        <input
          name="console"
          placeholder="z. B. Allen & Heath SQ7"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Datum
        <input
          name="event_date"
          type="date"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-3">
        Notizen
        <input
          name="notes"
          placeholder="optional"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      {error && <p className="text-sm text-negative lg:col-span-4">{error}</p>}

      <div className="lg:col-span-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[9px] bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Wird angelegt …" : "Patchplan anlegen"}
        </button>
      </div>
    </form>
  );
}
