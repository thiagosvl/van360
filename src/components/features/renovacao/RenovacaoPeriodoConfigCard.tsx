import { CalendarDays, Clock, Car, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RenovacaoPeriodoConfigCardProps {
  anoDestino: number;
  periodoTexto: string;
  transporteTexto: string | null;
  qtdParcelas: number | null;
  onConfigurar: () => void;
}

export function RenovacaoPeriodoConfigCard({
  anoDestino,
  periodoTexto,
  transporteTexto,
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
              Período Letivo
            </h3>
            <span className="text-[11px] text-[#737373]">
              Regras gerais de {anoDestino}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a0a0a]">
              <Clock className="w-3.5 h-3.5 text-[#737373] shrink-0" />
              <span>Cobrança</span>
            </div>
            <p className="text-xs text-[#737373] pl-5">
              {periodoTexto}
            </p>
          </div>

          {transporteTexto && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0a0a0a]">
                <Car className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                <span>Transporte</span>
              </div>
              <p className="text-xs text-[#737373] pl-5">
                {transporteTexto}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs text-[#737373] truncate">
          Cobrança e transporte padrão
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onConfigurar}
          className="h-8 px-3 rounded-[14px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] text-xs font-medium gap-1.5 shadow-none shrink-0 cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5 text-[#737373]" />
          <span>Configurar</span>
        </Button>
      </div>
    </div>
  );
}
