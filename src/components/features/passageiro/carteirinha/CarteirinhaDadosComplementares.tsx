import { Button } from "@/components/ui/button";
import {
  formatRespostaComplementarExibicao,
  normalizeRespostasComplementares,
  RespostaComplementarItem,
  TipoPerguntaPersonalizadaEnum,
} from "@/constants/formularioExterno";
import { useLayoutSafe } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { ClipboardList, Pencil } from "lucide-react";

interface CarteirinhaDadosComplementaresProps {
  passageiro?: Passageiro | Partial<Passageiro> | null;
  dadosComplementares?: RespostaComplementarItem[] | null;
  canManageOverride?: boolean;
  hideWhenEmpty?: boolean;
  onSuccess?: (updatedPassageiro?: Passageiro, hasChanges?: boolean) => void;
}

export const CarteirinhaDadosComplementares = ({
  passageiro,
  dadosComplementares,
  canManageOverride,
  hideWhenEmpty = false,
  onSuccess,
}: CarteirinhaDadosComplementaresProps) => {
  const { can } = usePermissions();
  const layout = useLayoutSafe();
  const canManage =
    canManageOverride !== undefined
      ? canManageOverride
      : can("passageiros.gerenciar");

  const rawData =
    dadosComplementares !== undefined
      ? dadosComplementares
      : passageiro?.dados_complementares;
  const respostas = normalizeRespostasComplementares(rawData);

  if (hideWhenEmpty && respostas.length === 0) {
    return null;
  }

  const handleEdit = () => {
    if (!canManage || !passageiro || !layout) return;
    layout.openPassageiroDadosComplementaresDialog({
      passageiro,
      onSuccess,
    });
  };

  return (
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#e5e5e5] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ClipboardList className="w-4 h-4 text-[#0a0a0a] shrink-0" />
          <h3 className="text-sm font-semibold text-[#0a0a0a] truncate">
            Informações Complementares
          </h3>
        </div>

        {canManage && passageiro && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="h-7 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-2.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer shrink-0"
          >
            <Pencil className="h-3 w-3 text-[#737373]" />
            <span>Editar</span>
          </Button>
        )}
      </div>

      <div className="px-5 sm:px-6 py-4 sm:py-5">
        {respostas.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5">
            {respostas.map((item) => {
              const isSimPositivo =
                item.tipo === TipoPerguntaPersonalizadaEnum.SIM_NAO_TEXTO &&
                item.resposta_booleana === true;

              return (
                <div
                  key={item.id}
                  onClick={canManage && passageiro ? handleEdit : undefined}
                  className={cn(
                    "rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] px-4 py-3 space-y-1 transition-colors",
                    canManage && passageiro && "cursor-pointer hover:bg-[#f5f5f5]"
                  )}
                >
                  <p className="text-[11px] font-medium text-[#737373] leading-snug">
                    {item.pergunta}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isSimPositivo && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-semibold bg-primary/10 text-primary border border-primary/15">
                        Sim
                      </span>
                    )}
                    <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-relaxed break-words">
                      {isSimPositivo
                        ? item.resposta_texto || "Sim"
                        : formatRespostaComplementarExibicao(item)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={canManage && passageiro ? handleEdit : undefined}
            className={cn(
              "-mx-2 px-2 py-1 rounded-[12px] transition-colors",
              canManage && passageiro && "cursor-pointer hover:bg-[#f5f5f5]"
            )}
          >
            <p className="text-[11px] text-[#a3a3a3] italic py-2">
              {canManage
                ? "Toque para registrar informações complementares do aluno..."
                : "Nenhuma informação complementar cadastrada."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
