import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type ModoAusencia = "unico" | "periodo";

export interface PeriodoAusenciaCamposProps {
  dataInicio: string;
  dataFim: string;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
  disabled?: boolean;
  errors?: {
    dataInicio?: string;
    dataFim?: string;
  };
}

const calcularTotalDiasUteis = (inicioStr: string, fimStr: string): number => {
  if (!inicioStr) return 0;
  const start = parseISO(inicioStr);
  const end = fimStr ? parseISO(fimStr) : start;
  if (isBefore(end, start)) return 0;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

export const PeriodoAusenciaCampos: React.FC<PeriodoAusenciaCamposProps> = ({
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  disabled = false,
  errors = {},
}) => {
  const [modo, setModo] = useState<ModoAusencia>(() => {
    return dataFim && dataInicio && dataFim !== dataInicio ? "periodo" : "unico";
  });
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handleSelectInicio = (date: Date | undefined) => {
    if (!date) return;
    const formatted = format(date, "yyyy-MM-dd");
    onDataInicioChange(formatted);

    if (modo === "unico") {
      onDataFimChange(formatted);
    } else {
      if (dataFim && isBefore(parseISO(dataFim), date)) {
        onDataFimChange(formatted);
      } else if (!dataFim) {
        onDataFimChange(formatted);
      }
    }

    setIsStartOpen(false);
  };

  const handleSelectFim = (date: Date | undefined) => {
    if (!date) return;
    const formatted = format(date, "yyyy-MM-dd");
    onDataFimChange(formatted);
    setIsEndOpen(false);
  };

  const handleModoChange = (novoModo: ModoAusencia) => {
    setModo(novoModo);
    if (novoModo === "unico" && dataInicio) {
      onDataFimChange(dataInicio);
    }
  };

  const diasUteis = calcularTotalDiasUteis(dataInicio, dataFim);
  const startDateObj = dataInicio ? parseISO(dataInicio) : undefined;
  const endDateObj = dataFim ? parseISO(dataFim) : startDateObj;
  const minStartDate = new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-[13px] font-medium text-[#737373]">
          Período da Ausência
        </Label>
        <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] grid grid-cols-2 gap-1 w-full">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleModoChange("unico")}
            className={cn(
              "w-full rounded-[18px] px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer justify-center whitespace-nowrap",
              modo === "unico"
                ? "bg-white text-[#0a0a0a] shadow-xs"
                : "text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
            )}
          >
            Apenas 1 dia
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleModoChange("periodo")}
            className={cn(
              "w-full rounded-[18px] px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer justify-center whitespace-nowrap",
              modo === "periodo"
                ? "bg-white text-[#0a0a0a] shadow-xs"
                : "text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
            )}
          >
            Período
          </button>
        </div>
      </div>

      {modo === "unico" ? (
        <div className="space-y-1.5">
          <Label className="text-[13px] font-medium text-[#737373]">
            Data da Ausência <span className="text-[#e7000b]">*</span>
          </Label>

          <Popover open={isStartOpen && !disabled} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className={cn(
                  "h-11 w-full rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] text-sm text-left font-normal px-3.5 flex items-center justify-between shadow-none hover:bg-white transition-colors cursor-pointer",
                  !dataInicio && "text-[#737373] font-normal",
                  dataInicio && "text-[#0a0a0a] font-normal",
                  errors.dataInicio && "border-[#e7000b]",
                  disabled && "opacity-60 cursor-not-allowed bg-[#f5f5f5]"
                )}
              >
                <span>{startDateObj ? format(startDateObj, "dd/MM/yyyy") : "dd/mm/aaaa"}</span>
                <CalendarIcon className="w-4 h-4 text-[#737373] shrink-0 ml-auto" />
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0 bg-white border border-[#e5e5e5] rounded-[20px] sm:rounded-[24px] shadow-xl z-[9999]">
              <Calendar
                mode="single"
                selected={startDateObj}
                disabled={[
                  { before: minStartDate },
                  (date: Date) => date.getDay() === 0 || date.getDay() === 6,
                ]}
                fromDate={minStartDate}
                onSelect={handleSelectInicio}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {errors.dataInicio && (
            <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
              {errors.dataInicio}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-[#737373]">
                Data de Início <span className="text-[#e7000b]">*</span>
              </Label>

              <Popover open={isStartOpen && !disabled} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "h-11 w-full rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] text-sm text-left font-normal px-3.5 flex items-center justify-between shadow-none hover:bg-white transition-colors cursor-pointer",
                      !dataInicio && "text-[#737373] font-normal",
                      dataInicio && "text-[#0a0a0a] font-normal",
                      errors.dataInicio && "border-[#e7000b]",
                      disabled && "opacity-60 cursor-not-allowed bg-[#f5f5f5]"
                    )}
                  >
                    <span>{startDateObj ? format(startDateObj, "dd/MM/yyyy") : "dd/mm/aaaa"}</span>
                    <CalendarIcon className="w-4 h-4 text-[#737373] shrink-0 ml-auto" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0 bg-white border border-[#e5e5e5] rounded-[20px] sm:rounded-[24px] shadow-xl z-[9999]">
                  <Calendar
                    mode="single"
                    selected={startDateObj}
                    disabled={[
                      { before: minStartDate },
                      (date: Date) => date.getDay() === 0 || date.getDay() === 6,
                    ]}
                    fromDate={minStartDate}
                    onSelect={handleSelectInicio}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              {errors.dataInicio && (
                <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                  {errors.dataInicio}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-[#737373]">
                Data de Término <span className="text-[#e7000b]">*</span>
              </Label>

              <Popover open={isEndOpen && !disabled && Boolean(dataInicio)} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || !dataInicio}
                    className={cn(
                      "h-11 w-full rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] text-sm text-left font-normal px-3.5 flex items-center justify-between shadow-none hover:bg-white transition-colors cursor-pointer",
                      !dataFim && "text-[#737373] font-normal",
                      dataFim && "text-[#0a0a0a] font-normal",
                      errors.dataFim && "border-[#e7000b]",
                      (disabled || !dataInicio) && "opacity-60 cursor-not-allowed bg-[#f5f5f5]"
                    )}
                  >
                    <span>{endDateObj ? format(endDateObj, "dd/MM/yyyy") : "dd/mm/aaaa"}</span>
                    <CalendarIcon className="w-4 h-4 text-[#737373] shrink-0 ml-auto" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0 bg-white border border-[#e5e5e5] rounded-[20px] sm:rounded-[24px] shadow-xl z-[9999]">
                  <Calendar
                    mode="single"
                    selected={endDateObj}
                    disabled={[
                      { before: startDateObj || minStartDate },
                      (date: Date) => date.getDay() === 0 || date.getDay() === 6,
                    ]}
                    fromDate={startDateObj || minStartDate}
                    onSelect={handleSelectFim}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              {errors.dataFim && (
                <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                  {errors.dataFim}
                </p>
              )}
            </div>
          </div>

          {diasUteis > 1 && (
            <div className="px-1 text-xs text-[#737373] font-normal flex items-center gap-1.5">
              <span>Período de</span>
              <span className="font-semibold text-[#0a0a0a]">{diasUteis} dias úteis</span>
              <span>(fins de semana desconsiderados)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
