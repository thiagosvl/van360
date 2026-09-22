import { FilterDefaults } from "@/types/enums";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const [localStatus, setLocalStatus] = useState<string>(FilterDefaults.TODOS);
  const [localEscola, setLocalEscola] = useState<string | undefined>(FilterDefaults.TODAS);
  const [localVeiculo, setLocalVeiculo] = useState<string | undefined>(FilterDefaults.TODOS);
  const [localPeriodo, setLocalPeriodo] = useState<string | undefined>(FilterDefaults.TODOS);
  const [localMes, setLocalMes] = useState<number | undefined>(() => mesParam ? getNowBR().getMonth() + 1 : undefined);
  const [localAno, setLocalAno] = useState<number | undefined>(() => anoParam ? getNowBR().getFullYear() : undefined);
  const [localCategoria, setLocalCategoria] = useState<string | undefined>(FilterDefaults.TODAS);

  const selectedStatus = syncWithUrl
    ? (searchParams.get(statusParam) ?? FilterDefaults.TODOS)
    : localStatus;

  const selectedEscola = useMemo(() => {
    if (!escolaParam) return undefined;
    if (syncWithUrl) {
      return searchParams.get(escolaParam) ?? FilterDefaults.TODAS;
    }
    return localEscola;
  }, [escolaParam, syncWithUrl, searchParams, localEscola]);

  const selectedVeiculo = useMemo(() => {
    if (!veiculoParam) return undefined;
    if (syncWithUrl) {
      return searchParams.get(veiculoParam) ?? FilterDefaults.TODOS;
    }
    return localVeiculo;
  }, [veiculoParam, syncWithUrl, searchParams, localVeiculo]);

  const selectedPeriodo = useMemo(() => {
    if (!periodoParam) return undefined;
    if (syncWithUrl) {
      return searchParams.get(periodoParam) ?? FilterDefaults.TODOS;
    }
    return localPeriodo;
  }, [periodoParam, syncWithUrl, searchParams, localPeriodo]);

  const selectedMes = useMemo(() => {
    if (!mesParam) return undefined;
    if (syncWithUrl) {
      const val = searchParams.get(mesParam);
      if (val) {
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) ? parsed : getNowBR().getMonth() + 1;
      }
      return getNowBR().getMonth() + 1;
    }
    return localMes;
  }, [mesParam, syncWithUrl, searchParams, localMes]);

  const selectedAno = useMemo(() => {
    if (!anoParam) return undefined;
    if (syncWithUrl) {
      const val = searchParams.get(anoParam);
      if (val) {
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) ? parsed : getNowBR().getFullYear();
      }
      return getNowBR().getFullYear();
    }
    return localAno;
  }, [anoParam, syncWithUrl, searchParams, localAno]);

  const selectedCategoria = useMemo(() => {
    if (!categoriaParam) return undefined;
    if (syncWithUrl) {
      return searchParams.get(categoriaParam) ?? FilterDefaults.TODAS;
    }
    return localCategoria;
  }, [categoriaParam, syncWithUrl, searchParams, localCategoria]);

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

  useEffect(() => {
    if (!syncWithUrl) return;

    const urlSearch = searchParams.get(searchParam) ?? "";
    if (urlSearch !== lastSyncedSearchRef.current) {
      lastSyncedSearchRef.current = urlSearch;
      setSearchTermState(urlSearch);
      const trimmed = urlSearch.trim();
      setDebouncedSearchTermState(trimmed.length >= minSearchLength ? trimmed : "");
    }
  }, [searchParams, syncWithUrl, searchParam, minSearchLength]);

  const setSearchTerm = useCallback((value: string) => {
    setSearchTermState(value);
  }, []);

  const setSelectedStatus = useCallback(
    (value: string) => {
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
      } else {
        setLocalStatus(value);
      }
    },
    [syncWithUrl, statusParam, setSearchParams]
  );

  const setSelectedEscola = useCallback(
    (value: string) => {
      if (!escolaParam) return;
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
      } else {
        setLocalEscola(value);
      }
    },
    [syncWithUrl, escolaParam, setSearchParams]
  );

  const setSelectedVeiculo = useCallback(
    (value: string) => {
      if (!veiculoParam) return;
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
      } else {
        setLocalVeiculo(value);
      }
    },
    [syncWithUrl, veiculoParam, setSearchParams]
  );

  const setSelectedPeriodo = useCallback(
    (value: string) => {
      if (!periodoParam) return;
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
      } else {
        setLocalPeriodo(value);
      }
    },
    [syncWithUrl, periodoParam, setSearchParams]
  );

  const setSelectedMes = useCallback(
    (value: number) => {
      if (!mesParam) return;
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(mesParam, value.toString());
          return newParams;
        }, { replace: true });
      } else {
        setLocalMes(value);
      }
    },
    [syncWithUrl, mesParam, setSearchParams]
  );

  const setSelectedAno = useCallback(
    (value: number) => {
      if (!anoParam) return;
      if (syncWithUrl) {
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set(anoParam, value.toString());
          return newParams;
        }, { replace: true });
      } else {
        setLocalAno(value);
      }
    },
    [syncWithUrl, anoParam, setSearchParams]
  );

  const setSelectedCategoria = useCallback(
    (value: string) => {
      if (!categoriaParam) return;
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
      } else {
        setLocalCategoria(value);
      }
    },
    [syncWithUrl, categoriaParam, setSearchParams]
  );

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

      if (!syncWithUrl) {
        if (newFilters.status !== undefined) setLocalStatus(newFilters.status);
        if (newFilters.escola !== undefined && escolaParam) setLocalEscola(newFilters.escola);
        if (newFilters.veiculo !== undefined && veiculoParam) setLocalVeiculo(newFilters.veiculo);
        if (newFilters.periodo !== undefined && periodoParam) setLocalPeriodo(newFilters.periodo);
        if (newFilters.mes !== undefined && mesParam) setLocalMes(newFilters.mes);
        if (newFilters.ano !== undefined && anoParam) setLocalAno(newFilters.ano);
        if (newFilters.categoria !== undefined && categoriaParam) setLocalCategoria(newFilters.categoria);
        return;
      }

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

  const clearFilters = useCallback(() => {
    setSearchTermState("");
    setDebouncedSearchTermState("");
    lastSyncedSearchRef.current = "";

    if (!syncWithUrl) {
      setLocalStatus(FilterDefaults.TODOS);
      if (escolaParam) setLocalEscola(FilterDefaults.TODAS);
      if (veiculoParam) setLocalVeiculo(FilterDefaults.TODOS);
      if (periodoParam) setLocalPeriodo(FilterDefaults.TODOS);
      if (mesParam) setLocalMes(getNowBR().getMonth() + 1);
      if (anoParam) setLocalAno(getNowBR().getFullYear());
      if (categoriaParam) setLocalCategoria(FilterDefaults.TODAS);
      return;
    }

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
  ]);

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


