import { getMessage } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCreateEscola,
  useDeleteEscola,
  useEscolas,
  useFilters,
  useToggleAtivoEscola,
  safeCloseDialog,
} from "@/hooks";
import { useProfile, useSession } from "@/hooks";
import { FilterDefaults } from "@/types/enums";
import { Escola } from "@/types/escola";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function useEscolasViewModel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openEscolaFormDialog,
  } = useLayout();

  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const deleteEscola = useDeleteEscola();
  const toggleAtivoEscola = useToggleAtivoEscola();
  const createEscola = useCreateEscola();

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    setFilters,
  } = useFilters();

  /* Debounce Logic */
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    data: escolasData,
    isLoading: isEscolasLoading,
    refetch,
  } = useEscolas(
    {
      usuarioId: profile?.id,
      search: debouncedSearchTerm,
      status: selectedStatus,
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("escola.erro.carregar"),
    }
  );

  const escolas = useMemo(
    () => escolasData?.list ?? [],
    [escolasData]
  );

  const countEscolasAtivas = escolasData?.ativas ?? null;

  useEffect(() => {
    setPageTitle("Escolas");
  }, [setPageTitle]);

  // Handle URL params
  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      openEscolaFormDialog({
        onSuccess: () => {
          navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
        },
      });
    }
  }, [searchParams, openEscolaFormDialog, navigate]);

  const handleCadastrarRapido = useCallback(async () => {
    if (!profile?.id) return;

    const fakeEscola = { ...mockGenerator.escola() };
    try {
      await createEscola.mutateAsync({
        usuarioId: profile.id,
        data: {
          ...fakeEscola,
          ativo: true,
        },
      });
    } catch (error) {
      console.error("Failed to create fake school", error);
    }
  }, [profile?.id, createEscola]);

  const handleEdit = useCallback(
    (escola: Escola) => {
      openEscolaFormDialog({
        editingEscola: escola,
      });
    },
    [openEscolaFormDialog]
  );

  const handleDeleteClick = useCallback(
    (escola: Escola & { passageiros_ativos_count?: number }) => {
      if ((escola.passageiros_ativos_count ?? 0) > 0) {
        toast.error("escola.erro.excluir", {
          description: "escola.erro.excluirComPassageiros",
        });
        return;
      }

      openConfirmationDialog({
        title: getMessage('escola.confirmar.excluir'),
        description: getMessage('escola.confirmar.excluirDescricao'),
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteEscola.mutateAsync(escola.id);
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            console.error(error);
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [deleteEscola, openConfirmationDialog, closeConfirmationDialog]
  );

  const handleToggleAtivo = useCallback(
    async (escola: Escola & { passageiros_ativos_count?: number }) => {
      if (!profile?.id) return;

      const novoStatus = !escola.ativo;

      if (!novoStatus && (escola.passageiros_ativos_count ?? 0) > 0) {
        toast.error("escola.erro.desativar", {
          description: "escola.erro.desativarComPassageiros",
        });
        return;
      }

      const action = novoStatus ? "Ativar" : "Desativar";
      openConfirmationDialog({
        title: novoStatus ? "escola.confirmar.ativar" : "escola.confirmar.desativar",
        description: novoStatus
          ? "A escola voltará a aparecer nas listagens ativas."
          : "A escola deixará de aparecer nas listagens ativas. Você poderá reativá-la depois.",
        confirmText: action,
        variant: novoStatus ? "success" : "warning",
        onConfirm: async () => {
          try {
            await toggleAtivoEscola.mutateAsync({ id: escola.id, novoStatus });
            safeCloseDialog(closeConfirmationDialog);
          } catch (error) {
            console.error(error);
            safeCloseDialog(closeConfirmationDialog);
          }
        },
      });
    },
    [
      profile?.id,
      toggleAtivoEscola,
      openConfirmationDialog,
      closeConfirmationDialog,
    ]
  );

  const handleRegister = useCallback(() => {
    openEscolaFormDialog({ allowBatchCreation: true });
  }, [openEscolaFormDialog]);

  return {
    profile,
    isLoading: isSessionLoading || isProfileLoading,
    isEscolasLoading,
    isActionLoading: deleteEscola.isPending || toggleAtivoEscola.isPending,
    escolas,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    setFilters,
    handleCadastrarRapido,
    handleEdit,
    handleDeleteClick,
    handleToggleAtivo,
    handleRegister,
    openEscolaFormDialog,
    refetch,
    navigate,
    hasActiveFilters: selectedStatus !== FilterDefaults.TODOS || !!searchTerm,
  };
}
