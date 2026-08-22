import { useState, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useReajusteLote } from "@/hooks/api/useRenovacoes";
import { useEscolasWithFilters, useProfile } from "@/hooks";
import { RenovacaoReajusteTipo } from "@/types/enums";
import { Escola } from "@/types/escola";
import { moneyMask, moneyToNumber, dateMask } from "@/utils/masks";
import { convertDateBrToISO } from "@/utils/formatters/date";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "sonner";
import {
  DollarSign,
  CalendarDays,
  Sparkles,
  School,
  ChevronDown,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [acaoSelecionada, setAcaoSelecionada] = useState<AcaoLote>("mensalidade");
  const [tipoReajuste, setTipoReajuste] = useState<RenovacaoReajusteTipo>(
    RenovacaoReajusteTipo.FIXO
  );
  const [valorInput, setValorInput] = useState("30,00");

  const [dataInicioTransporte, setDataInicioTransporte] = useState("03/02/2027");
  const [dataFimTransporte, setDataFimTransporte] = useState("15/12/2027");
  const [dataInicioCobranca, setDataInicioCobranca] = useState("05/02/2027");
  const [dataFimCobranca, setDataFimCobranca] = useState("05/12/2027");

  const [isAllSelected, setIsAllSelected] = useState(true);
  const [selectedEscolaIds, setSelectedEscolaIds] = useState<string[]>([]);
  const [isEscolaPopoverOpen, setIsEscolaPopoverOpen] = useState(false);

  const reajusteMutation = useReajusteLote();

  const handleToggleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      setSelectedEscolaIds([]);
    } else {
      setSelectedEscolaIds(escolasList.map((e) => e.id));
    }
  };

  const handleToggleEscola = (id: string, checked: boolean) => {
    let updated: string[];
    if (isAllSelected) {
      updated = checked ? [id] : escolasList.filter((e) => e.id !== id).map((e) => e.id);
      setIsAllSelected(false);
    } else {
      if (checked) {
        updated = [...selectedEscolaIds, id];
        if (updated.length === escolasList.length) {
          setIsAllSelected(true);
          setSelectedEscolaIds([]);
          return;
        }
      } else {
        updated = selectedEscolaIds.filter((eId) => eId !== id);
      }
    }
    setSelectedEscolaIds(updated);
  };

  const isEscolaChecked = (id: string) => {
    if (isAllSelected) return true;
    return selectedEscolaIds.includes(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payloadEscolas = isAllSelected ? null : selectedEscolaIds;

    try {
      if (acaoSelecionada === "mensalidade") {
        let numericValue = 0;
        if (tipoReajuste === RenovacaoReajusteTipo.FIXO || tipoReajuste === RenovacaoReajusteTipo.VALOR_PADRAO) {
          numericValue = moneyToNumber(valorInput);
        } else if (tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL) {
          numericValue = Number(valorInput.replace(",", "."));
        }

        await reajusteMutation.mutateAsync({
          ano_destino: anoDestino,
          tipo: tipoReajuste,
          valor: numericValue,
          escola_ids: payloadEscolas,
        });
      } else if (acaoSelecionada === "transporte") {
        await reajusteMutation.mutateAsync({
          ano_destino: anoDestino,
          tipo: RenovacaoReajusteTipo.MANTER,
          valor: 0,
          escola_ids: payloadEscolas,
          data_inicio_transporte: dataInicioTransporte ? convertDateBrToISO(dataInicioTransporte) : undefined,
          data_fim_transporte: dataFimTransporte ? convertDateBrToISO(dataFimTransporte) : undefined,
        });
      } else if (acaoSelecionada === "cobranca") {
        await reajusteMutation.mutateAsync({
          ano_destino: anoDestino,
          tipo: RenovacaoReajusteTipo.MANTER,
          valor: 0,
          escola_ids: payloadEscolas,
          data_inicio_cobranca: dataInicioCobranca ? convertDateBrToISO(dataInicioCobranca) : undefined,
          data_fim_cobranca: dataFimCobranca ? convertDateBrToISO(dataFimCobranca) : undefined,
        });
      }

      toast.success("Ajustes em lote aplicados com sucesso!");
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao aplicar ajustes em lote.");
    }
  };

  const getEscolaDisplayText = () => {
    if (isAllSelected) return "Toda a Frota (Todas as Escolas)";
    if (selectedEscolaIds.length === 0) return "Nenhuma escola selecionada";
    if (selectedEscolaIds.length === 1) {
      const found = escolasList.find((e) => e.id === selectedEscolaIds[0]);
      return found ? found.nome : "1 escola selecionada";
    }
    return `${selectedEscolaIds.length} escolas selecionadas`;
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !reajusteMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title={`AJUSTES EM LOTE • ${anoDestino}`}
        icon={<Sparkles className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={reajusteMutation.isPending}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* 1. O QUE VOCÊ DESEJA AJUSTAR EM LOTE? */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-semibold ml-1 text-sm">
              O que você deseja ajustar em lote? <span className="text-red-600">*</span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAcaoSelecionada("mensalidade")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all",
                  acaoSelecionada === "mensalidade"
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                )}
              >
                <DollarSign className="w-5 h-5 mb-1 text-[#1a3a5c]" />
                <span className="text-xs">Mensalidade</span>
              </button>

              <button
                type="button"
                onClick={() => setAcaoSelecionada("transporte")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all",
                  acaoSelecionada === "transporte"
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Car className="w-5 h-5 mb-1 text-[#1a3a5c]" />
                <span className="text-xs">Transporte</span>
              </button>

              <button
                type="button"
                onClick={() => setAcaoSelecionada("cobranca")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all",
                  acaoSelecionada === "cobranca"
                    ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-semibold shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                )}
              >
                <CalendarDays className="w-5 h-5 mb-1 text-[#1a3a5c]" />
                <span className="text-xs">Cobrança</span>
              </button>
            </div>
          </div>

          {/* 2. CONFIGURAÇÃO DA AÇÃO */}
          {acaoSelecionada === "mensalidade" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Tipo de Reajuste
              </Label>

              <RadioGroup
                value={tipoReajuste}
                onValueChange={(val) => {
                  const tipo = val as RenovacaoReajusteTipo;
                  setTipoReajuste(tipo);
                  if (tipo === RenovacaoReajusteTipo.PERCENTUAL) setValorInput("8,0");
                  else if (tipo === RenovacaoReajusteTipo.FIXO) setValorInput("30,00");
                  else if (tipo === RenovacaoReajusteTipo.VALOR_PADRAO) setValorInput("380,00");
                }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 hover:bg-slate-100/50 cursor-pointer">
                  <RadioGroupItem value={RenovacaoReajusteTipo.FIXO} id="fixo" />
                  <Label htmlFor="fixo" className="cursor-pointer font-medium text-slate-700 text-sm flex-1">
                    Acréscimo fixo em Reais (+ R$)
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 hover:bg-slate-100/50 cursor-pointer">
                  <RadioGroupItem value={RenovacaoReajusteTipo.PERCENTUAL} id="percentual" />
                  <Label htmlFor="percentual" className="cursor-pointer font-medium text-slate-700 text-sm flex-1">
                    Acréscimo percentual (+ %)
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 hover:bg-slate-100/50 cursor-pointer">
                  <RadioGroupItem value={RenovacaoReajusteTipo.VALOR_PADRAO} id="padrao" />
                  <Label htmlFor="padrao" className="cursor-pointer font-medium text-slate-700 text-sm flex-1">
                    Definir novo valor fixo para todos (R$)
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-1.5 pt-1">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  {tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL
                    ? "Percentual de Reajuste"
                    : tipoReajuste === RenovacaoReajusteTipo.VALOR_PADRAO
                    ? "Novo Valor da Mensalidade"
                    : "Valor do Acréscimo"}{" "}
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
                    placeholder={tipoReajuste === RenovacaoReajusteTipo.PERCENTUAL ? "Ex: 8,0" : "R$ 0,00"}
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    required
                  />
                </div>
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

          {/* 3. PARA QUEM VOCÊ QUER APLICAR? */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <Label className="text-slate-700 font-semibold ml-1 text-sm">
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

          {/* PREVIEW DE IMPACTO */}
          <div className="rounded-2xl bg-[#1a3a5c]/5 border border-[#1a3a5c]/10 p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-[#1a3a5c] uppercase tracking-wider block">
              Resumo da Aplicação
            </span>
            <p className="text-xs text-slate-600">
              {acaoSelecionada === "mensalidade"
                ? `O reajuste será gravado nas propostas de ${getEscolaDisplayText()} para ${anoDestino}.`
                : acaoSelecionada === "transporte"
                ? `As datas de transporte (${dataInicioTransporte} a ${dataFimTransporte}) serão atualizadas para ${getEscolaDisplayText()}.`
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
            isLoading={reajusteMutation.isPending}
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
