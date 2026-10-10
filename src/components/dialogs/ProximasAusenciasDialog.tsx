import { useState, useMemo, useEffect, useRef } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Banner } from "@/components/ui/Banner";
import { RotaMultiSelect } from "@/components/ui/RotaMultiSelect";
import { PeriodoAusenciaCampos } from "@/components/ui/PeriodoAusenciaCampos";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useProximasAusencias, useRoutes, useBuscarAlunos, useRegistrarAusenciaMutation, AusenciaFuturaItem } from "@/hooks/api/useRoutes";
import { routeApi } from "@/services/api/route.api";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useAppPreferences } from "@/hooks/business/useAppPreferences";
import { parseLocalDate, getShortWeekDayBR } from "@/utils/dateUtils";
import { formatShortName, getInitials, formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { toast } from "@/utils/notifications/toast";
import { Calendar, CalendarCheck2, Bus, User, UserPlus, ChevronDown, Loader2, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Route } from "@/types/route";
import { useQueryClient } from "@tanstack/react-query";

export interface ProximasAusenciasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedRotaId?: string;
  lockedRotaNome?: string;
}

type TabMode = "dia" | "rota";

interface AlunoAusenciaNode {
  id: string;
  passageiroId: string;
  nome: string;
  rotaId: string;
  rotaNome: string;
  dataAusencia: string;
  turma?: string | null;
  escolaNome?: string | null;
  responsavelNome?: string | null;
}

interface RotaGroupInDia {
  rotaId: string;
  rotaNome: string;
  alunos: AlunoAusenciaNode[];
}

interface DiaGroupItem {
  dataStr: string;
  dataLabel: string;
  rotas: RotaGroupInDia[];
  totalAlunos: number;
}

interface DiaGroupInRota {
  dataStr: string;
  dataLabel: string;
  alunos: AlunoAusenciaNode[];
}

interface RotaGroupItem {
  rotaId: string;
  rotaNome: string;
  dias: DiaGroupInRota[];
  totalAlunos: number;
}

