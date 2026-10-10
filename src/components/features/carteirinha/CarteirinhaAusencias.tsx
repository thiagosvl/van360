import { useState, useMemo } from "react";
import { Plus, Loader2, Calendar, Bus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePassageiroAusencias, useRemoverAusenciaMutation, usePassageiroRotas } from "@/hooks/api/useRoutes";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { toast } from "@/utils/notifications/toast";
import { Passageiro } from "@/types/passageiro";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Banner } from "@/components/ui/Banner";

interface AusenciaItem {
  id: string;
  passageiro_id: string;
  rota_id: string;
  data_ausencia: string;
  rota?: { id: string; nome: string };
  [key: string]: unknown;
}

interface GrupoAusenciaData {
  dataStr: string;
  dateObj: Date;
  formattedDate: string;
  dayOfWeek: string;
  isHoje: boolean;
  isAmanha: boolean;
  ausencias: AusenciaItem[];
}

interface CarteirinhaAusenciasProps {
  passageiro: Passageiro;
  temRotas?: boolean;
  isRotasLoading?: boolean;
}

export function CarteirinhaAusencias({
  passageiro,
  temRotas,
  isRotasLoading,
}: CarteirinhaAusenciasProps) {
  const { openConfirmationDialog, closeConfirmationDialog, openRegistrarAusenciaDialog } = useLayout();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const passageiroId = passageiro.id || "";
  const { data: ausenciasList = [], isLoading } = usePassageiroAusencias(passageiroId);
  const fallbackRotasQuery = usePassageiroRotas(temRotas === undefined ? passageiroId : "");
  const hasRotas = temRotas !== undefined ? temRotas : (fallbackRotasQuery.data || []).length > 0;
  const isRotasChecking = isRotasLoading !== undefined ? isRotasLoading : (temRotas === undefined ? fallbackRotasQuery.isLoading : false);
  const removerAusenciaMutation = useRemoverAusenciaMutation();

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const ausenciasFuturas = useMemo(() => {
    return ((ausenciasList as AusenciaItem[]) || [])
      .filter((item) => item.data_ausencia >= todayStr)
      .sort((a, b) => a.data_ausencia.localeCompare(b.data_ausencia));
  }, [ausenciasList, todayStr]);

  const gruposAusencias = useMemo<GrupoAusenciaData[]>(() => {
    const map = new Map<string, AusenciaItem[]>();
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

    const grupos: GrupoAusenciaData[] = [];
    for (const [dataStr, items] of map.entries()) {
      const dateObj = parseISO(dataStr);
      grupos.push({
        dataStr,
        dateObj,
        formattedDate: format(dateObj, "dd/MM/yyyy"),
        dayOfWeek: format(dateObj, "EEEE", { locale: ptBR }),
        isHoje: dataStr === todayYMD,
        isAmanha: dataStr === tomorrowYMD,
        ausencias: items,
      });
    }

    return grupos;
  }, [ausenciasFuturas]);

  const handleExcluirAusencia = (ausencia: AusenciaItem) => {
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
        } catch (err: unknown) {
          const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro ao remover ausência.";
          toast.error(errorMsg);
          safeCloseDialog(closeConfirmationDialog);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <div className="bg-[#ffffff] rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs p-5 sm:p-6 text-left space-y-4">
      <div className="flex items-center justify-between text-left min-h-[32px]">
        <h3 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
          Ausências
        </h3>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasRotas || isRotasChecking}
          title={!hasRotas ? "Aluno não possui rota vinculada" : undefined}
          onClick={() => {
            if (!hasRotas) return;
            openRegistrarAusenciaDialog({
              lockedPassageiro: { id: passageiroId, nome: passageiro.nome },
            });
          }}
          className={cn(
            "h-8 rounded-[18px] border font-semibold text-xs flex items-center gap-1.5 px-3.5 transition-all border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <Plus className="w-3 h-3" /> Registrar
        </Button>
      </div>

      {!isRotasChecking && !hasRotas && (
        <Banner
          variant="warning"
          description="Este aluno não está vinculado a nenhuma rota, portanto não é possível registrar ausências."
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-[#737373]" />
        </div>
      ) : gruposAusencias.length === 0 ? (
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
                <Calendar className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                <span className="text-xs font-semibold text-[#0a0a0a]">
                  {grupo.formattedDate}
                </span>
                <span className="text-[11px] font-normal capitalize text-[#737373]">
                  • {grupo.dayOfWeek}
                </span>
                {grupo.isHoje && (
                  <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                    Hoje
                  </span>
                )}
                {grupo.isAmanha && (
                  <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-medium bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">
                    Amanhã
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {grupo.ausencias.map((ausencia) => {
                  const isDeletingThis = deletingId === ausencia.id;

                  return (
                    <div
                      key={ausencia.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#0a0a0a] transition-all hover:border-[#d4d4d4]"
                    >
                      <Bus className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                      <span className="font-medium text-xs truncate max-w-[190px]">
                        {ausencia.rota?.nome || "Rota vinculada"}
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
    </div>
  );
}
