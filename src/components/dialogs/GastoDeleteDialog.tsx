import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import { GastoEscopoAcao } from "@/types/enums";
import { Gasto } from "@/types/gasto";
import { obterDetalhesExclusaoParcelas } from "@/utils/domain";
import { toast } from "@/utils/notifications/toast";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { safeCloseDialog } from "@/hooks";

export interface GastoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gasto: Gasto | null;
  onConfirm: (escopo: GastoEscopoAcao) => void | Promise<void>;
  isLoading?: boolean;
}

export default function GastoDeleteDialog({
  open,
  onOpenChange,
  gasto,
  onConfirm,
  isLoading = false,
}: GastoDeleteDialogProps) {
  const [escopo, setEscopo] = useState<GastoEscopoAcao | null>(null);
  const [hasError, setHasError] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setEscopo(null);
      setHasError(false);
    }
  }, [open, gasto]);

  const showLoading = isLoading || internalLoading;
  const isParcelado = Boolean(gasto?.parcelamento_id);
  const detalhes = obterDetalhesExclusaoParcelas(gasto?.numero_parcela, gasto?.total_parcelas);

  const handleConfirm = async () => {
    if (isParcelado && !escopo) {
      setHasError(true);
      toast.error("validacao.formularioComErros");
      return;
    }

    const escopoFinal = isParcelado ? (escopo as GastoEscopoAcao) : GastoEscopoAcao.UNICA;
    const result = onConfirm(escopoFinal);
    if (result instanceof Promise) {
      setInternalLoading(true);
      try {
        await result;
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const handleSelectOption = (val: GastoEscopoAcao) => {
    setEscopo(val);
    setHasError(false);
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <BaseDialog.Header
        title={isParcelado ? "Excluir gasto parcelado" : "Excluir gasto"}
        icon={<Trash2 className="w-5 h-5 text-[#e7000b]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          {!isParcelado ? (
            <p className="text-[#737373] text-sm font-normal leading-relaxed">
              Tem certeza que deseja excluir este registro de gasto? Essa ação não poderá ser desfeita.
            </p>
          ) : (
            <>
              <p className="text-[#737373] text-sm font-normal leading-relaxed">
                Este gasto faz parte de um lançamento parcelado. Escolha quais parcelas deseja remover <span className="text-[#e7000b]">*</span>:
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectOption(GastoEscopoAcao.UNICA)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all text-sm font-medium cursor-pointer",
                    escopo === GastoEscopoAcao.UNICA
                      ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                      : hasError
                        ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                        : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    escopo === GastoEscopoAcao.UNICA
                      ? "border-[#0a0a0a] bg-[#0a0a0a]"
                      : hasError
                        ? "border-[#e7000b]/60 bg-white"
                        : "border-[#e5e5e5] bg-white"
                  )}>
                    {escopo === GastoEscopoAcao.UNICA && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0a0a0a] block">{detalhes.unica.titulo}</span>
                    <span className="text-xs text-[#737373] font-normal leading-relaxed block">{detalhes.unica.descricao}</span>
                  </div>
                </button>

                {detalhes.futuras && (
                  <button
                    type="button"
                    onClick={() => handleSelectOption(GastoEscopoAcao.FUTURAS)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all text-sm font-medium cursor-pointer",
                      escopo === GastoEscopoAcao.FUTURAS
                        ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                        : hasError
                          ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                          : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                      escopo === GastoEscopoAcao.FUTURAS
                        ? "border-[#0a0a0a] bg-[#0a0a0a]"
                        : hasError
                          ? "border-[#e7000b]/60 bg-white"
                          : "border-[#e5e5e5] bg-white"
                    )}>
                      {escopo === GastoEscopoAcao.FUTURAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-semibold text-[#0a0a0a] block">{detalhes.futuras.titulo}</span>
                      <span className="text-xs text-[#737373] font-normal leading-relaxed block">{detalhes.futuras.descricao}</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectOption(GastoEscopoAcao.TODAS)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all text-sm font-medium cursor-pointer",
                    escopo === GastoEscopoAcao.TODAS
                      ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                      : hasError
                        ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                        : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    escopo === GastoEscopoAcao.TODAS
                      ? "border-[#0a0a0a] bg-[#0a0a0a]"
                      : hasError
                        ? "border-[#e7000b]/60 bg-white"
                        : "border-[#e5e5e5] bg-white"
                  )}>
                    {escopo === GastoEscopoAcao.TODAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0a0a0a] block">{detalhes.todas.titulo}</span>
                    <span className="text-xs text-[#737373] font-normal leading-relaxed block">{detalhes.todas.descricao}</span>
                  </div>
                </button>
              </div>

              {hasError && (
                <p className="text-xs text-[#e7000b] font-medium mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  Selecione uma das opções acima.
                </p>
              )}
            </>
          )}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={showLoading}
          onClick={handleClose}
        />
        <BaseDialog.Action
          label={showLoading ? "Excluindo..." : "Confirmar Exclusão"}
          variant="destructive"
          isLoading={showLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
