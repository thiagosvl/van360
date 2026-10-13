import { useState, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNowBR, toPersistenceString, parseLocalDate } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

export type PeriodPresetKey =
  | "hoje"
  | "ontem"
  | "3d"
  | "7d"
  | "14d"
  | "30d"
  | "mes_atual"
  | "mes_anterior"
  | "3m"
  | "6m"
  | "1a"
  | "tudo"
  | "custom";

export interface PeriodDateRange {
  dataInicio?: string;
  dataFim?: string;
  preset: PeriodPresetKey;
}

export interface AdminPeriodFilterProps {
  startDate?: string;
  endDate?: string;
  value?: PeriodDateRange;
  onChange: (
    startDate?: string,
    endDate?: string,
    preset?: PeriodPresetKey
  ) => void;
  defaultPreset?: PeriodPresetKey;
  allowedPresets?: PeriodPresetKey[];
  label?: string;
  showLabelAbove?: boolean;
  containerClassName?: string;
  className?: string;
  align?: "start" | "end" | "center";
}

interface PresetOption {
  key: PeriodPresetKey;
  label: string;
  group: "curto" | "longo" | "geral";
}

const PRESET_DEFINITIONS: PresetOption[] = [
  { key: "hoje", label: "Hoje", group: "curto" },
  { key: "ontem", label: "Ontem", group: "curto" },
  { key: "3d", label: "Últimos 3 dias", group: "curto" },
  { key: "7d", label: "Últimos 7 dias", group: "curto" },
  { key: "14d", label: "Últimos 14 dias", group: "curto" },
  { key: "30d", label: "Últimos 30 dias", group: "curto" },
  { key: "mes_atual", label: "Este mês", group: "longo" },
  { key: "mes_anterior", label: "Mês anterior", group: "longo" },
  { key: "3m", label: "Últimos 3 meses", group: "longo" },
  { key: "6m", label: "Últimos 6 meses", group: "longo" },
  { key: "1a", label: "Último 1 ano", group: "longo" },
  { key: "tudo", label: "Todo o período", group: "geral" },
  { key: "custom", label: "Personalizado", group: "geral" },
];

export function calculateDateRangeForPreset(preset: PeriodPresetKey): {
  dataInicio?: string;
  dataFim?: string;
} {
  const now = getNowBR();
  const todayStr = toPersistenceString(now);

  const subtractDays = (d: Date, days: number): Date => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() - days);
    return copy;
  };

  switch (preset) {
    case "hoje":
      return { dataInicio: todayStr, dataFim: todayStr };

    case "ontem": {
      const ontem = toPersistenceString(subtractDays(now, 1));
      return { dataInicio: ontem, dataFim: ontem };
    }

    case "3d":
      return {
        dataInicio: toPersistenceString(subtractDays(now, 3)),
        dataFim: todayStr,
      };

    case "7d":
      return {
        dataInicio: toPersistenceString(subtractDays(now, 7)),
        dataFim: todayStr,
      };

    case "14d":
      return {
        dataInicio: toPersistenceString(subtractDays(now, 14)),
        dataFim: todayStr,
      };

    case "30d":
      return {
        dataInicio: toPersistenceString(subtractDays(now, 30)),
        dataFim: todayStr,
      };

    case "mes_atual": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        dataInicio: toPersistenceString(firstDay),
        dataFim: todayStr,
      };
    }

    case "mes_anterior": {
      const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        dataInicio: toPersistenceString(firstDayPrev),
        dataFim: toPersistenceString(lastDayPrev),
      };
    }

    case "3m": {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return {
        dataInicio: toPersistenceString(threeMonthsAgo),
        dataFim: todayStr,
      };
    }

    case "6m": {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      return {
        dataInicio: toPersistenceString(sixMonthsAgo),
        dataFim: todayStr,
      };
    }

    case "1a": {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return {
        dataInicio: toPersistenceString(oneYearAgo),
        dataFim: todayStr,
      };
    }

    case "tudo":
      return { dataInicio: undefined, dataFim: undefined };

    case "custom":
    default:
      return { dataInicio: undefined, dataFim: undefined };
  }
}

