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
    <div className="space-y-3">
      {/* Segmented Control: Apenas 1 dia vs Período */}
      <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleModoChange("unico")}
          className={cn(
            "h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
            modo === "unico"
              ? "bg-white text-[#16314f] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          Apenas 1 dia
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleModoChange("periodo")}
          className={cn(
            "h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
            modo === "periodo"
              ? "bg-white text-[#16314f] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          Período
        </button>
      </div>

      {modo === "unico" ? (
        /* Modo 1 dia: Apenas um campo */
        <div className="space-y-1">
          <Label className="text-slate-700 font-semibold ml-1">
            Data da Ausência <span className="text-red-500">*</span>
          </Label>

          <Popover open={isStartOpen && !disabled} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                className={cn(
                  "h-12 w-full rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base text-left font-medium px-3.5 flex items-center justify-between shadow-none hover:bg-slate-100 transition-colors cursor-pointer",
                  !dataInicio && "text-slate-400 font-normal",
                  dataInicio && "text-slate-700 font-medium",
                  errors.dataInicio && "border-red-500",
                  disabled && "opacity-60 cursor-not-allowed bg-slate-100"
                )}
              >
                <span>{startDateObj ? format(startDateObj, "dd/MM/yyyy") : "dd/mm/aaaa"}</span>
                <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-auto p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999]">
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
            <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
              {errors.dataInicio}
            </p>
          )}
        </div>
      ) : (
        /* Modo Período: Dois campos */
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-slate-700 font-semibold ml-1">
                Data de Início <span className="text-red-500">*</span>
              </Label>

              <Popover open={isStartOpen && !disabled} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "h-12 w-full rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base text-left font-medium px-3.5 flex items-center justify-between shadow-none hover:bg-slate-100 transition-colors cursor-pointer",
                      !dataInicio && "text-slate-400 font-normal",
                      dataInicio && "text-slate-700 font-medium",
                      errors.dataInicio && "border-red-500",
                      disabled && "opacity-60 cursor-not-allowed bg-slate-100"
                    )}
                  >
                    <span>{startDateObj ? format(startDateObj, "dd/MM/yyyy") : "dd/mm/aaaa"}</span>
                    <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999]">
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
                <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                  {errors.dataInicio}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-slate-700 font-semibold ml-1">
                Data de Término <span className="text-red-500">*</span>
              </Label>

              <Popover open={isEndOpen && !disabled && Boolean(dataInicio)} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || !dataInicio}
                    className={cn(
                      "h-12 w-full rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base text-left font-medium px-3.5 flex items-center justify-between shadow-none hover:bg-slate-100 transition-colors cursor-pointer",
                      !dataFim && "text-slate-400 font-normal",
                      dataFim && "text-slate-700 font-medium",
                      errors.dataFim && "border-red-500",
                      (disabled || !dataInicio) && "opacity-60 cursor-not-allowed bg-slate-100"
                    )}
                  >
                    <span>{endDateObj ? format(endDateObj, "dd/MM/yyyy") : "dd/mm/aaaa"}</span>
                    <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-auto p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999]">
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
                <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                  {errors.dataFim}
                </p>
              )}
            </div>
          </div>

          {diasUteis > 1 && (
            <div className="px-1 text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span>Período de</span>
              <span className="font-bold text-[#1a3a5c]">{diasUteis} dias úteis</span>
              <span>(fins de semana desconsiderados)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
