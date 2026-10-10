import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ConfiguracoesToggleTabSkeleton } from "@/components/skeletons";
import { useConfiguracoes } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/config/permissions";
import { Smartphone } from "lucide-react";

type ConfigKey =
  | "notificar_motorista_parcelas"
  | "notificar_motorista_aniversarios";

export const MinhasNotificacoesTab = memo(function MinhasNotificacoesTab() {
  const { can, isSubConta } = usePermissions();
  const canViewFinancials = can(PERMISSIONS.FINANCEIRO_VISUALIZAR) && !isSubConta;
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
    return <ConfiguracoesToggleTabSkeleton cardCount={1} rowCount={2} />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Alertas do Aplicativo
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Lembretes operacionais enviados via notificação no seu celular
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
          {canViewFinancials && (
            <div className="flex items-center justify-between gap-3 pt-1 first:pt-0">
              <div className="space-y-0.5 min-w-0 pr-1">
                <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                  Lembrete de pagamentos e parcelas
                </h3>
                <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
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
          )}

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                Lembrete de aniversariantes da semana
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
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
