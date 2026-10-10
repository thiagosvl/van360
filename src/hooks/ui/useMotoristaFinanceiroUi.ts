import { useMotoristaFinanceiroApi } from "../api/useMotoristaFinanceiroApi";
import { formatCurrency } from "@/utils/formatters";
import { ModoCobrancaEnum } from "@/types/enums";

export function useMotoristaFinanceiroUi() {
  const { financeiro, isLoading, isError, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();

  const taxaEfetiva = financeiro?.taxa_efetiva ?? 4.0;
  const taxaFormatada = formatCurrency(taxaEfetiva);
  const modoCobranca = (financeiro?.modo_cobranca as ModoCobrancaEnum) || ModoCobrancaEnum.DESATIVADO;
  const cobrancaAtiva = modoCobranca === ModoCobrancaEnum.AUTOMATICA;

  return {
    financeiro,
    isLoading,
    isError,
    isUpdating,
    modoCobranca,
    cobrancaAtiva,
    taxaEfetiva,
    taxaFormatada,
    updateFinanceiro,
  };
}
