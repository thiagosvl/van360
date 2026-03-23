import { CobrancaOrigem, CobrancaTipoPagamento } from "@/types/enums";
import { formatDate } from "./date";

export const formatCobrancaOrigem = (origem: string): string => {
  if (origem === CobrancaOrigem.AUTOMATICA) {
    return "Gerada Automaticamente";
  }
  return "Registrada Manualmente";
};

export const formatPaymentType = (tipo: string | undefined) => {
  if (!tipo) return "";

  const typeMap: Record<string, string> = {
    [CobrancaTipoPagamento.DINHEIRO]: "Dinheiro",
    [CobrancaTipoPagamento.CARTAO_CREDITO]: "Cartão de Crédito",
    [CobrancaTipoPagamento.CARTAO_DEBITO]: "Cartão de Débito",
    [CobrancaTipoPagamento.TRANSFERENCIA]: "Transferência",
    [CobrancaTipoPagamento.PIX]: "PIX",
    [CobrancaTipoPagamento.BOLETO]: "Boleto",
  };

  return typeMap[tipo] || tipo;
};


export const checkCobrancaEmAtraso = (dataVencimento: string) => {
  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return vencimento < hoje;
};

