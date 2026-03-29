import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnifiedEmptyState } from "@/components/empty";
import { ListSkeleton } from "@/components/skeletons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLayout } from "@/contexts/LayoutContext";
import { useContratoActions } from "@/hooks/ui/useContratoActions";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";
import { ContratoStatus, ContratoTab } from "@/types/enums";
import { formatFirstName, formatRelativeTime, formatShortName } from "@/utils/formatters";
import { Clock, Eye, FileCheck2, FileText, FileX2, Send } from "lucide-react";
import { memo } from "react";
import { ContratoActionsMenu } from "./ContratoActionsMenu";
import { ContratoSummary } from "./ContratoSummary";

interface ContratosListProps {
  data: any[];
  isLoading: boolean;
  activeTab: ContratoTab;
  busca: string;
  isDesativado?: boolean;
  // Ações
  onVerPassageiro: (id: string) => void;
  onCopiarLink: (token: string) => void;
  onReenviarNotificacao: (id: string) => void;
  onExcluir: (id: string) => void;
  onSubstituir: (id: string) => void;
  onGerarContrato: (passageiroId: string) => void;
  onVisualizarLink: (token: string) => void;
  onVisualizarFinal: (url: string) => void;
}

interface ContratoMobileCardProps {
  item: any;
  index: number;
  activeTab: ContratoTab;
  isDesativado?: boolean;
  onVerPassageiro: (id: string) => void;
  onCopiarLink: (token: string) => void;
  onReenviarNotificacao: (id: string) => void;
  onExcluir: (id: string) => void;
  onSubstituir: (id: string) => void;
  onGerarContrato: (passageiroId: string) => void;
  onVisualizarLink: (token: string) => void;
  onVisualizarFinal: (url: string) => void;
}

