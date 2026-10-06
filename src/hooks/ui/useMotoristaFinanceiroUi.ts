import { useMotoristaFinanceiroApi } from "../api/useMotoristaFinanceiroApi";
import { formatCurrency } from "@/utils/formatters";

export function useMotoristaFinanceiroUi() {
  const { financeiro, isLoading, isError, updateFinanceiro, isUpdating } = useMotoristaFinanceiroApi();

  const taxaEfetiva = financeiro?.taxa_efetiva ?? 4.0;
  const taxaFormatada = formatCurrency(taxaEfetiva);
  const cobrancaAtiva = !!financeiro?.cobranca_automatica_ativa;
  const repassarAoPai = !!financeiro?.repassar_taxa_pais_padrao;

  return {
    financeiro,
    isLoading,
    isError,
    isUpdating,
    cobrancaAtiva,
    repassarAoPai,
    taxaEfetiva,
    taxaFormatada,
    updateFinanceiro,
  };
}
