import { useState, useMemo } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePassageiroAusencias, useRemoverAusenciaMutation } from "@/hooks/api/useRoutes";
import RegistrarAusenciaDialog from "@/components/dialogs/RegistrarAusenciaDialog";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { toast } from "@/utils/notifications/toast";
import { Passageiro } from "@/types/passageiro";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CarteirinhaAusenciasProps {
  passageiro: Passageiro;
}

export function CarteirinhaAusencias({ passageiro }: CarteirinhaAusenciasProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const passageiroId = passageiro.id || "";
  const { data: ausenciasList = [], isLoading } = usePassageiroAusencias(passageiroId);
  const removerAusenciaMutation = useRemoverAusenciaMutation();

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const ausenciasFuturas = useMemo(() => {
    return (ausenciasList || [])
      .filter((item: any) => item.data_ausencia >= todayStr)
      .sort((a: any, b: any) => a.data_ausencia.localeCompare(b.data_ausencia));
  }, [ausenciasList, todayStr]);

  const handleExcluirAusencia = (ausencia: any) => {
    const dateFormatted = format(parseISO(ausencia.data_ausencia), "dd/MM/yyyy");

    openConfirmationDialog({
      title: "Remover Registro de Ausência?",
      description: `Tem certeza que deseja remover o agendamento de ausência do dia ${dateFormatted}?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: async () => {
        setDeletingId(ausencia.id);
        try {
          await removerAusenciaMutation.mutateAsync({
            id: ausencia.id,
            passageiro_id: passageiroId,
            rota_id: ausencia.rota_id,
            data_ausencia: ausencia.data_ausencia,
          });
          toast.success("Ausência removida com sucesso!");
          safeCloseDialog(closeConfirmationDialog);
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Erro ao remover ausência.");
          safeCloseDialog(closeConfirmationDialog);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-6 text-left space-y-4">
      {/* Header do Card */}
      <div className="flex items-center justify-between text-left min-h-[32px]">
        <h3 className="text-base font-bold text-[#16314f]">
          Ausências
        </h3>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className={cn(
            "h-8 rounded-lg border font-bold text-xs flex items-center gap-1.5 px-3 transition-all border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] shadow-sm hover:shadow cursor-pointer"
          )}
        >
          <Plus className="w-3 h-3" /> Registrar
        </Button>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : ausenciasFuturas.length === 0 ? (
        <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Nenhuma ausência futura agendada para este aluno.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ausenciasFuturas.map((ausencia) => {
            const dateObj = parseISO(ausencia.data_ausencia);
            const formattedDate = format(dateObj, "dd/MM/yyyy");
            const dayOfWeek = format(dateObj, "EEEE", { locale: ptBR });
            const isDeletingThis = deletingId === ausencia.id;

            return (
              <div
                key={ausencia.id}
                className="p-3 bg-slate-50/80 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-slate-100/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {formattedDate}
                    </span>
                    <span className="text-[10px] font-semibold capitalize text-slate-500">
                      • {dayOfWeek}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {ausencia.rota?.nome || "Rota vinculada"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isDeletingThis}
                  onClick={() => handleExcluirAusencia(ausencia)}
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 cursor-pointer"
                  title="Remover registro de ausência"
                >
                  {isDeletingThis ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Diálogo de Inclusão com lockedPassageiro */}
      {isAddDialogOpen && (
        <RegistrarAusenciaDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          lockedPassageiro={{ id: passageiroId, nome: passageiro.nome }}
        />
      )}
    </div>
  );
}
