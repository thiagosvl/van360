import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ActionItem } from "@/types/actions";
import { ContratoStatus } from "@/types/enums";
import {
  Copy,
  Download,
  Eye,
  FileText,
  RefreshCcw,
  Send,
  Trash2,
  User
} from "lucide-react";
import { memo, useMemo } from "react";

interface ContratoActionsMenuProps {
  item: any; // Pode ser Contrato ou Passageiro
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
}

export const ContratoActionsMenu = memo(function ContratoActionsMenu(props: ContratoActionsMenuProps) {
  const {
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
  } = props;

  const actions = useMemo(() => {
    const isPendente = status === ContratoStatus.PENDENTE;
    const isAssinado = status === ContratoStatus.ASSINADO;
    const list: ActionItem[] = [];

    if (tipo === 'passageiro') {
      if (onGerarContrato) {
        list.push({
          label: 'Gerar Contrato',
          icon: <FileText className="h-4 w-4" />,
          onClick: () => onGerarContrato(item.id),
          hasSeparatorAfter: true
        });
      }
    } else {
      // Contrato Actions
      if (isPendente) {
        if (onReenviarNotificacao) {
          list.push({
            label: 'Reenviar WhatsApp',
            icon: <Send className="h-4 w-4" />,
            onClick: () => onReenviarNotificacao(item.id),
            hasSeparatorAfter: true
          });
        }
        if (onCopiarLink) {
           list.push({
            label: 'Copiar Link',
            icon: <Copy className="h-4 w-4" />,
            onClick: () => onCopiarLink(item.token_acesso),
            hasSeparatorAfter: true
           });
        }
      }

      if (isAssinado) {
        if (onVisualizarLink) {
          list.push({
            label: 'Visualizar (Link)',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onVisualizarLink(item.token_acesso),
            hasSeparatorAfter: true
          });
        }
        if (onBaixarPDF) {
          list.push({
            label: 'Baixar PDF',
            icon: <Download className="h-4 w-4" />,
            onClick: () => onBaixarPDF(item.id),
            hasSeparatorAfter: true
          });
        }
        if (onSubstituir) {
          list.push({
            label: 'Gerar Novo (Substituir)',
            icon: <RefreshCcw className="h-4 w-4" />,
            onClick: () => onSubstituir(item.id),
            hasSeparatorAfter: true
          });
        }
      }
    }

    // Common Action: Ver Passageiro
    list.push({
      label: 'Ver Passageiro',
      icon: <User className="h-4 w-4" />,
      onClick: () => onVerPassageiro(tipo === 'passageiro' ? item.id : item.passageiro_id),
    });

    // Destructive Actions
    if (tipo === 'contrato' && isPendente && onExcluir) {
      list.push({
        label: 'Excluir Contrato',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onExcluir(item.id),
        className: 'text-red-600',
        isDestructive: true
      });
    }

    // Final pass to ensure EVERY item except the last has a separator
    if (list.length > 1) {
      for (let i = 0; i < list.length - 1; i++) {
        list[i].hasSeparatorAfter = true;
      }
    }

    return list;
  }, [item, tipo, status, props]);

  return <ActionsDropdown actions={actions} />;
});
