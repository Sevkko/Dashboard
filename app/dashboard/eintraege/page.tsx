import { EntryForm } from "@/components/EntryForm";
import { EntryTable } from "@/components/EntryTable";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

export default async function EntriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user!.id)
    .order("entry_date", { ascending: false });

  const entries = (data ?? []) as Entry[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Einträge</h1>
        <p className="mt-1 text-sm text-text-muted">
          Erfasse Fixkosten, Ausgaben und Einnahmen von Hand.
        </p>
      </div>

      <EntryForm />
      <EntryTable entries={entries} />
    </div>
  );
}
