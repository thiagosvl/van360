import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { School, CalendarDays, DollarSign, Car, Sun, Users, Compass, User, Sparkles } from "lucide-react";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { modalidades, periodos } from "@/utils/formatters";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";

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

  // Financeiro
  const [novoValor, setNovoValor] = useState("");
  const [novoDiaVencimento, setNovoDiaVencimento] = useState("10");
  const [novoIsento, setNovoIsento] = useState(false);
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

      const diaVenc = passageiro.novo_dia_vencimento || passageiro.dia_vencimento_atual || 10;
      setNovoDiaVencimento(String(diaVenc));

      const escolaId = passageiro.nova_escola_id || passageiro.escola_id_atual || (escolasList[0]?.id ?? "");
      setNovaEscolaId(escolaId);

      const periodo = passageiro.novo_periodo || passageiro.periodo_atual || "manha";
      setNovoPeriodo(periodo);

      setNovaModalidade(passageiro.nova_modalidade || passageiro.modalidade_atual || "ida_volta");
      setNovaTurma(passageiro.nova_turma || "");
      setNovoNomeProfessor(passageiro.novo_nome_professor || "");

      const veiculoId = passageiro.novo_veiculo_id || passageiro.veiculo_id_atual || (veiculosList[0]?.id ?? "");
      setNovoVeiculoId(veiculoId);

      setNovoIsento(Boolean(passageiro.novo_isento ?? passageiro.isento_atual));

      if (passageiro.nova_data_inicio_transporte) {
        setDataInicioTransporte(formatDateToBR(passageiro.nova_data_inicio_transporte));
      }
      if (passageiro.nova_data_fim_transporte) {
        setDataFimTransporte(formatDateToBR(passageiro.nova_data_fim_transporte));
      }
      if (passageiro.nova_data_inicio_cobranca) {
        setDataInicioCobranca(formatDateToBR(passageiro.nova_data_inicio_cobranca));
      }
      if (passageiro.nova_data_fim_cobranca) {
        setDataFimCobranca(formatDateToBR(passageiro.nova_data_fim_cobranca));
      }
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
          novo_valor_cobranca: novoIsento ? 0 : moneyToNumber(novoValor),
          novo_dia_vencimento: Number(novoDiaVencimento) || 10,
          nova_escola_id: novaEscolaId || null,
          novo_periodo: novoPeriodo || null,
          nova_modalidade: novaModalidade || null,
          nova_turma: novaTurma || null,
          novo_nome_professor: novoNomeProfessor || null,
          novo_veiculo_id: novoVeiculoId || null,
          novo_isento: novoIsento,
          nova_data_inicio_transporte: dataInicioTransporte ? convertDateBrToISO(dataInicioTransporte) : undefined,
          nova_data_fim_transporte: dataFimTransporte ? convertDateBrToISO(dataFimTransporte) : undefined,
          nova_data_inicio_cobranca: dataInicioCobranca ? convertDateBrToISO(dataInicioCobranca) : undefined,
          nova_data_fim_cobranca: dataFimCobranca ? convertDateBrToISO(dataFimCobranca) : undefined,
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
        icon={<User className="w-5 h-5 text-[#1a3a5c]" />}
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

          {/* SEÇÃO 1: PARCELAS (FINANCEIRO) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c]">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              Parcelas
            </div>

            {/* Isenção de Cobrança */}
            <div className="flex flex-row items-center justify-between rounded-2xl bg-slate-50/70 border border-slate-200/80 p-4">
              <div className="space-y-0.5 pr-4">
                <Label className="text-slate-800 font-bold text-sm cursor-pointer">
                  Passageiro Isento
                </Label>
                <div className="text-xs text-slate-500 font-normal leading-relaxed">
                  Ative para filhos, parentes ou cortesias. Nenhuma cobrança ou parcela será gerada.
                </div>
              </div>
              <Switch
                checked={novoIsento}
                onCheckedChange={setNovoIsento}
                className="data-[state=checked]:bg-[#1a3a5c]"
              />
            </div>

            {/* Valor da Cobrança */}
            {!novoIsento && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-semibold ml-1 text-sm">
                    Valor da Cobrança <span className="text-red-600">*</span>
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
          </div>

          <hr className="border-slate-100" />

          {/* SEÇÃO 2: ESCOLA E TRANSPORTE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c]">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                <Car className="w-5 h-5" />
              </div>
              Escola e Transporte
            </div>

            <div className="space-y-4">
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
                    {escolasList.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Turno */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Turno <span className="text-red-600">*</span>
                </Label>
                <Select value={novoPeriodo} onValueChange={setNovoPeriodo}>
                  <div className="relative">
                    <Sun className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                    <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {periodos.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modalidade */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Modalidade
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

              {/* Turma */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Turma / Série
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
                  Nome do Professor(a)
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                  <Input
                    value={novoNomeProfessor}
                    onChange={(e) => setNovoNomeProfessor(e.target.value)}
                    placeholder="Ex: Professora Juliana"
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-slate-700 font-normal w-full"
                  />
                </div>
              </div>

              {/* Veículo */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold ml-1 text-sm">
                  Veículo <span className="text-red-600">*</span>
                </Label>
                <Select value={novoVeiculoId} onValueChange={setNovoVeiculoId}>
                  <div className="relative">
                    <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                    <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-sm sm:text-base text-left text-slate-700 font-normal w-full">
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                  </div>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {veiculosList.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.modelo} ({formatarPlacaExibicao(v.placa)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
