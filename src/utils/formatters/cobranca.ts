import { formatDate } from "./date";

export const formatCobrancaOrigem = (origem: string): string => {
  if (origem === "automatica") {
    return "Gerada Automaticamente";
  }
  return "Registrada Manualmente";
};

export const formatPaymentType = (tipo: string | undefined) => {
  if (!tipo) return "";

  const typeMap: Record<string, string> = {
    dinheiro: "Dinheiro",
    "cartao-credito": "Cartão de Crédito",
    "cartao-debito": "Cartão de Débito",
    transferencia: "Transferência",
    PIX: "PIX",
    boleto: "Boleto",
  };

  return typeMap[tipo] || tipo;
};

export const checkCobrancaEmAtraso = (dataVencimento: string) => {
  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return vencimento < hoje;
};

