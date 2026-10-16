import { useState, useId, useMemo } from "react";
import {
  Sparkles,
  School,
  ChevronDown,
  DollarSign,
  CalendarDays,
  Car,
  X,
  Users,
} from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useReajusteLote } from "@/hooks/api/useRenovacoes";
import { useProfile, useEscolasWithFilters } from "@/hooks";
import { Escola } from "@/types/escola";
import { RenovacaoReajusteTipo } from "@/types/enums";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { moneyMask, moneyToNumber, dateMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { NativeSelect } from "@/components/ui/native-select";
import { monthOptions, parseLocalDate } from "@/utils/dateUtils";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReajusteLoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  anoDestino: number;
  passageiroIds?: string[];
}

type AcaoLote = "mensalidade" | "transporte" | "cobranca";

export function ReajusteLoteDialog({
  isOpen,
  onClose,
  anoDestino,
  passageiroIds,
}: ReajusteLoteDialogProps) {
  const isModoAlunosSelecionados = Boolean(passageiroIds && passageiroIds.length > 0);
  const qtdAlunosSelecionados = passageiroIds?.length || 0;

  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };

  const fixoId = useId();
  const percentualId = useId();
  const padraoId = useId();

  const [acaoSelecionada, setAcaoSelecionada] = useState<AcaoLote | null>(null);

  const [tipoReajuste, setTipoReajuste] = useState<RenovacaoReajusteTipo>(
    RenovacaoReajusteTipo.FIXO
  );
  const [valorInput, setValorInput] = useState("");

  const exemploCalculo = useMemo(() => {
    const baseExemplo = 350;
    if (!valorInput.trim()) return null;

    if (tipoReajuste === RenovacaoReajusteTipo.FIXO) {
      const acrescimo = moneyToNumber(valorInput);
      if (acrescimo <= 0) return null;
      const finalVal = baseExemplo + acrescimo;
      return `Exemplo: Uma parcela atual de R$ 350,00 passará a ser ${formatCurrency(finalVal)} (R$ 350,00 + ${formatCurrency(acrescimo)}).`;
    }

    if (tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL) {
      const perc = parseFloat(valorInput.replace(",", "."));
      if (isNaN(perc) || perc <= 0) return null;
      const finalVal = Number((baseExemplo * (1 + perc / 100)).toFixed(2));
      return `Exemplo: Uma parcela atual de R$ 350,00 passará a ser ${formatCurrency(finalVal)} (R$ 350,00 + ${valorInput}%).`;
    }

    if (tipoReajuste === RenovacaoReajusteTipo.VALOR_PADRAO) {
      const fixoVal = moneyToNumber(valorInput);
      if (fixoVal <= 0) return null;
      return `Todos os alunos selecionados terão a nova parcela definida exatamente em ${formatCurrency(fixoVal)}.`;
    }

    return null;
  }, [valorInput, tipoReajuste]);

  const [dataInicioTransporte, setDataInicioTransporte] = useState("");
  const [dataFimTransporte, setDataFimTransporte] = useState("");
  const [openCalendarInicioTransp, setOpenCalendarInicioTransp] = useState(false);
  const [openCalendarFimTransp, setOpenCalendarFimTransp] = useState(false);
  const [transporteErrors, setTransporteErrors] = useState<Record<string, string>>({});

  const [mesInicioCobranca, setMesInicioCobranca] = useState("");
  const [anoInicioCobranca, setAnoInicioCobranca] = useState("");
  const [mesFimCobranca, setMesFimCobranca] = useState("");
  const [anoFimCobranca, setAnoFimCobranca] = useState("");

  const anoOptions = [anoDestino.toString(), (anoDestino + 1).toString()];
  const [cobrancaErrors, setCobrancaErrors] = useState<Record<string, string>>({});

  const [selectedEscolaIds, setSelectedEscolaIds] = useState<string[]>([]);
  const [isEscolaPopoverOpen, setIsEscolaPopoverOpen] = useState(false);

  const reajusteMutation = useReajusteLote();

  const isAllSelected =
    escolasList.length > 0 && selectedEscolaIds.length === escolasList.length;

  const isPublicoDefinido = isModoAlunosSelecionados || selectedEscolaIds.length > 0;

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEscolaIds(escolasList.map((e) => e.id));
    } else {
      setSelectedEscolaIds([]);
      setAcaoSelecionada(null);
    }
  };

  const handleToggleEscola = (escolaId: string, checked: boolean) => {
    if (checked) {
      setSelectedEscolaIds((prev) => [...prev, escolaId]);
    } else {
      setSelectedEscolaIds((prev) => {
        const next = prev.filter((id) => id !== escolaId);
        if (next.length === 0) {
          setAcaoSelecionada(null);
        }
        return next;
      });
    }
  };

  const isEscolaChecked = (escolaId: string) => {
    return selectedEscolaIds.includes(escolaId);
  };

  const getEscolaDisplayText = () => {
    if (selectedEscolaIds.length === 0) {
      return "Selecione as escolas...";
    }
    if (isAllSelected) {
      return "Toda a Frota (Todas as Escolas)";
    }
    if (selectedEscolaIds.length === 1) {
      const escola = escolasList.find((e) => e.id === selectedEscolaIds[0]);
      return escola?.nome || "1 escola selecionada";
    }
    return `${selectedEscolaIds.length} escolas selecionadas`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isModoAlunosSelecionados && selectedEscolaIds.length === 0) {
      toast.error("Selecione ao menos uma escola para aplicar o reajuste.");
      return;
    }

    if (!acaoSelecionada) {
      toast.error("Selecione o que deseja ajustar em lote.");
      return;
    }

    const payloadAlvo = isModoAlunosSelecionados
      ? { passageiro_ids: passageiroIds }
      : { escola_ids: selectedEscolaIds };

    try {
      if (acaoSelecionada === "mensalidade") {
        let valorNum = 0;
        if (tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL) {
          valorNum = parseFloat(valorInput.replace(",", "."));
        } else {
          valorNum = moneyToNumber(valorInput);
        }

        if (isNaN(valorNum) || valorNum <= 0) {
          toast.error("Informe um valor ou percentual válido maior que zero.");
          return;
        }

        await reajusteMutation.mutateAsync({
          ano_destino: anoDestino,
          ...payloadAlvo,
          tipo_reajuste: tipoReajuste,
          valor_reajuste: valorNum,
        });
      } else if (acaoSelecionada === "transporte") {
        const errs: Record<string, string> = {};
        if (!dataInicioTransporte) errs.dataInicioTransporte = "Informe o início do transporte";
        if (!dataFimTransporte) errs.dataFimTransporte = "Informe o fim do transporte";

        const dtIni = dataInicioTransporte ? convertDateBrToISO(dataInicioTransporte) : "";
        const dtFim = dataFimTransporte ? convertDateBrToISO(dataFimTransporte) : "";

        let pIni: Date | null = null;
        let pFim: Date | null = null;

        if (dtIni) {
          pIni = parseLocalDate(dtIni);
          if (isNaN(pIni.getTime())) errs.dataInicioTransporte = "Data de início inválida";
        }
        if (dtFim) {
          pFim = parseLocalDate(dtFim);
          if (isNaN(pFim.getTime())) errs.dataFimTransporte = "Data de término inválida";
        }

        if (pIni && pFim && pFim < pIni) {
          errs.dataFimTransporte = "O fim deve ser igual ou posterior ao início";
        }

        if (Object.keys(errs).length > 0) {
          setTransporteErrors(errs);
          toast.error("Preencha as datas de transporte corretamente.");
          return;
        }
        setTransporteErrors({});

        await reajusteMutation.mutateAsync({
          ano_destino: anoDestino,
          ...payloadAlvo,
          data_inicio_transporte: dtIni,
          data_fim_transporte: dtFim,
        });
      } else if (acaoSelecionada === "cobranca") {
        const errs: Record<string, string> = {};
        if (!mesInicioCobranca && !anoInicioCobranca) {
          errs.mesInicioCobranca = "Informe o mês e o ano de início da cobrança";
          errs.anoInicioCobranca = "true";
        } else if (!mesInicioCobranca) {
          errs.mesInicioCobranca = "Informe o mês de início da cobrança";
        } else if (!anoInicioCobranca) {
          errs.anoInicioCobranca = "Informe o ano de início da cobrança";
        }

        if (!mesFimCobranca && !anoFimCobranca) {
          errs.mesFimCobranca = "Informe o mês e o ano de término da cobrança";
          errs.anoFimCobranca = "true";
        } else if (!mesFimCobranca) {
          errs.mesFimCobranca = "Informe o mês de término da cobrança";
        } else if (!anoFimCobranca) {
          errs.anoFimCobranca = "Informe o ano de término da cobrança";
        }

        if (mesInicioCobranca && anoInicioCobranca && mesFimCobranca && anoFimCobranca) {
          const totalInicio = Number(anoInicioCobranca) * 12 + Number(mesInicioCobranca);
          const totalFim = Number(anoFimCobranca) * 12 + Number(mesFimCobranca);
          if (totalFim < totalInicio) {
            errs.mesFimCobranca = "O término deve ser posterior ou igual ao início";
            errs.anoFimCobranca = "true";
          }
        }

        if (Object.keys(errs).length > 0) {
          setCobrancaErrors(errs);
          toast.error("Preencha o mês e o ano de cobrança.");
          return;
        }
        setCobrancaErrors({});

        const dtIni = `${anoInicioCobranca}-${mesInicioCobranca.padStart(2, "0")}-01`;
        const dtFim = `${anoFimCobranca}-${mesFimCobranca.padStart(2, "0")}-01`;
        await reajusteMutation.mutateAsync({
          ano_destino: anoDestino,
          ...payloadAlvo,
          data_inicio_cobranca: dtIni,
          data_fim_cobranca: dtFim,
        });
      }

      safeCloseDialog(onClose);
    } catch {
      // O erro já é exibido pelo hook da mutação
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !reajusteMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
      description={`Aplicação em lote de valores e prazos para o ano letivo de ${anoDestino}`}
    >
      <BaseDialog.Header
        title={`Ajustes em Lote`}
        icon={<Sparkles className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={reajusteMutation.isPending}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {isModoAlunosSelecionados ? (
            <div className="space-y-1.5">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Para quem deseja aplicar?
              </Label>
              <div className="flex items-center gap-3 p-3 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5]">
                <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0a0a0a]">
                    {qtdAlunosSelecionados} {qtdAlunosSelecionados === 1 ? "aluno selecionado" : "alunos selecionados"}
                  </p>
                  <p className="text-[11px] text-[#737373]">
                    O ajuste será aplicado exclusivamente para os alunos marcados na lista.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Para quem deseja aplicar? <span className="text-[#e7000b]">*</span>
              </Label>

              <Popover open={isEscolaPopoverOpen} onOpenChange={setIsEscolaPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal justify-between text-[#0a0a0a] px-3.5 hover:bg-white focus:bg-white"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <School className="w-4 h-4 text-[#737373] shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{getEscolaDisplayText()}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] sm:w-[380px] p-3 rounded-[20px] shadow-xl border-[#e5e5e5] bg-white" align="start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5 p-2 rounded-[14px] hover:bg-[#fafafa] border-b border-[#e5e5e5] pb-2.5">
                      <Checkbox
                        id="all-escolas"
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleToggleSelectAll(Boolean(checked))}
                      />
                      <label
                        htmlFor="all-escolas"
                        className="text-xs font-semibold text-[#0a0a0a] cursor-pointer flex-1"
                      >
                        Toda a Frota (Todas as Escolas)
                      </label>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {escolasList.map((escola) => (
                        <div
                          key={escola.id}
                          className="flex items-center space-x-2.5 p-1.5 rounded-[12px] hover:bg-[#fafafa]"
                        >
                          <Checkbox
                            id={`escola-${escola.id}`}
                            checked={isEscolaChecked(escola.id)}
                            onCheckedChange={(checked) => handleToggleEscola(escola.id, Boolean(checked))}
                          />
                          <label
                            htmlFor={`escola-${escola.id}`}
                            className="text-xs text-[#0a0a0a] cursor-pointer flex-1 truncate"
                          >
                            {escola.nome}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label className={cn("font-medium text-xs", isPublicoDefinido ? "text-[#0a0a0a]" : "text-[#737373]")}>
              O que você deseja ajustar em lote? <span className="text-[#e7000b]">*</span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={!isPublicoDefinido}
                onClick={() => setAcaoSelecionada("mensalidade")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-[18px] border text-center transition-all",
                  !isPublicoDefinido
                    ? "border-[#e5e5e5] bg-[#fafafa] text-[#737373] opacity-40 cursor-not-allowed"
                    : acaoSelecionada === "mensalidade"
                      ? "border-primary/30 bg-primary/5 text-primary font-medium shadow-xs cursor-pointer"
                      : "border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:bg-white cursor-pointer"
                )}
              >
                <DollarSign className={cn("w-4 h-4 mb-1", acaoSelecionada === "mensalidade" ? "text-primary" : "text-[#737373]")} />
                <span className="text-xs">Valor da Parcela</span>
              </button>

              <button
                type="button"
                disabled={!isPublicoDefinido}
                onClick={() => setAcaoSelecionada("transporte")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-[18px] border text-center transition-all",
                  !isPublicoDefinido
                    ? "border-[#e5e5e5] bg-[#fafafa] text-[#737373] opacity-40 cursor-not-allowed"
                    : acaoSelecionada === "transporte"
                      ? "border-primary/30 bg-primary/5 text-primary font-medium shadow-xs cursor-pointer"
                      : "border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:bg-white cursor-pointer"
                )}
              >
                <Car className={cn("w-4 h-4 mb-1", acaoSelecionada === "transporte" ? "text-primary" : "text-[#737373]")} />
                <span className="text-xs">Transporte</span>
              </button>

              <button
                type="button"
                disabled={!isPublicoDefinido}
                onClick={() => setAcaoSelecionada("cobranca")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-[18px] border text-center transition-all",
                  !isPublicoDefinido
                    ? "border-[#e5e5e5] bg-[#fafafa] text-[#737373] opacity-40 cursor-not-allowed"
                    : acaoSelecionada === "cobranca"
                      ? "border-primary/30 bg-primary/5 text-primary font-medium shadow-xs cursor-pointer"
                      : "border-[#e5e5e5] bg-[#fafafa] text-[#737373] hover:text-[#0a0a0a] hover:bg-white cursor-pointer"
                )}
              >
                <CalendarDays className={cn("w-4 h-4 mb-1", acaoSelecionada === "cobranca" ? "text-primary" : "text-[#737373]")} />
                <span className="text-xs">Cobrança</span>
              </button>
            </div>
          </div>

          {acaoSelecionada === "mensalidade" && (
            <div className="space-y-3 pt-2 border-t border-[#e5e5e5]">
              <Label className="text-[#0a0a0a] font-medium text-xs">
                Tipo de Reajuste
              </Label>

              <RadioGroup
                value={tipoReajuste}
                onValueChange={(val) => {
                  const tipo = val as RenovacaoReajusteTipo;
                  setTipoReajuste(tipo);
                  setValorInput("");
                }}
                className="grid gap-1.5"
              >
                <label
                  htmlFor={fixoId}
                  className={cn(
                    "flex items-center space-x-3 rounded-[18px] border p-3 sm:p-3.5 transition-all cursor-pointer",
                    tipoReajuste === RenovacaoReajusteTipo.FIXO
                      ? "border-primary/30 bg-primary/5 text-primary font-medium"
                      : "border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#737373] font-normal"
                  )}
                >
                  <RadioGroupItem value={RenovacaoReajusteTipo.FIXO} id={fixoId} />
                  <span className={cn("text-xs sm:text-sm flex-1 leading-normal", tipoReajuste === RenovacaoReajusteTipo.FIXO ? "text-primary font-medium" : "text-[#0a0a0a]")}>
                    Acrescentar valor fixo (R$)
                  </span>
                </label>

                <label
                  htmlFor={percentualId}
                  className={cn(
                    "flex items-center space-x-3 rounded-[18px] border p-3 sm:p-3.5 transition-all cursor-pointer",
                    tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                      ? "border-primary/30 bg-primary/5 text-primary font-medium"
                      : "border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#737373] font-normal"
                  )}
                >
                  <RadioGroupItem value={RenovacaoReajusteTipo.PERCENTUAL} id={percentualId} />
                  <span className={cn("text-xs sm:text-sm flex-1 leading-normal", tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL ? "text-primary font-medium" : "text-[#0a0a0a]")}>
                    Acrescentar percentual (%)
                  </span>
                </label>

                <label
                  htmlFor={padraoId}
                  className={cn(
                    "flex items-center space-x-3 rounded-[18px] border p-3 sm:p-3.5 transition-all cursor-pointer",
                    tipoReajuste === RenovacaoReajusteTipo.VALOR_PADRAO
                      ? "border-primary/30 bg-primary/5 text-primary font-medium"
                      : "border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#737373] font-normal"
                  )}
                >
                  <RadioGroupItem value={RenovacaoReajusteTipo.VALOR_PADRAO} id={padraoId} />
                  <span className={cn("text-xs sm:text-sm flex-1 leading-normal", tipoReajuste === RenovacaoReajusteTipo.VALOR_PADRAO ? "text-primary font-medium" : "text-[#0a0a0a]")}>
                    Definir novo valor fixo para todos (R$)
                  </span>
                </label>
              </RadioGroup>

              <div className="space-y-1.5 pt-1">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  {tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                    ? "Percentual a acrescentar (%)"
                    : tipoReajuste === RenovacaoReajusteTipo.FIXO
                      ? "Valor a acrescentar por aluno (R$)"
                      : "Novo valor da parcela para todos (R$)"}{" "}
                  <span className="text-[#e7000b]">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={valorInput}
                    onChange={(e) => {
                      if (tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL) {
                        setValorInput(e.target.value.replace(/[^0-9,.]/g, ""));
                      } else {
                        setValorInput(moneyMask(e.target.value));
                      }
                    }}
                    placeholder={
                      tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                        ? "Ex: 10%"
                        : tipoReajuste === RenovacaoReajusteTipo.FIXO
                          ? "Ex: R$ 30,00"
                          : "Ex: R$ 380,00"
                    }
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                    required
                  />
                </div>

                {exemploCalculo && (
                  <p className="text-[11px] sm:text-xs text-[#737373] pt-0.5 leading-relaxed">
                    {exemploCalculo}
                  </p>
                )}
              </div>
            </div>
          )}

          {acaoSelecionada === "transporte" && (
            <div className="space-y-3 pt-2 border-t border-[#e5e5e5]">
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
                          transporteErrors.dataInicioTransporte && "border-[#e7000b]"
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
                            setTransporteErrors((prev) => ({ ...prev, dataInicioTransporte: "" }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              e.preventDefault();
                              setDataInicioTransporte("");
                              setTransporteErrors((prev) => ({ ...prev, dataInicioTransporte: "" }));
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
                        setTransporteErrors((prev) => ({ ...prev, dataInicioTransporte: "", dataFimTransporte: "" }));
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {transporteErrors.dataInicioTransporte && (
                  <p className="text-xs text-[#e7000b] mt-1">{transporteErrors.dataInicioTransporte}</p>
                )}
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
                          transporteErrors.dataFimTransporte && "border-[#e7000b]"
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
                            setTransporteErrors((prev) => ({ ...prev, dataFimTransporte: "" }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              e.preventDefault();
                              setDataFimTransporte("");
                              setTransporteErrors((prev) => ({ ...prev, dataFimTransporte: "" }));
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
                        setTransporteErrors((prev) => ({ ...prev, dataInicioTransporte: "", dataFimTransporte: "" }));
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {transporteErrors.dataFimTransporte && (
                  <p className="text-xs text-[#e7000b] mt-1">{transporteErrors.dataFimTransporte}</p>
                )}
              </div>
            </div>
          )}

          {acaoSelecionada === "cobranca" && (
            <div className="space-y-3 pt-2 border-t border-[#e5e5e5]">
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
                        if (val && !anoInicioCobranca) {
                          setAnoInicioCobranca(String(anoDestino));
                        }
                        setCobrancaErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.mesInicioCobranca;
                          if (val && anoInicioCobranca) delete updated.anoInicioCobranca;
                          return updated;
                        });
                      }}
                      icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                      error={!!cobrancaErrors.mesInicioCobranca}
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
                        if (val && !anoFimCobranca) {
                          setAnoFimCobranca(val);
                        }
                        setCobrancaErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.anoInicioCobranca;
                          if (val && mesInicioCobranca) delete updated.mesInicioCobranca;
                          return updated;
                        });
                      }}
                      error={!!cobrancaErrors.anoInicioCobranca}
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
                {(cobrancaErrors.mesInicioCobranca || (cobrancaErrors.anoInicioCobranca && cobrancaErrors.anoInicioCobranca !== "true")) && (
                  <p className="text-xs text-[#e7000b] mt-1">{cobrancaErrors.mesInicioCobranca || cobrancaErrors.anoInicioCobranca}</p>
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
                        if (val && !anoFimCobranca) {
                          setAnoFimCobranca(anoInicioCobranca || String(anoDestino));
                        }
                        setCobrancaErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.mesFimCobranca;
                          if (val && anoFimCobranca) delete updated.anoFimCobranca;
                          return updated;
                        });
                      }}
                      icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                      error={!!cobrancaErrors.mesFimCobranca}
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
                        setCobrancaErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.anoFimCobranca;
                          if (val && mesFimCobranca) delete updated.mesFimCobranca;
                          return updated;
                        });
                      }}
                      error={!!cobrancaErrors.anoFimCobranca}
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
                {(cobrancaErrors.mesFimCobranca || (cobrancaErrors.anoFimCobranca && cobrancaErrors.anoFimCobranca !== "true")) && (
                  <p className="text-xs text-[#e7000b] mt-1">{cobrancaErrors.mesFimCobranca || cobrancaErrors.anoFimCobranca}</p>
                )}
              </div>
            </div>
          )}

          {isPublicoDefinido && acaoSelecionada && (() => {
            const publicoAlvo = isModoAlunosSelecionados
              ? (qtdAlunosSelecionados === 1 ? "1 aluno selecionado" : `${qtdAlunosSelecionados} alunos selecionados`)
              : getEscolaDisplayText();

            let descricaoBanner = "";
            if (acaoSelecionada === "mensalidade") {
              if (valorInput.trim()) {
                if (tipoReajuste === RenovacaoReajusteTipo.FIXO) {
                  descricaoBanner = `Um acréscimo de ${formatCurrency(moneyToNumber(valorInput))} será aplicado na parcela de ${publicoAlvo} para ${anoDestino}.`;
                } else if (tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL) {
                  descricaoBanner = `Um acréscimo de ${valorInput}% será aplicado na parcela de ${publicoAlvo} para ${anoDestino}.`;
                } else {
                  descricaoBanner = `A parcela será definida exatamente em ${formatCurrency(moneyToNumber(valorInput))} para ${publicoAlvo} para ${anoDestino}.`;
                }
              } else {
                descricaoBanner = `O valor da parcela será atualizado para ${publicoAlvo} para ${anoDestino}.`;
              }
            } else if (acaoSelecionada === "transporte") {
              if (dataInicioTransporte && dataFimTransporte) {
                descricaoBanner = `O período de transporte (${dataInicioTransporte} a ${dataFimTransporte}) será atualizado para ${publicoAlvo}.`;
              } else {
                descricaoBanner = `O período de transporte será atualizado para ${publicoAlvo}. Preencha as datas acima.`;
              }
            } else if (acaoSelecionada === "cobranca") {
              if (mesInicioCobranca && anoInicioCobranca && mesFimCobranca && anoFimCobranca) {
                descricaoBanner = `O período de cobrança (${monthOptions.find((m) => m.value === mesInicioCobranca)?.label ?? ""}/${anoInicioCobranca} a ${monthOptions.find((m) => m.value === mesFimCobranca)?.label ?? ""}/${anoFimCobranca}) será atualizado para ${publicoAlvo}.`;
              } else {
                descricaoBanner = `O período de cobrança será atualizado para ${publicoAlvo}. Preencha o mês e o ano acima.`;
              }
            }

            return (
              <Banner
                variant="neutral"
                title="O que vai acontecer?"
                description={descricaoBanner}
                className="rounded-[18px]"
              />
            );
          })()}
        </BaseDialog.Body>

        <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[#e5e5e5]">
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={() => safeCloseDialog(onClose)}
          />
          <BaseDialog.Action
            label="Aplicar Ajustes"
            variant="primary"
            type="submit"
            isLoading={reajusteMutation.isPending}
            disabled={
              reajusteMutation.isPending ||
              !acaoSelecionada ||
              (!isModoAlunosSelecionados && selectedEscolaIds.length === 0) ||
              (acaoSelecionada === "mensalidade" && !valorInput.trim()) ||
              (acaoSelecionada === "transporte" && (!dataInicioTransporte || !dataFimTransporte)) ||
              (acaoSelecionada === "cobranca" && (!mesInicioCobranca || !anoInicioCobranca || !mesFimCobranca || !anoFimCobranca))
            }
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
