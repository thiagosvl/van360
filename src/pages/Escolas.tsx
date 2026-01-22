import { ROUTES } from "@/constants/routes";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EscolasList } from "@/components/features/escola/EscolasList";
import { EscolasToolbar } from "@/components/features/escola/EscolasToolbar";

import { ListSkeleton } from "@/components/skeletons";

import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateEscola,
    useDeleteEscola,
    useEscolas,
    useFilters,
    useToggleAtivoEscola,
} from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";

import { Escola } from "@/types/escola";

import { GraduationCap } from "lucide-react";

export default function Escolas() {
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openEscolaFormDialog,
    openPlanUpgradeDialog, // Added if not available from useLayout destructure? 
    // Wait, useLayout usually has openPlanUpgradeDialog?
    // Step 982 (Passageiros) shows: setPageTitle, openPlanUpgradeDialog...
    // Step 1003 (Escolas) shows: setPageTitle, openConfirmationDialog, closeConfirmationDialog, openEscolaFormDialog.
    // openPlanUpgradeDialog IS MISSING in destructuring. I must add it.
  } = useLayout();
  
  const { isReadOnly } = usePermissions();
  const [searchParams] = useSearchParams();

  const deleteEscola = useDeleteEscola();
  const toggleAtivoEscola = useToggleAtivoEscola();

  const isActionLoading = deleteEscola.isPending || toggleAtivoEscola.isPending;

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    setFilters,
  } = useFilters();

  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);

  const navigate = useNavigate();
  const createEscola = useCreateEscola();

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
      toast.success("Escola fake criada com sucesso!");
    } catch (error) {
      console.error("Failed to create fake school", error);
    }
  }, [profile?.id, createEscola]);

  const {
    data: escolasData,
    isLoading: isEscolasLoading,
    refetch: refetchEscolas,
  } = useEscolas(profile?.id, {
    enabled: !!profile?.id,
    onError: () => toast.error("escola.erro.carregar"),
  });

  const escolas = useMemo(
    () =>
      (
        escolasData as
          | {
              list?: (Escola & { passageiros_ativos_count?: number })[];
              ativas?: number;
            }
          | undefined
      )?.list ?? ([] as (Escola & { passageiros_ativos_count?: number })[]),
    [escolasData]
  );
  const countEscolasAtivas =
    (
      escolasData as
        | {
            list?: (Escola & { passageiros_ativos_count?: number })[];
            ativas?: number;
          }
        | undefined
    )?.ativas ?? null;

  useEffect(() => {
    setPageTitle("Escolas");
  }, [countEscolasAtivas, setPageTitle]);

  const escolasFiltradas = useMemo(() => {
    let filtered = escolas;

    if (selectedStatus !== "todos") {
      const status = selectedStatus === "ativa";
      filtered = filtered.filter((escola) => escola.ativo === status);
    }

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((escola) =>
        escola.nome.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return filtered;
  }, [escolas, selectedStatus, searchTerm]);

  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      openEscolaFormDialog({
        onSuccess: (escola) => {
          navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
        },
      });
    }
  }, [searchParams, openEscolaFormDialog, navigate]);

  const handleEdit = useCallback(
    (escola: Escola) => {
      if (isReadOnly) {
        openPlanUpgradeDialog({ feature: "READ_ONLY" });
        return;
      }
      openEscolaFormDialog({
        editingEscola: escola,
      });
    },
    [openEscolaFormDialog]
  );

  const handleDeleteClick = useCallback(
    (escola: Escola) => {
      if (isReadOnly) {
        openPlanUpgradeDialog({ feature: "READ_ONLY" });
        return;
      }
      if (escola.passageiros_ativos_count > 0) {
        toast.error("escola.erro.excluir", {
          description: "escola.erro.excluirComPassageiros",
        });
        return;
      }

      openConfirmationDialog({
        title: "Excluir escola?",
        description:
          "Tem certeza que deseja excluir esta escola? Essa ação não poderá ser desfeita.",
        confirmText: "Excluir",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await deleteEscola.mutateAsync(escola.id);
            closeConfirmationDialog();
          } catch (error) {
            console.error(error);
            closeConfirmationDialog();
          }
        },
      });
    },
    [deleteEscola]
  );

  const handleToggleAtivo = useCallback(
    async (escola: Escola) => {
      if (isReadOnly) {
        openPlanUpgradeDialog({ feature: "READ_ONLY" });
        return;
      }
      if (!profile?.id) return;

      const novoStatus = !escola.ativo;

      if (!novoStatus && escola.passageiros_ativos_count > 0) {
        toast.error("escola.erro.desativar", {
          description: "escola.erro.desativarComPassageiros",
        });
        return;
      }

      const action = novoStatus ? "Ativar" : "Desativar";
      openConfirmationDialog({
        title: `${action} escola?`,
        description: novoStatus
          ? "A escola voltará a aparecer nas listagens ativas."
          : "A escola deixará de aparecer nas listagens ativas. Você poderá reativá-la depois.",
        confirmText: action,
        variant: novoStatus ? "success" : "warning",
        onConfirm: async () => {
          try {
            await toggleAtivoEscola.mutateAsync({ id: escola.id, novoStatus });
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
      toggleAtivoEscola,
      openConfirmationDialog,
      closeConfirmationDialog,
    ]
  );

  const pullToRefreshReload = useCallback(async () => {
    await refetchEscolas();
  }, [refetchEscolas]);

  const hasActiveFilters = selectedStatus !== "todos" || !!searchTerm;

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="p-0">
              <div className="flex justify-end mb-4 md:hidden">
                <Button
                  onClick={handleCadastrarRapido}
                  variant="outline"
                  className="gap-2 text-uppercase w-full"
                >
                  GERAR ESCOLA FAKE
                </Button>
              </div>
              <div className="hidden md:flex justify-end mb-4">
                <Button
                  onClick={handleCadastrarRapido}
                  variant="outline"
                  className="gap-2 text-uppercase"
                >
                  GERAR ESCOLA FAKE
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-0">
              <div className="mb-6">
                <EscolasToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  onApplyFilters={setFilters}
                  onRegister={() => {
                    if (isReadOnly) {
                        openPlanUpgradeDialog({ feature: "READ_ONLY" });
                        return;
                    }
                    openEscolaFormDialog({ allowBatchCreation: true });
                  }}
                />
              </div>

              {isEscolasLoading ? (
                <ListSkeleton />
              ) : escolasFiltradas.length === 0 ? (
                <UnifiedEmptyState
                  icon={GraduationCap}
                  title="Nenhuma escola encontrada"
                  description={
                    searchTerm
                      ? `Nenhuma escola encontrada para "${searchTerm}"`
                      : "Cadastre as escolas que você atende para organizar seus passageiros."
                  }
                  action={
                    !searchTerm
                      ? {
                          label: "Cadastrar Escola",
                          onClick: () => openEscolaFormDialog(),
                        }
                      : undefined
                  }
                />
              ) : (
                <EscolasList
                  escolas={escolasFiltradas}
                  navigate={navigate}
                  onEdit={handleEdit}
                  onToggleAtivo={handleToggleAtivo}
                  onDelete={handleDeleteClick}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
}
