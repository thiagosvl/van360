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
  disableExcluirCobranca,
  disableRegistrarPagamento,
  podeEnviarNotificacao
} from "@/utils/domain/cobranca/disableActions";
import { MoreVertical } from "lucide-react";

interface CobrancaActionsMenuProps {
  cobranca: Cobranca;
  passageiroId: string;
  plano: any;
  variant?: "default" | "mobile";
  onVerCobranca: () => void;
  onEditarCobranca: () => void;
  onRegistrarPagamento: () => void;
  onEnviarNotificacao: () => void;
  onToggleLembretes: () => void;
  onDesfazerPagamento: () => void;
  onExcluirCobranca: () => void;
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
}: CobrancaActionsMenuProps) {
  const triggerClassName =
    variant === "mobile" ? "h-8 w-8 shrink-0 -mr-2 -mt-1" : "h-8 w-8 p-0";

  return (
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
      <DropdownMenuContent>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onVerCobranca();
          }}
        >
          Ver Cobrança
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onEditarCobranca();
          }}
        >
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
            Registrar Pagamento
          </DropdownMenuItem>
        )}
        {podeEnviarNotificacao(cobranca, plano) && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onEnviarNotificacao();
            }}
          >
            Enviar Lembrete
          </DropdownMenuItem>
        )}
        {podeEnviarNotificacao(cobranca, plano) && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLembretes();
            }}
          >
            {cobranca.desativar_lembretes
              ? "Reativar Lembretes"
              : "Pausar Lembretes"}
          </DropdownMenuItem>
        )}
        {!disableDesfazerPagamento(cobranca) && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDesfazerPagamento();
            }}
          >
            Desfazer Pagamento
          </DropdownMenuItem>
        )}
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
          Excluir Cobrança
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
