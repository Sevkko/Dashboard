import { PatchPlanForm } from "@/components/PatchPlanForm";
import { PatchPlanList } from "@/components/PatchPlanList";
import { createClient } from "@/lib/supabase/server";
import type { PatchPlan } from "@/lib/types";

export default async function PatchPlansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("patch_plans")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const plans = (data ?? []) as PatchPlan[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Patchpläne</h1>
        <p className="mt-1 text-sm text-text-muted">
          Kanal-Patchpläne fürs Mischpult anlegen und bei Bühnenwechseln schnell duplizieren.
        </p>
      </div>

      <PatchPlanForm />
      <PatchPlanList plans={plans} />
    </div>
  );
}
