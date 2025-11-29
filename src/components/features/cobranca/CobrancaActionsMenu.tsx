import UpgradePlanDialog from "@/components/dialogs/UpgradePlanDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cobranca } from "@/types/cobranca";
import { safeCloseDialog } from "@/utils/dialogUtils";
import {
  cobrancaPodeReceberNotificacao,
  disableDesfazerPagamento,
  disableEditarCobranca,
  disableExcluirCobranca,
  disableRegistrarPagamento,
  planoPermiteEnviarNotificacao,
} from "@/utils/domain/cobranca/disableActions";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  DollarSign,
  FilePen,
  MoreVertical,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

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
}: CobrancaActionsMenuProps) {
  const triggerClassName =
    variant === "mobile" ? "h-8 w-8 shrink-0 -mr-2 -mt-1" : "h-8 w-8 p-0";

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

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
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!planoPermiteEnviarNotificacao(plano)) {
                setTimeout(() => setUpgradeDialogOpen(true), 0);
                return;
              }
              onEnviarNotificacao();
            }}
          >
            <Bell className="mr-2 h-4 w-4" />
            Enviar Lembrete
          </DropdownMenuItem>
          {planoPermiteEnviarNotificacao(plano) && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLembretes();
                }}
                disabled={!cobrancaPodeReceberNotificacao(cobranca)}
              >
                {cobranca.desativar_lembretes ? (
                  <Bell className="mr-2 h-4 w-4" />
                ) : (
                  <BellOff className="mr-2 h-4 w-4" />
                )}
                {cobranca.desativar_lembretes
                  ? "Reativar Lembretes Automáticos"
                  : "Pausar Lembretes Automáticos"}
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

      <UpgradePlanDialog
        open={upgradeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            safeCloseDialog(() => setUpgradeDialogOpen(false));
          } else {
            setUpgradeDialogOpen(true);
          }
        }}
        featureName="Lembretes Automáticos"
        description="Envie lembretes de cobrança automáticos para seus passageiros via WhatsApp."
      />
    </>
  );
}
