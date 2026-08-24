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

  // Financeiro
  const [novoValor, setNovoValor] = useState("");
  const [modoCalculo, setModoCalculo] = useState<"direto" | "fixo" | "percentual">("direto");
  const [valorIncremento, setValorIncremento] = useState("");
  const [novoDiaVencimento, setNovoDiaVencimento] = useState("10");
  const [dataInicioCobranca, setDataInicioCobranca] = useState<string>(`01/02/${anoDestino}`);
  const [dataFimCobranca, setDataFimCobranca] = useState<string>(`01/12/${anoDestino}`);

  // Transporte
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

      const dtInicioTransp = passageiro.nova_data_inicio_transporte || passageiro.data_inicio_transporte_atual;
      setDataInicioTransporte(dtInicioTransp ? formatDateToBR(dtInicioTransp) : `01/02/${anoDestino}`);

      const dtFimTransp = passageiro.nova_data_fim_transporte || passageiro.data_fim_transporte_atual;
      setDataFimTransporte(dtFimTransp ? formatDateToBR(dtFimTransp) : `15/12/${anoDestino}`);

      const dtInicioCobr = passageiro.nova_data_inicio_cobranca || passageiro.data_inicio_cobranca_atual;
      setDataInicioCobranca(dtInicioCobr ? formatDateToBR(dtInicioCobr) : `01/02/${anoDestino}`);

      const dtFimCobr = passageiro.nova_data_fim_cobranca || passageiro.data_fim_cobranca_atual;
      setDataFimCobranca(dtFimCobr ? formatDateToBR(dtFimCobr) : `01/12/${anoDestino}`);
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
      toast.error("Erro ao atualizar reserva do passageiro.");
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !updateMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title={`RESERVA DE VAGA\n${anoDestino}`}
        icon={<Sparkles className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={updateMutation.isPending}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Card Resumo do Aluno */}
          <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Passageiro
            </span>
            <span className="text-base font-bold text-[#1a3a5c] block mt-0.5">
              {passageiro?.nome}
            </span>
          </div>

          {/* SEÇÃO 1: PARCELAS (FINANCEIRO) - Ocultada se o aluno já for isento de origem */}
          {!isIsentoOriginal && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c]">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                Parcelas
              </div>

              {/* Comparativo de Parcelas */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-xs text-slate-500 font-medium block">
                    Parcela Atual (2026)
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">
                    {formatCurrency(passageiro?.valor_cobranca_atual)}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-3">
                  <span className="text-xs text-emerald-800 font-medium block">
                    Nova Parcela ({anoDestino})
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-900 mt-0.5 block">
                    {novoValor ? novoValor : "R$ 0,00"}
                  </span>
                </div>
              </div>

              {/* Switcher de Tipo de Ajuste */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">
                  Como deseja definir o valor?
                </Label>
                <div className="grid grid-cols-3 rounded-xl border border-slate-200 p-1 bg-slate-50/70 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModoCalculo("direto");
                      setValorIncremento("");
                    }}
                    className={cn(
                      "py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer truncate px-1",
                      modoCalculo === "direto"
                        ? "bg-[#1a3a5c] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white/80"
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
                      "py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer truncate px-1",
                      modoCalculo === "fixo"
                        ? "bg-[#1a3a5c] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white/80"
                    )}
                  >
                    + R$
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModoCalculo("percentual");
                      setValorIncremento("");
                    }}
                    className={cn(
                      "py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer truncate px-1",
                      modoCalculo === "percentual"
                        ? "bg-[#1a3a5c] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-white/80"
                    )}
                  >
                    + %
                  </button>
                </div>
              </div>

              {/* Campo de Entrada de Acréscimo ou Valor Direto */}
              {modoCalculo === "direto" ? (
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-semibold ml-1 text-sm">
                    Novo Valor da Parcela ({anoDestino}) <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                    <Input
                      value={novoValor}
                      onChange={(e) => setNovoValor(moneyMask(e.target.value))}
                      placeholder="R$ 0,00"
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                      required
                    />
                  </div>
                </div>
              ) : (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold ml-1 text-xs sm:text-sm">
                      {modoCalculo === "fixo" ? "Valor do Acréscimo (R$)" : "Percentual de Acréscimo (%)"}{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
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
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                    />
                  </div>

                  {/* Preview da Fórmula de Cálculo Baseada no Valor Original */}
                  {valorIncremento.trim() && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-center text-xs text-slate-700">
                      {modoCalculo === "fixo" ? (
                        <>
                          {formatCurrency(passageiro?.valor_cobranca_atual)} (atual) + {formatCurrency(moneyToNumber(valorIncremento))} ={" "}
                          <strong className="font-bold text-slate-900">{novoValor}</strong>
                        </>
                      ) : (
                        <>
                          {formatCurrency(passageiro?.valor_cobranca_atual)} (atual) + {valorIncremento}% ={" "}
                          <strong className="font-bold text-slate-900">{novoValor}</strong>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Dia do Vencimento */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Dia do Vencimento <span className="text-red-600">*</span>
                </Label>
                <Select value={novoDiaVencimento} onValueChange={setNovoDiaVencimento}>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                    <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                  </div>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Início da Cobrança */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Início da Cobrança
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={dataInicioCobranca}
                    onChange={(e) => setDataInicioCobranca(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                  />
                </div>
              </div>

              {/* Fim da Cobrança */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Fim da Cobrança
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={dataFimCobranca}
                    onChange={(e) => setDataFimCobranca(dateMask(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 2: TRANSPORTE */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c]">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                <Car className="w-5 h-5" />
              </div>
              Transporte
            </div>

            {/* Escola */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Escola <span className="text-red-600">*</span>
              </Label>
              <Select value={novaEscolaId} onValueChange={setNovaEscolaId}>
                <div className="relative">
                  <School className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                </div>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {escolasList.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Período <span className="text-red-600">*</span>
              </Label>
              <Select value={novoPeriodo} onValueChange={setNovoPeriodo}>
                <div className="relative">
                  <Sun className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  {periodos.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modalidade */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Modalidade <span className="text-red-600">*</span>
              </Label>
              <Select value={novaModalidade} onValueChange={setNovaModalidade}>
                <div className="relative">
                  <Compass className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  {modalidades.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Veículo */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Veículo
              </Label>
              <Select value={novoVeiculoId} onValueChange={setNovoVeiculoId}>
                <div className="relative">
                  <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                    <SelectValue placeholder="Selecione o veículo" />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  {veiculosList.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.modelo} ({formatarPlacaExibicao(v.placa)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Turma */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Turma
              </Label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                <Input
                  value={novaTurma}
                  onChange={(e) => setNovaTurma(e.target.value)}
                  placeholder="Ex: 5º Ano B"
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                />
              </div>
            </div>

            {/* Nome do Professor */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Nome do Professor
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                <Input
                  value={novoNomeProfessor}
                  onChange={(e) => setNovoNomeProfessor(e.target.value)}
                  placeholder="Ex: Profa. Márcia"
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                />
              </div>
            </div>

            {/* Início do Transporte */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Início do Transporte
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                <Input
                  value={dataInicioTransporte}
                  onChange={(e) => setDataInicioTransporte(dateMask(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                />
              </div>
            </div>

            {/* Fim do Transporte */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold ml-1 text-sm">
                Fim do Transporte
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                <Input
                  value={dataFimTransporte}
                  onChange={(e) => setDataFimTransporte(dateMask(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                />
              </div>
            </div>
          </div>
        </BaseDialog.Body>

        <BaseDialog.Footer className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-100">
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            onClick={() => safeCloseDialog(onClose)}
          />
          <BaseDialog.Action
            label="Salvar"
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
