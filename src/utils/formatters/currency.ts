export function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export const formatCurrency = (value: number | undefined | null) => {
  if (typeof value !== "number" || isNaN(value)) {
    return (0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};