function formatarDataAusencia(dataStr: string): string {
  const d = parseLocalDate(dataStr);
  const diaSemana = getShortWeekDayBR(d);
  const dia = d.getDate().toString().padStart(2, "0");
  const mes = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${diaSemana}, ${dia}/${mes}`;
}

export function ProximasAusenciasDialog({
  open,
  onOpenChange,
  lockedRotaId,
  lockedRotaNome,
}: ProximasAusenciasDialogProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("dia");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { user } = useSession();
  const { donoContaId } = useProfile(user?.id);
  const { formatoNomeResponsavel } = useAppPreferences();
  const usuarioId = donoContaId || user?.id || "";

  const queryClient = useQueryClient();

  const [selectedRotasIds, setSelectedRotasIds] = useState<string[]>(lockedRotaId ? [lockedRotaId] : []);
  const [alunoRotas, setAlunoRotas] = useState<Route[]>([]);
  const [formPassageiroId, setFormPassageiroId] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState<{ id: string; nome: string } | null>(null);
  const [searchAluno, setSearchAluno] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingRotasAluno, setIsLoadingRotasAluno] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [keepOpen, setKeepOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const alunoSearchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alunoSearchContainerRef.current &&
        !alunoSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchAluno);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchAluno]);

  const { data: rotasList = [], isLoading: isLoadingRotas } = useRoutes(usuarioId, {
    enabled: open && !lockedRotaId && !!usuarioId,
  });

  const activeRotaIdForSearch = lockedRotaId || undefined;
  const { data: alunosEncontrados = [], isLoading: isLoadingAlunos } = useBuscarAlunos({
    search: debouncedSearch,
    rotaId: activeRotaIdForSearch,
    enabled: open && isRegisterOpen && debouncedSearch.trim().length >= 3,
  });

  const registrarMutation = useRegistrarAusenciaMutation();

  const {
    data: ausencias = [],
    isLoading,
    isFetching,
    isError,
  } = useProximasAusencias({
    rotaId: lockedRotaId,
    enabled: open,
  });

  const isCarregandoAusencias = isLoading && ausencias.length === 0;

  const rotasDisponiveis = useMemo(() => {
    if (lockedRotaId) return [];
    if (alunoRotas.length > 0) return alunoRotas;
    return (rotasList as Route[]) || [];
  }, [lockedRotaId, alunoRotas, rotasList]);

  useEffect(() => {
    if (open) {
      setSelectedRotasIds(lockedRotaId ? [lockedRotaId] : []);
      setAlunoRotas([]);
      setFormPassageiroId("");
      setAlunoSelecionado(null);
      setSearchAluno("");
      setDebouncedSearch("");
      setIsDropdownOpen(false);
      setDataInicio("");
      setDataFim("");
      setKeepOpen(false);
      setFormErrors({});
      setIsRegisterOpen(false);
    }
  }, [open, lockedRotaId]);

  useEffect(() => {
    if (open && !lockedRotaId && alunoRotas.length === 1 && selectedRotasIds.length === 0) {
      setSelectedRotasIds([alunoRotas[0].id]);
    }
  }, [open, lockedRotaId, alunoRotas, selectedRotasIds.length]);

  const handleSelectAluno = async (aluno: { id: string; nome: string }) => {
    setFormPassageiroId(aluno.id);
    setAlunoSelecionado(aluno);
    setSearchAluno(aluno.nome);
    setIsDropdownOpen(false);
    setFormErrors((prev) => ({ ...prev, passageiroId: "" }));

    if (lockedRotaId) {
      setSelectedRotasIds([lockedRotaId]);
    } else {
      try {
        setIsLoadingRotasAluno(true);
        const rotasDoAluno = await routeApi.listRotasByPassageiro(aluno.id);
        const listaRotas: Route[] = (rotasDoAluno || []).map((r: any) => r.rota || r);
        setAlunoRotas(listaRotas);
        if (listaRotas.length === 1) {
          setSelectedRotasIds([listaRotas[0].id]);
          setFormErrors((prev) => ({ ...prev, rotas: "" }));
        } else {
          setSelectedRotasIds([]);
        }
      } catch {
        setAlunoRotas([]);
      } finally {
        setIsLoadingRotasAluno(false);
      }
    }
  };

  const handleClearAluno = () => {
    setFormPassageiroId("");
    setAlunoSelecionado(null);
    setSearchAluno("");
    setDebouncedSearch("");
    setIsDropdownOpen(false);
    if (!lockedRotaId) {
      setSelectedRotasIds([]);
      setAlunoRotas([]);
    }
  };

  const handleSalvarAusencia = async () => {
    const errors: Record<string, string> = {};
    if (!formPassageiroId) errors.passageiroId = "Selecione um aluno";
    if (selectedRotasIds.length === 0) errors.rotas = "Selecione ao menos uma rota";
    if (!dataInicio) errors.dataInicio = "Informe a data da ausência";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const dataFimFinal = dataFim || dataInicio;

    try {
      await registrarMutation.mutateAsync({
        passageiro_id: formPassageiroId,
        rotas_ids: selectedRotasIds,
        data_inicio: dataInicio,
        data_fim: dataFimFinal,
      });

      toast.success(
        keepOpen
          ? "Ausência registrada! Selecione a próxima data."
          : "Ausência registrada com sucesso!"
      );

      await queryClient.invalidateQueries({ queryKey: ["route-ausencias-futuras"] });
      selectedRotasIds.forEach((rId) => {
        queryClient.invalidateQueries({ queryKey: ["route-ausencias", rId] });
        queryClient.invalidateQueries({ queryKey: ["route-passageiro-ausencias", rId] });
      });
      queryClient.invalidateQueries({ queryKey: ["route-execution"] });

      setDataInicio("");
      setDataFim("");
      setFormErrors({});

      if (!keepOpen) {
        setFormPassageiroId("");
        setAlunoSelecionado(null);
        setSearchAluno("");
        setDebouncedSearch("");
        if (!lockedRotaId) {
          setSelectedRotasIds([]);
          setAlunoRotas([]);
        }
        setIsRegisterOpen(false);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(errorObj?.response?.data?.message || "Erro ao registrar ausência.");
    }
  };

  const parsedItems: AlunoAusenciaNode[] = useMemo(() => {
    return (ausencias as AusenciaFuturaItem[]).map((item) => ({
      id: item.id,
      passageiroId: item.passageiro?.id || item.id,
      nome: item.passageiro?.nome || "Aluno",
      rotaId: item.rota?.id || "",
      rotaNome: item.rota?.nome || "Rota",
      dataAusencia: item.data_ausencia,
      turma: item.passageiro?.turma || null,
      escolaNome: item.passageiro?.escola_nome || null,
      responsavelNome: item.passageiro?.responsavel_nome || null,
    }));
  }, [ausencias]);

  const treePorDia = useMemo<DiaGroupItem[]>(() => {
    const map = new Map<string, Map<string, AlunoAusenciaNode[]>>();

    parsedItems.forEach((item) => {
      if (!map.has(item.dataAusencia)) {
        map.set(item.dataAusencia, new Map());
      }
      const rotasMap = map.get(item.dataAusencia)!;
      if (!rotasMap.has(item.rotaId)) {
        rotasMap.set(item.rotaId, []);
      }
      rotasMap.get(item.rotaId)!.push(item);
    });

    const resultado: DiaGroupItem[] = [];
    Array.from(map.entries())
      .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
      .forEach(([dataStr, rotasMap]) => {
        const rotas: RotaGroupInDia[] = [];
        let totalNoDia = 0;

        Array.from(rotasMap.entries()).forEach(([rId, alunos]) => {
          totalNoDia += alunos.length;
          rotas.push({
            rotaId: rId,
            rotaNome: alunos[0]?.rotaNome || "Rota",
            alunos,
          });
        });

        resultado.push({
          dataStr,
          dataLabel: formatarDataAusencia(dataStr),
          rotas,
          totalAlunos: totalNoDia,
        });
      });

    return resultado;
  }, [parsedItems]);

  const treePorRota = useMemo<RotaGroupItem[]>(() => {
    const map = new Map<string, Map<string, AlunoAusenciaNode[]>>();

    parsedItems.forEach((item) => {
      if (!map.has(item.rotaId)) {
        map.set(item.rotaId, new Map());
      }
      const diasMap = map.get(item.rotaId)!;
      if (!diasMap.has(item.dataAusencia)) {
        diasMap.set(item.dataAusencia, []);
      }
      diasMap.get(item.dataAusencia)!.push(item);
    });

    const resultado: RotaGroupItem[] = [];
    Array.from(map.entries()).forEach(([rId, diasMap]) => {
      const dias: DiaGroupInRota[] = [];
      let totalNaRota = 0;

      Array.from(diasMap.entries())
        .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
        .forEach(([dataStr, alunos]) => {
          totalNaRota += alunos.length;
          dias.push({
            dataStr,
            dataLabel: formatarDataAusencia(dataStr),
            alunos,
          });
        });

      const rotaNomePrimeiro = dias[0]?.alunos[0]?.rotaNome || "Rota";
      resultado.push({
        rotaId: rId,
        rotaNome: rotaNomePrimeiro,
        dias,
        totalAlunos: totalNaRota,
      });
    });

    return resultado;
  }, [parsedItems]);

  const renderAlunoCard = (aluno: AlunoAusenciaNode) => {
    const respName = aluno.responsavelNome ? formatNomeResponsavelExibicao(aluno.responsavelNome, formatoNomeResponsavel) : null;

    return (
      <div
        key={aluno.id}
        className="bg-white border border-[#e5e5e5] rounded-[18px] p-3 shadow-xs flex items-center gap-3 transition-all"
      >
        <Avatar className="w-8 h-8 shrink-0 border border-[#e5e5e5]">
          <AvatarFallback className="text-[10px] font-semibold bg-[#f5f5f5] text-[#0a0a0a]">
            {getInitials(aluno.nome) || <User className="w-3.5 h-3.5" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] truncate">
              {formatShortName(aluno.nome, true)}
            </span>
            {aluno.turma && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-[18px] bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] shrink-0">
                {aluno.turma}
              </span>
            )}
          </div>

          {(respName || aluno.escolaNome) && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#737373] font-normal truncate mt-0.5">
              {respName && (
                <>
                  <span className="truncate text-[#737373]">
                    {respName}
                  </span>
                  {aluno.escolaNome && <span className="text-[#d4d4d4]">•</span>}
                </>
              )}
              {aluno.escolaNome && (
                <span className="truncate text-[#737373]">
                  {aluno.escolaNome}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const dialogDescription = lockedRotaNome
    ? `Ausências registradas para a rota "${lockedRotaNome}"`
    : "Ausências futuras registradas para suas rotas";

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} maxWidth="md" description={dialogDescription}>
      <BaseDialog.Header
        title="Próximas Ausências"
        subtitle={dialogDescription}
        onClose={handleClose}
      />

      <BaseDialog.Body className="p-4 sm:p-6 space-y-4">
        <div className="border border-[#e5e5e5] rounded-[24px] p-3.5 bg-white shadow-xs transition-all">
          <button
            type="button"
            onClick={() => setIsRegisterOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-[#0a0a0a] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5]">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Registrar Ausência</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#737373] text-xs">
              <span>{isRegisterOpen ? "Fechar" : "Nova"}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isRegisterOpen && "rotate-180")} />
            </div>
          </button>

          {isRegisterOpen && (
            <div className="mt-4 pt-4 border-t border-[#e5e5e5] space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-[#737373]">
                  Aluno <span className="text-[#e7000b]">*</span>
                </Label>
                <div ref={alunoSearchContainerRef} className="relative">
                  <input
                    type="text"
                    placeholder="Digite o nome do aluno..."
                    value={searchAluno}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchAluno(val);
                      if (alunoSelecionado && val !== alunoSelecionado.nome) {
                        setAlunoSelecionado(null);
                        setFormPassageiroId("");
                        if (!lockedRotaId) {
                          setSelectedRotasIds([]);
                          setAlunoRotas([]);
                        }
                      }
                      setIsDropdownOpen(val.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (!alunoSelecionado && searchAluno.trim().length > 0) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    className={cn(
                      "w-full h-11 pl-3.5 pr-9 rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] text-sm text-[#0a0a0a] font-normal focus:outline-none focus:bg-white focus:border-[#0a0a0a] placeholder:text-[#737373] transition-colors",
                      formErrors.passageiroId && "border-[#e7000b]"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isLoadingAlunos || isLoadingRotasAluno ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#737373]" />
                    ) : alunoSelecionado ? (
                      <button
                        type="button"
                        onClick={handleClearAluno}
                        className="text-[#737373] hover:text-[#0a0a0a] cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Search className="w-3.5 h-3.5 text-[#737373] pointer-events-none" />
                    )}
                  </div>

                  {isDropdownOpen && !alunoSelecionado && searchAluno.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 p-1 bg-white border border-[#e5e5e5] rounded-[18px] shadow-lg z-50 max-h-52 overflow-y-auto divide-y divide-[#f5f5f5] animate-in fade-in slide-in-from-top-1 duration-150">
                      {searchAluno.trim().length < 3 ? (
                        <div className="p-3 text-[11px] text-[#737373] text-center font-normal">
                          Digite pelo menos 3 letras para buscar...
                        </div>
                      ) : isLoadingAlunos ? (
                        <div className="p-3 text-[11px] text-[#737373] text-center flex items-center justify-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a0a0a]" />
                          <span>Buscando alunos...</span>
                        </div>
                      ) : alunosEncontrados.length === 0 ? (
                        <div className="p-3 text-[11px] text-[#737373] text-center font-normal">
                          Nenhum aluno encontrado{activeRotaIdForSearch ? " nesta rota" : ""}.
                        </div>
                      ) : (
                        alunosEncontrados.map((aluno) => {
                          const isSelected = aluno.id === formPassageiroId;
                          const respName = aluno.responsavel_nome ? formatNomeResponsavelExibicao(aluno.responsavel_nome, formatoNomeResponsavel) : null;

                          return (
                            <button
                              key={aluno.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectAluno(aluno);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-xs rounded-[14px] hover:bg-[#f5f5f5] transition-colors flex items-center justify-between gap-2 cursor-pointer",
                                isSelected && "bg-[#f5f5f5] font-semibold text-[#0a0a0a]"
                              )}
                            >
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="truncate font-semibold text-[#0a0a0a]">
                                    {formatShortName(aluno.nome, true)}
                                  </span>
                                  {aluno.turma && (
                                    <span className="text-[10px] text-[#737373] font-medium px-1.5 py-0.2 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] shrink-0">
                                      {aluno.turma}
                                    </span>
                                  )}
                                </div>
                                {(respName || aluno.escola_nome) && (
                                  <div className="flex items-center gap-1 text-[10px] text-[#737373] font-normal truncate mt-0.5">
                                    {respName && (
                                      <>
                                        <span className="text-[#737373] truncate">{respName}</span>
                                        {aluno.escola_nome && <span className="text-[#d4d4d4]">•</span>}
                                      </>
                                    )}
                                    {aluno.escola_nome && (
                                      <span className="truncate text-[#737373]">{aluno.escola_nome}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0a0a0a] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                {formErrors.passageiroId && <p className="text-[11px] text-[#e7000b] font-medium">{formErrors.passageiroId}</p>}
              </div>

              {alunoSelecionado && !isLoadingRotasAluno && alunoRotas.length === 0 && !lockedRotaId && (
                <Banner
                  variant="warning"
                  description="Este aluno não está vinculado a nenhuma rota ativa."
                />
              )}

              {!lockedRotaId && (
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-[#737373]">
                    Rotas <span className="text-[#e7000b]">*</span>
                  </Label>
                  <RotaMultiSelect
                    rotas={rotasDisponiveis}
                    selectedIds={selectedRotasIds}
                    onChange={(ids) => {
                      setSelectedRotasIds(ids);
                      if (formErrors.rotas) setFormErrors((prev) => ({ ...prev, rotas: "" }));
                    }}
                    disabled={isLoadingRotas || isLoadingRotasAluno || rotasDisponiveis.length === 0}
                    hasError={Boolean(formErrors.rotas)}
                    placeholder={
                      !alunoSelecionado
                        ? "Selecione o aluno primeiro"
                        : rotasDisponiveis.length === 0
                        ? "Nenhuma rota disponível"
                        : "Selecione a(s) rota(s)"
                    }
                  />
                  {formErrors.rotas && <p className="text-[11px] text-[#e7000b] font-medium">{formErrors.rotas}</p>}
                </div>
              )}

              <PeriodoAusenciaCampos
                dataInicio={dataInicio}
                dataFim={dataFim}
                onDataInicioChange={(data) => {
                  setDataInicio(data);
                  if (formErrors.dataInicio) setFormErrors((prev) => ({ ...prev, dataInicio: "" }));
                }}
                onDataFimChange={(data) => {
                  setDataFim(data);
                  if (formErrors.dataFim) setFormErrors((prev) => ({ ...prev, dataFim: "" }));
                }}
                errors={{
                  dataInicio: formErrors.dataInicio,
                  dataFim: formErrors.dataFim,
                }}
              />

              <div className="flex items-center gap-2.5 pt-0.5 px-0.5">
                <Checkbox
                  id="keepOpenProximasAusencias"
                  checked={keepOpen}
                  onCheckedChange={(checked) => setKeepOpen(Boolean(checked))}
                />
                <label
                  htmlFor="keepOpenProximasAusencias"
                  className="text-[13px] text-[#737373] hover:text-[#0a0a0a] font-medium cursor-pointer select-none"
                >
                  Cadastrar outra em seguida
                </label>
              </div>

              <Button
                type="button"
                onClick={handleSalvarAusencia}
                disabled={registrarMutation.isPending}
                className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-semibold text-sm rounded-[18px] transition-all active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-2 border-none"
              >
                {registrarMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <UserPlus className="w-4 h-4 shrink-0" />
                )}
                <span>Salvar Ausência</span>
              </Button>
            </div>
          )}
        </div>

        {!lockedRotaId && (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabMode)}
            className="w-full"
          >
            <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5]">
              <TabsList className="grid grid-cols-2 w-full min-h-[38px] sm:min-h-[42px] bg-transparent p-0 gap-1 mt-0 border-0">
                <TabsTrigger
                  value="dia"
                  className={cn(
                    "w-full rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer justify-center whitespace-nowrap",
                    "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                    "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
                  )}
                >
                  Por Dia
                </TabsTrigger>
                <TabsTrigger
                  value="rota"
                  className={cn(
                    "w-full rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer justify-center whitespace-nowrap",
                    "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                    "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
                  )}
                >
                  Por Rota
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        )}

        <div className="max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin space-y-4">
          {isCarregandoAusencias ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28 rounded-[12px]" />
                <div className="pl-3.5 ml-1 border-l-2 border-[#e5e5e5] space-y-2">
                  <Skeleton className="h-12 w-full rounded-[18px]" />
                  <Skeleton className="h-12 w-full rounded-[18px]" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28 rounded-[12px]" />
                <div className="pl-3.5 ml-1 border-l-2 border-[#e5e5e5] space-y-2">
                  <Skeleton className="h-12 w-full rounded-[18px]" />
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs sm:text-sm font-medium text-[#e7000b]">
                Ocorreu um erro ao carregar as ausências. Tente novamente mais tarde.
              </p>
            </div>
          ) : parsedItems.length === 0 ? (
            <UnifiedEmptyState
              icon={CalendarCheck2}
              title="Nenhuma ausência futura"
              description="Todos os alunos estão confirmados para os próximos dias de rota."
            />
          ) : lockedRotaId ? (
            <div className="space-y-4">
              {treePorDia.map((grupoDia) => (
                <div key={grupoDia.dataStr} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0a0a0a] shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                      {grupoDia.dataLabel}
                    </span>
                  </div>

                  <div className="relative pl-3.5 ml-1 border-l-2 border-[#e5e5e5] space-y-1.5">
                    {grupoDia.rotas.flatMap((r) => r.alunos).map(renderAlunoCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "dia" ? (
            <div className="space-y-5">
              {treePorDia.map((grupoDia) => (
                <div key={grupoDia.dataStr} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[8px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                      {grupoDia.dataLabel}
                    </span>
                  </div>

                  <div className="relative pl-3.5 ml-3 border-l-2 border-[#e5e5e5] space-y-3">
                    {grupoDia.rotas.map((rota) => (
                      <div key={rota.rotaId} className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] text-[11px] font-medium">
                          <Bus className="w-3 h-3 text-[#0a0a0a] shrink-0" />
                          <span className="truncate max-w-[220px] sm:max-w-none">{rota.rotaNome}</span>
                        </div>

                        <div className="space-y-1.5 pl-2">
                          {rota.alunos.map(renderAlunoCard)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {treePorRota.map((grupoRota) => (
                <div key={grupoRota.rotaId} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[8px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                      <Bus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a] truncate">
                      {grupoRota.rotaNome}
                    </span>
                  </div>

                  <div className="relative pl-3.5 ml-3 border-l-2 border-[#e5e5e5] space-y-3">
                    {grupoRota.dias.map((dia) => (
                      <div key={dia.dataStr} className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] text-[11px] font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#0a0a0a]" />
                          <span>{dia.dataLabel}</span>
                        </div>

                        <div className="space-y-1.5 pl-2">
                          {dia.alunos.map(renderAlunoCard)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
