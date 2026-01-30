import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContratoStatus } from "@/types/enums";
import {
    Copy,
    Download,
    Eye,
    FileText,
    MoreVertical,
    RefreshCcw,
    Send,
    Trash2,
    User
} from "lucide-react";
import { memo } from "react";

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

export const ContratoActionsMenu = memo(function ContratoActionsMenu({
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
}: ContratoActionsMenuProps) {
  const isPendente = status === ContratoStatus.PENDENTE;
  const isAssinado = status === ContratoStatus.ASSINADO;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-100 shadow-xl p-1">
        
        {tipo === 'passageiro' ? (
          <DropdownMenuItem 
            onClick={() => onGerarContrato?.(item.id)}
            className="flex items-center gap-2 p-2.5 rounded-lg text-blue-600 font-medium"
          >
            <FileText className="h-4 w-4" />
            Gerar Contrato
          </DropdownMenuItem>
        ) : (
          <>
            {isPendente && (
              <>
                <DropdownMenuItem 
                  onClick={() => onReenviarNotificacao?.(item.id)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-blue-600 font-medium cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Reenviar WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onCopiarLink?.(item.token_acesso)}
                  className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </DropdownMenuItem>
              </>
            )}

            {isAssinado && (
              <>
                <DropdownMenuItem 
                  onClick={() => onVisualizarLink?.(item.token_acesso)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-green-600 font-medium cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar (Link)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onBaixarPDF?.(item.id)}
                  className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onSubstituir?.(item.id)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-orange-600 font-medium cursor-pointer"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Gerar Novo (Substituir)
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        <DropdownMenuSeparator className="bg-gray-50 my-1" />
        
        <DropdownMenuItem 
          onClick={() => onVerPassageiro(tipo === 'passageiro' ? item.id : item.passageiro_id)}
          className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer"
        >
          <User className="h-4 w-4" />
          Ver Passageiro
        </DropdownMenuItem>

        {tipo === 'contrato' && isPendente && (
          <>
            <DropdownMenuSeparator className="bg-gray-50 my-1" />
            <DropdownMenuItem 
              onClick={() => onExcluir?.(item.id)}
              className="flex items-center gap-2 p-2.5 rounded-lg text-red-600 font-medium cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Contrato
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  );
});
