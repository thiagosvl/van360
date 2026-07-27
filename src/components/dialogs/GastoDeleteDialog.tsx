import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import { GastoEscopoAcao } from "@/types/enums";
import { Gasto } from "@/types/gasto";
import { obterDetalhesExclusaoParcelas } from "@/utils/domain";
import { toast } from "@/utils/notifications/toast";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Header
        title={isParcelado ? "Excluir gasto parcelado" : "Excluir gasto"}
        icon={<Trash2 className="w-5 h-5 opacity-80" />}
        onClose={() => onOpenChange(false)}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          {!isParcelado ? (
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Tem certeza que deseja excluir este registro de gasto? Essa ação não poderá ser desfeita.
            </p>
          ) : (
            <>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Este gasto faz parte de um lançamento parcelado. Escolha quais parcelas deseja remover <span className="text-red-600">*</span>:
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {/* Opção 1: Somente esta parcela */}
                <button
                  type="button"
                  onClick={() => handleSelectOption(GastoEscopoAcao.UNICA)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm font-medium cursor-pointer",
                    escopo === GastoEscopoAcao.UNICA
                      ? "border-red-500 bg-red-50/50 text-red-950 shadow-sm ring-1 ring-red-500"
                      : hasError
                      ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                      : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    escopo === GastoEscopoAcao.UNICA
                      ? "border-red-600 bg-red-600"
                      : hasError
                      ? "border-red-400 bg-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {escopo === GastoEscopoAcao.UNICA && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-semibold block">{detalhes.unica.titulo}</span>
                    <span className="text-xs text-slate-500 font-normal leading-relaxed block">{detalhes.unica.descricao}</span>
                  </div>
                </button>

                {/* Opção 2: Esta e as próximas parcelas */}
                {detalhes.futuras && (
                  <button
                    type="button"
                    onClick={() => handleSelectOption(GastoEscopoAcao.FUTURAS)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm font-medium cursor-pointer",
                      escopo === GastoEscopoAcao.FUTURAS
                        ? "border-red-500 bg-red-50/50 text-red-950 shadow-sm ring-1 ring-red-500"
                        : hasError
                        ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                        : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                      escopo === GastoEscopoAcao.FUTURAS
                        ? "border-red-600 bg-red-600"
                        : hasError
                        ? "border-red-400 bg-white"
                        : "border-slate-300 bg-white"
                    )}>
                      {escopo === GastoEscopoAcao.FUTURAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-semibold block">{detalhes.futuras.titulo}</span>
                      <span className="text-xs text-slate-500 font-normal leading-relaxed block">{detalhes.futuras.descricao}</span>
                    </div>
                  </button>
                )}

                {/* Opção 3: Todas as parcelas */}
                <button
                  type="button"
                  onClick={() => handleSelectOption(GastoEscopoAcao.TODAS)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm font-medium cursor-pointer",
                    escopo === GastoEscopoAcao.TODAS
                      ? "border-red-500 bg-red-50/50 text-red-950 shadow-sm ring-1 ring-red-500"
                      : hasError
                      ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                      : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    escopo === GastoEscopoAcao.TODAS
                      ? "border-red-600 bg-red-600"
                      : hasError
                      ? "border-red-400 bg-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {escopo === GastoEscopoAcao.TODAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-semibold block">{detalhes.todas.titulo}</span>
                    <span className="text-xs text-slate-500 font-normal leading-relaxed block">{detalhes.todas.descricao}</span>
                  </div>
                </button>
              </div>

              {hasError && (
                <p className="text-xs text-red-500 font-medium mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-150">
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
          onClick={() => onOpenChange(false)}
        />
        <BaseDialog.Action
          label={showLoading ? "Excluindo..." : "Confirmar"}
          variant="primary"
          isLoading={showLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
