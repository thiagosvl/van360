import React, { useState, useMemo } from "react";
import { Plus, Loader2, Calendar, Bus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
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
import { cn } from "@/lib/utils";

interface GrupoAusenciaResponsavel {
  dataStr: string;
  dateObj: Date;
  dataLabel: string;
  isHoje: boolean;
  isAmanha: boolean;
  ausencias: ResponsavelAusenciaItem[];
}

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
  const hasRotas = rotas.length > 0;

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
    rotas.forEach((r) => {
      map.set(r.id, r.nome);
    });
    return map;
  }, [rotas]);

  const gruposAusencias = useMemo<GrupoAusenciaResponsavel[]>(() => {
    const map = new Map<string, ResponsavelAusenciaItem[]>();
    for (const item of ausenciasFuturas) {
      const existing = map.get(item.data_ausencia);
      if (existing) {
        existing.push(item);
      } else {
        map.set(item.data_ausencia, [item]);
      }
    }

    const d = new Date();
    const todayYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowYMD = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    const grupos: GrupoAusenciaResponsavel[] = [];
    for (const [dataStr, items] of map.entries()) {
      const dateObj = parseISO(dataStr);
      const isHoje = dataStr === todayYMD;
      const isAmanha = dataStr === tomorrowYMD;

      let dataLabel: string;
      if (isHoje) {
        dataLabel = "Hoje";
      } else if (isAmanha) {
        dataLabel = "Amanhã";
      } else {
        const diaSemana = format(dateObj, "EEE", { locale: ptBR });
        const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1).replace(".", "");
        const diaMes = format(dateObj, "dd/MM");
        dataLabel = `${diaSemanaCap}, ${diaMes}`;
      }

      grupos.push({
        dataStr,
        dateObj,
        dataLabel,
        isHoje,
        isAmanha,
        ausencias: items,
      });
    }

    return grupos;
  }, [ausenciasFuturas]);

  const handleExcluirAusencia = (ausencia: ResponsavelAusenciaItem) => {
    const dateFormatted = format(parseISO(ausencia.data_ausencia), "dd/MM/yyyy");

    if (openConfirmationDialog) {
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
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 sm:p-6 text-left space-y-4">
      <div className="flex items-center justify-between text-left min-h-[32px]">
        <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">Ausências</h3>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasRotas}
          onClick={() => {
            if (!hasRotas) return;
            setIsAddDialogOpen(true);
          }}
          className="h-8 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-3.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" /> Registrar
        </Button>
      </div>

      {!hasRotas && (
        <Banner
          variant="warning"
          description="Este aluno não está vinculado a nenhuma rota, portanto não é possível registrar ausências."
        />
      )}

      {gruposAusencias.length === 0 ? (
        <div className="p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] text-center space-y-2">
          <p className="text-xs text-[#737373] font-medium">
            Nenhuma ausência futura agendada para este aluno.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 pt-1">
          {gruposAusencias.map((grupo) => (
            <div
              key={grupo.dataStr}
              className="space-y-2 pb-3.5 border-b border-[#e5e5e5]/60 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Calendar
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    grupo.isHoje || grupo.isAmanha
                      ? "text-primary"
                      : "text-[#737373]"
                  )}
                />
                <span
                  className={cn(
                    "text-xs leading-none",
                    grupo.isHoje || grupo.isAmanha
                      ? "font-bold text-primary"
                      : "font-semibold text-[#0a0a0a]"
                  )}
                >
                  {grupo.dataLabel}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {grupo.ausencias.map((ausencia) => {
                  const isDeletingThis = deletingId === ausencia.id;
                  const rotaNome =
                    ausencia.rota?.nome ||
                    (ausencia.rota_id ? rotasMap.get(ausencia.rota_id) : null) ||
                    "Rota vinculada";

                  return (
                    <div
                      key={ausencia.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#0a0a0a] transition-all hover:border-[#d4d4d4]"
                    >
                      <Bus className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                      <span className="font-medium text-xs truncate max-w-[190px]">
                        {rotaNome}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isDeletingThis}
                        onClick={() => handleExcluirAusencia(ausencia)}
                        className="h-5 w-5 -mr-1 ml-0.5 rounded-full text-[#737373] hover:text-[#e7000b] hover:bg-rose-100/60 transition-colors cursor-pointer shrink-0"
                        title="Remover ausência desta rota"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3 stroke-[2.5]" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddDialogOpen && (
        <ResponsavelNotificarAusenciaDialog
          open={isAddDialogOpen}
          onOpenChange={(val) => {
            if (!val) {
              safeCloseDialog(() => setIsAddDialogOpen(false));
            } else {
              setIsAddDialogOpen(true);
            }
          }}
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
