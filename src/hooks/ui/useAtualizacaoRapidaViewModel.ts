import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/business/useSession";
import { useEscolas } from "@/hooks/api/useEscolas";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { passageiroApi } from "@/services/api/passageiro.api";
import { Passageiro } from "@/types/passageiro";
import { FilterDefaults } from "@/types/enums";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { toast } from "@/utils/notifications/toast";
import { useLayout } from "@/hooks";
import { useAtualizacaoRapidaBusiness } from "../business/useAtualizacaoRapidaBusiness";

export function useAtualizacaoRapidaViewModel() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { setIsGlobalLoading } = useLayout();
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEscola, setSelectedEscola] = useState<string>(FilterDefaults.TODAS);
  const [selectedVeiculo, setSelectedVeiculo] = useState<string>(FilterDefaults.TODOS);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>(FilterDefaults.TODOS);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSemValor = searchParams.get("semValor") === "true";
  const [apenasSemValor, setApenasSemValorState] = useState<boolean>(initialSemValor);

  const setApenasSemValor = useCallback((val: boolean) => {
    setApenasSemValorState(val);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) {
        next.set("semValor", "true");
      } else {
        next.delete("semValor");
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const isParamActive = searchParams.get("semValor") === "true";
    setApenasSemValorState(isParamActive);
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const business = useAtualizacaoRapidaBusiness();

  const userQueryFilters = useMemo(
    () => ({ usuarioId: user?.id }),
    [user?.id]
  );

  const { data: escolasData } = useEscolas(userQueryFilters, {
    enabled: Boolean(user?.id),
  });
  const escolas: Escola[] = useMemo(() => {
    if (Array.isArray(escolasData)) return escolasData;
    return (escolasData as { list?: Escola[] })?.list || [];
  }, [escolasData]);

  const { data: veiculosData } = useVeiculos(userQueryFilters, {
    enabled: Boolean(user?.id),
  });
  const veiculos: Veiculo[] = useMemo(() => {
    if (Array.isArray(veiculosData)) return veiculosData;
    return (veiculosData as { list?: Veiculo[] })?.list || [];
  }, [veiculosData]);

  const loadPassageiros = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await passageiroApi.listPassageiros(user.id, {
        limit: 500,
        page: 1,
        status: "ativo",
      });
      const list = Array.isArray(response) ? response : (response?.list || []);
      const activeOnly = list.filter((p) => p.ativo !== false);
      setPassageiros(activeOnly);
      business.discardChanges();
      setSelectedIds(new Set());
    } catch {
      toast.error("Erro ao carregar lista de alunos.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, business]);

  useEffect(() => {
    loadPassageiros();
  }, [user?.id]);

  const passageirosMap = useMemo(() => {
    const map = new Map<string, Passageiro>();
    for (const p of passageiros) {
      if (p.id) map.set(p.id, p);
    }
    return map;
  }, [passageiros]);

  const filteredPassageiros = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return passageiros.filter((p) => {
      if (p.ativo === false) return false;

      if (term) {
        const matchesName = p.nome.toLowerCase().includes(term);
        const matchesRespPrincipal = p.responsavel_principal?.nome
          ? p.responsavel_principal.nome.toLowerCase().includes(term)
          : false;
        const matchesResponsaveis = p.responsaveis
          ? p.responsaveis.some((r) => r.nome?.toLowerCase().includes(term))
          : false;
        if (!matchesName && !matchesRespPrincipal && !matchesResponsaveis) return false;
      }

      const effectiveEscolaId = business.getEffectiveValue(p, "escola_id");
      if (selectedEscola !== FilterDefaults.TODAS && effectiveEscolaId !== selectedEscola) {
        return false;
      }

      const effectiveVeiculoId = business.getEffectiveValue(p, "veiculo_id");
      if (selectedVeiculo !== FilterDefaults.TODOS && effectiveVeiculoId !== selectedVeiculo) {
        return false;
      }

      const effectivePeriodo = business.getEffectiveValue(p, "periodo");
      if (selectedPeriodo !== FilterDefaults.TODOS && effectivePeriodo !== selectedPeriodo) {
        return false;
      }

      if (apenasSemValor) {
        const effectiveValor = business.getEffectiveValue(p, "valor_cobranca");
        const hasValor = effectiveValor !== null && effectiveValor !== undefined && Number(effectiveValor) > 0;
        if (hasValor) return false;
      }

      return true;
    });
  }, [
    passageiros,
    searchTerm,
    selectedEscola,
    selectedVeiculo,
    selectedPeriodo,
    apenasSemValor,
    business,
  ]);

  const totalSemValor = useMemo(() => {
    return passageiros.filter((p) => {
      const effectiveValor = business.getEffectiveValue(p, "valor_cobranca");
      return !effectiveValor || Number(effectiveValor) <= 0;
    }).length;
  }, [passageiros, business]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredPassageiros.length && filteredPassageiros.length > 0) {
        return new Set();
      }
      const next = new Set<string>();
      for (const p of filteredPassageiros) {
        if (p.id) next.add(p.id);
      }
      return next;
    });
  }, [filteredPassageiros]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = filteredPassageiros.length > 0 && selectedIds.size === filteredPassageiros.length;

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedEscola(FilterDefaults.TODAS);
    setSelectedVeiculo(FilterDefaults.TODOS);
    setSelectedPeriodo(FilterDefaults.TODOS);
    setApenasSemValor(false);
  }, [setApenasSemValor]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedEscola !== FilterDefaults.TODAS ||
    selectedVeiculo !== FilterDefaults.TODOS ||
    selectedPeriodo !== FilterDefaults.TODOS ||
    apenasSemValor
  );

  const saveChanges = useCallback(async () => {
    if (business.dirtyCount === 0 || isSaving) return;

    setIsSaving(true);
    setIsGlobalLoading(true, "Salvando alterações nos alunos...");
    try {
      const itemsToUpdate = business.changedItemsList;
      await passageiroApi.updateBatch(itemsToUpdate);

      setPassageiros((prev) =>
        prev.map((p) => {
          const updatedData = business.pendingChanges[p.id || ""];
          if (!updatedData) return p;
          return {
            ...p,
            ...updatedData,
          } as Passageiro;
        })
      );

      business.discardChanges();
      setSelectedIds(new Set());

      queryClient.invalidateQueries({ queryKey: ["passageiros"] });
      queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      queryClient.invalidateQueries({ queryKey: ["usuario-resumo"] });
      queryClient.invalidateQueries({ queryKey: ["escolas"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });

      toast.success(`${itemsToUpdate.length} aluno(s) atualizado(s) com sucesso!`);
    } catch {
      toast.error("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
      setIsGlobalLoading(false);
    }
  }, [business, isSaving, queryClient, setIsGlobalLoading]);

  return {
    passageiros: filteredPassageiros,
    totalOriginal: passageiros.length,
    isLoading,
    isSaving,
    reload: loadPassageiros,
    searchTerm,
    setSearchTerm,
    selectedEscola,
    setSelectedEscola,
    selectedVeiculo,
    setSelectedVeiculo,
    selectedPeriodo,
    setSelectedPeriodo,
    apenasSemValor,
    setApenasSemValor,
    totalSemValor,
    clearFilters,
    hasActiveFilters,
    escolas,
    veiculos,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    passageirosMap,
    business,
    saveChanges,
  };
}
