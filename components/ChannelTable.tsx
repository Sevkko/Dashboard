"use client";

import { useState, useTransition } from "react";
import { deleteChannel, updateChannel } from "@/lib/actions";
import { CHANNEL_GROUP_LABEL, type ChannelGroup, type PatchChannel } from "@/lib/types";

const GROUP_BADGE_CLASS: Record<ChannelGroup, string> = {
  drums: "bg-warning-soft text-warning",
  bass: "bg-accent-soft text-accent",
  guitar: "bg-positive-soft text-positive",
  keys: "bg-accent-soft text-accent",
  vocals: "bg-negative-soft text-negative",
  brass: "bg-warning-soft text-warning",
  playback: "bg-bg-subtle text-text-muted",
  other: "bg-bg-subtle text-text-muted",
};

export function ChannelTable({ planId, channels }: { planId: string; channels: PatchChannel[] }) {
  if (channels.length === 0) {
    return (
      <div className="rounded-card border border-border bg-bg-elevated p-10 text-center text-sm text-text-muted shadow-card">
        Noch keine Kanäle in diesem Plan.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-elevated shadow-card print:shadow-none">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Kanal", "Quelle", "Eingang", "Stagebox", "Gruppe", "Notizen", ""].map((head) => (
              <th
                key={head}
                className="border-b border-t border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted print:py-2"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <ChannelRow key={channel.id} planId={planId} channel={channel} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChannelRow({ planId, channel }: { planId: string; channel: PatchChannel }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteChannel(channel.id, planId);
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await updateChannel(channel.id, planId, new FormData(e.currentTarget));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    }
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={7} className="border-b border-border px-4 py-3">
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <input
              name="channel_number"
              type="number"
              min="1"
              required
              defaultValue={channel.channel_number}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              name="source"
              required
              defaultValue={channel.source}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              name="input_type"
              defaultValue={channel.input_type ?? ""}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <input
              name="stagebox_channel"
              defaultValue={channel.stagebox_channel ?? ""}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <select
              name="channel_group"
              defaultValue={channel.channel_group ?? ""}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">–</option>
              {(Object.keys(CHANNEL_GROUP_LABEL) as ChannelGroup[]).map((group) => (
                <option key={group} value={group}>
                  {CHANNEL_GROUP_LABEL[group]}
                </option>
              ))}
            </select>
            <input
              name="notes"
              defaultValue={channel.notes ?? ""}
              className="rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm outline-none focus:border-accent"
            />

            {error && <p className="col-span-full text-sm text-negative">{error}</p>}

            <div className="col-span-full flex gap-2">
              <button
                type="submit"
                className="rounded-[9px] bg-accent px-3 py-1.5 text-xs font-semibold text-white"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-[9px] border border-border bg-bg-subtle px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-text"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="last:[&>td]:border-b-0">
      <td className="border-b border-border px-4 py-3 text-sm font-display font-bold">
        {channel.channel_number}
      </td>
      <td className="border-b border-border px-4 py-3 text-sm font-semibold">{channel.source}</td>
      <td className="border-b border-border px-4 py-3 text-sm text-text-muted">
        {channel.input_type || "–"}
      </td>
      <td className="border-b border-border px-4 py-3 text-sm text-text-muted">
        {channel.stagebox_channel || "–"}
      </td>
      <td className="border-b border-border px-4 py-3">
        {channel.channel_group ? (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${GROUP_BADGE_CLASS[channel.channel_group]}`}
          >
            {CHANNEL_GROUP_LABEL[channel.channel_group]}
          </span>
        ) : (
          <span className="text-sm text-text-muted">–</span>
        )}
      </td>
      <td className="border-b border-border px-4 py-3 text-sm text-text-muted">
        {channel.notes || "–"}
      </td>
      <td className="border-b border-border px-4 py-3 text-right print:hidden">
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-text-muted hover:text-accent"
          >
            Bearbeiten
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs font-semibold text-text-muted hover:text-negative disabled:opacity-50"
          >
            {isPending ? "…" : "Löschen"}
          </button>
        </div>
      </td>
    </tr>
  );
}
