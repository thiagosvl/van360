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
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <p className="text-xs font-medium text-slate-600">
            Gerando recibo anual...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-sm transition-all hover:border-slate-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Recibo Anual
            </h4>
            <p className="text-xs text-slate-500">
              Referência: {ano}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onVisualizar}
          className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs h-9 px-4 rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          <span>Ver Recibo</span>
        </Button>
      </div>
    </div>
  );
};
