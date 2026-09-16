export type EntryType = "income" | "expense" | "fixed_cost";

export type Entry = {
  id: string;
  user_id: string;
  type: EntryType;
  label: string;
  category: string | null;
  amount: number;
  entry_date: string;
  created_at: string;
};

export const ENTRY_TYPE_LABEL: Record<EntryType, string> = {
  income: "Einnahme",
  expense: "Ausgabe",
  fixed_cost: "Fixkosten",
};
