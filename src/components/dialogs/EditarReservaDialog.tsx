import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useUpdateRenovacao } from "@/hooks/api/useRenovacoes";
import { useEscolasWithFilters, useProfile, useVeiculosWithFilters } from "@/hooks";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
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
  DoorOpen,
  ArrowRight,
} from "lucide-react";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { modalidades, periodos, formatCurrency, formatFirstName, formatShortName } from "@/utils/formatters";
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
  const [novoDiaVencimento, setNovoDiaVencimento] = useState("10");
  const [dataInicioCobranca, setDataInicioCobranca] = useState<string>("");
  const [dataFimCobranca, setDataFimCobranca] = useState<string>("");

  const [novaEscolaId, setNovaEscolaId] = useState("");
  const [novoPeriodo, setNovoPeriodo] = useState("");
  const [novaModalidade, setNovaModalidade] = useState("ida_volta");
  const [novaTurma, setNovaTurma] = useState("");
  const [novaSala, setNovaSala] = useState("");
  const [novoNomeProfessor, setNovoNomeProfessor] = useState("");
  const [novoVeiculoId, setNovoVeiculoId] = useState("");
  const [dataInicioTransporte, setDataInicioTransporte] = useState<string>("");
  const [dataFimTransporte, setDataFimTransporte] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        : "";
      setDataInicioTransporte(dtInicioTransp);

      const dtFimTransp = passageiro.nova_data_fim_transporte
        ? formatDateToBR(passageiro.nova_data_fim_transporte)
        : "";
      setDataFimTransporte(dtFimTransp);

      const dtInicioCobr = passageiro.nova_data_inicio_cobranca
        ? formatDateToBR(passageiro.nova_data_inicio_cobranca)
        : "";
      setDataInicioCobranca(dtInicioCobr);

      const dtFimCobr = passageiro.nova_data_fim_cobranca
        ? formatDateToBR(passageiro.nova_data_fim_cobranca)
        : "";
      setDataFimCobranca(dtFimCobr);
    }
  }, [passageiro, escolasList, veiculosList, anoDestino]);

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
      if (!dataInicioCobranca || dataInicioCobranca.trim().length !== 10) {
        newErrors.dataInicioCobranca = "Informe a data de início da cobrança";
      }
      if (!dataFimCobranca || dataFimCobranca.trim().length !== 10) {
        newErrors.dataFimCobranca = "Informe a data de término da cobrança";
      }
    }

    if (!novaEscolaId) {
      newErrors.novaEscolaId = "Selecione a escola";
    }
    if (!novoPeriodo) {
      newErrors.novoPeriodo = "Selecione o período";
    }
    if (!novaModalidade) {
      newErrors.novaModalidade = "Selecione a modalidade";
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
        title={passageiro?.nome ? `Reserva • ${formatFirstName(passageiro.nome)}` : "Reserva de Vaga"}
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
                title="Aluno Confirmado com Fluxo de Contrato"
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

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[#0a0a0a] font-medium text-xs">
                    Início Cobrança <span className="text-[#e7000b]">*</span>
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                    <Input
                      value={dataInicioCobranca}
                      onChange={(e) => {
                        setDataInicioCobranca(dateMask(e.target.value));
                        if (errors.dataInicioCobranca) setErrors((prev) => ({ ...prev, dataInicioCobranca: "" }));
                      }}
                      placeholder="dd/mm/aaaa"
                      className={cn(
                        "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full",
                        errors.dataInicioCobranca && "border-[#e7000b] focus:border-[#e7000b] focus:ring-[#e7000b]"
                      )}
                      aria-invalid={!!errors.dataInicioCobranca}
                    />
                  </div>
                  {errors.dataInicioCobranca && <p className="text-xs text-[#e7000b] mt-1">{errors.dataInicioCobranca}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#0a0a0a] font-medium text-xs">
                    Fim Cobrança <span className="text-[#e7000b]">*</span>
                  </Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                    <Input
                      value={dataFimCobranca}
                      onChange={(e) => {
                        setDataFimCobranca(dateMask(e.target.value));
                        if (errors.dataFimCobranca) setErrors((prev) => ({ ...prev, dataFimCobranca: "" }));
                      }}
                      placeholder="dd/mm/aaaa"
                      className={cn(
                        "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full",
                        errors.dataFimCobranca && "border-[#e7000b] focus:border-[#e7000b] focus:ring-[#e7000b]"
                      )}
                      aria-invalid={!!errors.dataFimCobranca}
                    />
                  </div>
                  {errors.dataFimCobranca && <p className="text-xs text-[#e7000b] mt-1">{errors.dataFimCobranca}</p>}
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
                  Período <span className="text-[#e7000b]">*</span>
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
                  Modalidade <span className="text-[#e7000b]">*</span>
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
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={dataInicioTransporte}
                    onChange={(e) => setDataInicioTransporte(dateMask(e.target.value))}
                    placeholder="dd/mm/aaaa"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Fim do Transporte <span className="text-[#737373] font-normal text-xs">(opcional)</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={dataFimTransporte}
                    onChange={(e) => setDataFimTransporte(dateMask(e.target.value))}
                    placeholder="dd/mm/aaaa"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                  />
                </div>
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
