import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { monthOptions, parseLocalDate } from "@/utils/dateUtils";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { usePeriodoRenovacaoConfig, useSalvarPeriodoRenovacaoConfig } from "@/hooks/api/useRenovacoes";
import { CalendarDays, Car, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ConfigurarPeriodoAnoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  anoDestino: number;
  onSuccess?: () => void;
}

export function ConfigurarPeriodoAnoDialog({
  isOpen,
  onClose,
  anoDestino,
  onSuccess,
}: ConfigurarPeriodoAnoDialogProps) {
  const { data: configPeriodo, isLoading } = usePeriodoRenovacaoConfig(anoDestino);
  const salvarMutation = useSalvarPeriodoRenovacaoConfig();

  const [mesInicioCobranca, setMesInicioCobranca] = useState("");
  const [anoInicioCobranca, setAnoInicioCobranca] = useState("");
  const [mesFimCobranca, setMesFimCobranca] = useState("");
  const [anoFimCobranca, setAnoFimCobranca] = useState("");

  const [dataInicioTransporte, setDataInicioTransporte] = useState("");
  const [dataFimTransporte, setDataFimTransporte] = useState("");

  const [openCalendarInicioTransp, setOpenCalendarInicioTransp] = useState(false);
  const [openCalendarFimTransp, setOpenCalendarFimTransp] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const anoOptions = [anoDestino.toString(), (anoDestino + 1).toString()];

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (configPeriodo?.configurado) {
        setMesInicioCobranca(configPeriodo.mes_inicio_cobranca ? String(configPeriodo.mes_inicio_cobranca) : "");
        setAnoInicioCobranca(configPeriodo.ano_inicio_cobranca ? String(configPeriodo.ano_inicio_cobranca) : String(anoDestino));
        setMesFimCobranca(configPeriodo.mes_fim_cobranca ? String(configPeriodo.mes_fim_cobranca) : "");
        setAnoFimCobranca(configPeriodo.ano_fim_cobranca ? String(configPeriodo.ano_fim_cobranca) : "");
        setDataInicioTransporte(
          configPeriodo.data_inicio_transporte
            ? formatDateToBR(new Date(configPeriodo.data_inicio_transporte + "T12:00:00"))
            : ""
        );
        setDataFimTransporte(
          configPeriodo.data_fim_transporte
            ? formatDateToBR(new Date(configPeriodo.data_fim_transporte + "T12:00:00"))
            : ""
        );
      } else {
        setMesInicioCobranca("");
        setAnoInicioCobranca("");
        setMesFimCobranca("");
        setAnoFimCobranca("");
        setDataInicioTransporte(`01/02/${anoDestino}`);
        setDataFimTransporte(`31/12/${anoDestino}`);
      }
    }
  }, [isOpen, configPeriodo, anoDestino]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const calcularQtdParcelas = () => {
    if (!mesInicioCobranca || !anoInicioCobranca || !mesFimCobranca || !anoFimCobranca) return null;
    const totalInicio = Number(anoInicioCobranca) * 12 + Number(mesInicioCobranca);
    const totalFim = Number(anoFimCobranca) * 12 + Number(mesFimCobranca);
    if (totalFim < totalInicio) return null;
    return totalFim - totalInicio + 1;
  };

  const qtdParcelas = calcularQtdParcelas();

  const handleSalvar = async () => {
    const newErrors: Record<string, string> = {};

    if (!mesInicioCobranca) {
      newErrors.mesInicioCobranca = "Informe o mês de início da cobrança";
    }
    if (!anoInicioCobranca) {
      newErrors.anoInicioCobranca = "Informe o ano de início da cobrança";
    }
    if (!mesFimCobranca) {
      newErrors.mesFimCobranca = "Informe o mês de término da cobrança";
    }
    if (!anoFimCobranca) {
      newErrors.anoFimCobranca = "Informe o ano de término da cobrança";
    }

    if (mesInicioCobranca && anoInicioCobranca && mesFimCobranca && anoFimCobranca) {
      const totalInicio = Number(anoInicioCobranca) * 12 + Number(mesInicioCobranca);
      const totalFim = Number(anoFimCobranca) * 12 + Number(mesFimCobranca);
      if (totalFim < totalInicio) {
        newErrors.mesFimCobranca = "O término deve ser igual ou posterior ao início";
      }
    }

    if (!dataInicioTransporte) {
      newErrors.dataInicioTransporte = "Informe o início do transporte";
    }
    if (!dataFimTransporte) {
      newErrors.dataFimTransporte = "Informe o término do transporte";
    }

    if (dataInicioTransporte && dataFimTransporte) {
      const d1 = new Date(convertDateBrToISO(dataInicioTransporte));
      const d2 = new Date(convertDateBrToISO(dataFimTransporte));
      if (d2 < d1) {
        newErrors.dataFimTransporte = "Término do transporte deve ser posterior ao início";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await salvarMutation.mutateAsync({
        ano: anoDestino,
        mes_inicio_cobranca: Number(mesInicioCobranca),
        ano_inicio_cobranca: Number(anoInicioCobranca),
        mes_fim_cobranca: Number(mesFimCobranca),
        ano_fim_cobranca: Number(anoFimCobranca),
        data_inicio_transporte: dataInicioTransporte ? convertDateBrToISO(dataInicioTransporte) : null,
        data_fim_transporte: dataFimTransporte ? convertDateBrToISO(dataFimTransporte) : null,
      });

      toast.success(`Período de cobrança de ${anoDestino} salvo com sucesso!`);
      onSuccess?.();
      handleClose();
    } catch {
      // toast tratado na mutation
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
      maxWidth="md"
      description="Defina a regra mestre de período de cobrança para o ano letivo"
    >
      <BaseDialog.Header
        title={`Configurações Iniciais`}
        icon={<Clock className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-5">
        <Banner variant="info">
          Defina o período de cobrança padrão e transporte para o ano letivo de {anoDestino}. Ele será aplicado a todos os alunos, mas você poderá alterar individualmente para cada aluno depois.
        </Banner>

        <section className="space-y-4 pt-1">
          <div className="flex items-center justify-between text-sm sm:text-base font-semibold text-[#0a0a0a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              Período de Cobrança
            </div>
            {qtdParcelas !== null && (
              <span className="text-xs font-normal px-2.5 py-1 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]">
                {qtdParcelas} {qtdParcelas === 1 ? "parcela" : "parcelas"}
              </span>
            )}
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Início Cobrança <span className="text-[#e7000b]">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <NativeSelect
                    value={mesInicioCobranca}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMesInicioCobranca(val);
                      setErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.mesInicioCobranca;
                        if (val && anoInicioCobranca) {
                          delete updated.anoInicioCobranca;
                        }
                        return updated;
                      });
                    }}
                    icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                    error={!!errors.mesInicioCobranca}
                  >
                    <option value="">Selecione o mês</option>
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="col-span-1">
                  <NativeSelect
                    value={anoInicioCobranca}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnoInicioCobranca(val);
                      setErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.anoInicioCobranca;
                        if (val && mesInicioCobranca) {
                          delete updated.mesInicioCobranca;
                        }
                        return updated;
                      });
                    }}
                    error={!!errors.anoInicioCobranca}
                  >
                    <option value="">Ano</option>
                    {anoOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
              {(errors.mesInicioCobranca || errors.anoInicioCobranca) && (
                <p className="text-xs text-[#e7000b] mt-1">{errors.mesInicioCobranca || errors.anoInicioCobranca}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Fim Cobrança <span className="text-[#e7000b]">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <NativeSelect
                    value={mesFimCobranca}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMesFimCobranca(val);
                      setErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.mesFimCobranca;
                        if (val && anoFimCobranca) {
                          delete updated.anoFimCobranca;
                        }
                        return updated;
                      });
                    }}
                    icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                    error={!!errors.mesFimCobranca}
                  >
                    <option value="">Selecione o mês</option>
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="col-span-1">
                  <NativeSelect
                    value={anoFimCobranca}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnoFimCobranca(val);
                      setErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.anoFimCobranca;
                        if (val && mesFimCobranca) {
                          delete updated.mesFimCobranca;
                        }
                        return updated;
                      });
                    }}
                    error={!!errors.anoFimCobranca}
                  >
                    <option value="">Ano</option>
                    {anoOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
              {(errors.mesFimCobranca || errors.anoFimCobranca) && (
                <p className="text-xs text-[#e7000b] mt-1">{errors.mesFimCobranca || errors.anoFimCobranca}</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-1">
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">
            <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
              <Car className="w-4 h-4" />
            </div>
            Período do Transporte
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Início do Transporte <span className="text-[#e7000b]">*</span>
              </Label>
              <Popover open={openCalendarInicioTransp} onOpenChange={setOpenCalendarInicioTransp}>
                <PopoverTrigger asChild>
                  <div className="relative group">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-white justify-start focus:border-[#0a0a0a] text-sm text-[#0a0a0a] shadow-none",
                        !dataInicioTransporte && "text-[#737373]",
                        errors.dataInicioTransporte && "border-[#e7000b]"
                      )}
                    >
                      {dataInicioTransporte || "dd/mm/aaaa"}
                    </Button>
                    {dataInicioTransporte && (
                      <div
                        role="button"
                        tabIndex={0}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDataInicioTransporte("");
                          if (errors.dataInicioTransporte) setErrors((prev) => ({ ...prev, dataInicioTransporte: "" }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            e.preventDefault();
                            setDataInicioTransporte("");
                            if (errors.dataInicioTransporte) setErrors((prev) => ({ ...prev, dataInicioTransporte: "" }));
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      dataInicioTransporte
                        ? parseLocalDate(convertDateBrToISO(dataInicioTransporte))
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setDataInicioTransporte(formatDateToBR(date));
                        setOpenCalendarInicioTransp(false);
                      } else {
                        setDataInicioTransporte("");
                      }
                      if (errors.dataInicioTransporte || errors.dataFimTransporte) {
                        setErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.dataInicioTransporte;
                          delete updated.dataFimTransporte;
                          return updated;
                        });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.dataInicioTransporte && <p className="text-xs text-[#e7000b] mt-1">{errors.dataInicioTransporte}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Fim do Transporte <span className="text-[#e7000b]">*</span>
              </Label>
              <Popover open={openCalendarFimTransp} onOpenChange={setOpenCalendarFimTransp}>
                <PopoverTrigger asChild>
                  <div className="relative group">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-white justify-start focus:border-[#0a0a0a] text-sm text-[#0a0a0a] shadow-none",
                        !dataFimTransporte && "text-[#737373]",
                        errors.dataFimTransporte && "border-[#e7000b]"
                      )}
                    >
                      {dataFimTransporte || "dd/mm/aaaa"}
                    </Button>
                    {dataFimTransporte && (
                      <div
                        role="button"
                        tabIndex={0}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDataFimTransporte("");
                          if (errors.dataFimTransporte) setErrors((prev) => ({ ...prev, dataFimTransporte: "" }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            e.preventDefault();
                            setDataFimTransporte("");
                            if (errors.dataFimTransporte) setErrors((prev) => ({ ...prev, dataFimTransporte: "" }));
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      dataFimTransporte
                        ? parseLocalDate(convertDateBrToISO(dataFimTransporte))
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setDataFimTransporte(formatDateToBR(date));
                        setOpenCalendarFimTransp(false);
                      } else {
                        setDataFimTransporte("");
                      }
                      if (errors.dataInicioTransporte || errors.dataFimTransporte) {
                        setErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.dataInicioTransporte;
                          delete updated.dataFimTransporte;
                          return updated;
                        });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.dataFimTransporte && <p className="text-xs text-[#e7000b] mt-1">{errors.dataFimTransporte}</p>}
            </div>
          </div>
        </section>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={salvarMutation.isPending}
        />
        <BaseDialog.Action
          label={salvarMutation.isPending ? "Salvando..." : "Salvar Período"}
          variant="primary"
          onClick={handleSalvar}
          isLoading={salvarMutation.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
