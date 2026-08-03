import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarX, Search, Check, Loader2 } from "lucide-react";
import { useRoutes, useRouteDetail, useRegistrarAusenciaMutation } from "@/hooks/api/useRoutes";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { toast } from "@/utils/notifications/toast";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { Route, RouteNodeType } from "@/types/route";

export interface RegistrarAusenciaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lockedRotaId?: string;
}

export default function RegistrarAusenciaDialog({
  isOpen,
  onClose,
  lockedRotaId,
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: routeDetail, isLoading: isLoadingRouteDetail } = useRouteDetail(rotaId);

  const registrarMutation = useRegistrarAusenciaMutation();

  useEffect(() => {
    if (isOpen) {
      setPassageiroId("");
      setPassageiroNomeSelected("");
      setSearchPassageiro("");
      setIsPassageiroDropdownOpen(false);
      setDataAusencia("");
      setErrors({});

      if (lockedRotaId) {
        setRotaId(lockedRotaId);
      } else {
        setRotaId("");
      }
    }
  }, [isOpen, lockedRotaId]);

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
    return passageirosDisponiveis.filter(
      (p) =>
        p.nome?.toLowerCase().includes(term) ||
        p.escola?.nome?.toLowerCase().includes(term) ||
        p.turma?.toLowerCase().includes(term) ||
        p.nome_responsavel?.toLowerCase().includes(term)
    );
  }, [passageirosDisponiveis, searchPassageiro]);

  const getSubInfoText = (p: Passageiro) => {
    const parts: string[] = [];
    if (p.turma?.trim()) parts.push(`Turma ${p.turma.trim()}`);
    if (p.escola?.nome?.trim()) parts.push(p.escola.nome.trim());
    return parts.join(" • ");
  };

  const handleRotaChange = (val: string) => {
    setRotaId(val);
    setPassageiroId("");
    setPassageiroNomeSelected("");
    setSearchPassageiro("");
    setIsPassageiroDropdownOpen(false);
    if (errors.rotaId) setErrors((prev) => ({ ...prev, rotaId: "" }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!rotaId) {
      newErrors.rotaId = "Selecione a rota";
    }
    if (!passageiroId) {
      newErrors.passageiroId = "Selecione o passageiro";
    }
    if (!dataAusencia) {
      newErrors.dataAusencia = "Informe a data da ausência";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.warning("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await registrarMutation.mutateAsync({
        passageiro_id: passageiroId,
        rota_id: rotaId,
        data_ausencia: dataAusencia,
      });

      toast.success("Ausência antecipada registrada com sucesso!");
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao registrar ausência.";
      toast.error(errorMsg);
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && onClose()} maxWidth="md">
      <BaseDialog.Header
        title="INFORMAR AUSÊNCIA ANTECIPADA"
        icon={<CalendarX className="w-5 h-5" />}
        onClose={onClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 text-left pt-4">
          {/* Campo 1: Rota */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Rota <span className="text-red-500">*</span>
            </Label>

            <Select
              value={rotaId}
              onValueChange={handleRotaChange}
              disabled={!!lockedRotaId || isLoadingRotas}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                  errors.rotaId && "border-red-500",
                  lockedRotaId && "bg-slate-100 opacity-90 cursor-not-allowed font-medium text-slate-700"
                )}
              >
                <SelectValue placeholder="Selecione a rota..." />
              </SelectTrigger>
              <SelectContent>
                {rotasList.map((r: Route) => (
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

          {/* Campo 2: Passageiro (filtrado pela rota selecionada) */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Passageiro <span className="text-red-500">*</span>
            </Label>

            <Popover open={isPassageiroDropdownOpen && !!rotaId} onOpenChange={(open) => rotaId && setIsPassageiroDropdownOpen(open)}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={!rotaId ? "Selecione uma rota primeiro" : "Digite o nome do aluno"}
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                    {isLoadingRouteDetail ? (
                      <Loader2 className="w-4 h-4 text-[#1a3a5c] animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] max-h-56 overflow-y-auto overscroll-contain touch-auto divide-y divide-slate-100"
                align="start"
                sideOffset={4}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {isLoadingRouteDetail ? (
                  <div className="p-3 text-xs text-slate-500 text-center">Carregando alunos da rota...</div>
                ) : filteredPassageiros.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    {searchPassageiro.trim() ? "Nenhum aluno encontrado" : "Nenhum aluno nesta rota"}
                  </div>
                ) : (
                  filteredPassageiros.map((p) => {
                    const isSelected = p.id === passageiroId;
                    const subInfo = getSubInfoText(p);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPassageiroId(p.id);
                          setPassageiroNomeSelected(p.nome);
                          setSearchPassageiro(p.nome);
                          setIsPassageiroDropdownOpen(false);
                          if (errors.passageiroId) {
                            setErrors((prev) => ({ ...prev, passageiroId: "" }));
                          }
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer",
                          isSelected && "bg-slate-100/80 font-medium text-[#1a3a5c]"
                        )}
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{p.nome}</div>
                          {subInfo && (
                            <div className="text-xs text-slate-500 font-medium mt-0.5">{subInfo}</div>
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

          {/* Campo 3: Data da Ausência */}
          <div className="space-y-1">
            <Label className="text-slate-700 font-semibold ml-1">
              Data da Ausência <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={dataAusencia}
              onChange={(e) => {
                setDataAusencia(e.target.value);
                if (errors.dataAusencia) setErrors((prev) => ({ ...prev, dataAusencia: "" }));
              }}
              className={cn(
                "h-12 rounded-lg bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base w-full text-slate-700 font-medium px-3.5 flex items-center justify-between [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
                errors.dataAusencia && "border-red-500"
              )}
            />
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
          onClick={onClose}
          disabled={registrarMutation.isPending}
        />
        <BaseDialog.Action
          label={registrarMutation.isPending ? "Salvando..." : "Salvar"}
          onClick={() => handleSubmit()}
          disabled={registrarMutation.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
