// React
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Components - Dialogs



// Components - Features
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EscolasList } from "@/components/features/escola/EscolasList";
import { EscolasToolbar } from "@/components/features/escola/EscolasToolbar";

// Components - Empty & Skeletons
import { ListSkeleton } from "@/components/skeletons";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateEscola,
    useDeleteEscola,
    useEscolas,
    useFilters,
    useToggleAtivoEscola,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Utils
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";

// Types
import { Escola } from "@/types/escola";

// Icons
import { GraduationCap } from "lucide-react";

export default function Escolas() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openEscolaFormDialog } = useLayout();
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
    
    // Pick a random school from mockGenerator (now a function)
    const fakeEscola = { ...mockGenerator.escola() };
    // Mutate name slightly ONLY if you really want to avoid duplicates, 
    // but user requested "real" mocks. However, we might need random name if we want multiple.
    // Let's use it as is first. If backend errors, user will see.
    // Actually, let's keep the random suffix for now BUT the user said "Use os registros mockados".
    // I will try to respect the record.
    // fakeEscola.nome = ... (removed mutation)

    try {
        await createEscola.mutateAsync({
            usuarioId: profile.id,
            data: {
                ...fakeEscola,
                ativo: true
            }
        });
        toast.success("Escola fake criada com sucesso!");
    } catch (error) {
        // Error handling is already in the mutation hook usually, but good to have safety
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

  // Check for openModal param on mount
  useEffect(() => {
     const openModal = searchParams.get("openModal");
     if (openModal === "true") {
         openEscolaFormDialog({
            onSuccess: (escola) => {
                 navigate("/inicio", { replace: true });
            }
         });
     }
  }, [searchParams, openEscolaFormDialog, navigate]);

  const handleEdit = useCallback((escola: Escola) => {
    openEscolaFormDialog({
        editingEscola: escola
    });
  }, [openEscolaFormDialog]);

  const handleDeleteClick = useCallback((escola: Escola) => {
    if (escola.passageiros_ativos_count > 0) {
      toast.error("escola.erro.excluir", {
        description: "escola.erro.excluirComPassageiros",
      });
      return;
    }

    openConfirmationDialog({
      title: "Excluir escola?",
      description: "Tem certeza que deseja excluir esta escola? Essa ação não poderá ser desfeita.",
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
      }
    });
  }, [deleteEscola]);

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
    [profile?.id, toggleAtivoEscola, openConfirmationDialog, closeConfirmationDialog]
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
                  onRegister={() => openEscolaFormDialog({ allowBatchCreation: true })}
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
