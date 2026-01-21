import {
  MobileAction,
  MobileActionItem,
} from "@/components/common/MobileActionItem";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { QuickRegistrationLink } from "@/components/features/passageiro/QuickRegistrationLink";
import { PrePassengerListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FEATURE_LIMITE_FRANQUIA,
  FEATURE_LIMITE_PASSAGEIROS,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCreatePrePassageiro,
  useDeletePrePassageiro,
  usePassageiros,
  usePrePassageiros,
} from "@/hooks";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { PrePassageiro } from "@/types/prePassageiro";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import {
  formatarTelefone,
  formatRelativeTime,
  periodos,
} from "@/utils/formatters";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import {
  Clock,
  Copy,
  Eye,
  MoreVertical,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function PrePassageiros({
  onFinalizeNewPrePassageiro,
  refreshKey,
  profile,
  plano,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const {
    openPlanUpgradeDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog
  } = useLayout();

  const createPrePassageiro = useCreatePrePassageiro();
  const deletePrePassageiro = useDeletePrePassageiro();

  const isActionLoading =
    createPrePassageiro.isPending || deletePrePassageiro.isPending;

  const {
    data: prePassageirosData,
    isLoading: isPrePassageirosLoading,
    isFetching: isPrePassageirosFetching,
    refetch: refetchPrePassageiros,
  } = usePrePassageiros(
    {
      usuarioId: profile?.id,
      search: debouncedSearchTerm || undefined,
    },
    {
      enabled: !!profile?.id,
      onError: () => toast.error("erro.carregar"),
    }
  );

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id },
    { enabled: !!profile?.id }
  );

  const prePassageiros =
    (prePassageirosData as PrePassageiro[] | undefined) ?? [];
  const countPassageiros =
    (passageirosData as { list?: any[] } | undefined)?.list?.length || 0;

  const loading = isPrePassageirosLoading || isPrePassageirosFetching;

  // --- Lógica de Limite (centralizada no hook) ---
  const { limits } = usePlanLimits({
    currentPassengerCount: countPassageiros,
  });

  const isLimitedUser = plano?.isFreePlan ?? false;
  const isLimitReached = limits.passengers.isReached;
  // -------------------------------------------------------

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (refreshKey !== undefined) {
      refetchPrePassageiros();
    }
  }, [refreshKey, refetchPrePassageiros]);

  const handleCadastrarRapidoLink = async () => {
    if (!profile?.id) {
      toast.error("auth.erro.login", { description: "Faça login novamente." });
      return;
    }

    const hoje = new Date();
    const valor = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    const valorInString = `R$ ${valor},00`;

    const nomePassageiro = mockGenerator.name();
    const nomeResponsavel = mockGenerator.name();
    const emailResponsavel = mockGenerator.email(nomeResponsavel);
    const telefoneResponsavel = mockGenerator.phone();
    const cpfResponsavel = mockGenerator.cpf();
    const endereco = mockGenerator.address();

    const fakePayload: any = {
      nome: nomePassageiro,
      nome_responsavel: nomeResponsavel,
      email_responsavel: emailResponsavel,
      telefone_responsavel: telefoneResponsavel,
      cpf_responsavel: cpfResponsavel,
      usuario_id: profile.id,
      observacoes: `Solicitação rápida gerada automaticamente`,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      periodo: periodos[0].value,
      escola_id: null,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      cep: endereco.cep,
      referencia: `Perto do ${endereco.bairro}`,
      valor_cobranca: valorInString,
      dia_vencimento: hoje.getDate(),
    };

    createPrePassageiro.mutate(fakePayload);
  };

  const handleFinalizeClick = (prePassageiro: PrePassageiro) => {
    // Verificar se é plano gratuito E limite atingido
    const isFreePlan = plano?.slug === PLANO_GRATUITO;
    if (isLimitedUser && isLimitReached) {
      if (isFreePlan) {
        openPlanUpgradeDialog({
          feature: FEATURE_LIMITE_PASSAGEIROS,
          defaultTab: PLANO_ESSENCIAL,
          targetPassengerCount: countPassageiros + 1,
        });
      } else {
        // Se for plano pago, abre dialogo de aumentar franquia
        openPlanUpgradeDialog({
          feature: FEATURE_LIMITE_FRANQUIA,
          targetPassengerCount: countPassageiros + 1,
        });
      }
      return;
    }

    openPassageiroFormDialog({
        mode: "finalize",
        prePassageiro,
        onSuccess: onFinalizeNewPrePassageiro
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 1)
      .join("")
      .toUpperCase();
  };

  const ActionsMenu = ({
    prePassageiro,
    showReviewOption,
  }: {
    prePassageiro: PrePassageiro;
    showReviewOption: boolean;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showReviewOption && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleFinalizeClick(prePassageiro);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Revisar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            openConfirmationDialog({
              title: "Excluir solicitação?",
              description:
                "Tem certeza que deseja excluir esta solicitação? Essa ação não poderá ser desfeita.",
              variant: "destructive",
              confirmText: "Excluir",
              cancelText: "Cancelar",
              onConfirm: async () => {
                if (prePassageiro.id) {
                  try {
                    await deletePrePassageiro.mutateAsync(prePassageiro.id);
                    closeConfirmationDialog();
                  } catch (error) {
                    // Error handled by mutation hook or global handler
                    console.error(error);
                  }
                }
              },
            });
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <div className="space-y-6">
        <Button
          onClick={handleCadastrarRapidoLink}
          variant="outline"
          className="w-full md:w-auto gap-2 text-uppercase"
        >
          GERAR PRÉ-CADASTRO FAKE
        </Button>

        <QuickRegistrationLink
          profile={profile}
        />

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Solicitações Pendentes
              {prePassageiros.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {prePassageiros.length}
                </Badge>
              )}
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar solicitação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm sm:text-base bg-white border-gray-200"
              />
            </div>
          </div>

          {loading ? (
            <PrePassengerListSkeleton />
          ) : prePassageiros.length === 0 ? (
            <UnifiedEmptyState
              icon={Users2}
              title="Tudo limpo por aqui!"
              description={
                searchTerm.length > 0
                  ? "Nenhuma solicitação encontrada para sua busca."
                  : "Envie seu link de cadastro para os pais e receba novas solicitações aqui."
              }
              action={
                searchTerm.length === 0
                  ? {
                      label: "Copiar Link",
                      icon: Copy,
                      onClick: () => {
                        if (!profile?.id) return;
                        navigator.clipboard.writeText(
                          buildPrepassageiroLink(profile.id)
                        );
                        toast.success("Link copiado!", {
                          description: "Envie para os pais.",
                        });
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b border-gray-100">
                      <TableHead className="w-[300px] py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-6">
                        Passageiro
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        WhatsApp
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Quando
                      </TableHead>
                      <TableHead className="text-right pr-20 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prePassageiros.map((prePassageiro) => (
                      <TableRow
                        key={prePassageiro.id}
                        className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
                        onClick={() => handleFinalizeClick(prePassageiro)}
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm bg-blue-50`}
                              >
                                {getInitials(prePassageiro.nome)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <p className="font-bold text-gray-900 text-sm">
                                {prePassageiro.nome}
                              </p>
                              <p className="text-xs font-semibold text-gray-500">
                                {prePassageiro.nome_responsavel}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-500">
                            {formatarTelefone(
                              prePassageiro.telefone_responsavel
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(prePassageiro.created_at)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFinalizeClick(prePassageiro);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Revisar
                            </Button>
                            <ActionsMenu
                              prePassageiro={prePassageiro}
                              showReviewOption={false}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {prePassageiros.map((prePassageiro, index) => {
                  const actions: MobileAction[] = [
                    {
                      label: "Excluir",
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => {
                        openConfirmationDialog({
                          title: "Excluir solicitação?",
                          description:
                            "Tem certeza que deseja excluir esta solicitação? Essa ação não poderá ser desfeita.",
                          variant: "destructive",
                          confirmText: "Excluir",
                          cancelText: "Cancelar",
                          onConfirm: async () => {
                            if (prePassageiro.id) {
                              try {
                                await deletePrePassageiro.mutateAsync(
                                  prePassageiro.id
                                );
                                closeConfirmationDialog();
                              } catch (error) {
                                console.error(error);
                              }
                            }
                          },
                        });
                      },
                      isDestructive: true,
                      swipeColor: "bg-red-600",
                    },
                    {
                      label: "Revisar",
                      icon: <Eye className="w-4 h-4" />,
                      onClick: () => handleFinalizeClick(prePassageiro),
                      swipeColor: "bg-blue-600",
                    },
                  ];

                  return (
                    <MobileActionItem
                      key={prePassageiro.id}
                      actions={actions}
                      showHint={index === 0}
                    >
                      <div
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100"
                        onClick={() => handleFinalizeClick(prePassageiro)}
                      >
                        {/* Linha 1: Avatar + Nome + Ações */}
                        <div className="flex justify-between items-start mb-1 relative">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold text-sm">
                              {getInitials(prePassageiro.nome)}
                            </div>
                            <div className="pr-6">
                              <p className="font-bold text-gray-900 text-sm">
                                {prePassageiro.nome}
                              </p>
                              <p className="text-xs font-semibold text-gray-900">
                                {prePassageiro.nome_responsavel}
                              </p>
                            </div>
                          </div>

                          {/* Botão de Ação no Topo Direito (Removido pois agora tem swipe) */}
                        </div>

                        {/* Linha 2: Detalhes Secundários */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {formatRelativeTime(prePassageiro.created_at)}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                            Pendente
                          </span>
                        </div>
                      </div>
                    </MobileActionItem>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
