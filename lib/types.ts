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

export type PatchPlan = {
  id: string;
  user_id: string;
  name: string;
  stage: string | null;
  console: string | null;
  event_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ChannelGroup =
  | "drums"
  | "bass"
  | "guitar"
  | "keys"
  | "vocals"
  | "brass"
  | "playback"
  | "other";

export const CHANNEL_GROUP_LABEL: Record<ChannelGroup, string> = {
  drums: "Drums",
  bass: "Bass",
  guitar: "Gitarre",
  keys: "Keys",
  vocals: "Gesang",
  brass: "Bläser",
  playback: "Playback",
  other: "Sonstiges",
};

export type PatchChannel = {
  id: string;
  plan_id: string;
  channel_number: number;
  source: string;
  input_type: string | null;
  stagebox_channel: string | null;
  channel_group: ChannelGroup | null;
  notes: string | null;
  created_at: string;
};
