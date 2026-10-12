import React from "react";
import { Eye, Loader2, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarteirinhaReciboAnualCardProps {
  ano: number;
  totalPago: number;
  quantidadeMeses: number;
  reciboUrl?: string | null;
  isLoading?: boolean;
  onVisualizar: () => void;
}

export const CarteirinhaReciboAnualCard: React.FC<CarteirinhaReciboAnualCardProps> = ({
  ano,
  quantidadeMeses,
  reciboUrl,
  isLoading = false,
  onVisualizar,
}) => {
  if (isLoading || !reciboUrl) {
    return (
      <div className="relative overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f5f5f5] text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0a0a0a]">
              Recibo Anual • {ano}
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">
              Gerando documento comprobatório de quitação...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white p-3.5 sm:p-4 shadow-xs transition-all hover:border-[#d4d4d4]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <ReceiptText className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#0a0a0a] truncate leading-tight">
              Recibo Anual de Pagamentos
            </h4>
            <p className="text-xs text-[#737373] mt-0.5 truncate">
              Ano de referência: {ano} {quantidadeMeses > 0 ? `• ${quantidadeMeses} ${quantidadeMeses === 1 ? "mês quitado" : "meses quitados"}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onVisualizar}
          className="bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 font-semibold text-xs h-9 px-3.5 rounded-[18px] shadow-none transition-all active:scale-[0.98] shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>Ver Recibo</span>
        </button>
      </div>
    </div>
  );
};
