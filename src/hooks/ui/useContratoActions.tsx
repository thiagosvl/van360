import { ActionItem } from "@/types/actions";
import { ContratoStatus } from "@/types/enums";
import {
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  RefreshCcw,
  Send,
  Trash2,
  User
} from "lucide-react";
import { useMemo } from "react";

interface UseContratoActionsProps {
  item: any;
  tipo: 'contrato' | 'passageiro';
  status?: string;
  onVerPassageiro: (id: string) => void;
  onCopiarLink?: (token: string) => void;
  onBaixarPDF?: (id: string) => void;
  onReenviarNotificacao?: (id: string) => void;
  onExcluir?: (id: string) => void;
  onSubstituir?: (id: string) => void;
  onGerarContrato?: (passageiroId: string) => void;
  onVisualizarLink?: (token: string) => void;
  onVisualizarFinal?: (url: string) => void;
}

export function useContratoActions({
  item,
  tipo,
  status,
  onVerPassageiro,
  onCopiarLink,
  onBaixarPDF,
  onReenviarNotificacao,
  onExcluir,
  onSubstituir,
  onGerarContrato,
  onVisualizarLink,
  onVisualizarFinal,
}: UseContratoActionsProps): ActionItem[] {
  return useMemo(() => {
    const isPendente = status === ContratoStatus.PENDENTE;
    const isAssinado = status === ContratoStatus.ASSINADO;
    const list: ActionItem[] = [];

    if (tipo === 'passageiro') {
      if (onGerarContrato) {
        list.push({
          label: 'Gerar Contrato',
          icon: <FileText className="h-4 w-4" />,
          onClick: () => onGerarContrato(item.id),
          swipeColor: 'bg-blue-600',
        });
      }
    } else {
      // Contrato Actions
      if (isPendente) {
        if (onVisualizarLink) {
          list.push({
            label: 'Ver Contrato',
            icon: <ExternalLink className="h-4 w-4" />,
            onClick: () => onVisualizarFinal(item.minuta_url),
            swipeColor: 'bg-green-600',
          });
        }
        if (onCopiarLink) {
           list.push({
            label: 'Copiar Link',
            icon: <Copy className="h-4 w-4" />,
            onClick: () => onCopiarLink(item.token_acesso),
            swipeColor: 'bg-indigo-600',
           });
        }
        if (onReenviarNotificacao) {
          list.push({
            label: 'Reenviar Contrato',
            icon: <Send className="h-4 w-4" />,
            onClick: () => onReenviarNotificacao(item.id),
            swipeColor: 'bg-blue-600',
          });
        }
      }

      if (isAssinado) {
        if (onVisualizarFinal && (item.contrato_final_url || item.contrato_url)) {
          list.push({
            label: 'Ver Contrato',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onVisualizarFinal(item.contrato_final_url || item.contrato_url),
            swipeColor: 'bg-green-600',
          });
        }
        if (onBaixarPDF) {
          list.push({
            label: 'Baixar PDF',
            icon: <Download className="h-4 w-4" />,
            onClick: () => onBaixarPDF(item.id),
            swipeColor: 'bg-blue-600',
          });
        }
        if (onSubstituir) {
          list.push({
            label: 'Substituir Contrato',
            icon: <RefreshCcw className="h-4 w-4" />,
            onClick: () => onSubstituir(item.id),
            swipeColor: 'bg-orange-600',
          });
        }
      }
    }

    // Common Action: Ver Passageiro
    list.push({
      label: 'Ver Passageiro',
      icon: <User className="h-4 w-4" />,
      onClick: () => onVerPassageiro(tipo === 'passageiro' ? item.id : item.passageiro_id),
      swipeColor: 'bg-gray-500'
    });

    // Destructive Actions
    if (tipo === 'contrato' && isPendente && onExcluir) {
      list.push({
        label: 'Excluir Contrato',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onExcluir(item.id),
        className: 'text-red-600 font-medium',
        isDestructive: true,
        swipeColor: 'bg-red-600'
      });
    }

    // Final pass to ensure EVERY item except the last has a separator (for Desktop view)
    if (list.length > 1) {
      for (let i = 0; i < list.length - 1; i++) {
        list[i].hasSeparatorAfter = true;
      }
    }

    return list;
  }, [item, tipo, status, onVerPassageiro, onCopiarLink, onBaixarPDF, onReenviarNotificacao, onExcluir, onSubstituir, onGerarContrato, onVisualizarLink, onVisualizarFinal]);
}
