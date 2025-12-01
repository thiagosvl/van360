// React
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Components - Dialogs
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import EscolaFormDialog from "@/components/dialogs/EscolaFormDialog";

// Components - Features
import { EscolasList } from "@/components/features/escola/EscolasList";
import { EscolasToolbar } from "@/components/features/escola/EscolasToolbar";

// Components - Empty & Skeletons
import { EmptyState } from "@/components/empty";
import { ListSkeleton } from "@/components/skeletons";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
    useDeleteEscola,
    useEscolas,
    useFilters,
    useToggleAtivoEscola,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Utils
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";

// Types
import { Escola } from "@/types/escola";

// Icons
import { School } from "lucide-react";

export default function Escolas() {
  const { setPageTitle } = useLayout();
  const [searchParams] = useSearchParams();

  const deleteEscola = useDeleteEscola();
  const toggleAtivoEscola = useToggleAtivoEscola();

  const isActionLoading = deleteEscola.isPending || toggleAtivoEscola.isPending;

  const [isDialogOpen, setIsDialogOpen] = useState(() => {
    const openModal = searchParams.get("openModal");
    return openModal && openModal === "true" ? true : false;
  });
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);
  const [escolaToDelete, setEscolaToDelete] = useState<Escola | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleSuccessSave = useCallback(
    (escolaCriada: Escola, keepOpen: boolean = false) => {
      if (keepOpen) {
        return;
      }
      safeCloseDialog(() => {
        if (searchParams.get("openModal")) {
          navigate("/inicio", { replace: true });
        }

        setEditingEscola(null);
        setIsDialogOpen(false);
      });
    },
    [searchParams, navigate]
  );

  const handleEdit = useCallback((escola: Escola) => {
    safeCloseDialog(() => {
      setEditingEscola(escola);
      setIsDialogOpen(true);
    });
  }, []);

  const handleDeleteClick = useCallback((escola: Escola) => {
    if (escola.passageiros_ativos_count > 0) {
      toast.error("escola.erro.excluir", {
        description: "escola.erro.excluirComPassageiros",
      });
      return;
    }

    setEscolaToDelete(escola);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!escolaToDelete) return;

    deleteEscola.mutate(escolaToDelete.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setEscolaToDelete(null);
      },
    });
  }, [escolaToDelete, deleteEscola]);

  const handleToggleAtivo = useCallback(
    async (escola: Escola) => {
      if (!profile?.id) return;

      const novoStatus = !escola.ativo;

      if (!novoStatus && escola.passageiros_ativos_count > 0) {
        toast.error("escola.erro.desativar", {
          description: "escola.erro.desativarComPassageiros",
        });
        return;
      }

      toggleAtivoEscola.mutate({ id: escola.id, novoStatus });
    },
    [profile?.id, toggleAtivoEscola]
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
              {/* Toolbar moved inside CardContent or kept here if needed, but we want to remove the separate button */}
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
                  onRegister={() => setIsDialogOpen(true)}
                />
              </div>

              {isEscolasLoading ? (
                <ListSkeleton />
              ) : escolasFiltradas.length === 0 ? (
                <EmptyState
                  icon={School}
                  description={
                    searchTerm
                      ? `Nenhuma escola encontrada para "${searchTerm}"`
                      : "Nenhuma escola encontrada"
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
          <ConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Confirmar exclusão"
            description="Deseja excluir permanentemente esta escola?"
            onConfirm={handleDelete}
            confirmText="Confirmar"
            variant="destructive"
            isLoading={deleteEscola.isPending}
          />

          {isDialogOpen && (
            <EscolaFormDialog
              isOpen={isDialogOpen}
              onClose={() => {
                safeCloseDialog(() => {
                  setIsDialogOpen(false);
                  setEditingEscola(null);
                });
              }}
              editingEscola={editingEscola}
              onSuccess={handleSuccessSave}
              allowBatchCreation={!editingEscola}
            />
          )}
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
}
