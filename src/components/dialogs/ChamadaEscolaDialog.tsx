import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Check, X, User } from "lucide-react";
import { RouteStopStatus, ExecucaoParada, ChamadaEscolaItem } from "@/types/route";
import { formatShortName, getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ChamadaEscolaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escolaNome?: string;
  alunos: ExecucaoParada[];
  isSubmitting: boolean;
  onConfirmChamada: (chamada: ChamadaEscolaItem[]) => Promise<void>;
}

export function ChamadaEscolaDialog({
  open,
  onOpenChange,
  escolaNome,
  alunos,
  isSubmitting,
  onConfirmChamada,
}: ChamadaEscolaDialogProps) {
  const [statusMap, setStatusMap] = useState<Record<string, RouteStopStatus>>({});

  useEffect(() => {
    if (open) {
      if (!isSubmitting) {
        setStatusMap((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          const initialMap: Record<string, RouteStopStatus> = {};
          alunos.forEach((aluno) => {
            initialMap[aluno.id] = aluno.status === RouteStopStatus.AUSENTE
              ? RouteStopStatus.AUSENTE
              : RouteStopStatus.EMBARCADO;
          });
          return initialMap;
        });
      }
    } else {
      setStatusMap({});
    }
  }, [open]);

  const handleToggleRow = (alunoId: string) => {
    if (isSubmitting) return;
    setStatusMap((prev) => ({
      ...prev,
      [alunoId]: prev[alunoId] === RouteStopStatus.AUSENTE
        ? RouteStopStatus.EMBARCADO
        : RouteStopStatus.AUSENTE,
    }));
  };

  const handleMarcarTodos = (targetStatus: RouteStopStatus) => {
    if (isSubmitting) return;
    const updated: Record<string, RouteStopStatus> = {};
    alunos.forEach((aluno) => {
      updated[aluno.id] = targetStatus;
    });
    setStatusMap(updated);
  };

  const handleSubmit = async () => {
    const chamadaArray: ChamadaEscolaItem[] = alunos.map((aluno) => ({
      parada_id: aluno.id,
      status: statusMap[aluno.id] || RouteStopStatus.EMBARCADO,
    }));
    await onConfirmChamada(chamadaArray);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      lockClose={true}
      description={`Chamada da escola ${escolaNome || ""}`}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="CHAMADA DE EMBARQUE"
        icon={<Users className="w-5 h-5 text-[#1a3a5c]" />}
        hideCloseButton={true}
      />

      <BaseDialog.Body className="p-3.5 sm:p-5 pt-1.5 space-y-3">
        {/* BOTOES DE ACAO EM LOTE */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleMarcarTodos(RouteStopStatus.EMBARCADO)}
            className="h-10 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200/90 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
            <span>Todos Presentes</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleMarcarTodos(RouteStopStatus.AUSENTE)}
            className="h-10 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border-slate-200/90 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4 stroke-[2.5] text-slate-600 shrink-0" />
            <span>Todos Ausentes</span>
          </Button>
        </div>

        {/* LISTA COMPACTA DE PASSAGEIROS */}
        <div className={cn("space-y-2 max-h-[55vh] overflow-y-auto pr-0.5 transition-opacity", isSubmitting && "pointer-events-none opacity-85 cursor-wait")}>
          {alunos.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-6 text-center">
              Nenhum aluno cadastrado para embarque nesta escola.
            </p>
          ) : (
            alunos.map((aluno) => {
              const currentStatus = statusMap[aluno.id] || RouteStopStatus.EMBARCADO;
              const isPresente = currentStatus === RouteStopStatus.EMBARCADO;
              const nomeCompleto = aluno.passageiro?.nome || aluno.nome || "";
              const nomeFormatado = formatShortName(nomeCompleto, true);

              return (
                <div
                  key={aluno.id}
                  onClick={() => handleToggleRow(aluno.id)}
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
                        {getInitials(nomeCompleto) || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-sm sm:text-base font-bold text-slate-900 truncate leading-snug">
                      {nomeFormatado}
                    </span>
                  </div>

                  {/* TOGGLE SWITCH ESTILO STITCH */}
                  <div
                    className={cn(
                      "w-12 h-7 rounded-full p-1 flex items-center transition-all shrink-0 shadow-2xs",
                      isPresente ? "bg-emerald-600 justify-end" : "bg-slate-300/80 justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs transition-transform",
                        isPresente ? "text-emerald-600" : "text-slate-500"
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
          disabled={isSubmitting}
          onClick={() => onOpenChange(false)}
        />
        <BaseDialog.Action
          label="Confirmar"
          variant="primary"
          isLoading={isSubmitting}
          onClick={handleSubmit}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
