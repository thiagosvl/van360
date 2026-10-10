import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { RotaMultiSelect } from "@/components/ui/RotaMultiSelect";
import { PeriodoAusenciaCampos } from "@/components/ui/PeriodoAusenciaCampos";
import { CalendarX, Search, Check, Loader2 } from "lucide-react";
import { useRoutes, useRouteDetail, usePassageiroRotas, useRegistrarAusenciaMutation } from "@/hooks/api/useRoutes";
import { routeApi } from "@/services/api/route.api";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { Route } from "@/types/route";

export interface RegistrarAusenciaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lockedRotaId?: string;
  lockedPassageiro?: { id: string; nome: string };
}

export function RegistrarAusenciaDialog({
  isOpen,
  onClose,
  lockedRotaId,
  lockedPassageiro,
}: RegistrarAusenciaDialogProps) {
  const { user } = useSession();
  const { donoContaId } = useProfile(user?.id);
  const usuarioId = donoContaId || user?.id || "";

  const { data: rotasList = [], isLoading: isLoadingRotas } = useRoutes(usuarioId, {
    enabled: isOpen && !!usuarioId,
  });

  const [selectedRotasIds, setSelectedRotasIds] = useState<string[]>([]);
  const [passageiroId, setPassageiroId] = useState("");
  const [passageiroNomeSelected, setPassageiroNomeSelected] = useState("");
  const [searchPassageiro, setSearchPassageiro] = useState("");
  const [isPassageiroDropdownOpen, setIsPassageiroDropdownOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [keepOpen, setKeepOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alunoRotasAvulsas, setAlunoRotasAvulsas] = useState<Array<{ id: string; nome: string }>>([]);
  const [isLoadingAlunoRotas, setIsLoadingAlunoRotas] = useState(false);

  const initialRotaIdForDetail = lockedRotaId || selectedRotasIds[0] || "";
  const { data: routeDetail, isLoading: isLoadingRouteDetail } = useRouteDetail(initialRotaIdForDetail);
  const { data: passageiroRotas = [], isLoading: isLoadingPassageiroRotas } = usePassageiroRotas(lockedPassageiro?.id || "");

  const registrarMutation = useRegistrarAusenciaMutation();

  const rotasDisponiveis = useMemo(() => {
    if (lockedPassageiro?.id) {
      return (passageiroRotas as Route[]) || [];
    }
    if (alunoRotasAvulsas.length > 0) {
      return alunoRotasAvulsas as Route[];
    }
    return (rotasList as Route[]) || [];
  }, [lockedPassageiro?.id, passageiroRotas, alunoRotasAvulsas, rotasList]);

  const hasNoRoutesForStudent = useMemo(() => {
    if (lockedPassageiro && !isLoadingPassageiroRotas) {
      return passageiroRotas.length === 0;
    }
    if (passageiroId && !isLoadingAlunoRotas && alunoRotasAvulsas.length === 0 && !lockedRotaId) {
      return true;
    }
    return false;
  }, [lockedPassageiro, isLoadingPassageiroRotas, passageiroRotas, passageiroId, isLoadingAlunoRotas, alunoRotasAvulsas, lockedRotaId]);

  useEffect(() => {
    if (isOpen) {
      setIsPassageiroDropdownOpen(false);
      setDataInicio("");
      setDataFim("");
      setKeepOpen(false);
      setErrors({});
      setAlunoRotasAvulsas([]);

      if (lockedPassageiro) {
        setPassageiroId(lockedPassageiro.id);
        setPassageiroNomeSelected(lockedPassageiro.nome);
        setSearchPassageiro(lockedPassageiro.nome);
        setSelectedRotasIds(passageiroRotas.length === 1 ? [passageiroRotas[0].id] : []);
      } else {
        setPassageiroId("");
        setPassageiroNomeSelected("");
        setSearchPassageiro("");
        setSelectedRotasIds(lockedRotaId ? [lockedRotaId] : []);
      }
    }
  }, [isOpen, lockedPassageiro, lockedRotaId, passageiroRotas]);

  useEffect(() => {
    if (isOpen && rotasDisponiveis.length === 1 && selectedRotasIds.length === 0) {
      setSelectedRotasIds([rotasDisponiveis[0].id]);
    }
  }, [isOpen, rotasDisponiveis, selectedRotasIds.length]);

  const passageirosDisponiveis = useMemo(() => {
    if (!initialRotaIdForDetail || !routeDetail?.paradas) return [];

    const passageirosMap = new Map<string, Passageiro>();
    routeDetail.paradas.forEach((p: { passageiro_id?: string; passageiro?: Passageiro }) => {
      const pid = p.passageiro_id || p.passageiro?.id;
      if (pid && p.passageiro) {
        passageirosMap.set(pid, p.passageiro);
      }
    });

    return Array.from(passageirosMap.values());
  }, [initialRotaIdForDetail, routeDetail]);

  const filteredPassageiros = useMemo(() => {
    if (!searchPassageiro.trim()) return passageirosDisponiveis;
    const term = searchPassageiro.toLowerCase();
    return passageirosDisponiveis.filter((p) =>
      p.nome.toLowerCase().includes(term)
    );
  }, [passageirosDisponiveis, searchPassageiro]);

  const handleSelectPassageiro = async (p: Passageiro) => {
    setPassageiroId(p.id);
    setPassageiroNomeSelected(p.nome);
    setSearchPassageiro(p.nome);
    setIsPassageiroDropdownOpen(false);
    if (errors.passageiroId) setErrors((prev) => ({ ...prev, passageiroId: "" }));

    if (!lockedPassageiro) {
      setIsLoadingAlunoRotas(true);
      try {
        const rotasAluno = await routeApi.listRotasByPassageiro(p.id);
        if (Array.isArray(rotasAluno) && rotasAluno.length > 0) {
          setAlunoRotasAvulsas(rotasAluno);
          if (rotasAluno.length === 1) {
            setSelectedRotasIds([rotasAluno[0].id]);
          } else if (lockedRotaId && !selectedRotasIds.includes(lockedRotaId)) {
            setSelectedRotasIds([lockedRotaId]);
          }
        }
      } catch {
        // silencioso
      } finally {
        setIsLoadingAlunoRotas(false);
      }
    }
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (selectedRotasIds.length === 0) newErrors.rotas = "Selecione ao menos uma rota";
    if (!passageiroId) newErrors.passageiroId = "Selecione um aluno";
    if (!dataInicio) newErrors.dataInicio = "Informe a data da ausência";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataFimFinal = dataFim || dataInicio;

    try {
      await registrarMutation.mutateAsync({
        passageiro_id: passageiroId,
        rotas_ids: selectedRotasIds,
        data_inicio: dataInicio,
        data_fim: dataFimFinal,
      });

      if (keepOpen) {
        toast.success("Ausência registrada! Selecione a próxima data.");
        setDataInicio("");
        setDataFim("");
      } else {
        toast.success("Ausência registrada com sucesso!");
        handleClose();
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj?.response?.data?.message || "Erro ao registrar ausência.");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <BaseDialog.Header
        title="Registrar Ausência"
        subtitle="Informe as ausências previstas para as rotas do aluno"
        icon={<CalendarX className="w-5 h-5" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 text-left">
          {hasNoRoutesForStudent && (
            <Banner
              variant="warning"
              description="Este aluno não está vinculado a nenhuma rota ativa."
            />
          )}

          {/* Campo Aluno */}
          {!lockedPassageiro && (
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-[#737373]">
                Aluno <span className="text-[#e7000b]">*</span>
              </Label>

              <Popover open={isPassageiroDropdownOpen} onOpenChange={setIsPassageiroDropdownOpen}>
                <PopoverAnchor asChild>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Digite o nome do aluno"
                      disabled={isLoadingRouteDetail}
                      value={isPassageiroDropdownOpen ? searchPassageiro : passageiroNomeSelected || searchPassageiro}
                      onFocus={() => setIsPassageiroDropdownOpen(true)}
                      onClick={() => setIsPassageiroDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchPassageiro(e.target.value);
                        setIsPassageiroDropdownOpen(true);
                      }}
                      className={cn(
                        "h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-sm text-[#0a0a0a] font-normal placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] pr-9 cursor-text",
                        errors.passageiroId && "border-[#e7000b]"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none flex items-center justify-center">
                      {isLoadingRouteDetail || isLoadingAlunoRotas ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#737373]" />
                      ) : (
                        <Search className="w-4 h-4 text-[#737373]" />
                      )}
                    </div>
                  </div>
                </PopoverAnchor>

                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-1 bg-white border border-[#e5e5e5] rounded-[18px] shadow-xl z-[9999] max-h-56 overflow-y-auto overscroll-contain touch-auto divide-y divide-[#f5f5f5]"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  {filteredPassageiros.length === 0 ? (
                    <div className="p-3 text-xs text-[#737373] text-center font-normal">
                      Nenhum aluno encontrado.
                    </div>
                  ) : (
                    filteredPassageiros.map((p) => {
                      const isSelected = p.id === passageiroId;
                      const nomeEscola = p.escola?.nome || p.escola_nome;
                      const temTurmaOuEscola = Boolean(p.turma || nomeEscola);

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPassageiro(p)}
                          className={cn(
                            "w-full text-left p-2.5 rounded-[14px] hover:bg-[#f5f5f5] transition-colors flex items-center justify-between gap-2 cursor-pointer",
                            isSelected && "bg-[#f5f5f5] font-semibold text-[#0a0a0a]"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#0a0a0a] leading-snug truncate">
                              {p.nome}
                            </p>

                            {temTurmaOuEscola && (
                              <p className="text-[10px] text-[#737373] font-normal leading-tight mt-0.5 truncate">
                                {[p.turma, nomeEscola].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0a0a0a] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </PopoverContent>
              </Popover>

              {errors.passageiroId && (
                <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                  {errors.passageiroId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#737373]">
              Rotas <span className="text-[#e7000b]">*</span>
            </Label>
            <RotaMultiSelect
              rotas={rotasDisponiveis}
              selectedIds={selectedRotasIds}
              onChange={(ids) => {
                setSelectedRotasIds(ids);
                if (errors.rotas) setErrors((prev) => ({ ...prev, rotas: "" }));
              }}
              disabled={isLoadingRotas || (Boolean(lockedPassageiro) && isLoadingPassageiroRotas) || hasNoRoutesForStudent}
              hasError={Boolean(errors.rotas)}
              placeholder={
                lockedPassageiro && isLoadingPassageiroRotas
                  ? "Buscando rotas..."
                  : hasNoRoutesForStudent
                    ? "Nenhuma rota disponível"
                    : "Selecione a(s) rota(s)"
              }
            />
            {errors.rotas && (
              <p className="text-xs text-[#e7000b] font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.rotas}
              </p>
            )}
          </div>

          <PeriodoAusenciaCampos
            dataInicio={dataInicio}
            dataFim={dataFim}
            onDataInicioChange={(data) => {
              setDataInicio(data);
              if (errors.dataInicio) setErrors((prev) => ({ ...prev, dataInicio: "" }));
            }}
            onDataFimChange={(data) => {
              setDataFim(data);
              if (errors.dataFim) setErrors((prev) => ({ ...prev, dataFim: "" }));
            }}
            disabled={hasNoRoutesForStudent}
            errors={{
              dataInicio: errors.dataInicio,
              dataFim: errors.dataFim,
            }}
          />

          <div className="flex items-center gap-2.5 pt-0.5 px-0.5">
            <Checkbox
              id="keepOpenAusencia"
              checked={keepOpen}
              onCheckedChange={(checked) => setKeepOpen(Boolean(checked))}
            />
            <label
              htmlFor="keepOpenAusencia"
              className="text-[13px] text-[#737373] hover:text-[#0a0a0a] font-medium cursor-pointer select-none"
            >
              Cadastrar outra em seguida
            </label>
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={registrarMutation.isPending}
        />
        <BaseDialog.Action
          label={registrarMutation.isPending ? "Salvando..." : "Salvar"}
          onClick={handleSubmit}
          disabled={registrarMutation.isPending || hasNoRoutesForStudent}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default RegistrarAusenciaDialog;
