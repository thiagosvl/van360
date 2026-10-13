import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Users, Check, X, User } from "lucide-react";
import { RouteStopStatus } from "@/types/route";
import { formatShortName, getInitials } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";

export interface EscolaChamadaItem {
  escolaId: string;
  escolaNome: string;
  alunos: Array<{
    id: string;
    passageiroId: string;
    nome: string;
    turma?: string | null;
    temAusenciaRegistrada?: boolean;
  }>;
}

interface ChamadaRapidaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escolas: EscolaChamadaItem[];
  initialStatusMap?: Record<string, RouteStopStatus>;
  onSalvar: (statusMap: Record<string, RouteStopStatus>) => void;
}

export function ChamadaRapidaDialog({
  open,
  onOpenChange,
  escolas,
  initialStatusMap,
  onSalvar,
}: ChamadaRapidaDialogProps) {
  const [statusMap, setStatusMap] = useState<Record<string, RouteStopStatus>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (open) {
      const defaultSchoolId = escolas[0]?.escolaId || "";
      setActiveTab(defaultSchoolId);

      const novoMap: Record<string, RouteStopStatus> = {};
      escolas.forEach((esc) => {
        esc.alunos.forEach((aluno) => {
          if (aluno.temAusenciaRegistrada) {
            novoMap[aluno.passageiroId] = RouteStopStatus.AUSENTE;
          } else {
            novoMap[aluno.passageiroId] = initialStatusMap?.[aluno.passageiroId] || RouteStopStatus.EMBARCADO;
          }
        });
      });
      setStatusMap(novoMap);
    }
  }, [open, escolas, initialStatusMap]);

  const activeEscola = escolas.find((e) => e.escolaId === activeTab) || escolas[0];
  const activeAlunos = activeEscola?.alunos || [];

  const contadoresPorEscola = useMemo(() => {
    const counts: Record<string, { presentes: number; total: number }> = {};
    escolas.forEach((esc) => {
      let presentes = 0;
      esc.alunos.forEach((a) => {
        if ((statusMap[a.passageiroId] || RouteStopStatus.EMBARCADO) === RouteStopStatus.EMBARCADO) {
          presentes++;
        }
      });
      counts[esc.escolaId] = { presentes, total: esc.alunos.length };
    });
    return counts;
  }, [escolas, statusMap]);

  const handleToggleAluno = (passageiroId: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [passageiroId]: prev[passageiroId] === RouteStopStatus.AUSENTE
        ? RouteStopStatus.EMBARCADO
        : RouteStopStatus.AUSENTE,
    }));
  };

  const handleMarcarLote = (status: RouteStopStatus) => {
    if (!activeAlunos.length) return;
    setStatusMap((prev) => {
      const updated = { ...prev };
      activeAlunos.forEach((aluno) => {
        updated[aluno.passageiroId] = status;
      });
      return updated;
    });
  };

  const handleConfirmar = () => {
    onSalvar(statusMap);
    safeCloseDialog(() => onOpenChange(false));
  };

  const totalGeralAlunos = escolas.reduce((acc, e) => acc + e.alunos.length, 0);
  const headerSubtitle = escolas.length === 1
    ? (escolas[0]?.escolaNome || "Confira os alunos presentes antes de iniciar o trajeto")
    : `${escolas.length} escolas com embarque`;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      description="Conferência rápida de embarque dos alunos nas escolas"
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Chamada de Embarque"
        subtitle={headerSubtitle}
        icon={<Users className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-3.5 sm:p-5 pt-3 space-y-3">
        {escolas.length > 1 && (
          <div className="w-full min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
              <TabsList className="flex gap-1.5 bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] justify-start overflow-x-auto h-auto no-scrollbar w-full min-w-0 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {escolas.map((esc) => {
                  const cont = contadoresPorEscola[esc.escolaId] || { presentes: 0, total: esc.alunos.length };

                  return (
                    <TabsTrigger
                      key={esc.escolaId}
                      value={esc.escolaId}
                      className="rounded-[18px] border-0 text-[#737373] hover:text-[#0a0a0a] px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs data-[state=active]:font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                    >
                      <span className="whitespace-nowrap">{esc.escolaNome}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        ({cont.presentes}/{cont.total})
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleMarcarLote(RouteStopStatus.EMBARCADO)}
            className="h-9 text-xs font-semibold text-[#0a0a0a] bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#0a0a0a] shrink-0" />
            <span>Todos Presentes</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleMarcarLote(RouteStopStatus.AUSENTE)}
            className="h-9 text-xs font-semibold text-[#0a0a0a] bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5] text-[#0a0a0a] shrink-0" />
            <span>Todos Ausentes</span>
          </Button>
        </div>

        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-0.5 scrollbar-thin">
          {totalGeralAlunos === 0 ? (
            <p className="text-xs text-[#737373] font-normal py-6 text-center">
              Nenhum aluno voltando cadastrado nesta rota.
            </p>
          ) : activeAlunos.length === 0 ? (
            <p className="text-xs text-[#737373] font-normal py-6 text-center">
              Nenhum aluno voltando desta escola.
            </p>
          ) : (
            activeAlunos.map((aluno) => {
              const currentStatus = statusMap[aluno.passageiroId] || RouteStopStatus.EMBARCADO;
              const isPresente = currentStatus === RouteStopStatus.EMBARCADO;
              const nomeFormatado = formatShortName(aluno.nome, true);

              return (
                <div
                  key={aluno.passageiroId}
                  onClick={() => handleToggleAluno(aluno.passageiroId)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 px-3 py-2 sm:py-2.5 rounded-[16px] transition-all cursor-pointer select-none border active:scale-[0.99]",
                    isPresente
                      ? "bg-[#f0fdf4] border-emerald-200/70 hover:bg-[#e6f9ed]"
                      : "bg-[#fef2f2] border-rose-200/70 hover:bg-[#fee2e2]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs font-semibold transition-colors border",
                          isPresente
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200/60"
                            : "bg-rose-100 text-[#e7000b] border-rose-200/60"
                        )}
                      >
                        {getInitials(aluno.nome) || <User className="w-3.5 h-3.5" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-xs sm:text-[13px] font-semibold text-[#0a0a0a] truncate leading-tight block">
                        {nomeFormatado}
                      </span>
                      {aluno.turma && (
                        <span className="text-[10px] sm:text-[11px] font-normal text-[#737373] block leading-tight mt-0.5">
                          {aluno.turma}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 flex items-center transition-all shrink-0 cursor-pointer shadow-2xs",
                      isPresente ? "bg-emerald-600 justify-end" : "bg-[#e7000b] justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs transition-transform",
                        isPresente ? "text-emerald-700" : "text-[#e7000b]"
                      )}
                    >
                      {isPresente ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <X className="w-3 h-3 stroke-[3]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
        />
        <BaseDialog.Action
          label="Confirmar"
          variant="primary"
          onClick={handleConfirmar}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
