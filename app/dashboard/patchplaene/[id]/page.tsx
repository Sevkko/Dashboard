import { notFound } from "next/navigation";
import { ChannelForm } from "@/components/ChannelForm";
import { ChannelTable } from "@/components/ChannelTable";
import { PatchPlanHeader } from "@/components/PatchPlanHeader";
import { createClient } from "@/lib/supabase/server";
import type { PatchChannel, PatchPlan } from "@/lib/types";

export default async function PatchPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  const nextChannelNumber =
    channels.length > 0 ? Math.max(...channels.map((c) => c.channel_number)) + 1 : 1;

  return (
    <div className="flex flex-col gap-6">
      <PatchPlanHeader plan={plan as PatchPlan} />

      <ChannelForm planId={id} nextChannelNumber={nextChannelNumber} />

      <div>
        <h2 className="mb-3 text-base font-bold">
          Kanäle {channels.length > 0 ? `(${channels.length})` : ""}
        </h2>
        <ChannelTable planId={id} channels={channels} />
      </div>
    </div>
  );
}
