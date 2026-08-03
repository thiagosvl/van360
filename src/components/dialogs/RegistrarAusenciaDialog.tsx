import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarX, Search, Check, Loader2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRoutes, useRouteDetail, usePassageiroRotas, useRegistrarAusenciaMutation } from "@/hooks/api/useRoutes";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/hooks";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { Route } from "@/types/route";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface RegistrarAusenciaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lockedRotaId?: string;
  lockedPassageiro?: { id: string; nome: string };
}

export default function RegistrarAusenciaDialog({
  isOpen,
  onClose,
  lockedRotaId,
  lockedPassageiro,
}: RegistrarAusenciaDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const usuarioId = profile?.id || "";

  const { data: rotasList = [], isLoading: isLoadingRotas } = useRoutes(usuarioId);

  const [rotaId, setRotaId] = useState("");
  const [passageiroId, setPassageiroId] = useState("");
  const [passageiroNomeSelected, setPassageiroNomeSelected] = useState("");
  const [searchPassageiro, setSearchPassageiro] = useState("");
  const [isPassageiroDropdownOpen, setIsPassageiroDropdownOpen] = useState(false);
  const [dataAusencia, setDataAusencia] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: routeDetail, isLoading: isLoadingRouteDetail } = useRouteDetail(rotaId);

  const { data: passageiroRotas = [], isLoading: isLoadingPassageiroRotas } = usePassageiroRotas(lockedPassageiro?.id || "");

  const hasNoRoutesForStudent = useMemo(() => {
    return !!lockedPassageiro && !isLoadingPassageiroRotas && passageiroRotas.length === 0;
  }, [lockedPassageiro, isLoadingPassageiroRotas, passageiroRotas]);

  const registrarMutation = useRegistrarAusenciaMutation();

  const rotasDisponiveis = useMemo(() => {
    if (lockedPassageiro?.id) {
      return passageiroRotas as Route[];
    }
    return rotasList as Route[];
  }, [lockedPassageiro?.id, passageiroRotas, rotasList]);

  useEffect(() => {
    if (isOpen) {
      setIsPassageiroDropdownOpen(false);
      setDataAusencia("");
      setIsCalendarOpen(false);
      setErrors({});

      if (lockedPassageiro) {
        setPassageiroId(lockedPassageiro.id);
        setPassageiroNomeSelected(lockedPassageiro.nome);
        setSearchPassageiro(lockedPassageiro.nome);
        if (passageiroRotas.length === 1) {
          setRotaId(passageiroRotas[0].id);
        } else {
          setRotaId("");
        }
      } else {
        setPassageiroId("");
        setPassageiroNomeSelected("");
        setSearchPassageiro("");
        if (lockedRotaId) {
          setRotaId(lockedRotaId);
        } else {
          setRotaId("");
        }
      }
    }
  }, [isOpen, lockedRotaId, lockedPassageiro, passageiroRotas]);

  const passageirosDisponiveis = useMemo(() => {
    if (!rotaId || !routeDetail?.passageiros) return [];

    const passageirosMap = new Map<string, Passageiro>();
    routeDetail.passageiros.forEach((p: any) => {
      const pid = p.passageiro_id || p.passageiro?.id;
      if (pid && p.passageiro) {
        passageirosMap.set(pid, p.passageiro as Passageiro);
      }
    });

    return Array.from(passageirosMap.values());
  }, [rotaId, routeDetail]);

  const filteredPassageiros = useMemo(() => {
    if (!searchPassageiro.trim()) return passageirosDisponiveis;
    const term = searchPassageiro.toLowerCase();
    return passageirosDisponiveis.filter((p) =>
      p.nome.toLowerCase().includes(term)
    );
  }, [passageirosDisponiveis, searchPassageiro]);

  const handleRotaChange = (newRotaId: string) => {
    setRotaId(newRotaId);
    if (!lockedPassageiro) {
      setPassageiroId("");
      setPassageiroNomeSelected("");
      setSearchPassageiro("");
    }
    if (errors.rotaId) setErrors((prev) => ({ ...prev, rotaId: "" }));
  };

  const handleSelectPassageiro = (p: Passageiro) => {
    setPassageiroId(p.id);
    setPassageiroNomeSelected(p.nome);
    setSearchPassageiro(p.nome);
    setIsPassageiroDropdownOpen(false);
    if (errors.passageiroId) setErrors((prev) => ({ ...prev, passageiroId: "" }));
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!rotaId) newErrors.rotaId = "Selecione uma rota";
    if (!passageiroId) newErrors.passageiroId = "Selecione um passageiro";
    if (!dataAusencia) newErrors.dataAusencia = "Informe a data da ausência";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await registrarMutation.mutateAsync({
        passageiro_id: passageiroId,
        rota_id: rotaId,
        data_ausencia: dataAusencia,
      });

      toast.success("Ausência registrada com sucesso!");
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao registrar ausência.");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <BaseDialog.Header
        title="Registrar Ausência"
        icon={<CalendarX className="w-5 h-5" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 text-left">
          {hasNoRoutesForStudent && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-snug">
                Este passageiro não está vinculado a nenhuma rota.
              </p>
            </div>
          )}

          {/* Campo Rota */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Rota <span className="text-red-500">*</span>
            </Label>
            <Select
              value={rotaId}
              onValueChange={handleRotaChange}
              disabled={!!lockedRotaId || isLoadingRotas || (!!lockedPassageiro && isLoadingPassageiroRotas) || hasNoRoutesForStudent}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                  errors.rotaId && "border-red-500",
                  (lockedRotaId || hasNoRoutesForStudent) && "bg-slate-100 opacity-80 cursor-not-allowed font-medium text-slate-500"
                )}
              >
                <SelectValue
                  placeholder={
                    lockedPassageiro && isLoadingPassageiroRotas
                      ? "Buscando rotas..."
                      : hasNoRoutesForStudent
                        ? "Nenhuma rota disponível"
                        : "Selecione a rota"
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {rotasDisponiveis.map((r: Route) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {lockedRotaId && (
              <p className="text-[11px] text-slate-400 ml-1">
                Esta ausência será vinculada à rota atual em exibição.
              </p>
            )}
            {errors.rotaId && (
              <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.rotaId}
              </p>
            )}
          </div>

          {/* Campo Passageiro (Autocomplete quando não travado) */}
          {!lockedPassageiro && (
            <div className="space-y-1">
              <Label className="text-slate-700 font-semibold ml-1">
                Passageiro <span className="text-red-500">*</span>
              </Label>

              <Popover open={isPassageiroDropdownOpen && !!rotaId} onOpenChange={(open) => rotaId && setIsPassageiroDropdownOpen(open)}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={!rotaId ? "Selecione uma rota primeiro" : "Digite o nome"}
                      disabled={!rotaId || isLoadingRouteDetail}
                      value={isPassageiroDropdownOpen ? searchPassageiro : passageiroNomeSelected || searchPassageiro}
                      onFocus={() => {
                        if (!rotaId) return;
                        setIsPassageiroDropdownOpen(true);
                        setSearchPassageiro("");
                      }}
                      onChange={(e) => {
                        if (!rotaId) return;
                        setSearchPassageiro(e.target.value);
                        setIsPassageiroDropdownOpen(true);
                      }}
                      className={cn(
                        "h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base pr-9",
                        errors.passageiroId && "border-red-500",
                        (!rotaId || isLoadingRouteDetail) && "opacity-60 cursor-not-allowed"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
                      {isLoadingRouteDetail ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : (
                        <Search className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] max-h-56 overflow-y-auto overscroll-contain touch-auto divide-y divide-slate-100"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  {filteredPassageiros.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center font-medium">
                      Nenhum passageiro encontrado nesta rota.
                    </div>
                  ) : (
                    filteredPassageiros.map((p) => {
                      const isSelected = p.id === passageiroId;
                      const nomeEscola = p.escola?.nome || p.escola_nome;
                      const temTurmaOuEscola = !!(p.turma || nomeEscola);

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPassageiro(p)}
                          className={cn(
                            "w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer",
                            isSelected && "bg-slate-50 font-bold"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 leading-snug truncate">
                              {p.nome}
                            </p>

                            {temTurmaOuEscola && (
                              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                                {[p.turma, nomeEscola].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#1a3a5c] shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </PopoverContent>
              </Popover>

              {errors.passageiroId && (
                <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                  {errors.passageiroId}
                </p>
              )}
            </div>
          )}

          {/* Campo Data da Ausência */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Data da Ausência <span className="text-red-500">*</span>
            </Label>
            {(() => {
              const selectedDate = dataAusencia ? parseISO(dataAusencia) : undefined;

              return (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={hasNoRoutesForStudent}
                      className={cn(
                        "h-12 w-full rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left font-medium px-3.5 flex items-center justify-between shadow-none hover:bg-slate-100 transition-colors cursor-pointer",
                        !dataAusencia && "text-slate-400 font-normal",
                        dataAusencia && "text-slate-700 font-medium",
                        errors.dataAusencia && "border-red-500",
                        hasNoRoutesForStudent && "opacity-60 cursor-not-allowed bg-slate-100"
                      )}
                    >
                      <span>
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "dd/mm/aaaa"}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0 ml-auto" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999]">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setDataAusencia(format(date, "yyyy-MM-dd"));
                          if (errors.dataAusencia) setErrors((prev) => ({ ...prev, dataAusencia: "" }));
                          setIsCalendarOpen(false);
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              );
            })()}
            {errors.dataAusencia && (
              <p className="text-xs text-red-500 font-medium ml-1 mt-1.5 animate-in fade-in duration-200">
                {errors.dataAusencia}
              </p>
            )}
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
          onClick={() => handleSubmit()}
          disabled={registrarMutation.isPending || hasNoRoutesForStudent}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
