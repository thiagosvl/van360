import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Check, X, User } from "lucide-react";
import { RouteStopStatus, ExecucaoParada, ChamadaEscolaItem } from "@/types/route";
import { formatShortName, getInitials } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
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
        title="Chamada na Escola"
        subtitle={escolaNome ? `Conferir alunos da escola ${escolaNome}` : "Confira os alunos que estão embarcando"}
        icon={<Users className="w-5 h-5 text-[#0a0a0a]" />}
        hideCloseButton={true}
      />

      <BaseDialog.Body className="p-3.5 sm:p-5 pt-3 space-y-3">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleMarcarTodos(RouteStopStatus.EMBARCADO)}
            className="h-9 text-xs font-semibold text-[#0a0a0a] bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#0a0a0a] shrink-0" />
            <span>Todos Presentes</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleMarcarTodos(RouteStopStatus.AUSENTE)}
            className="h-9 text-xs font-semibold text-[#0a0a0a] bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5] text-[#0a0a0a] shrink-0" />
            <span>Todos Ausentes</span>
          </Button>
        </div>

        <div className={cn("space-y-1.5 max-h-[50vh] overflow-y-auto pr-0.5 transition-opacity scrollbar-thin", isSubmitting && "pointer-events-none opacity-85 cursor-wait")}>
          {alunos.length === 0 ? (
            <p className="text-xs text-[#737373] font-normal py-6 text-center">
              Nenhum aluno cadastrado para embarque nesta escola.
            </p>
          ) : (
            alunos.map((aluno) => {
              const currentStatus = statusMap[aluno.id] || RouteStopStatus.EMBARCADO;
              const isPresente = currentStatus === RouteStopStatus.EMBARCADO;
              const nomeCompleto = aluno.passageiro?.nome || aluno.nome || "";
              const nomeFormatado = formatShortName(nomeCompleto, true);
              const turma = aluno.passageiro?.turma;

              return (
                <div
                  key={aluno.id}
                  onClick={() => handleToggleRow(aluno.id)}
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
                        {getInitials(nomeCompleto) || <User className="w-3.5 h-3.5" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-xs sm:text-[13px] font-semibold text-[#0a0a0a] truncate leading-tight block">
                        {nomeFormatado}
                      </span>
                      {turma && (
                        <span className="text-[10px] sm:text-[11px] font-normal text-[#737373] block leading-tight mt-0.5">
                          {turma}
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
          disabled={isSubmitting}
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
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
