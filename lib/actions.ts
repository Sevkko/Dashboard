"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EntryType } from "@/lib/types";

export async function addEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const type = formData.get("type") as EntryType;
  const label = String(formData.get("label") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const entry_date = String(formData.get("entry_date") ?? "");

  if (!["income", "expense", "fixed_cost"].includes(type)) {
    throw new Error("Ungültiger Typ.");
  }
  if (!label) {
    throw new Error("Bitte eine Bezeichnung angeben.");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Bitte einen gültigen Betrag angeben.");
  }

  const { error } = await supabase.from("entries").insert({
    user_id: user.id,
    type,
    label,
    category: category || null,
    amount,
    entry_date: entry_date || new Date().toISOString().slice(0, 10),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/eintraege");
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const { error } = await supabase.from("entries").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/eintraege");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  return { supabase, user };
}

export async function createPatchPlan(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const stage = String(formData.get("stage") ?? "").trim();
  const consoleName = String(formData.get("console") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    throw new Error("Bitte einen Namen für den Patchplan angeben.");
  }

  const { data, error } = await supabase
    .from("patch_plans")
    .insert({
      user_id: user.id,
      name,
      stage: stage || null,
      console: consoleName || null,
      event_date: event_date || null,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/patchplaene");
  return data.id as string;
}

export async function updatePatchPlan(id: string, formData: FormData) {
  const { supabase } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const stage = String(formData.get("stage") ?? "").trim();
  const consoleName = String(formData.get("console") ?? "").trim();
  const event_date = String(formData.get("event_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    throw new Error("Bitte einen Namen für den Patchplan angeben.");
  }

  const { error } = await supabase
    .from("patch_plans")
    .update({
      name,
      stage: stage || null,
      console: consoleName || null,
      event_date: event_date || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/patchplaene");
  revalidatePath(`/dashboard/patchplaene/${id}`);
}

export async function deletePatchPlan(id: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("patch_plans").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/patchplaene");
}

export async function duplicatePatchPlan(id: string, newName: string) {
  const { supabase, user } = await requireUser();

  const { data: original, error: planError } = await supabase
    .from("patch_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (planError || !original) {
    throw new Error(planError?.message ?? "Patchplan nicht gefunden.");
  }

  const { data: created, error: createError } = await supabase
    .from("patch_plans")
    .insert({
      user_id: user.id,
      name: newName.trim() || `${original.name} (Kopie)`,
      stage: original.stage,
      console: original.console,
      event_date: null,
      notes: original.notes,
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  const { data: channels, error: channelsError } = await supabase
    .from("patch_channels")
    .select("*")
    .eq("plan_id", id)
    .order("channel_number", { ascending: true });

  if (channelsError) {
    throw new Error(channelsError.message);
  }

  if (channels && channels.length > 0) {
    const { error: insertError } = await supabase.from("patch_channels").insert(
      channels.map((channel) => ({
        plan_id: created.id,
        channel_number: channel.channel_number,
        source: channel.source,
        input_type: channel.input_type,
        stagebox_channel: channel.stagebox_channel,
        channel_group: channel.channel_group,
        notes: channel.notes,
      })),
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidatePath("/dashboard/patchplaene");
  return created.id as string;
}

export async function addChannel(planId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const channel_number = Number(formData.get("channel_number"));
  const source = String(formData.get("source") ?? "").trim();
  const input_type = String(formData.get("input_type") ?? "").trim();
  const stagebox_channel = String(formData.get("stagebox_channel") ?? "").trim();
  const channel_group = String(formData.get("channel_group") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Number.isFinite(channel_number) || channel_number <= 0) {
    throw new Error("Bitte eine gültige Kanalnummer angeben.");
  }
  if (!source) {
    throw new Error("Bitte eine Quelle/Bezeichnung angeben.");
  }

  const { error } = await supabase.from("patch_channels").insert({
    plan_id: planId,
    channel_number,
    source,
    input_type: input_type || null,
    stagebox_channel: stagebox_channel || null,
    channel_group: channel_group || null,
    notes: notes || null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Kanal ${channel_number} ist in diesem Plan bereits vergeben.`);
    }
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/patchplaene/${planId}`);
}

export async function updateChannel(id: string, planId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const channel_number = Number(formData.get("channel_number"));
  const source = String(formData.get("source") ?? "").trim();
  const input_type = String(formData.get("input_type") ?? "").trim();
  const stagebox_channel = String(formData.get("stagebox_channel") ?? "").trim();
  const channel_group = String(formData.get("channel_group") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!Number.isFinite(channel_number) || channel_number <= 0) {
    throw new Error("Bitte eine gültige Kanalnummer angeben.");
  }
  if (!source) {
    throw new Error("Bitte eine Quelle/Bezeichnung angeben.");
  }

  const { error } = await supabase
    .from("patch_channels")
    .update({
      channel_number,
      source,
      input_type: input_type || null,
      stagebox_channel: stagebox_channel || null,
      channel_group: channel_group || null,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Kanal ${channel_number} ist in diesem Plan bereits vergeben.`);
    }
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/patchplaene/${planId}`);
}

export async function deleteChannel(id: string, planId: string) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("patch_channels").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/patchplaene/${planId}`);
}
