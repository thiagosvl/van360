import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PrePassengerListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { ActionItem } from "@/types/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMessage } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog,
  useAppPreferences,
  useDeletePrePassageiro,
  usePrePassageiros,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { PrePassageiro } from "@/types/prePassageiro";
import { Passageiro } from "@/types/passageiro";
import { cn } from "@/lib/utils";
import {
  formatarTelefone,
  formatRelativeTime,
  formatShortName,
  getInitials,
} from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { toast } from "@/utils/notifications/toast";
import {
  Eye,
  MoreVertical,
  Trash2,
  Users2
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Usuario } from "@/types/usuario";

interface PrePassageirosProps {
  onFinalizeNewPrePassageiro?: () => Promise<void>;
  profile?: Usuario | null;
  searchTerm?: string;
  prePassageiros?: PrePassageiro[];
  countPassageiros?: number;
  isLoading?: boolean;
}

export default function PrePassageiros({
  onFinalizeNewPrePassageiro,
  profile: initialProfile,
  searchTerm = "",
  prePassageiros: prePassageirosProp,
  countPassageiros: countPassageirosProp,
  isLoading: isLoadingProp,
}: PrePassageirosProps) {
  const navigate = useNavigate();
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openRevisarSolicitacaoDialog,
    openOnboardingSuccessDialog,
    openFirstChargeDialog,
  } = useLayout();

  const { profile } = useProfile();
  const { formatoNomeResponsavel } = useAppPreferences();
  const { data: resumo } = useUsuarioResumo(profile?.id);

  const totalPassageiros = countPassageirosProp ?? (resumo?.contadores?.passageiros?.ativos ?? resumo?.contadores?.passageiros?.total ?? 0);
  const isFirstPassageiro = totalPassageiros === 0;

  const deletePrePassageiro = useDeletePrePassageiro();

  const {
    data: prePassageirosQueryData,
    isLoading: isPrePassageirosQueryLoading,
  } = usePrePassageiros(
    {
      usuarioId: profile?.id,
      search: searchTerm || undefined,
    },
    {
      enabled: !prePassageirosProp && !!profile?.id,
      onError: () => toast.error("erro.carregar"),
    },
  );

  const prePassageiros = prePassageirosProp ?? (prePassageirosQueryData as PrePassageiro[] | undefined) ?? [];
  const loading = isLoadingProp !== undefined ? isLoadingProp : isPrePassageirosQueryLoading;

  const handleFinalizeClick = (prePassageiro: PrePassageiro) => {
    openRevisarSolicitacaoDialog({
      prePassageiro,
      onSuccess: (passageiro) => {
        if (onFinalizeNewPrePassageiro) onFinalizeNewPrePassageiro();
        if (!passageiro) return;

        openFirstChargeDialog({
          passageiro,
          isFirstPassageiro,
          onSuccess: (p) => {
            const finalPassageiro = p || passageiro;
            if (isFirstPassageiro) {
              openOnboardingSuccessDialog({
                passageiroNome: finalPassageiro.nome,
                onNavigateToPassageiro: () => {
                  navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", finalPassageiro.id));
                },
              });
              return;
            }

            openConfirmationDialog({
              title: "Aluno cadastrado com sucesso!",
              description: `${finalPassageiro.nome} agora faz parte dos seus alunos ativos. O que você deseja fazer agora?`,
              cancelText: "Continuar aqui",
              confirmText: "Ir para Carteirinha",
              variant: "default",
              onCancel: () => {
                safeCloseDialog(closeConfirmationDialog);
              },
              onConfirm: () => {
                safeCloseDialog(closeConfirmationDialog);
                navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", finalPassageiro.id));
              },
            });
          },
        });
      },
    });
  };

  const ActionsMenu = ({
    prePassageiro,
    showReviewOption,
  }: {
    prePassageiro: PrePassageiro;
    showReviewOption: boolean;
  }) => {
    const actions: ActionItem[] = [
      ...(showReviewOption
        ? [
            {
              label: "Revisar",
              icon: <Eye className="w-4 h-4" />,
              description: "Finalizar cadastro do aluno",
              onClick: () => handleFinalizeClick(prePassageiro),
            },
          ]
        : []),
      {
        label: "Excluir",
        icon: <Trash2 className="w-4 h-4" />,
        description: "Remover solicitação de cadastro",
        isDestructive: true,
        onClick: () => {
          openConfirmationDialog({
            title: getMessage("prePassageiro.info.confirmarExclusao"),
            description: getMessage("prePassageiro.info.confirmarExclusaoDescricao"),
            variant: "destructive",
            confirmText: "Excluir",
            cancelText: "Cancelar",
            onConfirm: async () => {
              if (prePassageiro.id) {
                try {
                  await deletePrePassageiro.mutateAsync(prePassageiro.id);
                  safeCloseDialog(closeConfirmationDialog);
                } catch (error) {
                  safeCloseDialog(closeConfirmationDialog);
                  console.error(error);
                }
              }
            },
          });
        },
      },
    ];

    return (
      <ActionsDropdown
        actions={actions}
        title={formatShortName(prePassageiro.nome, true)}
        description="Solicitação de cadastro"
      />
    );
  };

  return (
    <div className="space-y-4">
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
          action={undefined}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <Table>
              <TableHeader className="bg-[#fafafa]">
                <TableRow className="hover:bg-transparent border-b border-[#e5e5e5]">
                  <TableHead className="px-6 py-3.5 text-left text-xs font-medium text-[#737373] uppercase tracking-wider w-[320px]">
                    Aluno
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                    WhatsApp
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                    Quando
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-medium text-[#737373] uppercase tracking-wider pr-16">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prePassageiros.map((prePassageiro) => (
                  <TableRow
                    key={prePassageiro.id}
                    className="hover:bg-[#fafafa] border-b border-[#e5e5e5] last:border-0 transition-colors cursor-pointer"
                    onClick={() => handleFinalizeClick(prePassageiro)}
                  >
                    <TableCell className="py-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full flex items-center justify-center">
                          <span className="text-[#0a0a0a] font-semibold text-xs leading-none">
                            {getInitials(prePassageiro.nome)}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="font-semibold text-[#0a0a0a] text-sm truncate">
                            {formatShortName(prePassageiro.nome, true)}
                          </p>
                          <p className={cn(
                            "text-xs text-[#737373]",
                            formatoNomeResponsavel === "completo" ? "truncate max-w-[200px]" : "truncate"
                          )}>
                            {formatNomeResponsavelExibicao(prePassageiro.nome_responsavel, formatoNomeResponsavel)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs text-[#737373] font-normal">
                        {formatarTelefone(
                          prePassageiro.telefone_responsavel,
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-xs text-[#737373] font-normal">
                        {formatRelativeTime(prePassageiro.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3.5 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="h-8 px-3 rounded-[18px] bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/15 text-xs font-medium gap-1.5 cursor-pointer transition-colors shadow-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalizeClick(prePassageiro);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
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
          <div className="md:hidden space-y-2.5 sm:space-y-3">
            {prePassageiros.map((prePassageiro, index) => {
              const mobileActions = [
                {
                  label: "Revisar Cadastro",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => handleFinalizeClick(prePassageiro),
                },
                {
                  label: "Excluir",
                  icon: <Trash2 className="h-4 w-4 text-[#e7000b]" />,
                  isDestructive: true,
                  onClick: () =>
                    openConfirmationDialog({
                      title: getMessage("prePassageiro.info.confirmarExclusao"),
                      description: getMessage("prePassageiro.info.confirmarExclusaoDescricao"),
                      variant: "destructive",
                      confirmText: "Excluir",
                      cancelText: "Cancelar",
                      onConfirm: async () => {
                        if (prePassageiro.id) {
                          try {
                            await deletePrePassageiro.mutateAsync(prePassageiro.id);
                            safeCloseDialog(closeConfirmationDialog);
                          } catch (error) {
                            safeCloseDialog(closeConfirmationDialog);
                            console.error(error);
                          }
                        }
                      },
                    }),
                },
              ];

              return (
                <MobileActionItem
                  key={prePassageiro.id}
                  actions={mobileActions}
                  showHint={index === 0}
                  className="bg-transparent"
                  renderHeader={() => (
                    <div className="flex items-center gap-3 bg-[#fafafa] p-3.5 sm:p-4 rounded-[22px] border border-[#e5e5e5] shadow-2xs w-full text-left">
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-[#e5e5e5] rounded-[14px] flex items-center justify-center">
                        <span className="text-[#0a0a0a] font-semibold text-xs leading-none">
                          {getInitials(prePassageiro.nome)}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-[#0a0a0a] text-sm">
                          {formatShortName(prePassageiro.nome, true)}
                        </p>
                        <p className={cn(
                          "text-xs text-[#737373] mt-0.5",
                          formatoNomeResponsavel === "completo" ? "truncate max-w-[200px]" : "truncate"
                        )}>
                          {formatNomeResponsavelExibicao(prePassageiro.nome_responsavel, formatoNomeResponsavel)}
                        </p>
                      </div>
                    </div>
                  )}
                >
                  <div
                    onClick={() => handleFinalizeClick(prePassageiro)}
                    className="bg-white p-3.5 sm:p-4 rounded-[20px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center gap-3.5 active:scale-[0.99] transition-all cursor-pointer relative"
                  >
                    <div className="flex-shrink-0 w-9 h-9 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full flex items-center justify-center">
                      <span className="text-[#0a0a0a] font-semibold text-xs leading-none">
                        {getInitials(prePassageiro.nome)}
                      </span>
                    </div>

                    <div className="flex-grow min-w-0 pr-10">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[#0a0a0a] text-sm truncate leading-tight">
                          {formatShortName(prePassageiro.nome, true)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={cn(
                          "text-xs text-[#737373]",
                          formatoNomeResponsavel === "completo" ? "truncate" : "truncate"
                        )}>
                          {formatNomeResponsavelExibicao(prePassageiro.nome_responsavel, formatoNomeResponsavel)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-4 top-1/2 -translate-y-1/2">
                      <p className="text-[11px] text-[#737373] font-normal">
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
  );
}
