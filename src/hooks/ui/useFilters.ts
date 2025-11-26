import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface UseFiltersOptions {
  searchParam?: string;
  statusParam?: string;
  escolaParam?: string;
  veiculoParam?: string;
  periodoParam?: string;
  syncWithUrl?: boolean;
}

export interface UseFiltersReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedEscola?: string;
  setSelectedEscola?: (value: string) => void;
  selectedVeiculo?: string;
  setSelectedVeiculo?: (value: string) => void;
  selectedPeriodo?: string;
  setSelectedPeriodo?: (value: string) => void;
  clearFilters: () => void;
  setFilters: (newFilters: {
    search?: string;
    status?: string;
    escola?: string;
    veiculo?: string;
    periodo?: string;
  }) => void;
  hasActiveFilters: boolean;
}

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const {
    searchParam = "search",
    statusParam = "status",
    escolaParam = "escola",
    veiculoParam = "veiculo",
    periodoParam = "periodo",
    syncWithUrl = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTermState] = useState(() => {
    return syncWithUrl ? searchParams.get(searchParam) ?? "" : "";
  });

  const [selectedStatus, setSelectedStatusState] = useState(() => {
    return syncWithUrl ? searchParams.get(statusParam) ?? "todos" : "todos";
  });

  const [selectedEscola, setSelectedEscolaState] = useState<string | undefined>(
    () => {
      if (!escolaParam) return undefined;
      return syncWithUrl ? searchParams.get(escolaParam) ?? "todas" : "todas";
    }
  );

  const [selectedVeiculo, setSelectedVeiculoState] = useState<
    string | undefined
  >(() => {
    if (!veiculoParam) return undefined;
    return syncWithUrl ? searchParams.get(veiculoParam) ?? "todos" : "todos";
  });

  const [selectedPeriodo, setSelectedPeriodoState] = useState<
    string | undefined
  >(() => {
    if (!periodoParam) return undefined;
    return syncWithUrl ? searchParams.get(periodoParam) ?? "todos" : "todos";
  });

  const setSearchTerm = useCallback(
    (value: string) => {
      setSearchTermState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value) {
            newParams.set(searchParam, value);
          } else {
            newParams.delete(searchParam);
          }
          return newParams;
        });
      }
    },
    [syncWithUrl, searchParam, setSearchParams]
  );

  const setSelectedStatus = useCallback(
    (value: string) => {
      setSelectedStatusState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todos") {
            newParams.set(statusParam, value);
          } else {
            newParams.delete(statusParam);
          }
          return newParams;
        });
      }
    },
    [syncWithUrl, statusParam, setSearchParams]
  );

  const setSelectedEscola = useCallback(
    (value: string) => {
      if (!escolaParam) return;
      setSelectedEscolaState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todas") {
            newParams.set(escolaParam, value);
          } else {
            newParams.delete(escolaParam);
          }
          return newParams;
        });
      }
    },
    [syncWithUrl, escolaParam, setSearchParams]
  );

  const setSelectedVeiculo = useCallback(
    (value: string) => {
      if (!veiculoParam) return;
      setSelectedVeiculoState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todos") {
            newParams.set(veiculoParam, value);
          } else {
            newParams.delete(veiculoParam);
          }
          return newParams;
        });
      }
    },
    [syncWithUrl, veiculoParam, setSearchParams]
  );

  const setSelectedPeriodo = useCallback(
    (value: string) => {
      if (!periodoParam) return;
      setSelectedPeriodoState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== "todos") {
            newParams.set(periodoParam, value);
          } else {
            newParams.delete(periodoParam);
          }
          return newParams;
        });
      }
    },
    [syncWithUrl, periodoParam, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchTermState("");
    setSelectedStatusState("todos");
    if (selectedEscola !== undefined) setSelectedEscolaState("todas");
    if (selectedVeiculo !== undefined) setSelectedVeiculoState("todos");
    if (selectedPeriodo !== undefined) setSelectedPeriodoState("todos");

    if (syncWithUrl) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete(searchParam);
        newParams.delete(statusParam);
        if (escolaParam) newParams.delete(escolaParam);
        if (veiculoParam) newParams.delete(veiculoParam);
        if (periodoParam) newParams.delete(periodoParam);
        return newParams;
      });
    }
  }, [
    syncWithUrl,
    searchParam,
    statusParam,
    escolaParam,
    veiculoParam,
    periodoParam,
    setSearchParams,
    selectedEscola,
    selectedVeiculo,
    selectedPeriodo,
  ]);

  // Sync state with URL params when they change externally
  useEffect(() => {
    if (!syncWithUrl) return;

    const urlSearch = searchParams.get(searchParam) ?? "";
    const urlStatus = searchParams.get(statusParam) ?? "todos";
    const urlEscola = escolaParam ? searchParams.get(escolaParam) ?? "todas" : undefined;
    const urlVeiculo = veiculoParam ? searchParams.get(veiculoParam) ?? "todos" : undefined;
    const urlPeriodo = periodoParam ? searchParams.get(periodoParam) ?? "todos" : undefined;

    if (urlSearch !== searchTerm) setSearchTermState(urlSearch);
    if (urlStatus !== selectedStatus) setSelectedStatusState(urlStatus);
    if (escolaParam && urlEscola !== selectedEscola) setSelectedEscolaState(urlEscola);
    if (veiculoParam && urlVeiculo !== selectedVeiculo) setSelectedVeiculoState(urlVeiculo);
    if (periodoParam && urlPeriodo !== selectedPeriodo) setSelectedPeriodoState(urlPeriodo);
  }, [
    searchParams,
    syncWithUrl,
    searchParam,
    statusParam,
    escolaParam,
    veiculoParam,
    periodoParam,
    searchTerm,
    selectedStatus,
    selectedEscola,
    selectedVeiculo,
    selectedPeriodo,
  ]);

  const setFilters = useCallback(
    (newFilters: {
      search?: string;
      status?: string;
      escola?: string;
      veiculo?: string;
      periodo?: string;
    }) => {
      // Update local state
      if (newFilters.search !== undefined) setSearchTermState(newFilters.search);
      if (newFilters.status !== undefined) setSelectedStatusState(newFilters.status);
      if (newFilters.escola !== undefined && escolaParam) setSelectedEscolaState(newFilters.escola);
      if (newFilters.veiculo !== undefined && veiculoParam) setSelectedVeiculoState(newFilters.veiculo);
      if (newFilters.periodo !== undefined && periodoParam) setSelectedPeriodoState(newFilters.periodo);

      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          
          if (newFilters.search !== undefined) {
            if (newFilters.search) newParams.set(searchParam, newFilters.search);
            else newParams.delete(searchParam);
          }

          if (newFilters.status !== undefined) {
            if (newFilters.status && newFilters.status !== "todos") newParams.set(statusParam, newFilters.status);
            else newParams.delete(statusParam);
          }

          if (newFilters.escola !== undefined && escolaParam) {
            if (newFilters.escola && newFilters.escola !== "todas") newParams.set(escolaParam, newFilters.escola);
            else newParams.delete(escolaParam);
          }

          if (newFilters.veiculo !== undefined && veiculoParam) {
            if (newFilters.veiculo && newFilters.veiculo !== "todos") newParams.set(veiculoParam, newFilters.veiculo);
            else newParams.delete(veiculoParam);
          }

          if (newFilters.periodo !== undefined && periodoParam) {
            if (newFilters.periodo && newFilters.periodo !== "todos") newParams.set(periodoParam, newFilters.periodo);
            else newParams.delete(periodoParam);
          }

          return newParams;
        });
      }
    },
    [
      syncWithUrl,
      searchParam,
      statusParam,
      escolaParam,
      veiculoParam,
      periodoParam,
      setSearchParams,
    ]
  );

  const hasActiveFilters =
    !!searchTerm ||
    selectedStatus !== "todos" ||
    (selectedEscola !== undefined && selectedEscola !== "todas") ||
    (selectedVeiculo !== undefined && selectedVeiculo !== "todos") ||
    (selectedPeriodo !== undefined && selectedPeriodo !== "todos");

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    ...(selectedEscola !== undefined && {
      selectedEscola,
      setSelectedEscola,
    }),
    ...(selectedVeiculo !== undefined && {
      selectedVeiculo,
      setSelectedVeiculo,
    }),
    ...(selectedPeriodo !== undefined && {
      selectedPeriodo,
      setSelectedPeriodo,
    }),
    clearFilters,
    setFilters,
    hasActiveFilters,
  };
}


