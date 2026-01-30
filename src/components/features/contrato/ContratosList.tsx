import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnifiedEmptyState } from "@/components/empty";
import { Badge } from "@/components/ui/badge";
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
import { ContratoStatus } from "@/types/enums";
import { Eye, FileText, Send } from "lucide-react";
import { memo } from "react";
import { ContratoActionsMenu } from "./ContratoActionsMenu";

interface ContratosListProps {
  data: any[];
  isLoading: boolean;
  activeTab: string;
  busca: string;
  // Ações
  onVerPassageiro: (id: string) => void;
  onCopiarLink: (token: string) => void;
  onBaixarPDF: (id: string) => void;
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
  activeTab,
  onVerPassageiro,
  onCopiarLink,
  onBaixarPDF,
  onReenviarNotificacao,
  onExcluir,
  onSubstituir,
  onGerarContrato,
  onVisualizarLink,
  onVisualizarFinal,
}: any) {
  const actions = useContratoActions({
    item,
    tipo: item.tipo,
    status: item.status,
    onVerPassageiro,
    onCopiarLink,
    onBaixarPDF,
    onReenviarNotificacao,
    onExcluir,
    onSubstituir,
    onGerarContrato,
    onVisualizarLink,
    onVisualizarFinal,
  });

  const isPassageiro = item.tipo === "passageiro";
  const status = item.status;

  // Mapeia as ações do hook para o formato do MobileActionItem
  const swipeActions = actions.map(action => ({
    label: action.label,
    icon: action.icon,
    onClick: action.onClick,
    swipeColor: action.swipeColor || 'bg-gray-500',
    isDestructive: action.isDestructive
  }));

  return (
    <MobileActionItem actions={swipeActions} showHint={index === 0}>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                item.passageiro?.ativo
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-slate-600",
              )}
            >
              {(item.passageiro?.nome || item.nome || "?").charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {item.passageiro?.nome || item.nome || "Não informado"}
              </p>
              <p className="text-xs text-gray-500">
                {item.passageiro?.nome_responsavel ||
                  item.nome_responsavel ||
                  "Responsável não inf."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-50">
          <div>
            <span className="text-sm font-bold text-gray-700">
              {(
                Number(
                  item.dados_contrato?.valorMensal ||
                    item.valor_parcela ||
                    item.valor_mensal,
                ) || 0
              ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="text-right">
            
          {!isPassageiro ? (
             <Badge variant={status === ContratoStatus.ASSINADO ? "success" : "destructive"}>
                {status === ContratoStatus.ASSINADO ? "Assinado" : "Pendente"}
             </Badge>
          ) : (
            <Badge variant="secondary">
              Sem Contrato
            </Badge>
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

    const configs: Record<string, any> = {
      pendentes: {
        icon: Send,
        title: "Nenhum contrato pendente",
        desc: "Todos os seus contratos foram assinados!",
      },
      assinados: {
        icon: Eye,
        title: "Nenhum contrato assinado",
        desc: "Aguardando assinaturas dos responsáveis.",
      },
      sem_contrato: {
        icon: FileText,
        title: "Todos os passageiros com contrato",
        desc: "Bom trabalho! Tudo organizado.",
      },
    };

    const config = configs[activeTab] || configs.pendentes;

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
      emptyState={getEmptyState()}
      mobileContainerClassName="space-y-3"
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
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                Passageiro
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                Status Passageiro
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                Valor
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                        item.passageiro?.ativo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-slate-600",
                      )}
                    >
                      {(item.passageiro?.nome || item.nome || "?").charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-gray-900 text-sm">
                        {item.passageiro?.nome || item.nome || "Não informado"}
                      </p>
                      <p className="text-xs font-semibold text-gray-900">
                        {item.passageiro?.nome_responsavel ||
                          item.nome_responsavel ||
                          "Não informado"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <StatusBadge status={item.passageiro?.ativo} />
                </TableCell>
                <TableCell className="px-6 py-4 font-bold text-gray-900 text-sm">
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
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <ContratoActionsMenu
                    item={item}
                    tipo={item.tipo}
                    status={item.status}
                    {...actions}
                    onReenviarNotificacao={handleReenviarNotificacao}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
});
