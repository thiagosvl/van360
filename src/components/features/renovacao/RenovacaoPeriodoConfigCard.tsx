import { CalendarDays, Clock, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RenovacaoPeriodoConfigCardProps {
  anoDestino: number;
  periodoTexto: string;
  qtdParcelas: number | null;
  onConfigurar: () => void;
}

export function RenovacaoPeriodoConfigCard({
  anoDestino,
  periodoTexto,
  qtdParcelas,
  onConfigurar,
}: RenovacaoPeriodoConfigCardProps) {
  return (
    <div className="bg-[#ffffff] rounded-[20px] border border-[#e5e5e5] p-4 sm:p-5 shadow-xs space-y-3.5 h-full flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
              Período de Cobrança
            </h3>
            <span className="text-[11px] text-[#737373]">
              Regras gerais de {anoDestino}
            </span>
          </div>
        </div>

        <div className="pt-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a0a0a]">
              <Clock className="w-3.5 h-3.5 text-[#737373] shrink-0" />
              <span>Cobrança</span>
            </div>
            <p className="text-xs text-[#737373] pl-5">
              {periodoTexto} {qtdParcelas ? `(${qtdParcelas}x)` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs text-[#737373] truncate">
          {qtdParcelas ? `${qtdParcelas} parcelas configuradas` : "Definir parcelas da renovação"}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={onConfigurar}
          className="h-9 px-3.5 rounded-[16px] border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs sm:text-sm font-medium gap-2 shadow-2xs shrink-0 cursor-pointer transition-colors"
        >
          <Settings2 className="w-4 h-4 text-[#737373]" />
          <span>Configurar</span>
        </Button>
      </div>
    </div>
  );
}
