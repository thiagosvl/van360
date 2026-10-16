import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useUpdateRenovacao, usePeriodoRenovacaoConfig } from "@/hooks/api/useRenovacoes";
import { useEscolasWithFilters, useProfile, useVeiculosWithFilters } from "@/hooks";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { moneyMask, moneyToNumber } from "@/utils/masks";
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
  DoorOpen,
  ArrowRight,
  X,
} from "lucide-react";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { modalidades, periodos, formatCurrency, formatFirstName, formatShortName } from "@/utils/formatters";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { monthOptions, parseLocalDate } from "@/utils/dateUtils";
import { ptBR } from "date-fns/locale";
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
  const { data: configPeriodoMestre } = usePeriodoRenovacaoConfig(anoDestino);

  const updateMutation = useUpdateRenovacao();

  const isIsentoOriginal = Boolean(passageiro?.isento_atual);

  const [novoValor, setNovoValor] = useState("");
  const [novoDiaVencimento, setNovoDiaVencimento] = useState("10");
  const [mesInicioCobranca, setMesInicioCobranca] = useState("");
  const [anoInicioCobranca, setAnoInicioCobranca] = useState("");
  const [mesFimCobranca, setMesFimCobranca] = useState("");
  const [anoFimCobranca, setAnoFimCobranca] = useState("");

  const [novaEscolaId, setNovaEscolaId] = useState("");
  const [novoPeriodo, setNovoPeriodo] = useState("");
  const [novaModalidade, setNovaModalidade] = useState("ida_volta");
  const [novaTurma, setNovaTurma] = useState("");
  const [novaSala, setNovaSala] = useState("");
  const [novoNomeProfessor, setNovoNomeProfessor] = useState("");
  const [novoVeiculoId, setNovoVeiculoId] = useState("");
  const [dataInicioTransporte, setDataInicioTransporte] = useState<string>("");
  const [dataFimTransporte, setDataFimTransporte] = useState<string>("");

  const [openCalendarInicioTransp, setOpenCalendarInicioTransp] = useState(false);
  const [openCalendarFimTransp, setOpenCalendarFimTransp] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const anoOptions = [anoDestino.toString(), (anoDestino + 1).toString()];

  useEffect(() => {
    if (passageiro) {
      setErrors({});
      const valorBase = passageiro.novo_valor_cobranca ?? passageiro.valor_cobranca_atual ?? 0;
      setNovoValor(moneyMask(String(Math.round(valorBase * 100))));

      const diaVenc = passageiro.novo_dia_vencimento || passageiro.dia_vencimento_atual || 10;
      setNovoDiaVencimento(String(diaVenc));

      const escolaId = passageiro.nova_escola_id || passageiro.escola_id_atual || (escolasList[0]?.id ?? "");
      setNovaEscolaId(escolaId);

      const periodo = passageiro.novo_periodo || passageiro.periodo_atual || "manha";
      setNovoPeriodo(periodo);

      setNovaModalidade(passageiro.nova_modalidade || passageiro.modalidade_atual || "ida_volta");
      setNovaTurma(passageiro.nova_turma || passageiro.turma_atual || "");
      setNovaSala(passageiro.nova_sala || passageiro.sala_atual || "");
      setNovoNomeProfessor(passageiro.novo_nome_professor || passageiro.nome_professor_atual || "");

      const veiculoId = passageiro.novo_veiculo_id || passageiro.veiculo_id_atual || (veiculosList[0]?.id ?? "");
      setNovoVeiculoId(veiculoId);

      const dtInicioTransp = passageiro.nova_data_inicio_transporte
        ? formatDateToBR(passageiro.nova_data_inicio_transporte)
        : (configPeriodoMestre?.data_inicio_transporte
            ? formatDateToBR(new Date(configPeriodoMestre.data_inicio_transporte + "T12:00:00"))
            : "");
      setDataInicioTransporte(dtInicioTransp);

      const dtFimTransp = passageiro.nova_data_fim_transporte
        ? formatDateToBR(passageiro.nova_data_fim_transporte)
        : (configPeriodoMestre?.data_fim_transporte
            ? formatDateToBR(new Date(configPeriodoMestre.data_fim_transporte + "T12:00:00"))
            : "");
      setDataFimTransporte(dtFimTransp);

      if (passageiro.nova_data_inicio_cobranca) {
        const parts = passageiro.nova_data_inicio_cobranca.split("-");
        if (parts.length >= 2) {
          setAnoInicioCobranca(parts[0]);
          setMesInicioCobranca(parseInt(parts[1], 10).toString());
        }
      } else if (configPeriodoMestre?.configurado && configPeriodoMestre.mes_inicio_cobranca && configPeriodoMestre.ano_inicio_cobranca) {
        setAnoInicioCobranca(String(configPeriodoMestre.ano_inicio_cobranca));
        setMesInicioCobranca(String(configPeriodoMestre.mes_inicio_cobranca));
      } else {
        setMesInicioCobranca("");
        setAnoInicioCobranca("");
      }

      if (passageiro.nova_data_fim_cobranca) {
        const parts = passageiro.nova_data_fim_cobranca.split("-");
        if (parts.length >= 2) {
          setAnoFimCobranca(parts[0]);
          setMesFimCobranca(parseInt(parts[1], 10).toString());
        }
      } else if (configPeriodoMestre?.configurado && configPeriodoMestre.mes_fim_cobranca && configPeriodoMestre.ano_fim_cobranca) {
        setAnoFimCobranca(String(configPeriodoMestre.ano_fim_cobranca));
        setMesFimCobranca(String(configPeriodoMestre.mes_fim_cobranca));
      } else {
        setMesFimCobranca("");
        setAnoFimCobranca("");
      }
    }
  }, [passageiro, escolasList, veiculosList, anoDestino, configPeriodoMestre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passageiro) return;

    const newErrors: Record<string, string> = {};

    if (!isIsentoOriginal) {
      if (!novoValor || moneyToNumber(novoValor) <= 0) {
        newErrors.novoValor = "Informe o valor da parcela";
      }
      if (!novoDiaVencimento) {
        newErrors.novoDiaVencimento = "Selecione o dia do vencimento";
      }
      if (!mesInicioCobranca && !anoInicioCobranca) {
        newErrors.mesInicioCobranca = "Informe o mês e o ano de início da cobrança";
        newErrors.anoInicioCobranca = "true";
      } else if (!mesInicioCobranca) {
        newErrors.mesInicioCobranca = "Informe o mês de início da cobrança";
      } else if (!anoInicioCobranca) {
        newErrors.anoInicioCobranca = "Informe o ano de início da cobrança";
      }

      if (!mesFimCobranca && !anoFimCobranca) {
        newErrors.mesFimCobranca = "Informe o mês e o ano de término da cobrança";
        newErrors.anoFimCobranca = "true";
      } else if (!mesFimCobranca) {
        newErrors.mesFimCobranca = "Informe o mês de término da cobrança";
      } else if (!anoFimCobranca) {
        newErrors.anoFimCobranca = "Informe o ano de término da cobrança";
      }

      if (mesInicioCobranca && anoInicioCobranca && mesFimCobranca && anoFimCobranca) {
        const totalInicio = Number(anoInicioCobranca) * 12 + Number(mesInicioCobranca);
        const totalFim = Number(anoFimCobranca) * 12 + Number(mesFimCobranca);
        if (totalFim < totalInicio) {
          newErrors.mesFimCobranca = "O término deve ser posterior ou igual ao início";
          newErrors.anoFimCobranca = "true";
        }
      }
    }

    if (!novaEscolaId) {
      newErrors.novaEscolaId = "Selecione a escola";
    }

    let dataInicioDate: Date | null = null;
    let dataFimDate: Date | null = null;

    if (dataInicioTransporte && dataInicioTransporte.trim().length > 0) {
      const parsed = parseLocalDate(convertDateBrToISO(dataInicioTransporte));
      if (isNaN(parsed.getTime())) {
        newErrors.dataInicioTransporte = "Data de início inválida";
      } else {
        dataInicioDate = parsed;
      }
    }

    if (dataFimTransporte && dataFimTransporte.trim().length > 0) {
      const parsed = parseLocalDate(convertDateBrToISO(dataFimTransporte));
      if (isNaN(parsed.getTime())) {
        newErrors.dataFimTransporte = "Data de término inválida";
      } else {
        dataFimDate = parsed;
      }
    }

    if (dataInicioDate && dataFimDate && dataFimDate < dataInicioDate) {
      newErrors.dataFimTransporte = "O fim deve ser igual ou posterior ao início";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, preencha os campos obrigatórios destacados.");
      return;
    }
    setErrors({});

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
          nova_sala: novaSala || null,
          novo_nome_professor: novoNomeProfessor || null,
          novo_veiculo_id: novoVeiculoId || null,
          nova_data_inicio_transporte: dataInicioTransporte ? convertDateBrToISO(dataInicioTransporte) : null,
          nova_data_fim_transporte: dataFimTransporte ? convertDateBrToISO(dataFimTransporte) : null,
          nova_data_inicio_cobranca: isIsentoOriginal
            ? null
            : (mesInicioCobranca && anoInicioCobranca ? `${anoInicioCobranca}-${mesInicioCobranca.padStart(2, "0")}-01` : null),
          nova_data_fim_cobranca: isIsentoOriginal
            ? null
            : (mesFimCobranca && anoFimCobranca ? `${anoFimCobranca}-${mesFimCobranca.padStart(2, "0")}-01` : null),
        },
      });

      toast.success("Atualizado com sucesso!");
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao atualizar.");
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !updateMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
      description={`Configuração das condições financeiras para o ano letivo de ${anoDestino}`}
    >
      <BaseDialog.Header
        title={passageiro?.nome ? `Renovação • ${formatFirstName(passageiro.nome)}` : "Reserva de Vaga"}
        subtitle={
          passageiro?.responsavel_principal?.nome
            ? `${formatShortName(passageiro.responsavel_principal.nome, true)}`
            : "Condições da proposta e valores para o próximo ano letivo"
        }
        icon={<Sparkles className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={updateMutation.isPending}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="p-4 sm:p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {passageiro?.status === RenovacaoStatus.CONFIRMADO &&
            Boolean(passageiro?.contrato_id || profile?.config_contrato?.usar_contratos) && (
              <Banner
                variant="warning"
                title="Aluno Confirmado e com Contrato"
                description={`Caso altere valor, vencimento, datas, escola, período ou modalidade, o contrato e a matrícula de ${anoDestino} serão reiniciados e a renovação voltará para Pendente no mesmo link para nova confirmação e assinatura.`}
                className="rounded-[18px]"
              />
            )}

          {!isIsentoOriginal && (
            <section className="space-y-4">
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">
                <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                Condições da Parcela
              </div>

              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-[16px] sm:rounded-[18px] border border-[#e5e5e5] bg-white w-full shadow-none">
                <div>
                  <span className="text-[10px] text-[#737373] font-medium uppercase tracking-wider block">
                    Parcela Atual
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] mt-0.5 block">
                    {isIsentoOriginal ? "Isento" : formatCurrency(passageiro?.valor_cobranca_atual)}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-[#737373] shrink-0 mx-2" />

                <div className="text-right">
                  <span className="text-[10px] text-[#737373] font-medium uppercase tracking-wider block">
                    Nova Parcela
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] mt-0.5 block">
                    {isIsentoOriginal ? "Isento" : (novoValor || "R$ 0,00")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#0a0a0a] font-medium text-xs">
                    Novo Valor ({anoDestino}) <span className="text-[#e7000b]">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                    <Input
                      value={novoValor}
                      onChange={(e) => {
                        setNovoValor(moneyMask(e.target.value));
                        if (errors.novoValor) setErrors((prev) => ({ ...prev, novoValor: "" }));
                      }}
                      placeholder="R$ 0,00"
                      className={cn(
                        "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full",
                        errors.novoValor && "border-[#e7000b] focus:border-[#e7000b] focus:ring-[#e7000b]"
                      )}
                      aria-invalid={!!errors.novoValor}
                    />
                  </div>
                  {errors.novoValor && <p className="text-xs text-[#e7000b] mt-1">{errors.novoValor}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#0a0a0a] font-medium text-xs">
                    Vencimento <span className="text-[#e7000b]">*</span>
                  </Label>
                  <NativeSelect
                    value={novoDiaVencimento}
                    onChange={(e) => {
                      setNovoDiaVencimento(e.target.value);
                      if (errors.novoDiaVencimento) setErrors((prev) => ({ ...prev, novoDiaVencimento: "" }));
                    }}
                    error={!!errors.novoDiaVencimento}
                    icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day.toString()}>
                        Dia {day}
                      </option>
                    ))}
                  </NativeSelect>
                  {errors.novoDiaVencimento && <p className="text-xs text-[#e7000b] mt-1">{errors.novoDiaVencimento}</p>}
                </div>
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
                          if (val && !anoInicioCobranca) {
                            setAnoInicioCobranca(String(anoDestino));
                          }
                          setErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.mesInicioCobranca;
                            if (val && (anoInicioCobranca || !prev.anoInicioCobranca || prev.anoInicioCobranca === "true")) {
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
                  {(errors.mesInicioCobranca || (errors.anoInicioCobranca && errors.anoInicioCobranca !== "true")) && (
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
                            if (val && (anoFimCobranca || !prev.anoFimCobranca || prev.anoFimCobranca === "true")) {
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
                  {(errors.mesFimCobranca || (errors.anoFimCobranca && errors.anoFimCobranca !== "true")) && (
                    <p className="text-xs text-[#e7000b] mt-1">{errors.mesFimCobranca || errors.anoFimCobranca}</p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">
              <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                <Car className="w-4 h-4" />
              </div>
              Dados do Transporte
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Escola <span className="text-[#e7000b]">*</span>
                </Label>
                <NativeSelect
                  value={novaEscolaId}
                  onChange={(e) => {
                    setNovaEscolaId(e.target.value);
                    if (errors.novaEscolaId) setErrors((prev) => ({ ...prev, novaEscolaId: "" }));
                  }}
                  error={!!errors.novaEscolaId}
                  icon={<School className="h-4 w-4 text-[#737373]" />}
                >
                  <option value="">Selecione a escola</option>
                  {escolasList.map((escola) => (
                    <option key={escola.id} value={escola.id}>
                      {escola.nome}
                    </option>
                  ))}
                </NativeSelect>
                {errors.novaEscolaId && <p className="text-xs text-[#e7000b] mt-1">{errors.novaEscolaId}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Período <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <NativeSelect
                  value={novoPeriodo}
                  onChange={(e) => {
                    setNovoPeriodo(e.target.value);
                    if (errors.novoPeriodo) setErrors((prev) => ({ ...prev, novoPeriodo: "" }));
                  }}
                  error={!!errors.novoPeriodo}
                  icon={<Sun className="h-4 w-4 text-[#737373]" />}
                >
                  <option value="">Selecione o período</option>
                  {periodos.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </NativeSelect>
                {errors.novoPeriodo && <p className="text-xs text-[#e7000b] mt-1">{errors.novoPeriodo}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Modalidade <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <NativeSelect
                  value={novaModalidade}
                  onChange={(e) => {
                    setNovaModalidade(e.target.value);
                    if (errors.novaModalidade) setErrors((prev) => ({ ...prev, novaModalidade: "" }));
                  }}
                  error={!!errors.novaModalidade}
                  icon={<Compass className="h-4 w-4 text-[#737373]" />}
                >
                  <option value="">Selecione a modalidade</option>
                  {modalidades.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </NativeSelect>
                {errors.novaModalidade && <p className="text-xs text-[#e7000b] mt-1">{errors.novaModalidade}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Veículo <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <NativeSelect
                  value={novoVeiculoId}
                  onChange={(e) => setNovoVeiculoId(e.target.value)}
                  icon={<Car className="h-4 w-4 text-[#737373]" />}
                >
                  <option value="">Selecione o veículo</option>
                  {veiculosList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.modelo} ({formatarPlacaExibicao(v.placa)})
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Turma <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={novaTurma}
                    onChange={(e) => setNovaTurma(e.target.value)}
                    placeholder="Ex: 5º Ano B"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Sala <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <div className="relative">
                  <DoorOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={novaSala}
                    onChange={(e) => setNovaSala(e.target.value)}
                    placeholder="Ex: Sala 12"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Nome do Professor <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={novoNomeProfessor}
                    onChange={(e) => setNovoNomeProfessor(e.target.value)}
                    placeholder="Ex: Profa. Márcia"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Início do Transporte <span className="text-[#737373] font-normal text-xs">(opcional)</span>
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
                          setErrors((prev) => ({ ...prev, dataInicioTransporte: "", dataFimTransporte: "" }));
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dataInicioTransporte && <p className="text-xs text-[#e7000b] mt-1">{errors.dataInicioTransporte}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Fim do Transporte <span className="text-[#737373] font-normal text-xs">(opcional)</span>
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
                        if (errors.dataFimTransporte) {
                          setErrors((prev) => ({ ...prev, dataFimTransporte: "" }));
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dataFimTransporte && <p className="text-xs text-[#e7000b] mt-1">{errors.dataFimTransporte}</p>}
              </div>
            </div>
          </section>
        </BaseDialog.Body>

        <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[#e5e5e5]">
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
