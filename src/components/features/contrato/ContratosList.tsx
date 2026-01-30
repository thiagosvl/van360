import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
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
import { cn } from "@/lib/utils";
import { ContratoStatus } from "@/types/enums";
import { formatDateToBR } from "@/utils/formatters";
import { Download, Eye, FileText, Send, Trash2, User } from "lucide-react";
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
  onVisualizarLink
}: any) {
  const isPassageiro = item.tipo === 'passageiro';
  const status = item.status;
  
  // Definir ações para o Swipe
  const swipeActions = [];
  
  if (isPassageiro) {
    swipeActions.push({
      label: 'Gerar Contrato',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => onGerarContrato(item.id),
      swipeColor: 'bg-blue-600'
    });
  } else {
    if (status === ContratoStatus.PENDENTE) {
      swipeActions.push({
        label: 'Reenviar',
        icon: <Send className="h-5 w-5" />,
        onClick: () => onReenviarNotificacao(item.id),
        swipeColor: 'bg-blue-600'
      });
      swipeActions.push({
        label: 'Excluir',
        icon: <Trash2 className="h-5 w-5" />,
        onClick: () => onExcluir(item.id),
        swipeColor: 'bg-red-600'
      });
    } else if (status === ContratoStatus.ASSINADO) {
      swipeActions.push({
        label: 'Visualizar',
        icon: <Eye className="h-5 w-5" />,
        onClick: () => onVisualizarLink(item.token_acesso),
        swipeColor: 'bg-green-600'
      });
      swipeActions.push({
        label: 'Baixar',
        icon: <Download className="h-5 w-5" />,
        onClick: () => onBaixarPDF(item.id),
        swipeColor: 'bg-blue-600'
      });
    }
  }

  // Global action sempre disponível
  swipeActions.push({
    label: 'Ver Passageiro',
    icon: <User className="h-5 w-5" />,
    onClick: () => onVerPassageiro(isPassageiro ? item.id : item.passageiro_id),
    swipeColor: 'bg-gray-500'
  });

  return (
    <MobileActionItem actions={swipeActions} showHint={index === 0}>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
              isPassageiro ? "bg-orange-50 text-orange-600" : (status === ContratoStatus.ASSINADO ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600")
            )}>
              {(item.passageiro?.nome || item.nome || "?").charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{item.passageiro?.nome || item.nome || "Não informado"}</p>
              <p className="text-xs text-gray-500">{item.passageiro?.nome_responsavel || item.nome_responsavel || "Responsável não inf."}</p>
            </div>
          </div>
          {!isPassageiro && (
             <Badge variant={status === ContratoStatus.ASSINADO ? "success" : "destructive"}>
                {status === ContratoStatus.ASSINADO ? "Assinado" : "Pendente"}
             </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-50">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">VALOR</span>
            <span className="text-sm font-bold text-gray-700">
              {(Number(item.dados_contrato?.valorMensal || item.valor_parcela || item.valor_mensal) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
               {isPassageiro ? "VENCIMENTO PADRÃO" : "CRIADO EM"}
             </span>
             <span className="text-sm text-gray-600">
               {isPassageiro ? `Dia ${item.vencimento_mensalidade || item.dados_contrato?.diaVencimento || item.dia_vencimento}` : formatDateToBR(item.created_at)}
             </span>
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
      pendentes: { icon: Send, title: "Nenhum contrato pendente", desc: "Todos os seus contratos foram assinados!" },
      assinados: { icon: Eye, title: "Nenhum contrato assinado", desc: "Aguardando assinaturas dos responsáveis." },
      sem_contrato: { icon: FileText, title: "Todos os passageiros com contrato", desc: "Bom trabalho! Tudo organizado." },
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
        />
      )}
    >
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Passageiro</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Responsável</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Valor</TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                {activeTab === 'sem_contrato' ? 'Venc. Padrão' : 'Data'}
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs",
                      item.tipo === 'passageiro' ? "bg-orange-50 text-orange-600" : (item.status === ContratoStatus.ASSINADO ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600")
                    )}>
                      {(item.passageiro?.nome || item.nome || "?").charAt(0)}
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{item.passageiro?.nome || item.nome || "Não informado"}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-600">
                  {item.passageiro?.nome_responsavel || item.nome_responsavel || "Não informado"}
                </TableCell>
                <TableCell className="px-6 py-4 font-bold text-gray-900 text-sm">
                  {(Number(item.dados_contrato?.valorMensal || item.valor_parcela || item.valor_mensal) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-gray-600">
                  {item.tipo === 'passageiro' ? `Dia ${item.vencimento_mensalidade || item.dados_contrato?.diaVencimento || item.dia_vencimento}` : formatDateToBR(item.created_at)}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <ContratoActionsMenu 
                    item={item} 
                    tipo={item.tipo} 
                    status={item.status} 
                    {...actions}
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
