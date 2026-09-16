import { KpiCard } from "@/components/KpiCard";
import { EntryTable } from "@/components/EntryTable";
import { createClient } from "@/lib/supabase/server";
import type { Entry } from "@/lib/types";

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const { data } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user!.id)
    .gte("entry_date", monthStart)
    .order("entry_date", { ascending: false });

  const entries = (data ?? []) as Entry[];

  const income = entries.filter((e) => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
  const expenses = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const fixedCosts = entries
    .filter((e) => e.type === "fixed_cost")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = income - expenses - fixedCosts;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Übersicht</h1>
        <p className="mt-1 text-sm text-text-muted">
          Dein Stand für {now.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Einnahmen" value={income} tone="positive" />
        <KpiCard label="Ausgaben" value={expenses} tone="negative" />
        <KpiCard label="Fixkosten" value={fixedCosts} tone="negative" />
        <KpiCard label="Saldo" value={balance} tone={balance >= 0 ? "positive" : "negative"} />
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold">Letzte Einträge diesen Monat</h2>
        <EntryTable entries={entries.slice(0, 8)} />
      </div>
    </div>
  );
}
