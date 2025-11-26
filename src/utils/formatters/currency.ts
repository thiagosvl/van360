export function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

