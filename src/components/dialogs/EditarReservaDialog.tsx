import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateRenovacao } from "@/hooks/api/useRenovacoes";
import { useEscolasWithFilters, useProfile, useVeiculosWithFilters } from "@/hooks";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { moneyMask, moneyToNumber, dateMask } from "@/utils/masks";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "sonner";
import {
  School,
  CalendarDays,
  DollarSign,
  Car,
  Sun,
  Users,
  Compass,
  User,
  Sparkles,
} from "lucide-react";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { modalidades, periodos, formatCurrency } from "@/utils/formatters";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { cn } from "@/lib/utils";

interface EditarReservaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: RenovacaoPassageiroItem | null;
  anoDestino: number;
  onSuccess?: () => void;
}

export function EditarReservaDialog({
  isOpen,
  onClose,
  passageiro,
  anoDestino,
  onSuccess,
}: EditarReservaDialogProps) {
  const { profile } = useProfile();
  const { data: escolasList = [] } = useEscolasWithFilters(profile?.id, { ativo: "true" }) as { data: Escola[] };
  const { data: veiculosList = [] } = useVeiculosWithFilters(profile?.id, { ativo: "true" }) as { data: Veiculo[] };

  const updateMutation = useUpdateRenovacao();

  const isIsentoOriginal = Boolean(passageiro?.isento_atual);

  const [novoValor, setNovoValor] = useState("");
  const [modoCalculo, setModoCalculo] = useState<"direto" | "fixo" | "percentual">("direto");
  const [valorIncremento, setValorIncremento] = useState("");
  const [novoDiaVencimento, setNovoDiaVencimento] = useState("10");
  const [dataInicioCobranca, setDataInicioCobranca] = useState<string>(`01/02/${anoDestino}`);
  const [dataFimCobranca, setDataFimCobranca] = useState<string>(`01/12/${anoDestino}`);

  const [novaEscolaId, setNovaEscolaId] = useState("");
  const [novoPeriodo, setNovoPeriodo] = useState("");
  const [novaModalidade, setNovaModalidade] = useState("ida_volta");
  const [novaTurma, setNovaTurma] = useState("");
  const [novoNomeProfessor, setNovoNomeProfessor] = useState("");
  const [novoVeiculoId, setNovoVeiculoId] = useState("");
  const [dataInicioTransporte, setDataInicioTransporte] = useState<string>(`01/02/${anoDestino}`);
  const [dataFimTransporte, setDataFimTransporte] = useState<string>(`15/12/${anoDestino}`);

  useEffect(() => {
    if (passageiro) {
      const valorBase = passageiro.novo_valor_cobranca ?? passageiro.valor_cobranca_atual ?? 0;
      setNovoValor(moneyMask(String(Math.round(valorBase * 100))));
      setModoCalculo("direto");
      setValorIncremento("");

      const diaVenc = passageiro.novo_dia_vencimento || passageiro.dia_vencimento_atual || 10;
      setNovoDiaVencimento(String(diaVenc));

      const escolaId = passageiro.nova_escola_id || passageiro.escola_id_atual || (escolasList[0]?.id ?? "");
      setNovaEscolaId(escolaId);

      const periodo = passageiro.novo_periodo || passageiro.periodo_atual || "manha";
      setNovoPeriodo(periodo);

      setNovaModalidade(passageiro.nova_modalidade || passageiro.modalidade_atual || "ida_volta");
      setNovaTurma(passageiro.nova_turma || passageiro.turma_atual || "");
      setNovoNomeProfessor(passageiro.novo_nome_professor || passageiro.nome_professor_atual || "");

      const veiculoId = passageiro.novo_veiculo_id || passageiro.veiculo_id_atual || (veiculosList[0]?.id ?? "");
      setNovoVeiculoId(veiculoId);

      const projectDate = (dateVal: string | null | undefined, fallback: string) => {
        if (!dateVal) return fallback;
        const br = formatDateToBR(dateVal);
        const parts = br.split("/");
        if (parts.length === 3) {
          return `${parts[0]}/${parts[1]}/${anoDestino}`;
        }
        return fallback;
      };

      const dtInicioTransp = passageiro.nova_data_inicio_transporte
        ? formatDateToBR(passageiro.nova_data_inicio_transporte)
        : projectDate(passageiro.data_inicio_transporte_atual, `01/02/${anoDestino}`);
      setDataInicioTransporte(dtInicioTransp);

      const dtFimTransp = passageiro.nova_data_fim_transporte
        ? formatDateToBR(passageiro.nova_data_fim_transporte)
        : projectDate(passageiro.data_fim_transporte_atual, `15/12/${anoDestino}`);
      setDataFimTransporte(dtFimTransp);

      const dtInicioCobr = passageiro.nova_data_inicio_cobranca
        ? formatDateToBR(passageiro.nova_data_inicio_cobranca)
        : projectDate(passageiro.data_inicio_cobranca_atual, `01/02/${anoDestino}`);
      setDataInicioCobranca(dtInicioCobr);

      const dtFimCobr = passageiro.nova_data_fim_cobranca
        ? formatDateToBR(passageiro.nova_data_fim_cobranca)
        : projectDate(passageiro.data_fim_cobranca_atual, `01/12/${anoDestino}`);
      setDataFimCobranca(dtFimCobr);
    }
  }, [passageiro, escolasList, veiculosList, anoDestino]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passageiro) return;

    try {
      await updateMutation.mutateAsync({
        passageiroId: passageiro.passageiro_id,
        data: {
          ano_destino: anoDestino,
          novo_valor_cobranca: isIsentoOriginal ? null : moneyToNumber(novoValor),
          novo_dia_vencimento: isIsentoOriginal ? null : (Number(novoDiaVencimento) || 10),
          nova_escola_id: novaEscolaId || null,
          novo_periodo: novoPeriodo || null,
          nova_modalidade: novaModalidade || null,
          nova_turma: novaTurma || null,
          novo_nome_professor: novoNomeProfessor || null,
          novo_veiculo_id: novoVeiculoId || null,
          nova_data_inicio_transporte: dataInicioTransporte ? convertDateBrToISO(dataInicioTransporte) : undefined,
          nova_data_fim_transporte: dataFimTransporte ? convertDateBrToISO(dataFimTransporte) : undefined,
          nova_data_inicio_cobranca: isIsentoOriginal ? undefined : (dataInicioCobranca ? convertDateBrToISO(dataInicioCobranca) : undefined),
          nova_data_fim_cobranca: isIsentoOriginal ? undefined : (dataFimCobranca ? convertDateBrToISO(dataFimCobranca) : undefined),
        },
      });

      toast.success("Reserva atualizada com sucesso!");
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao atualizar reserva do aluno.");
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !updateMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
      description={`Configuração da reserva e condições financeiras para o ano letivo de ${anoDestino}`}
    >
      <BaseDialog.Header
        title={`Reserva de Vaga • ${anoDestino}`}
        subtitle="Condições da proposta e valores para o próximo ano letivo"
        icon={<Sparkles className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={updateMutation.isPending}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="rounded-[20px] bg-[#fafafa] p-4 border border-[#e5e5e5]">
            <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
              Aluno
            </span>
            <span className="text-base font-bold text-[#0a0a0a] tracking-tight block mt-0.5">
              {passageiro?.nome}
            </span>
          </div>

          {!isIsentoOriginal && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-2">
                <DollarSign className="w-4 h-4 text-[#0a0a0a]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Condições da Parcela
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-[18px] border border-[#e5e5e5] bg-white p-3">
                  <span className="text-[11px] text-[#737373] font-medium block">
                    Parcela Atual
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0a0a0a] mt-0.5 block tracking-tight">
                    {formatCurrency(passageiro?.valor_cobranca_atual)}
                  </span>
                </div>

                <div className="rounded-[18px] border border-[#0a0a0a] bg-[#0a0a0a]/[0.02] p-3">
                  <span className="text-[11px] text-[#0a0a0a] font-medium block">
                    Nova Parcela ({anoDestino})
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0a0a0a] mt-0.5 block tracking-tight">
                    {novoValor ? novoValor : "R$ 0,00"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Como deseja definir o valor?
                </Label>
                <div className="grid grid-cols-3 rounded-[18px] border border-[#e5e5e5] p-1 bg-[#fafafa] gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModoCalculo("direto");
                      setValorIncremento("");
                    }}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-[14px] transition-all text-center cursor-pointer truncate px-1",
                      modoCalculo === "direto"
                        ? "bg-[#0a0a0a] text-white shadow-xs"
                        : "text-[#737373] hover:text-[#0a0a0a] hover:bg-white"
                    )}
                  >
                    Valor Final
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModoCalculo("fixo");
                      setValorIncremento("");
                    }}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-[14px] transition-all text-center cursor-pointer truncate px-1",
                      modoCalculo === "fixo"
                        ? "bg-[#0a0a0a] text-white shadow-xs"
                        : "text-[#737373] hover:text-[#0a0a0a] hover:bg-white"
                    )}
                  >
                    + R$ (Fixo)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModoCalculo("percentual");
                      setValorIncremento("");
                    }}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-[14px] transition-all text-center cursor-pointer truncate px-1",
                      modoCalculo === "percentual"
                        ? "bg-[#0a0a0a] text-white shadow-xs"
                        : "text-[#737373] hover:text-[#0a0a0a] hover:bg-white"
                    )}
                  >
                    + % (Percentual)
                  </button>
                </div>
              </div>

              {modoCalculo === "direto" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                    Novo Valor da Parcela ({anoDestino}) <span className="text-[#e7000b]">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <Input
                      value={novoValor}
                      onChange={(e) => setNovoValor(moneyMask(e.target.value))}
                      placeholder="R$ 0,00"
                      className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm font-medium w-full"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                    {modoCalculo === "fixo" ? "Valor do Acréscimo (R$)" : "Percentual de Acréscimo (%)"}{" "}
                    <span className="text-[#e7000b]">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <Input
                      value={valorIncremento}
                      onChange={(e) => {
                        const val = e.target.value;
                        const baseOrigem = Number(passageiro?.valor_cobranca_atual || 0);

                        if (modoCalculo === "percentual") {
                          const clean = val.replace(/[^0-9,.]/g, "");
                          setValorIncremento(clean);
                          const perc = Number(clean.replace(",", "."));
                          if (perc > 0) {
                            const total = Number((baseOrigem * (1 + perc / 100)).toFixed(2));
                            setNovoValor(moneyMask(String(Math.round(total * 100))));
                          } else {
                            setNovoValor(moneyMask(String(Math.round(baseOrigem * 100))));
                          }
                        } else {
                          const masked = moneyMask(val);
                          setValorIncremento(masked);
                          const acrescimo = moneyToNumber(masked);
                          if (acrescimo > 0) {
                            const total = baseOrigem + acrescimo;
                            setNovoValor(moneyMask(String(Math.round(total * 100))));
                          } else {
                            setNovoValor(moneyMask(String(Math.round(baseOrigem * 100))));
                          }
                        }
                      }}
                      placeholder={modoCalculo === "percentual" ? "Ex: 10%" : "Ex: R$ 30,00"}
                      className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm font-medium w-full"
                    />
                  </div>

                  {valorIncremento.trim() && (
                    <div className="rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-2.5 text-center text-xs text-[#737373]">
                      {modoCalculo === "fixo" ? (
                        <>
                          {formatCurrency(passageiro?.valor_cobranca_atual)} + {formatCurrency(moneyToNumber(valorIncremento))} ={" "}
                          <strong className="font-bold text-[#0a0a0a]">{novoValor}</strong>
                        </>
                      ) : (
                        <>
                          {formatCurrency(passageiro?.valor_cobranca_atual)} + {valorIncremento}% ={" "}
                          <strong className="font-bold text-[#0a0a0a]">{novoValor}</strong>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                    Vencimento <span className="text-[#e7000b]">*</span>
                  </Label>
                  <Select value={novoDiaVencimento} onValueChange={setNovoDiaVencimento}>
                    <SelectTrigger className="h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full">
                      <SelectValue placeholder="Dia" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()} className="text-xs">
                          Dia {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                    Início Cobrança
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <Input
                      value={dataInicioCobranca}
                      onChange={(e) => setDataInicioCobranca(dateMask(e.target.value))}
                      placeholder="DD/MM/AAAA"
                      className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                    Fim Cobrança
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <Input
                      value={dataFimCobranca}
                      onChange={(e) => setDataFimCobranca(dateMask(e.target.value))}
                      placeholder="DD/MM/AAAA"
                      className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-2">
              <Car className="w-4 h-4 text-[#0a0a0a]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Dados do Transporte
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Escola <span className="text-[#e7000b]">*</span>
                </Label>
                <Select value={novaEscolaId} onValueChange={setNovaEscolaId}>
                  <div className="relative">
                    <School className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <SelectTrigger className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full">
                      <SelectValue placeholder="Selecione a escola" />
                    </SelectTrigger>
                  </div>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {escolasList.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id} className="text-xs">
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Período <span className="text-[#e7000b]">*</span>
                </Label>
                <Select value={novoPeriodo} onValueChange={setNovoPeriodo}>
                  <div className="relative">
                    <Sun className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <SelectTrigger className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {periodos.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="text-xs">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Modalidade <span className="text-[#e7000b]">*</span>
                </Label>
                <Select value={novaModalidade} onValueChange={setNovaModalidade}>
                  <div className="relative">
                    <Compass className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <SelectTrigger className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {modalidades.map((m) => (
                      <SelectItem key={m.value} value={m.value} className="text-xs">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Veículo
                </Label>
                <Select value={novoVeiculoId} onValueChange={setNovoVeiculoId}>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                    <SelectTrigger className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full">
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {veiculosList.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-xs">
                        {v.modelo} ({formatarPlacaExibicao(v.placa)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Turma
                </Label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                  <Input
                    value={novaTurma}
                    onChange={(e) => setNovaTurma(e.target.value)}
                    placeholder="Ex: 5º Ano B"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Nome do Professor
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                  <Input
                    value={novoNomeProfessor}
                    onChange={(e) => setNovoNomeProfessor(e.target.value)}
                    placeholder="Ex: Profa. Márcia"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Início do Transporte
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                  <Input
                    value={dataInicioTransporte}
                    onChange={(e) => setDataInicioTransporte(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0a0a0a] ml-1">
                  Fim do Transporte
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-3 h-4 w-4 text-[#737373] z-10" />
                  <Input
                    value={dataFimTransporte}
                    onChange={(e) => setDataFimTransporte(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] border-[#e5e5e5] text-xs sm:text-sm w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </BaseDialog.Body>

        <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[#e5e5e5]">
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={() => safeCloseDialog(onClose)}
          />
          <BaseDialog.Action
            label="Salvar Reserva"
            variant="primary"
            type="submit"
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
