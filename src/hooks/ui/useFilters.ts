import { FilterDefaults } from "@/types/enums";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getNowBR } from "@/utils/dateUtils";

export interface UseFiltersOptions {
  searchParam?: string;
  statusParam?: string;
  escolaParam?: string;
  veiculoParam?: string;
  periodoParam?: string;
  mesParam?: string;
  anoParam?: string;
  categoriaParam?: string;
  syncWithUrl?: boolean;
  minSearchLength?: number;
  debounceMs?: number;
}

export interface UseFiltersReturn {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  debouncedSearchTerm: string;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedEscola?: string;
  setSelectedEscola?: (value: string) => void;
  selectedVeiculo?: string;
  setSelectedVeiculo?: (value: string) => void;
  selectedPeriodo?: string;
  setSelectedPeriodo?: (value: string) => void;
  selectedMes?: number;
  setSelectedMes?: (value: number) => void;
  selectedAno?: number;
  setSelectedAno?: (value: number) => void;
  selectedCategoria?: string;
  setSelectedCategoria?: (value: string) => void;
  clearFilters: () => void;
  setFilters: (newFilters: {
    search?: string;
    status?: string;
    escola?: string;
    veiculo?: string;
    periodo?: string;
    mes?: number;
    ano?: number;
    categoria?: string;
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
    mesParam,
    anoParam,
    categoriaParam,
    syncWithUrl = true,
    minSearchLength = 3,
    debounceMs = 350,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  const initialUrlSearch = syncWithUrl ? searchParams.get(searchParam) ?? "" : "";

  const [searchTerm, setSearchTermState] = useState(initialUrlSearch);
  const [debouncedSearchTerm, setDebouncedSearchTermState] = useState(() => {
    const trimmed = initialUrlSearch.trim();
    return trimmed.length >= minSearchLength ? trimmed : "";
  });

  const lastSyncedSearchRef = useRef(initialUrlSearch);

  const [selectedStatus, setSelectedStatusState] = useState(() => {
    return syncWithUrl ? searchParams.get(statusParam) ?? FilterDefaults.TODOS : FilterDefaults.TODOS;
  });

  const [selectedEscola, setSelectedEscolaState] = useState<string | undefined>(
    () => {
      if (!escolaParam) return undefined;
      return syncWithUrl ? searchParams.get(escolaParam) ?? FilterDefaults.TODAS : FilterDefaults.TODAS;
    }
  );

  const [selectedVeiculo, setSelectedVeiculoState] = useState<
    string | undefined
  >(() => {
    if (!veiculoParam) return undefined;
    return syncWithUrl ? searchParams.get(veiculoParam) ?? FilterDefaults.TODOS : FilterDefaults.TODOS;
  });

  const [selectedPeriodo, setSelectedPeriodoState] = useState<
    string | undefined
  >(() => {
    if (!periodoParam) return undefined;
    return syncWithUrl ? searchParams.get(periodoParam) ?? FilterDefaults.TODOS : FilterDefaults.TODOS;
  });

  const [selectedMes, setSelectedMesState] = useState<number | undefined>(
    () => {
      if (!mesParam) return undefined;
      const val = syncWithUrl ? searchParams.get(mesParam) : null;
      return val ? parseInt(val) : getNowBR().getMonth() + 1;
    }
  );

  const [selectedAno, setSelectedAnoState] = useState<number | undefined>(
    () => {
      if (!anoParam) return undefined;
      const val = syncWithUrl ? searchParams.get(anoParam) : null;
      return val ? parseInt(val) : getNowBR().getFullYear();
    }
  );

  const [selectedCategoria, setSelectedCategoriaState] = useState<
    string | undefined
  >(() => {
    if (!categoriaParam) return undefined;
    return syncWithUrl ? searchParams.get(categoriaParam) ?? FilterDefaults.TODAS : FilterDefaults.TODAS;
  });

  useEffect(() => {
    const trimmed = searchTerm.trim();
    const effectiveSearch = trimmed.length >= minSearchLength ? trimmed : "";

    const timer = setTimeout(() => {
      setDebouncedSearchTermState(effectiveSearch);

      if (syncWithUrl && lastSyncedSearchRef.current !== effectiveSearch) {
        lastSyncedSearchRef.current = effectiveSearch;
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (effectiveSearch) {
            newParams.set(searchParam, effectiveSearch);
          } else {
            newParams.delete(searchParam);
          }
          return newParams;
        }, { replace: true });
      }
    }, trimmed.length === 0 ? 0 : debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, minSearchLength, debounceMs, syncWithUrl, searchParam, setSearchParams]);

  const setSearchTerm = useCallback((value: string) => {
    setSearchTermState(value);
  }, []);

  const setSelectedStatus = useCallback(
    (value: string) => {
      setSelectedStatusState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== FilterDefaults.TODOS) {
            newParams.set(statusParam, value);
          } else {
            newParams.delete(statusParam);
          }
          return newParams;
        }, { replace: true });
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
          if (value && value !== FilterDefaults.TODAS) {
            newParams.set(escolaParam, value);
          } else {
            newParams.delete(escolaParam);
          }
          return newParams;
        }, { replace: true });
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
          if (value && value !== FilterDefaults.TODOS) {
            newParams.set(veiculoParam, value);
          } else {
            newParams.delete(veiculoParam);
          }
          return newParams;
        }, { replace: true });
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
          if (value && value !== FilterDefaults.TODOS) {
            newParams.set(periodoParam, value);
          } else {
            newParams.delete(periodoParam);
          }
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, periodoParam, setSearchParams]
  );

  const setSelectedMes = useCallback(
    (value: number) => {
      if (!mesParam) return;
      setSelectedMesState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(mesParam, value.toString());
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, mesParam, setSearchParams]
  );

  const setSelectedAno = useCallback(
    (value: number) => {
      if (!anoParam) return;
      setSelectedAnoState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(anoParam, value.toString());
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, anoParam, setSearchParams]
  );

  const setSelectedCategoria = useCallback(
    (value: string) => {
      if (!categoriaParam) return;
      setSelectedCategoriaState(value);
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value !== FilterDefaults.TODAS) {
            newParams.set(categoriaParam, value);
          } else {
            newParams.delete(categoriaParam);
          }
          return newParams;
        }, { replace: true });
      }
    },
    [syncWithUrl, categoriaParam, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchTermState("");
    setDebouncedSearchTermState("");
    lastSyncedSearchRef.current = "";
    setSelectedStatusState(FilterDefaults.TODOS);
    if (selectedEscola !== undefined) setSelectedEscolaState(FilterDefaults.TODAS);
    if (selectedVeiculo !== undefined) setSelectedVeiculoState(FilterDefaults.TODOS);
    if (selectedPeriodo !== undefined) setSelectedPeriodoState(FilterDefaults.TODOS);
    if (selectedMes !== undefined) setSelectedMesState(getNowBR().getMonth() + 1);
    if (selectedAno !== undefined) setSelectedAnoState(getNowBR().getFullYear());
    if (selectedCategoria !== undefined) setSelectedCategoriaState(FilterDefaults.TODAS);

    if (syncWithUrl) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete(searchParam);
        newParams.delete(statusParam);
        if (escolaParam) newParams.delete(escolaParam);
        if (veiculoParam) newParams.delete(veiculoParam);
        if (periodoParam) newParams.delete(periodoParam);
        if (mesParam) newParams.delete(mesParam);
        if (anoParam) newParams.delete(anoParam);
        if (categoriaParam) newParams.delete(categoriaParam);
        return newParams;
      }, { replace: true });
    }
  }, [
    syncWithUrl,
    searchParam,
    statusParam,
    escolaParam,
    veiculoParam,
    periodoParam,
    mesParam,
    anoParam,
    categoriaParam,
    setSearchParams,
    selectedEscola,
    selectedVeiculo,
    selectedPeriodo,
    selectedMes,
    selectedAno,
    selectedCategoria,
  ]);

  useEffect(() => {
    if (!syncWithUrl) return;

    const urlSearch = searchParams.get(searchParam) ?? "";
    const urlStatus = searchParams.get(statusParam) ?? FilterDefaults.TODOS;
    const urlEscola = escolaParam ? searchParams.get(escolaParam) ?? FilterDefaults.TODAS : undefined;
    const urlVeiculo = veiculoParam ? searchParams.get(veiculoParam) ?? FilterDefaults.TODOS : undefined;
    const urlPeriodo = periodoParam ? searchParams.get(periodoParam) ?? FilterDefaults.TODOS : undefined;
    const urlMes = mesParam ? searchParams.get(mesParam) : undefined;
    const urlAno = anoParam ? searchParams.get(anoParam) : undefined;
    const urlCategoria = categoriaParam ? searchParams.get(categoriaParam) ?? FilterDefaults.TODAS : undefined;

    if (urlSearch !== lastSyncedSearchRef.current) {
      lastSyncedSearchRef.current = urlSearch;
      setSearchTermState(urlSearch);
      const trimmed = urlSearch.trim();
      setDebouncedSearchTermState(trimmed.length >= minSearchLength ? trimmed : "");
    }
    if (urlStatus !== selectedStatus) setSelectedStatusState(urlStatus);
    if (escolaParam && urlEscola !== selectedEscola) setSelectedEscolaState(urlEscola);
    if (veiculoParam && urlVeiculo !== selectedVeiculo) setSelectedVeiculoState(urlVeiculo);
    if (periodoParam && urlPeriodo !== selectedPeriodo) setSelectedPeriodoState(urlPeriodo);
    if (mesParam && urlMes && parseInt(urlMes) !== selectedMes) setSelectedMesState(parseInt(urlMes));
    if (anoParam && urlAno && parseInt(urlAno) !== selectedAno) setSelectedAnoState(parseInt(urlAno));
    if (categoriaParam && urlCategoria !== selectedCategoria) setSelectedCategoriaState(urlCategoria);
  }, [
    searchParams,
    syncWithUrl,
    searchParam,
    statusParam,
    escolaParam,
    veiculoParam,
    periodoParam,
    mesParam,
    anoParam,
    categoriaParam,
    minSearchLength,
    selectedStatus,
    selectedEscola,
    selectedVeiculo,
    selectedPeriodo,
    selectedMes,
    selectedAno,
    selectedCategoria,
  ]);

  const setFilters = useCallback(
    (newFilters: {
      search?: string;
      status?: string;
      escola?: string;
      veiculo?: string;
      periodo?: string;
      mes?: number;
      ano?: number;
      categoria?: string;
    }) => {
      if (newFilters.search !== undefined) {
        setSearchTermState(newFilters.search);
        const trimmed = newFilters.search.trim();
        const effective = trimmed.length >= minSearchLength ? trimmed : "";
        setDebouncedSearchTermState(effective);
        lastSyncedSearchRef.current = effective;
      }
      if (newFilters.status !== undefined) setSelectedStatusState(newFilters.status);
      if (newFilters.escola !== undefined && escolaParam) setSelectedEscolaState(newFilters.escola);
      if (newFilters.veiculo !== undefined && veiculoParam) setSelectedVeiculoState(newFilters.veiculo);
      if (newFilters.periodo !== undefined && periodoParam) setSelectedPeriodoState(newFilters.periodo);
      if (newFilters.mes !== undefined && mesParam) setSelectedMesState(newFilters.mes);
      if (newFilters.ano !== undefined && anoParam) setSelectedAnoState(newFilters.ano);
      if (newFilters.categoria !== undefined && categoriaParam) setSelectedCategoriaState(newFilters.categoria);

      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);

          if (newFilters.search !== undefined) {
            const trimmed = newFilters.search.trim();
            const effective = trimmed.length >= minSearchLength ? trimmed : "";
            if (effective) newParams.set(searchParam, effective);
            else newParams.delete(searchParam);
          }

          if (newFilters.status !== undefined) {
            if (newFilters.status && newFilters.status !== FilterDefaults.TODOS) newParams.set(statusParam, newFilters.status);
            else newParams.delete(statusParam);
          }

          if (newFilters.escola !== undefined && escolaParam) {
            if (newFilters.escola && newFilters.escola !== FilterDefaults.TODAS) newParams.set(escolaParam, newFilters.escola);
            else newParams.delete(escolaParam);
          }

          if (newFilters.veiculo !== undefined && veiculoParam) {
            if (newFilters.veiculo && newFilters.veiculo !== FilterDefaults.TODOS) newParams.set(veiculoParam, newFilters.veiculo);
            else newParams.delete(veiculoParam);
          }

          if (newFilters.periodo !== undefined && periodoParam) {
            if (newFilters.periodo && newFilters.periodo !== FilterDefaults.TODOS) newParams.set(periodoParam, newFilters.periodo);
            else newParams.delete(periodoParam);
          }

          if (newFilters.mes !== undefined && mesParam) {
            newParams.set(mesParam, newFilters.mes.toString());
          }

          if (newFilters.ano !== undefined && anoParam) {
            newParams.set(anoParam, newFilters.ano.toString());
          }

          if (newFilters.categoria !== undefined && categoriaParam) {
            if (newFilters.categoria && newFilters.categoria !== FilterDefaults.TODAS) newParams.set(categoriaParam, newFilters.categoria);
            else newParams.delete(categoriaParam);
          }

          return newParams;
        }, { replace: true });
      }
    },
    [
      syncWithUrl,
      searchParam,
      statusParam,
      escolaParam,
      veiculoParam,
      periodoParam,
      mesParam,
      anoParam,
      categoriaParam,
      minSearchLength,
      setSearchParams,
    ]
  );

  const hasActiveFilters =
    !!searchTerm.trim() ||
    selectedStatus !== FilterDefaults.TODOS ||
    (selectedEscola !== undefined && selectedEscola !== FilterDefaults.TODAS) ||
    (selectedVeiculo !== undefined && selectedVeiculo !== FilterDefaults.TODOS) ||
    (selectedPeriodo !== undefined && selectedPeriodo !== FilterDefaults.TODOS) ||
    (selectedCategoria !== undefined && selectedCategoria !== FilterDefaults.TODAS);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
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
    ...(selectedMes !== undefined && {
      selectedMes,
      setSelectedMes,
    }),
    ...(selectedAno !== undefined && {
      selectedAno,
      setSelectedAno,
    }),
    ...(selectedCategoria !== undefined && {
      selectedCategoria,
      setSelectedCategoria,
    }),
    clearFilters,
    setFilters,
    hasActiveFilters,
  };
}


