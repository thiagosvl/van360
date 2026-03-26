import { CobrancaTipoPagamento } from "@/types/enums";
import { formatDate } from "./date";
import { tiposPagamento } from "./constants";

export const formatPaymentType = (tipo: string | undefined) => {
  if (!tipo) return "";

  const typeMap: Record<string, string> = {
    [CobrancaTipoPagamento.DINHEIRO]: tiposPagamento.find((t) => t.value === CobrancaTipoPagamento.DINHEIRO)?.label,
    [CobrancaTipoPagamento.CARTAO_CREDITO]: tiposPagamento.find((t) => t.value === CobrancaTipoPagamento.CARTAO_CREDITO)?.label,
    [CobrancaTipoPagamento.CARTAO_DEBITO]: tiposPagamento.find((t) => t.value === CobrancaTipoPagamento.CARTAO_DEBITO)?.label,
    [CobrancaTipoPagamento.TRANSFERENCIA]: tiposPagamento.find((t) => t.value === CobrancaTipoPagamento.TRANSFERENCIA)?.label,
    [CobrancaTipoPagamento.PIX]: tiposPagamento.find((t) => t.value === CobrancaTipoPagamento.PIX)?.label,
    [CobrancaTipoPagamento.BOLETO]: tiposPagamento.find((t) => t.value === CobrancaTipoPagamento.BOLETO)?.label,
  };

  return typeMap[tipo] || tipo;
};


export const checkCobrancaEmAtraso = (dataVencimento: string) => {
  const vencimento = formatDate(dataVencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return vencimento < hoje;
};

