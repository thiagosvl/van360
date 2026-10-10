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
  reciboUrl,
  isLoading = false,
  onVisualizar,
}) => {
  if (isLoading || !reciboUrl) {
    return (
      <div className="relative overflow-hidden rounded-[18px] sm:rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#f5f5f5] text-[#737373]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <p className="text-xs font-medium text-[#737373]">
            Gerando recibo anual...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[18px] sm:rounded-[20px] border border-[#e5e5e5] bg-[#ffffff] p-3.5 sm:p-4 shadow-xs transition-all hover:border-[#d4d4d4]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a]">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0a0a0a]">
              Recibo Anual
            </h4>
            <p className="text-xs text-[#737373]">
              Referência: {ano}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onVisualizar}
          className="bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 font-semibold text-xs h-9 px-4 rounded-[18px] shadow-none transition-all active:scale-95 shrink-0 gap-1.5 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>Ver Recibo</span>
        </Button>
      </div>
    </div>
  );
};
