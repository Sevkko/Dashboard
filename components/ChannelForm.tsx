"use client";

import { useRef, useState } from "react";
import { addChannel } from "@/lib/actions";
import { CHANNEL_GROUP_LABEL, type ChannelGroup } from "@/lib/types";

export function ChannelForm({ planId, nextChannelNumber }: { planId: string; nextChannelNumber: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addChannel(planId, new FormData(e.currentTarget));
      formRef.current?.reset();
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
      className="grid grid-cols-2 gap-3 rounded-card border border-border bg-bg-elevated p-5 shadow-card sm:grid-cols-3 lg:grid-cols-7"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Kanal
        <input
          name="channel_number"
          type="number"
          min="1"
          required
          defaultValue={nextChannelNumber}
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium lg:col-span-2">
        Quelle
        <input
          name="source"
          required
          placeholder="z. B. Kick In, Gesang Lead"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Eingang
        <input
          name="input_type"
          placeholder="z. B. dyn. Mikro, DI"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Stagebox
        <input
          name="stagebox_channel"
          placeholder="z. B. SB1/1"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Gruppe
        <select
          name="channel_group"
          defaultValue=""
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">–</option>
          {(Object.keys(CHANNEL_GROUP_LABEL) as ChannelGroup[]).map((group) => (
            <option key={group} value={group}>
              {CHANNEL_GROUP_LABEL[group]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2 lg:col-span-6">
        Notizen
        <input
          name="notes"
          placeholder="optional"
          className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>

      {error && <p className="text-sm text-negative sm:col-span-3 lg:col-span-7">{error}</p>}

      <div className="sm:col-span-3 lg:col-span-1 lg:self-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[9px] bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "…" : "Hinzufügen"}
        </button>
      </div>
    </form>
  );
}
