import { useState, useMemo } from "react";
import { useAdminVencimentosPorDia } from "@/hooks/api/admin/useAdminVencimentosHooks";

export function useAdminVencimentosViewModel() {
  const { data, isLoading, isError, refetch } = useAdminVencimentosPorDia();
  const [somenteComVencimento, setSomenteComVencimento] = useState(true);

  const diasFiltrados = useMemo(() => {
    if (!data?.dias) return [];

    let lista = data.dias;

    if (somenteComVencimento) {
      lista = lista.filter((item) => item.quantidade > 0 || item.isHoje);
    }

    return lista;
  }, [data?.dias, somenteComVencimento]);

  return {
    isLoading,
    isError,
    refetch,
    somenteComVencimento,
    setSomenteComVencimento,
    dias: diasFiltrados,
    totalPassageiros: data?.totalPassageirosAtivosComVencimento ?? 0,
    vencimentosHoje: data?.vencimentosHoje ?? 0,
    diaComPico: data?.diaComPico ?? null,
    diaAtual: data?.diaAtual ?? new Date().getDate(),
  };
}
