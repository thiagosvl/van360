import { ActionItem } from "@/types/actions";
import { ContratoStatus } from "@/types/enums";
import {
  Copy,
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
  isDesativado?: boolean;
  usarContratos?: boolean;
  onVerPassageiro: (id: string) => void;
  onCopiarLink?: (token: string) => void;
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
  status: rawStatus,
  isDesativado = false,
  usarContratos = true,
  onVerPassageiro,
  onCopiarLink,
  onReenviarNotificacao,
  onExcluir,
  onSubstituir,
  onGerarContrato,
  onVisualizarLink,
  onVisualizarFinal,
}: UseContratoActionsProps): ActionItem[] {
  return useMemo(() => {
    // Normalização robusta de status
    const status = (rawStatus || item?.status_contrato || item?.contrato_status || item?.status)?.toString().toLowerCase();

    // Identificação do estado do contrato
    const isPendente = status === ContratoStatus.PENDENTE || status === 'pendente' || status === '1';
    const isAssinado = status === ContratoStatus.ASSINADO || status === 'assinado' || status === '2';
    // Consideramos que tem contrato se o status for pendente/assinado OU se houver um id de contrato
    const hasContract = isPendente || isAssinado || !!(item?.contrato_id);

    // Lógica de desativação global da funcionalidade
    // Se a feature está desativada na config (usarContratos === false) ou se o componente pai pediu (isDesativado)
    const isFeatureDisabled = !!(isDesativado || (usarContratos === false));

    const list: ActionItem[] = [];

    // 1. GERAR CONTRATO - Só aparece se NÃO tem contrato
    if (onGerarContrato && !hasContract) {
      list.push({
        label: 'Gerar Contrato',
        icon: <FileText className="h-4 w-4" />,
        onClick: () => onGerarContrato(tipo === 'passageiro' ? item.id : item.passageiro_id),
        disabled: isFeatureDisabled,
        swipeColor: 'bg-blue-600',
        hasSeparatorAfter: true
      });
    }

    // 2. VER CONTRATO - Só aparece se tem contrato
    const urlContrato = isPendente
      ? (item.minuta_url || item.contrato_url)
      : (item.contrato_final_url || item.contrato_url);

    if (hasContract) {
      list.push({
        label: isAssinado ? 'Ver Contrato Assinado' : 'Ver Contrato Pendente',
        icon: isAssinado ? <Eye className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />,
        onClick: () => urlContrato && onVisualizarFinal?.(urlContrato),
        disabled: !!(!urlContrato || isFeatureDisabled),
        isLink: !!urlContrato,
        href: urlContrato || undefined,
        swipeColor: 'bg-green-600',
        hasSeparatorAfter: true
      });
    }

    // 3. COPIAR LINK - Só aparece se pendente
    if (isPendente) {
      list.push({
        label: 'Copiar Link',
        icon: <Copy className="h-4 w-4" />,
        onClick: () => onCopiarLink?.(item.token_acesso),
        disabled: !!(!item.token_acesso || isFeatureDisabled),
        swipeColor: 'bg-indigo-600',
        hasSeparatorAfter: true
      });
    }

    // 4. REENVIAR CONTRATO - Só aparece se pendente
    if (isPendente) {
      list.push({
        label: 'Reenviar Contrato',
        icon: <Send className="h-4 w-4" />,
        onClick: () => onReenviarNotificacao?.(item.id),
        disabled: !!(!onReenviarNotificacao || isFeatureDisabled),
        swipeColor: 'bg-blue-600',
        hasSeparatorAfter: true
      });
    }

    // 5. SUBSTITUIR CONTRATO - Só aparece se tem contrato
    if (hasContract) {
      list.push({
        label: 'Substituir Contrato',
        icon: <RefreshCcw className="h-4 w-4" />,
        onClick: () => onSubstituir?.(item.id),
        disabled: !!(!onSubstituir || isFeatureDisabled),
        swipeColor: 'bg-orange-600',
        hasSeparatorAfter: true
      });
    }

    // 6. VER CARTEIRINHA - Sempre visível e habilitado (Independente de contrato)
    list.push({
      label: 'Ver Carteirinha',
      icon: <User className="h-4 w-4" />,
      onClick: () => onVerPassageiro(tipo === 'passageiro' ? item.id : item.passageiro_id),
      swipeColor: 'bg-gray-500',
      hasSeparatorAfter: true
    });

    // 7. EXCLUIR CONTRATO - Só aparece se tem contrato
    if (hasContract) {
      list.push({
        label: 'Excluir Contrato',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onExcluir?.(item.id),
        disabled: !!(!onExcluir || isFeatureDisabled),
        className: 'text-red-600 font-medium',
        isDestructive: true,
        swipeColor: 'bg-red-600'
      });
    }

    return list;
  }, [item, tipo, rawStatus, isDesativado, usarContratos, onVerPassageiro, onCopiarLink, onReenviarNotificacao, onExcluir, onSubstituir, onGerarContrato, onVisualizarFinal]);


}

