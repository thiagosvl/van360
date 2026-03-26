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
import { cn } from "@/lib/utils";
import { formatShortName, formatFirstName } from "@/utils/formatters";
import { formatRelativeTime } from "@/utils/formatters";
import { ContratoStatus, ContratoTab } from "@/types/enums";
import { ChevronsLeft, Clock, Eye, FileText, Send } from "lucide-react";
import { memo } from "react";
import { ContratoActionsMenu } from "./ContratoActionsMenu";

interface ContratosListProps {
  data: any[];
  isLoading: boolean;
  activeTab: ContratoTab;
  busca: string;
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
    onVerPassageiro,
    onCopiarLink,
    onReenviarNotificacao,
    onExcluir,
    onSubstituir,
    onGerarContrato,
    onVisualizarLink,
    onVisualizarFinal,
  });

  const isPassageiro = item.tipo === "passageiro";
  const status = item.status;
  const nomeExibicao = item.passageiro?.nome || item.nome || "Não informado";
  const responsavelExibicao = item.passageiro?.nome_responsavel || item.nome_responsavel || "Responsável não inf.";

  const swipeActions = actions.map((action) => ({
    label: action.label,
    icon: action.icon,
    onClick: action.onClick,
    swipeColor: action.swipeColor || "bg-gray-500",
    isDestructive: action.isDestructive,
  }));

  return (
    <MobileActionItem actions={swipeActions} showHint={index === 0} className="bg-transparent">
      <div className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50">
        <div className="flex-shrink-0 w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#1a3a5c]" />
        </div>

        <div className="flex-grow min-w-0 pr-10">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {formatShortName(nomeExibicao)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {formatFirstName(responsavelExibicao)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
          <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
            {(
              Number(
                item.dados_contrato?.valorMensal ||
                item.valor_parcela ||
                item.valor_mensal,
              ) || 0
            ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <div className="flex items-center gap-1.5">
            {(status === ContratoStatus.PENDENTE || isPassageiro) ? (
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
        closeConfirmationDialog();
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
                          {formatShortName(nomePassageiro)}
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
