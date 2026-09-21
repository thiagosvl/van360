import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    ? escolas[0]?.escolaNome
    : `${escolas.length} ESCOLAS COM EMBARQUE`;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      description="Conferência rápida de embarque dos alunos nas escolas"
      maxWidth="md"
    >
      <BaseDialog.Header
        title="CHAMADA DE EMBARQUE"
        subtitle={headerSubtitle}
        icon={<Users className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-3.5 sm:p-5 pt-1.5 space-y-3">
        {escolas.length > 1 && (
          <div className="w-full min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
              <TabsList className="flex gap-2 bg-transparent p-0 justify-start overflow-x-auto h-auto no-scrollbar pb-1 w-full min-w-0 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {escolas.map((esc) => {
                  const cont = contadoresPorEscola[esc.escolaId] || { presentes: 0, total: esc.alunos.length };

                  return (
                    <TabsTrigger
                      key={esc.escolaId}
                      value={esc.escolaId}
                      className="rounded-full border border-slate-200 bg-white text-slate-600 px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:border-[#1a3a5c] transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span className="whitespace-nowrap">{esc.escolaNome}</span>
                      <span className="text-[10px] opacity-80 font-normal">
                        ({cont.presentes}/{cont.total})
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleMarcarLote(RouteStopStatus.EMBARCADO)}
            className="h-10 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200/90 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
            <span>Todos Presentes</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleMarcarLote(RouteStopStatus.AUSENTE)}
            className="h-10 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200/90 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
            <span>Todos Ausentes</span>
          </Button>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-0.5 scrollbar-thin">
          {totalGeralAlunos === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-6 text-center">
              Nenhum aluno voltando cadastrado nesta rota.
            </p>
          ) : activeAlunos.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-6 text-center">
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
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer select-none border",
                    isPresente
                      ? "bg-[#e6f4ea] border-emerald-200/70 hover:bg-[#d8ece0]"
                      : "bg-[#fce8e6] border-rose-200/70 hover:bg-[#fadbd8]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Avatar className="w-9 h-9 border border-black/10 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs font-bold text-white transition-colors",
                          isPresente ? "bg-emerald-600" : "bg-rose-500"
                        )}
                      >
                        {getInitials(aluno.nome) || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-sm sm:text-base font-bold text-slate-900 truncate leading-snug block">
                        {nomeFormatado}
                      </span>
                      {aluno.turma && (
                        <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                          {aluno.turma}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "w-12 h-7 rounded-full p-1 flex items-center transition-all shrink-0 shadow-2xs",
                      isPresente ? "bg-emerald-600 justify-end" : "bg-slate-300/80 justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs transition-transform",
                        isPresente ? "text-emerald-700" : "text-slate-400"
                      )}
                    >
                      {isPresente ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <X className="w-3.5 h-3.5 stroke-[3]" />
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
          label="Salvar"
          variant="primary"
          onClick={handleConfirmar}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
