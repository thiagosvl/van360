import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfiguracoes } from "@/hooks";
import { Smartphone } from "lucide-react";

type ConfigKey =
  | "notificar_motorista_parcelas"
  | "notificar_motorista_aniversarios";

export const MinhasNotificacoesTab = memo(function MinhasNotificacoesTab() {
  const { configuracoes, isLoading, updateConfiguracoes } = useConfiguracoes();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const handleToggle = async (key: ConfigKey, currentValue: boolean) => {
    if (updatingKey) return;
    setUpdatingKey(key);
    try {
      await updateConfiguracoes({ [key]: !currentValue });
    } catch {
    } finally {
      setUpdatingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1a3a5c]">
              Alertas do Aplicativo
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Lembretes operacionais enviados via notificação no seu celular
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-3.5 pt-1">
          {/* Item 1: Lembrete de Parcelas e Pagamentos */}
          <div className="flex items-center justify-between gap-3 pt-1 first:pt-0">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                Lembrete de pagamentos e parcelas
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Notificação semanal para você acompanhar os pagamentos e dar baixa nas parcelas recebidas.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-motorista-parcelas"
                checked={configuracoes?.notificar_motorista_parcelas ?? true}
                loading={updatingKey === "notificar_motorista_parcelas"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_motorista_parcelas",
                    configuracoes?.notificar_motorista_parcelas ?? true
                  )
                }
              />
            </div>
          </div>

          {/* Item 2: Aniversários */}
          <div className="flex items-center justify-between gap-3 pt-3.5">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                Lembrete de aniversariantes da semana
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Notificação semanal para você se lembrar de parabenizar os alunos que fazem aniversário.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-motorista-aniversarios"
                checked={configuracoes?.notificar_motorista_aniversarios ?? true}
                loading={updatingKey === "notificar_motorista_aniversarios"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_motorista_aniversarios",
                    configuracoes?.notificar_motorista_aniversarios ?? true
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
