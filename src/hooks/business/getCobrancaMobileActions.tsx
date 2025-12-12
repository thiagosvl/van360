import { Cobranca } from "@/types/cobranca";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  DollarSign,
  FilePen,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { MobileAction } from "@/components/common/MobileActionItem";
import {
  disableDesfazerPagamento,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
  seForPago,
} from "@/utils/domain/cobranca/disableActions";
import { canUseNotificacoes } from "@/utils/domain/plano/accessRules";

interface GetCobrancaMobileActionsProps {
  cobranca: Cobranca;
  plano: any;
  onVerCobranca: () => void;
  onEditarCobranca: () => void;
  onRegistrarPagamento: () => void;
  onEnviarNotificacao: () => void;
  onToggleLembretes: () => void;
  onDesfazerPagamento: () => void;
  onExcluirCobranca?: () => void;
  onVerCarteirinha?: () => void;
  onUpgrade: (featureName: string, description: string) => void;
}

export function getCobrancaMobileActions({
  cobranca,
  plano,
  onVerCobranca,
  onEditarCobranca,
  onRegistrarPagamento,
  onEnviarNotificacao,
  onToggleLembretes,
  onDesfazerPagamento,
  onExcluirCobranca,
  onVerCarteirinha,
  onUpgrade,
}: GetCobrancaMobileActionsProps): MobileAction[] {
  const hasNotificacoesAccess = canUseNotificacoes(plano as any);
  const isPago = seForPago(cobranca);

  const actions: MobileAction[] = [];

  // 1. Ver Carteirinha (Optional)
  if (onVerCarteirinha) {
    actions.push({
      label: "Ver Carteirinha",
      icon: <User className="h-4 w-4" />,
      onClick: onVerCarteirinha,
      swipeColor: "bg-blue-500",
    });
  }

  // 2. Registrar Pagamento (Priority Action)
  if (!disableRegistrarPagamento(cobranca)) {
    actions.push({
      label: "Registrar Pagamento",
      icon: <CheckCircle2 className="h-4 w-4" />,
      onClick: () => {
        // Fix for pointer events / dialog
        document.body.click(); 
        setTimeout(() => onRegistrarPagamento(), 10);
      },
      swipeColor: "bg-green-600",
    });
  }

  // 3. Ver Detalhes
  actions.push({
    label: "Ver Detalhes",
    icon: <DollarSign className="h-4 w-4" />,
    onClick: onVerCobranca,
    swipeColor: "bg-gray-500",
  });

  // 4. Enviar Cobrança (WhatsApp)
  if (!isPago) {
    actions.push({
      label: "Enviar Cobrança",
      icon: <Send className="h-4 w-4" />,
      onClick: hasNotificacoesAccess
        ? onEnviarNotificacao
        : () =>
            onUpgrade(
              "Envio de Cobranças",
              "Automatize o envio de cobranças e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
            ),
      swipeColor: "bg-green-500",
      disabled: false, 
    });
  }

  // 5. Editar
  actions.push({
    label: "Editar",
    icon: <FilePen className="h-4 w-4" />,
    onClick: onEditarCobranca,
    disabled: disableEditarCobranca(cobranca),
    swipeColor: "bg-blue-600",
  });

  // 6. Notificações (Toggle)
  if (!isPago) {
    actions.push({
      label: cobranca.desativar_lembretes
        ? "Ativar Notificações"
        : "Pausar Notificações",
      icon: cobranca.desativar_lembretes ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      ),
      onClick: hasNotificacoesAccess
        ? onToggleLembretes
        : () =>
            onUpgrade(
              "Notificações Automáticas",
              "Automatize o envio de lembretes e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
            ),
      swipeColor: "bg-orange-500",
    });
  }

  // 7. Desfazer Pagamento
  if (!disableDesfazerPagamento(cobranca)) {
    actions.push({
      label: "Desfazer Pagamento",
      icon: <ArrowLeft className="h-4 w-4" />,
      onClick: onDesfazerPagamento,
      swipeColor: "bg-amber-500",
    });
  }

  // 8. Excluir (Last)
  if (onExcluirCobranca) {
    actions.push({
      label: "Excluir",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onExcluirCobranca,
      disabled: disableExcluirCobranca(cobranca),
      isDestructive: true,
      swipeColor: "bg-red-600",
    });
  }

  return actions;
}
