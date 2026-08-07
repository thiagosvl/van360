import { CobrancaTipoPagamento } from "@/types/enums";
import { tiposPagamento } from "./constants";
import { getStartOfDayBR } from "../dateUtils";

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
  const vencimento = getStartOfDayBR(dataVencimento);
  const hoje = getStartOfDayBR();

  return vencimento < hoje;
};

/**
 * Retorna o valor de exibição da cobrança.
 * Se a cobrança possui um `valor_pago` gravado (ex: pagamento parcial ou baixa manual),
 * retorna o `valor_pago`. Caso contrário, retorna o `valor` original.
 */
export function getCobrancaValorExibicao(cobranca?: { valor?: number; valor_pago?: number } | null): number {
  if (!cobranca) return 0;
  if (cobranca.valor_pago !== undefined && cobranca.valor_pago !== null && Number(cobranca.valor_pago) > 0) {
    return Number(cobranca.valor_pago);
  }
  return Number(cobranca.valor || 0);
}

