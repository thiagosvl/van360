import { useState, useMemo } from "react";
import { useAdminVencimentosPorDia } from "@/hooks/api/admin/useAdminVencimentosHooks";

export function useAdminVencimentosViewModel() {
  const { data, isLoading, isError, refetch } = useAdminVencimentosPorDia();
  const [somenteComVencimento, setSomenteComVencimento] = useState(false);
  const [buscaDia, setBuscaDia] = useState("");

  const diasFiltrados = useMemo(() => {
    if (!data?.dias) return [];

    let lista = data.dias;

    if (somenteComVencimento) {
      lista = lista.filter((item) => item.quantidade > 0 || item.isHoje);
    }

    if (buscaDia.trim()) {
      const termo = buscaDia.trim();
      lista = lista.filter((item) => item.dia.toString().includes(termo));
    }

    return lista;
  }, [data?.dias, somenteComVencimento, buscaDia]);

  return {
    isLoading,
    isError,
    refetch,
    somenteComVencimento,
    setSomenteComVencimento,
    buscaDia,
    setBuscaDia,
    dias: diasFiltrados,
    totalPassageiros: data?.totalPassageirosAtivosComVencimento ?? 0,
    vencimentosHoje: data?.vencimentosHoje ?? 0,
    diaComPico: data?.diaComPico ?? null,
    diaAtual: data?.diaAtual ?? new Date().getDate(),
  };
}
