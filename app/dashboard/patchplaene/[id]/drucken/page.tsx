import { notFound } from "next/navigation";
import { ChannelTable } from "@/components/ChannelTable";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PatchChannel, PatchPlan } from "@/lib/types";

export default async function PatchPlanPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: plan } = await supabase.from("patch_plans").select("*").eq("id", id).single();

  if (!plan) {
    notFound();
  }

  const { data: channelData } = await supabase
    .from("patch_channels")
    .select("*")
    .eq("plan_id", id)
    .order("channel_number", { ascending: true });

  const channels = (channelData ?? []) as PatchChannel[];
  const typedPlan = plan as PatchPlan;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{typedPlan.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {typedPlan.stage ?? "Bühne unbekannt"}
            {typedPlan.console ? ` · ${typedPlan.console}` : ""}
            {typedPlan.event_date ? ` · ${formatDate(typedPlan.event_date)}` : ""}
          </p>
          {typedPlan.notes && <p className="mt-2 text-sm text-text-muted">{typedPlan.notes}</p>}
        </div>
        <button
          className="rounded-[9px] bg-accent px-4 py-2.5 text-sm font-semibold text-white print:hidden"
          data-print-trigger
        >
          Drucken
        </button>
      </div>

      <ChannelTable planId={id} channels={channels} />

      <PrintOnLoad />
    </div>
  );
}

function PrintOnLoad() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.querySelector('[data-print-trigger]')?.addEventListener('click', () => window.print());`,
      }}
    />
  );
}
