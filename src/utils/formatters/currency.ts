export function parseCurrencyToNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (value === null || value === undefined || value === "") return 0;

  let str = String(value).trim();
  if (!str) return 0;

  // Limpa caracteres não numéricos mantendo dígitos, ponto, vírgula e sinal de menos
  str = str.replace(/[^\d.,-]/g, "");
  if (!str) return 0;

  // Se contiver vírgula (formato brasileiro clássico, ex: "2.000,00" ou "2000,50")
  if (str.includes(",")) {
    // Remove os pontos (separadores de milhar) e substitui a vírgula por ponto
    str = str.replace(/\./g, "").replace(",", ".");
  } else {
    // Se não houver vírgula, mas houver ponto(s):
    // Pode ser um valor PT-BR sem centavos digitado com ponto (ex: "2.000" -> 2000 ou "1.000.000" -> 1000000)
    // ou uma string em formato decimal ISO / JS float (ex: "2000.00" ou "2000.5")
    const parts = str.split(".");
    if (parts.length > 2) {
      // Múltiplos pontos ex: "1.000.000" -> remove todos os pontos
      str = str.replace(/\./g, "");
    } else if (parts.length === 2 && parts[1].length === 3) {
      // Um único ponto seguido por exatamente 3 dígitos (ex: "2.000", "50.000") -> ponto de milhar PT-BR
      str = str.replace(/\./g, "");
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
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
