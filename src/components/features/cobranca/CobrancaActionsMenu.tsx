import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cobranca } from "@/types/cobranca";
import {
  disableDesfazerPagamento,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
  seForPago,
} from "@/utils/domain/cobranca/disableActions";
import { canUseNotificacoes } from "@/utils/domain/plano/accessRules";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  DollarSign,
  FilePen,
  MoreVertical,
  Send,
  Trash2,
  User,
} from "lucide-react";

interface CobrancaActionsMenuProps {
  cobranca: Cobranca;
  passageiroId?: string;
  plano: any;
  variant?: "default" | "mobile";
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

export function CobrancaActionsMenu({
  cobranca,
  passageiroId,
  plano,
  variant = "default",
  onVerCobranca,
  onEditarCobranca,
  onRegistrarPagamento,
  onEnviarNotificacao,
  onToggleLembretes,
  onDesfazerPagamento,
  onExcluirCobranca,
  onVerCarteirinha,
  onUpgrade,
}: CobrancaActionsMenuProps) {
  const triggerClassName =
    variant === "mobile" ? "h-8 w-8 shrink-0 -mr-2 -mt-1" : "h-8 w-8 p-0";

  const hasNotificacoesAccess = canUseNotificacoes(plano as any);

  const handleToggleNotificacoes = () => {
    if (hasNotificacoesAccess) {
      // Usuário tem permissão: executa a ação normal
      onToggleLembretes();
    } else {
      // Usuário não tem permissão: chama callback de upgrade
      onUpgrade(
        "Notificações Automáticas",
        "Automatize o envio de lembretes e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
      );
    }
  };

  const handleEnviarNotificacao = () => {
    if (hasNotificacoesAccess) {
      // Usuário tem permissão: executa a ação normal
      onEnviarNotificacao();
    } else {
      // Usuário não tem permissão: chama callback de upgrade
      onUpgrade(
        "Envio de Cobranças",
        "Automatize o envio de cobranças e reduza a inadimplência. Envie notificações automáticas para seus passageiros via WhatsApp."
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={variant === "mobile" ? "icon" : "sm"}
            className={triggerClassName}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onVerCarteirinha && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onVerCarteirinha();
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Ver Carteirinha
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onVerCobranca();
            }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Ver Cobrança
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={disableEditarCobranca(cobranca)}
            onClick={(e) => {
              e.stopPropagation();
              onEditarCobranca();
            }}
          >
            <FilePen className="mr-2 h-4 w-4" />
            Editar Cobrança
          </DropdownMenuItem>
          {!disableRegistrarPagamento(cobranca) && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                document.body.click();
                setTimeout(() => onRegistrarPagamento(), 10);
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Registrar Pagamento
            </DropdownMenuItem>
          )}
          {!seForPago(cobranca) && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                disabled={hasNotificacoesAccess || seForPago(cobranca)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnviarNotificacao();
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Cobrança
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleNotificacoes();
                }}
                disabled={hasNotificacoesAccess || seForPago(cobranca)}
              >
                {cobranca.desativar_lembretes ? (
                  <Bell className="mr-2 h-4 w-4" />
                ) : (
                  <BellOff className="mr-2 h-4 w-4" />
                )}
                {cobranca.desativar_lembretes
                  ? "Ativar Notificações"
                  : "Pausar Notificações"}
              </DropdownMenuItem>
            </>
          )}
          {!disableDesfazerPagamento(cobranca) && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDesfazerPagamento();
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Desfazer Pagamento
            </DropdownMenuItem>
          )}
          {onExcluirCobranca && (
            <DropdownMenuItem
              className={
                variant === "mobile"
                  ? "text-red-600"
                  : "text-red-600 cursor-pointer"
              }
              disabled={disableExcluirCobranca(cobranca)}
              onClick={(e) => {
                e.stopPropagation();
                onExcluirCobranca();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Cobrança
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
