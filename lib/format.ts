export function formatCurrency(amount: number): string {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
