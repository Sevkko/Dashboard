import { formatCurrency } from "@/lib/format";

export function KpiCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-text";

  return (
    <div className="rounded-card border border-border bg-bg-elevated p-5 shadow-card">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className={`mt-2 font-display text-2xl font-extrabold tracking-tight ${toneClass}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
