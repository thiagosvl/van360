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
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCreatePrePassageiro,
  useDeletePrePassageiro,
  usePrePassageiros,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { PassageiroFormModes } from "@/types/enums";
import { PrePassageiro } from "@/types/prePassageiro";
import { buildPrepassageiroLink } from "@/utils/domain/motorista/motoristaUtils";
import {
  formatarTelefone,
  formatFirstName,
  formatRelativeTime,
  formatShortName,
  getInitials,
} from "@/utils/formatters";
import { convertDateBrToISO } from "@/utils/formatters/date";
import { moneyToNumber, phoneMask } from "@/utils/masks";
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
import { useEffect, useRef, useState } from "react";

export default function PrePassageiros({
  onFinalizeNewPrePassageiro,
  profile: initialProfile,
  searchTerm: externalSearchTerm = "",
}) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(externalSearchTerm);
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openPassageiroFormDialog,
    openFirstChargeDialog,
  } = useLayout();

  const { profile, summary } = useProfile();

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
    },
  );

  const prePassageiros =
    (prePassageirosData as PrePassageiro[] | undefined) ?? [];

  const loading = isPrePassageirosLoading || isPrePassageirosFetching;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(externalSearchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [externalSearchTerm]);

  const solicitacoesPendentesCount = summary?.contadores?.passageiros?.solicitacoes_pendentes || 0;

  // Track previous count to detect changes coming from the server/socket
  const prevCountRef = useRef(solicitacoesPendentesCount);

  useEffect(() => {
    // If the count changed from what we had before, it means an external update happened.
    // We should refetch the list to match the new count.
    if (prevCountRef.current !== solicitacoesPendentesCount) {
      refetchPrePassageiros();
      prevCountRef.current = solicitacoesPendentesCount;
    }
  }, [solicitacoesPendentesCount, refetchPrePassageiros]);

  const handleCadastrarRapidoLink = async () => {
    if (!profile?.id) {
      toast.error("auth.erro.sessaoExpirada");
      return;
    }

    const mockPassenger = mockGenerator.passenger();
    const mockEndereco = mockGenerator.address();

    const fakePayload: any = {
      ...mockPassenger,
      ...mockEndereco,
      telefone_responsavel: phoneMask(mockPassenger.telefone_responsavel),
      usuario_id: profile.id,
      observacoes: `Solicitação rápida gerada automaticamente`,
      escola_id: null,
      referencia: `Perto do ${mockEndereco.bairro}`,
      data_nascimento: convertDateBrToISO(mockPassenger.data_nascimento),
      data_inicio_transporte: convertDateBrToISO(mockPassenger.data_inicio_transporte),
      valor_cobranca: moneyToNumber(mockPassenger.valor_cobranca),
      dia_vencimento: parseInt(mockPassenger.dia_vencimento),
    };

    createPrePassageiro.mutate(fakePayload);
  };

  const handleFinalizeClick = (prePassageiro: PrePassageiro) => {
    openPassageiroFormDialog({
      mode: PassageiroFormModes.FINALIZE,
      prePassageiro,
      onSuccess: (passageiro) => {
        if (onFinalizeNewPrePassageiro) onFinalizeNewPrePassageiro();
        if (passageiro) {
          openFirstChargeDialog({ passageiro });
        }
      },
    });
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
              title: "prePassageiro.info.confirmarExclusao",
              description: "prePassageiro.info.confirmarExclusaoDescricao",
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
      <div className="space-y-6 pt-2">
        <div className="space-y-4">
          {/* Header e Search removidos - agora gerenciados pelo Toolbar pai */}

          {loading ? (
            <PrePassengerListSkeleton />
          ) : prePassageiros.length === 0 ? (
            <UnifiedEmptyState
              icon={Users2}
              title="Tudo limpo por aqui!"
              description={
                externalSearchTerm.length > 0
                  ? "Nenhuma solicitação encontrada para sua busca."
                  : "Envie seu link de cadastro para os pais e receba novas solicitações aqui."
              }
              action={
                externalSearchTerm.length === 0
                  ? {
                    label: "Copiar Link",
                    icon: Copy,
                    onClick: () => {
                      if (!profile?.id) return;
                      navigator.clipboard.writeText(
                        buildPrepassageiroLink(profile.id),
                      );
                      toast.success("sistema.sucesso.linkCopiado", {
                        description: "sistema.sucesso.linkCopiadoDescricao",
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
                      <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest w-[300px]">
                        Passageiro
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        WhatsApp
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Quando
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest pr-20">
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
                            <div className="flex-shrink-0 w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center">
                              <span className="text-white font-headline font-bold text-sm leading-none">
                                {getInitials(prePassageiro.nome)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                                {formatShortName(prePassageiro.nome)}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                Responsável: {formatFirstName(prePassageiro.nome_responsavel)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-500">
                            {formatarTelefone(
                              prePassageiro.telefone_responsavel,
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
                                  prePassageiro.id,
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
                        className="bg-transparent"
                      >
                        <div
                          className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
                          onClick={() => handleFinalizeClick(prePassageiro)}
                        >
                          <div className="flex-shrink-0 w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center">
                            <span className="text-white font-headline font-bold text-sm leading-none">
                              {getInitials(prePassageiro.nome)}
                            </span>
                          </div>

                          <div className="flex-grow min-w-0 pr-10">
                            <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
                              {formatShortName(prePassageiro.nome)}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
                                {formatFirstName(prePassageiro.nome_responsavel)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
                            <span className="text-[8px] font-bold text-blue-600 border border-blue-200 uppercase tracking-widest bg-blue-50 px-1 py-0.5 rounded-sm">
                              Pendente
                            </span>
                            <p className="text-[8px] text-gray-400 font-medium uppercase opacity-60">
                              {formatRelativeTime(prePassageiro.created_at)}
                            </p>
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

      <LoadingOverlay active={isActionLoading} text="sistema.sucesso.processando" />
    </>
  );
}
