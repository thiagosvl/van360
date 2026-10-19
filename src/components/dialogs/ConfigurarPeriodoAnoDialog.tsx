import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { monthOptions } from "@/utils/dateUtils";
import { usePeriodoRenovacaoConfig, useSalvarPeriodoRenovacaoConfig } from "@/hooks/api/useRenovacoes";
import { CalendarDays, Clock } from "lucide-react";
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
  const { data: configPeriodo } = usePeriodoRenovacaoConfig(anoDestino);
  const salvarMutation = useSalvarPeriodoRenovacaoConfig();

  const [mesInicioCobranca, setMesInicioCobranca] = useState("");
  const [anoInicioCobranca, setAnoInicioCobranca] = useState("");
  const [mesFimCobranca, setMesFimCobranca] = useState("");
  const [anoFimCobranca, setAnoFimCobranca] = useState("");

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
      } else {
        setMesInicioCobranca("");
        setAnoInicioCobranca("");
        setMesFimCobranca("");
        setAnoFimCobranca("");
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
        data_inicio_transporte: null,
        data_fim_transporte: null,
      });

      toast.success(`Período de cobrança de ${anoDestino} salvo com sucesso!`);
      onSuccess?.();
      handleClose();
    } catch {
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
          Defina o período de cobrança padrão para o ano letivo de {anoDestino}. Ele será aplicado a todos os alunos, mas você poderá alterar individualmente para cada aluno depois.
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