const ContratoMobileCard = memo(function ContratoMobileCard({
  item,
  index,
  isDesativado,
  onVerPassageiro,
  onCopiarLink,
  onReenviarNotificacao,
  onExcluir,
  onSubstituir,
  onGerarContrato,
  onVisualizarLink,
  onVisualizarFinal,
}: ContratoMobileCardProps) {
  const actions = useContratoActions({
    item,
    tipo: item.tipo,
    status: item.status as ContratoStatus,
    isDesativado,
    onVerPassageiro,
    onCopiarLink,
    onReenviarNotificacao,
    onExcluir,
    onSubstituir,
    onGerarContrato,
    onVisualizarLink,
    onVisualizarFinal,
  });

  const isSemContrato = item.tipo === "passageiro";
  const status = item.status as ContratoStatus | null;
  const isAssinado = status === ContratoStatus.ASSINADO;
  const nomeExibicao = item.passageiro?.nome || item.nome || "Não informado";
  const responsavelExibicao = item.passageiro?.nome_responsavel || item.nome_responsavel || "Responsável não inf.";

  const iconConfig = isAssinado
    ? { icon: FileCheck2, className: "bg-emerald-50 border-emerald-100 text-emerald-500" }
    : isSemContrato
      ? { icon: FileX2, className: "bg-slate-50 border-slate-100 text-slate-400" }
      : { icon: Clock, className: "bg-amber-50 border-amber-100 text-amber-500" };

  const swipeActions = actions.map((action) => ({
    label: action.label,
    icon: action.icon,
    onClick: action.onClick,
    isLink: action.isLink,
    href: action.href,
    swipeColor: action.swipeColor || "bg-gray-500",
    isDestructive: action.isDestructive,
  }));

  const renderHeader = () => <ContratoSummary item={item} />;

  return (
    <MobileActionItem actions={swipeActions} showHint={index === 0} className="bg-transparent" renderHeader={renderHeader}>
      <div className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50">
        <div className={cn("flex-shrink-0 w-9 h-9 border rounded-lg flex items-center justify-center", iconConfig.className)}>
          <iconConfig.icon className="w-5 h-5" />
        </div>

        <div className="flex-grow min-w-0 pr-10">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {formatShortName(nomeExibicao, true)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {formatFirstName(responsavelExibicao)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1.5">
            {(status === ContratoStatus.PENDENTE || isSemContrato) ? (
              item.created_at && (
                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5" />
                  {formatRelativeTime(item.created_at)}
                </div>
              )
            ) : (
              <StatusBadge
                status={status === ContratoStatus.ASSINADO}
                trueLabel="ASSINADO"
                falseLabel="PENDENTE"
                className="font-bold text-[8px] h-3.5 px-1 rounded-sm border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none"
              />
            )}
          </div>
        </div>
      </div>
    </MobileActionItem>
  );
});

export const ContratosList = memo(function ContratosList({
  data,
  isLoading,
  activeTab,
  busca,
  isDesativado,
  ...actions
}: ContratosListProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const handleReenviarNotificacao = (id: string) => {
    openConfirmationDialog({
      title: "Reenviar Contrato?",
      description:
        "O responsável do passageiro receberá o link para assinatura no WhatsApp. Deseja continuar?",
      confirmText: "Reenviar",
      variant: "default",
      onConfirm: () => {
        actions.onReenviarNotificacao(id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const getEmptyState = () => {
    if (busca) {
      return (
        <UnifiedEmptyState
          icon={FileText}
          title="Nenhum resultado"
          description="Nenhum contrato ou passageiro encontrado com este filtro."
        />
      );
    }

    const configs: Record<
      ContratoTab,
      { icon: any; title: string; desc: string }
    > = {
      [ContratoTab.PENDENTES]: {
        icon: Send,
        title: "Nenhum contrato pendente",
        desc: "Todos os seus contratos foram assinados!",
      },
      [ContratoTab.ASSINADOS]: {
        icon: Eye,
        title: "Nenhum contrato assinado",
        desc: "Aguardando assinaturas dos responsáveis.",
      },
      [ContratoTab.SEM_CONTRATO]: {
        icon: FileText,
        title: "Todos os passageiros com contrato",
        desc: "Bom trabalho! Tudo organizado.",
      },
    };

    const config = configs[activeTab] || configs[ContratoTab.PENDENTES];

    return (
      <UnifiedEmptyState
        icon={config.icon}
        title={config.title}
        description={config.desc}
      />
    );
  };

  return (
    <ResponsiveDataList
      data={data}
      isLoading={isLoading}
      loadingSkeleton={<ListSkeleton count={5} />}
      emptyState={getEmptyState()}
      mobileContainerClassName="space-y-4"
      mobileItemRenderer={(item, index) => (
        <ContratoMobileCard
          key={item.id}
          item={item}
          index={index}
          activeTab={activeTab}
          isDesativado={isDesativado}
          {...actions}
          onReenviarNotificacao={handleReenviarNotificacao}
        />
      )}
    >
      <div className="rounded-[28px] overflow-hidden bg-white shadow-diff-shadow border-none">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Passageiro
              </TableHead>
              <TableHead className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Valor Mensal
              </TableHead>
              <TableHead className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const nomePassageiro = item.passageiro?.nome || item.nome || "Não informado";
              const nomeResponsavel = item.passageiro?.nome_responsavel || item.nome_responsavel || "Não informado";
              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <FileText className="w-5 h-5 text-[#1a3a5c]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                          {formatShortName(nomePassageiro, true)}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                          {formatFirstName(nomeResponsavel)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-8 py-5">
                    <span className="text-sm font-black text-[#1a3a5c]">
                      {(
                        Number(
                          item.dados_contrato?.valorMensal ||
                          item.valor_parcela ||
                          item.valor_mensal,
                        ) || 0
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <div className="flex justify-end pr-2">
                      <ContratoActionsMenu
                        item={item}
                        tipo={item.tipo}
                        status={item.status}
                        isDesativado={isDesativado}
                        {...actions}
                        onReenviarNotificacao={handleReenviarNotificacao}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
});