const MESES_ABREV = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function formatExtenso(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = parseLocalDate(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const mes = MESES_ABREV[d.getMonth()];
    const ano = d.getFullYear();
    return `${day} de ${mes} de ${ano}`;
  } catch {
    return dateStr;
  }
}

function formatDiaMes(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = parseLocalDate(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const mes = MESES_ABREV[d.getMonth()];
    return `${day} de ${mes}`;
  } catch {
    return dateStr;
  }
}

export function AdminPeriodFilter({
  startDate,
  endDate,
  value,
  onChange,
  defaultPreset = "30d",
  allowedPresets,
  label,
  showLabelAbove = true,
  containerClassName,
  className,
  align = "start",
}: AdminPeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPreset, setLocalPreset] = useState<PeriodPresetKey>(defaultPreset);

  const initialRange = useMemo(() => {
    if (value) return value;
    const computed = calculateDateRangeForPreset(defaultPreset);
    return {
      preset: defaultPreset,
      dataInicio: startDate ?? computed.dataInicio,
      dataFim: endDate ?? computed.dataFim,
    };
  }, [value, defaultPreset, startDate, endDate]);

  const activePreset = value?.preset || localPreset;
  const currentInicio = startDate ?? (value?.dataInicio ?? initialRange.dataInicio);
  const currentFim = endDate ?? (value?.dataFim ?? initialRange.dataFim);

  const [tempInicio, setTempInicio] = useState(currentInicio || "");
  const [tempFim, setTempFim] = useState(currentFim || "");

  const presetsToRender = useMemo(() => {
    if (!allowedPresets || allowedPresets.length === 0) {
      return PRESET_DEFINITIONS;
    }
    const allowedSet = new Set(allowedPresets);
    return PRESET_DEFINITIONS.filter((item) => allowedSet.has(item.key));
  }, [allowedPresets]);

  const activePresetDef = PRESET_DEFINITIONS.find((p) => p.key === activePreset);

  const triggerLabel = useMemo(() => {
    if (activePreset === "hoje") {
      return currentInicio ? `Hoje: ${formatExtenso(currentInicio)}` : "Hoje";
    }

    if (activePreset === "ontem") {
      return currentInicio ? `Ontem: ${formatExtenso(currentInicio)}` : "Ontem";
    }

    if (activePreset === "mes_atual") {
      if (currentInicio) {
        const d = parseLocalDate(currentInicio);
        const mes = MESES_ABREV[d.getMonth()];
        const ano = d.getFullYear();
        return `Este mês: ${mes} de ${ano}`;
      }
      return "Este mês";
    }

    if (activePreset === "mes_anterior") {
      if (currentInicio) {
        const d = parseLocalDate(currentInicio);
        const mes = MESES_ABREV[d.getMonth()];
        const ano = d.getFullYear();
        return `Mês anterior: ${mes} de ${ano}`;
      }
      return "Mês anterior";
    }

    if (activePreset === "3d" && currentInicio && currentFim) {
      return `Últimos 3 dias (${formatDiaMes(currentInicio)} a ${formatDiaMes(currentFim)})`;
    }

    if (activePreset === "7d" && currentInicio && currentFim) {
      return `Últimos 7 dias (${formatDiaMes(currentInicio)} a ${formatDiaMes(currentFim)})`;
    }

    if (activePreset === "14d" && currentInicio && currentFim) {
      return `Últimos 14 dias (${formatDiaMes(currentInicio)} a ${formatDiaMes(currentFim)})`;
    }

    if (activePreset === "30d" && currentInicio && currentFim) {
      return `Últimos 30 dias (${formatDiaMes(currentInicio)} a ${formatDiaMes(currentFim)})`;
    }

    if (activePreset === "3m") return "Últimos 3 meses";
    if (activePreset === "6m") return "Últimos 6 meses";
    if (activePreset === "1a") return "Último 1 ano";
    if (activePreset === "tudo") return "Todo o período";

    if (activePreset === "custom") {
      if (currentInicio && currentFim) {
        const dIni = parseLocalDate(currentInicio);
        const dFim = parseLocalDate(currentFim);
        if (dIni.getFullYear() === dFim.getFullYear()) {
          return `${formatDiaMes(currentInicio)} a ${formatExtenso(currentFim)}`;
        }
        return `${formatExtenso(currentInicio)} a ${formatExtenso(currentFim)}`;
      }
      if (currentInicio) return `A partir de ${formatExtenso(currentInicio)}`;
      if (currentFim) return `Até ${formatExtenso(currentFim)}`;
      return "Personalizado";
    }

    return activePresetDef?.label || "Selecionar período";
  }, [activePreset, currentInicio, currentFim, activePresetDef]);

  const handleSelectPreset = useCallback(
    (presetKey: PeriodPresetKey) => {
      setLocalPreset(presetKey);

      if (presetKey === "custom") {
        setTempInicio(currentInicio || "");
        setTempFim(currentFim || "");
        return;
      }

      const calculated = calculateDateRangeForPreset(presetKey);
      onChange(calculated.dataInicio, calculated.dataFim, presetKey);
      setIsOpen(false);
    },
    [onChange, currentInicio, currentFim]
  );

  const handleApplyCustom = useCallback(() => {
    setLocalPreset("custom");
    onChange(tempInicio || undefined, tempFim || undefined, "custom");
    setIsOpen(false);
  }, [onChange, tempInicio, tempFim]);

  const handleClear = useCallback(() => {
    setTempInicio("");
    setTempFim("");
    handleSelectPreset("tudo");
  }, [handleSelectPreset]);

  const isCustomMode = activePreset === "custom";

  const curtoPresets = presetsToRender.filter((p) => p.group === "curto");
  const longoPresets = presetsToRender.filter((p) => p.group === "longo");
  const geralPresets = presetsToRender.filter((p) => p.group === "geral");

  const buttonElement = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-9 w-full rounded-lg border border-border bg-background hover:bg-secondary/40 text-foreground text-sm font-normal px-3 flex items-center justify-between gap-2.5 cursor-pointer transition-colors shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary select-none",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate text-foreground text-sm font-normal">
              {triggerLabel}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-60 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-[calc(100vw-2rem)] sm:w-[480px] p-0 bg-card border border-border rounded-2xl shadow-xl z-50 text-foreground overflow-hidden"
      >
        <div className="p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-headline font-semibold text-foreground">
              {label ? `Filtrar por ${label.toLowerCase()}` : "Selecionar período"}
            </h3>
          </div>
          {(currentInicio || currentFim || activePreset !== "tudo") && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpar período</span>
            </button>
          )}
        </div>

        <div className="p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] sm:max-h-none overflow-y-auto">
          {curtoPresets.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
                Dias imediatos
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                {curtoPresets.map((opt) => {
                  const isSelected = activePreset === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectPreset(opt.key)}
                      className={cn(
                        "w-full px-3 py-1.5 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {longoPresets.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block px-1">
                  Meses & anos
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                  {longoPresets.map((opt) => {
                    const isSelected = activePreset === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectPreset(opt.key)}
                        className={cn(
                          "w-full px-3 py-1.5 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {geralPresets.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                  {geralPresets.map((opt) => {
                    const isSelected = activePreset === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectPreset(opt.key)}
                        className={cn(
                          "w-full px-3 py-1.5 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {isCustomMode && (
          <div className="p-3.5 sm:p-4 bg-secondary/30 border-t border-border/40 space-y-3">
            <span className="text-[11px] font-semibold text-foreground block">
              Intervalo de datas personalizado
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1 text-left">
                <Label className="text-[11px] font-medium text-muted-foreground">De:</Label>
                <Input
                  type="date"
                  value={tempInicio}
                  onChange={(e) => setTempInicio(e.target.value)}
                  className="h-8 rounded-xl bg-card border-border text-foreground text-xs focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1 text-left">
                <Label className="text-[11px] font-medium text-muted-foreground">Até:</Label>
                <Input
                  type="date"
                  value={tempFim}
                  onChange={(e) => setTempFim(e.target.value)}
                  className="h-8 rounded-xl bg-card border-border text-foreground text-xs focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyCustom}
                className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer"
              >
                Aplicar período
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );

  if (label && showLabelAbove !== false) {
    return (
      <div className={cn("flex flex-col gap-1.5 text-left w-full", containerClassName)}>
        <Label className="text-xs font-medium text-muted-foreground block leading-none">{label}</Label>
        {buttonElement}
      </div>
    );
  }

  return buttonElement;
}
