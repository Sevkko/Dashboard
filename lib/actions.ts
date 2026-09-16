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
