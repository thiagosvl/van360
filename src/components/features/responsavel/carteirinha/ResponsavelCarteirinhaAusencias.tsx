import React, { useState, useMemo } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsavelCarteirinhaData, ResponsavelAusenciaItem } from "@/types/responsavel";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ResponsavelNotificarAusenciaDialog } from "@/components/dialogs/ResponsavelNotificarAusenciaDialog";
import { useRemoverAusenciaResponsavelMutation } from "@/hooks/api/useResponsavelAuthApi";
import { useLayoutSafe } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { toast } from "sonner";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { STORAGE_KEYS } from "@/constants";

interface ResponsavelCarteirinhaAusenciasProps {
  carteirinha: ResponsavelCarteirinhaData;
  onRefresh: () => void;
}

export const ResponsavelCarteirinhaAusencias: React.FC<ResponsavelCarteirinhaAusenciasProps> = ({
  carteirinha,
  onRefresh,
}) => {
  const { token } = useResponsavelAuth();
  const authToken = token || localStorage.getItem(STORAGE_KEYS.RESPONSAVEL_TOKEN) || "";

  const layoutContext = useLayoutSafe();
  const openConfirmationDialog = layoutContext?.openConfirmationDialog;
  const closeConfirmationDialog = layoutContext?.closeConfirmationDialog;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const removerAusenciaMutation = useRemoverAusenciaResponsavelMutation();

  const rotas = carteirinha.rotas || [];

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const ausenciasFuturas = useMemo(() => {
    return (carteirinha.ausencias || [])
      .filter((item) => item.data_ausencia >= todayStr)
      .sort((a, b) => a.data_ausencia.localeCompare(b.data_ausencia));
  }, [carteirinha.ausencias, todayStr]);

  const rotasMap = useMemo(() => {
    const map = new Map<string, string>();
    (carteirinha.rotas || []).forEach((r) => {
      map.set(r.id, r.nome);
    });
    return map;
  }, [carteirinha.rotas]);

  const handleExcluirAusencia = (ausencia: ResponsavelAusenciaItem) => {
    const dateFormatted = format(parseISO(ausencia.data_ausencia), "dd/MM/yyyy");

    if (openConfirmationDialog) {
      openConfirmationDialog({
        title: "Remover Registro de Ausência?",
        description: `Tem certeza que deseja remover a notificação de ausência do dia ${dateFormatted}?`,
        confirmText: "Confirmar",
        cancelText: "Cancelar",
        variant: "warning",
        onConfirm: async () => {
          setDeletingId(ausencia.id);
          try {
            await removerAusenciaMutation.mutateAsync({
              passageiroId: carteirinha.id,
              ausenciaId: ausencia.id,
              token: authToken,
              rotaId: ausencia.rota_id || undefined,
              dataAusencia: ausencia.data_ausencia,
            });
            toast.success("Ausência removida com sucesso!");
            if (closeConfirmationDialog) safeCloseDialog(closeConfirmationDialog);
            onRefresh();
          } catch (err: unknown) {
            const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao remover ausência.";
            toast.error(errorMsg);
            if (closeConfirmationDialog) safeCloseDialog(closeConfirmationDialog);
          } finally {
            setDeletingId(null);
          }
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow p-6 text-left space-y-4">
      <div className="flex items-center justify-between text-left min-h-[32px]">
        <h3 className="text-base font-bold text-[#16314f]">Ausências</h3>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="h-8 rounded-lg border font-bold text-xs flex items-center gap-1.5 px-3 transition-all border-slate-200 bg-white hover:bg-slate-50 text-[#1a3a5c] shadow-sm hover:shadow cursor-pointer"
        >
          <Plus className="w-3 h-3" /> Registrar
        </Button>
      </div>

      {ausenciasFuturas.length === 0 ? (
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
            const rotaNome = ausencia.rota?.nome || (ausencia.rota_id ? rotasMap.get(ausencia.rota_id) : null) || "Rota vinculada";

            return (
              <div
                key={ausencia.id}
                className="p-3 bg-slate-50/80 border border-slate-200/70 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-slate-100/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{formattedDate}</span>
                    <span className="text-[10px] font-semibold capitalize text-slate-500">
                      • {dayOfWeek}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                    {rotaNome}
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

      {isAddDialogOpen && (
        <ResponsavelNotificarAusenciaDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          passageiroId={carteirinha.id}
          passageiroNome={carteirinha.nome}
          rotas={rotas}
          token={authToken}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
