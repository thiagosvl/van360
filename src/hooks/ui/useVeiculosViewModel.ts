import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCreateVeiculo,
  useDeleteVeiculo,
  useFilters,
  useToggleAtivoVeiculo,
  useVeiculos,
} from "@/hooks";
import { useProfile, useSession } from "@/hooks";
import { Veiculo } from "@/types/veiculo";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function useVeiculosViewModel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openVeiculoFormDialog,
  } = useLayout();

  const { user } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const deleteVeiculo = useDeleteVeiculo();
  const toggleAtivoVeiculo = useToggleAtivoVeiculo();
  const createVeiculo = useCreateVeiculo();

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    hasActiveFilters,
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
    data: veiculosData,
    isLoading: isVeiculosLoading,
    refetch,
  } = useVeiculos(
    {
      usuarioId: profile?.id,
      search: debouncedSearchTerm,
      status: selectedStatus,
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("veiculo.erro.carregar"),
    }
  );

  const veiculos = useMemo(
    () => veiculosData?.list ?? [],
    [veiculosData]
  );

  useEffect(() => {
    setPageTitle("Veículos");
  }, [setPageTitle]);

  // Handle URL params
  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      openVeiculoFormDialog({
        onSuccess: () => {
          navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
        },
      });
    }
  }, [searchParams, openVeiculoFormDialog, navigate]);

  const handleCadastrarRapido = useCallback(async () => {
    if (!profile?.id) return;

    const fakeVeiculo = { ...mockGenerator.veiculo() };
    const oldPlate = fakeVeiculo.placa;
    const suffix = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    fakeVeiculo.placa = oldPlate.substring(0, oldPlate.length - 2) + suffix;

    try {
      await createVeiculo.mutateAsync({
        usuarioId: profile.id,
        data: {
          ...fakeVeiculo,
          ativo: true,
        },
      });
    } catch (error) {
      console.error("Failed to create fake vehicle", error);
    }
  }, [profile?.id, createVeiculo]);

  const handleEdit = useCallback(
    (veiculo: Veiculo) => {
      openVeiculoFormDialog({
        editingVeiculo: veiculo,
      });
    },
    [openVeiculoFormDialog]
  );

  const handleDeleteClick = useCallback(
    (veiculo: Veiculo & { passageiros_ativos_count?: number }) => {
      if ((veiculo.passageiros_ativos_count ?? 0) > 0) {
        toast.error("veiculo.erro.excluir", {
          description: "veiculo.erro.excluirComPassageiros",
        });
        return;
      }

      openConfirmationDialog({
        title: "veiculo.confirmar.excluir",
        description: "veiculo.confirmar.excluirDescricao",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteVeiculo.mutateAsync(veiculo.id);
            closeConfirmationDialog();
          } catch (error) {
            closeConfirmationDialog();
          }
        },
      });
    },
    [deleteVeiculo, openConfirmationDialog, closeConfirmationDialog]
  );

  const handleToggleAtivo = useCallback(
    async (veiculo: Veiculo & { passageiros_ativos_count?: number }) => {
      if (!profile?.id) return;

      const novoStatus = !veiculo.ativo;

      if (!novoStatus && (veiculo.passageiros_ativos_count ?? 0) > 0) {
        toast.error("veiculo.erro.desativar", {
          description: "veiculo.erro.desativarComPassageiros",
        });
        return;
      }

      const action = novoStatus ? "Ativar" : "Desativar";
      openConfirmationDialog({
        title: novoStatus
          ? "veiculo.confirmar.ativar"
          : "veiculo.confirmar.desativar",
        description: novoStatus
          ? "veiculo.confirmar.ativarDescricao"
          : "veiculo.confirmar.desativarDescricao",
        confirmText: action,
        variant: novoStatus ? "success" : "warning",
        onConfirm: async () => {
          try {
            await toggleAtivoVeiculo.mutateAsync({ id: veiculo.id, novoStatus });
            closeConfirmationDialog();
          } catch (error) {
            console.error(error);
            closeConfirmationDialog();
          }
        },
      });
    },
    [
      profile?.id,
      toggleAtivoVeiculo,
      openConfirmationDialog,
      closeConfirmationDialog,
    ]
  );

  const handleRegister = useCallback(() => {
    openVeiculoFormDialog({ allowBatchCreation: true });
  }, [openVeiculoFormDialog]);

  return {
    profile,
    isLoading: isProfileLoading || !profile,
    isVeiculosLoading,
    isActionLoading: deleteVeiculo.isPending || toggleAtivoVeiculo.isPending,
    veiculos,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    hasActiveFilters,
    setFilters,
    handleCadastrarRapido,
    handleEdit,
    handleDeleteClick,
    handleToggleAtivo,
    handleRegister,
    openVeiculoFormDialog,
    refetch,
    navigate,
  };
}
