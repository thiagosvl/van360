import { useState, useId, useMemo } from "react";
import {
  Sparkles,
  School,
  ChevronDown,
  DollarSign,
  CalendarDays,
  Car,
} from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useReajusteLote } from "@/hooks/api/useRenovacoes";
import { useProfile, useEscolasWithFilters } from "@/hooks";
import { Escola } from "@/types/escola";
import { RenovacaoReajusteTipo } from "@/types/enums";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { moneyMask, moneyToNumber, dateMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReajusteLoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  anoDestino: number;
}

type AcaoLote = "mensalidade" | "transporte" | "cobranca";

export function ReajusteLoteDialog({
  isOpen,
  onClose,
  anoDestino,
}: ReajusteLoteDialogProps) {
  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };

  const fixoId = useId();
  const percentualId = useId();
  const padraoId = useId();

  const [acaoSelecionada, setAcaoSelecionada] = useState<AcaoLote>("mensalidade");

  // Reajuste de Parcela
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
      return `Todos os passageiros selecionados terão a nova parcela definida exatamente em ${formatCurrency(fixoVal)}.`;
    }

    return null;
  }, [valorInput, tipoReajuste]);

  // Ajuste de Transporte
  const [dataInicioTransporte, setDataInicioTransporte] = useState(`03/02/${anoDestino}`);
  const [dataFimTransporte, setDataFimTransporte] = useState(`15/12/${anoDestino}`);

  // Ajuste de Cobrança
  const [dataInicioCobranca, setDataInicioCobranca] = useState(`10/01/${anoDestino}`);
  const [dataFimCobranca, setDataFimCobranca] = useState(`10/12/${anoDestino}`);

  const [selectedEscolaIds, setSelectedEscolaIds] = useState<string[]>([]);
  const [isEscolaPopoverOpen, setIsEscolaPopoverOpen] = useState(false);

  const reajusteMutation = useReajusteLote();

  const isAllSelected =
    escolasList.length > 0 && selectedEscolaIds.length === escolasList.length;

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEscolaIds(escolasList.map((e) => e.id));
    } else {
      setSelectedEscolaIds([]);
    }
  };

  const handleToggleEscola = (escolaId: string, checked: boolean) => {
    if (checked) {
      setSelectedEscolaIds((prev) => [...prev, escolaId]);
    } else {
      setSelectedEscolaIds((prev) => prev.filter((id) => id !== escolaId));
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

    if (selectedEscolaIds.length === 0) {
      toast.error("Selecione ao menos uma escola para aplicar o reajuste.");
      return;
    }

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
        escola_ids: selectedEscolaIds,
        tipo_reajuste: tipoReajuste,
        valor_reajuste: valorNum,
      });
    } else if (acaoSelecionada === "transporte") {
      await reajusteMutation.mutateAsync({
        ano_destino: anoDestino,
        escola_ids: selectedEscolaIds,
        data_inicio_transporte: dataInicioTransporte,
        data_fim_transporte: dataFimTransporte,
      });
    } else if (acaoSelecionada === "cobranca") {
      await reajusteMutation.mutateAsync({
        ano_destino: anoDestino,
        escola_ids: selectedEscolaIds,
        data_inicio_cobranca: dataInicioCobranca,
        data_fim_cobranca: dataFimCobranca,
      });
    }

    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !reajusteMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="AJUSTES EM LOTE"
        icon={<Sparkles className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={reajusteMutation.isPending}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* 1. PARA QUEM VOCÊ QUER APLICAR? (PRIMEIRO PASSO) */}
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">
              Para quem você quer aplicar? <span className="text-red-600">*</span>
            </Label>

            <Popover open={isEscolaPopoverOpen} onOpenChange={setIsEscolaPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 text-left font-normal justify-between text-slate-700 px-3 hover:bg-slate-100/60"
                >
                  <div className="flex items-center gap-2 truncate">
                    <School className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate text-sm">{getEscolaDisplayText()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[320px] sm:w-[380px] p-3 rounded-2xl shadow-xl border-slate-200" align="start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50 border-b border-slate-100 pb-2.5">
                    <Checkbox
                      id="all-escolas"
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleToggleSelectAll(Boolean(checked))}
                    />
                    <label
                      htmlFor="all-escolas"
                      className="text-xs font-bold text-slate-900 cursor-pointer flex-1"
                    >
                      Toda a Frota (Todas as Escolas)
                    </label>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {escolasList.map((escola) => (
                      <div
                        key={escola.id}
                        className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-50"
                      >
                        <Checkbox
                          id={`escola-${escola.id}`}
                          checked={isEscolaChecked(escola.id)}
                          onCheckedChange={(checked) => handleToggleEscola(escola.id, Boolean(checked))}
                        />
                        <label
                          htmlFor={`escola-${escola.id}`}
                          className="text-xs text-slate-700 cursor-pointer flex-1 truncate"
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

          {/* 2. O QUE VOCÊ DESEJA AJUSTAR EM LOTE? */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <Label className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">
              O que você deseja ajustar em lote? <span className="text-red-600">*</span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAcaoSelecionada("mensalidade")}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  acaoSelecionada === "mensalidade"
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                )}
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-[#1a3a5c]" />
                <span className="text-xs">Valor da Parcela</span>
              </button>

              <button
                type="button"
                onClick={() => setAcaoSelecionada("transporte")}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  acaoSelecionada === "transporte"
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Car className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-[#1a3a5c]" />
                <span className="text-xs">Período Transporte</span>
              </button>

              <button
                type="button"
                onClick={() => setAcaoSelecionada("cobranca")}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  acaoSelecionada === "cobranca"
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                )}
              >
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-[#1a3a5c]" />
                <span className="text-xs">Período Cobrança</span>
              </button>
            </div>
          </div>

          {/* 3. CONFIGURAÇÃO DA AÇÃO SELECIONADA */}
          {acaoSelecionada === "mensalidade" && (
            <div className="space-y-3 pt-1.5 border-t border-slate-100">
              <Label className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">
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
                    "flex items-center space-x-3 rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer",
                    tipoReajuste === RenovacaoReajusteTipo.FIXO
                      ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700 font-medium"
                  )}
                >
                  <RadioGroupItem value={RenovacaoReajusteTipo.FIXO} id={fixoId} />
                  <span className="text-xs sm:text-sm flex-1 leading-normal">
                    Acrescentar valor fixo (R$)
                  </span>
                </label>

                <label
                  htmlFor={percentualId}
                  className={cn(
                    "flex items-center space-x-3 rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer",
                    tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                      ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700 font-medium"
                  )}
                >
                  <RadioGroupItem value={RenovacaoReajusteTipo.PERCENTUAL} id={percentualId} />
                  <span className="text-xs sm:text-sm flex-1 leading-normal">
                    Acrescentar percentual (%)
                  </span>
                </label>

                <label
                  htmlFor={padraoId}
                  className={cn(
                    "flex items-center space-x-3 rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer",
                    tipoReajuste === RenovacaoReajusteTipo.VALOR_PADRAO
                      ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold"
                      : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700 font-medium"
                  )}
                >
                  <RadioGroupItem value={RenovacaoReajusteTipo.VALOR_PADRAO} id={padraoId} />
                  <span className="text-xs sm:text-sm flex-1 leading-normal">
                    Definir novo valor fixo para todos (R$)
                  </span>
                </label>
              </RadioGroup>

              <div className="space-y-1.5 pt-1">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  {tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                    ? "Percentual a acrescentar (%)"
                    : tipoReajuste === RenovacaoReajusteTipo.FIXO
                    ? "Valor a acrescentar por passageiro (R$)"
                    : "Novo valor da parcela para todos (R$)"}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
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
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    required
                  />
                </div>

                {/* Resumo explicativo do cálculo dinâmico para Lote */}
                {exemploCalculo && (
                  <p className="text-[11px] sm:text-xs text-slate-500 pt-0.5 leading-relaxed">
                    {exemploCalculo}
                  </p>
                )}
              </div>
            </div>
          )}

          {acaoSelecionada === "transporte" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Início do Transporte <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={dataInicioTransporte}
                    onChange={(e) => setDataInicioTransporte(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Fim do Transporte <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={dataFimTransporte}
                    onChange={(e) => setDataFimTransporte(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {acaoSelecionada === "cobranca" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Início da Cobrança <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={dataInicioCobranca}
                    onChange={(e) => setDataInicioCobranca(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Fim da Cobrança <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={dataFimCobranca}
                    onChange={(e) => setDataFimCobranca(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. O QUE VAI ACONTECER? (NO FINAL) */}
          <div className="rounded-2xl bg-[#1a3a5c]/5 border border-[#1a3a5c]/10 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-wider block">
              O que vai acontecer?
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedEscolaIds.length === 0
                ? "Nenhuma escola selecionada. Selecione ao menos uma escola acima."
                : acaoSelecionada === "mensalidade"
                ? valorInput.trim()
                  ? tipoReajuste === RenovacaoReajusteTipo.FIXO
                    ? `Um acréscimo de ${formatCurrency(moneyToNumber(valorInput))} será aplicado na parcela de todos os passageiros de ${getEscolaDisplayText()} para ${anoDestino}.`
                    : tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                    ? `Um acréscimo de ${valorInput}% será aplicado na parcela de todos os passageiros de ${getEscolaDisplayText()} para ${anoDestino}.`
                    : `A parcela será definida exatamente em ${formatCurrency(moneyToNumber(valorInput))} para todos os passageiros de ${getEscolaDisplayText()} para ${anoDestino}.`
                  : `O valor da parcela será atualizado para os passageiros de ${getEscolaDisplayText()} para ${anoDestino}.`
                : acaoSelecionada === "transporte"
                ? `O período de transporte (${dataInicioTransporte} a ${dataFimTransporte}) será atualizado para ${getEscolaDisplayText()}.`
                : `O período de cobrança (${dataInicioCobranca} a ${dataFimCobranca}) será atualizado para ${getEscolaDisplayText()}.`}
            </p>
          </div>
        </BaseDialog.Body>

        <BaseDialog.Footer className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-100">
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={() => safeCloseDialog(onClose)}
          />
          <BaseDialog.Action
            label="Aplicar"
            variant="primary"
            type="submit"
            loading={reajusteMutation.isPending}
            disabled={
              reajusteMutation.isPending ||
              selectedEscolaIds.length === 0 ||
              (acaoSelecionada === "mensalidade" && !valorInput.trim())
            }
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
