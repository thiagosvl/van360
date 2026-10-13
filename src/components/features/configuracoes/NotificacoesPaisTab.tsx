import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ConfiguracoesToggleTabSkeleton } from "@/components/skeletons";
import { useConfiguracoes } from "@/hooks";
import { Navigation } from "lucide-react";

type ConfigKey =
  | "notificar_inicio_rota"
  | "notificar_proxima_parada"
  | "notificar_conclusao_parada";

export const NotificacoesPaisTab = memo(function NotificacoesPaisTab() {
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
    return <ConfiguracoesToggleTabSkeleton cardCount={1} rowCount={3} />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Avisos de Rota aos Pais
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Notificações de trajeto, aproximação da van e paradas enviadas aos responsáveis
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
          <div className="flex items-center justify-between gap-3 pt-1 first:pt-0">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                Início de rota
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Avisa os pais quando o trajeto de ida começa ou na saída da escola para a volta.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-inicio-rota"
                checked={configuracoes?.notificar_inicio_rota ?? false}
                loading={updatingKey === "notificar_inicio_rota"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_inicio_rota",
                    configuracoes?.notificar_inicio_rota ?? false
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                Próxima parada (Van a caminho)
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Avisa o responsável que a residência dele é a próxima parada da fila.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-proxima-parada"
                checked={configuracoes?.notificar_proxima_parada ?? false}
                loading={updatingKey === "notificar_proxima_parada"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_proxima_parada",
                    configuracoes?.notificar_proxima_parada ?? false
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                Confirmação de embarque e entrega
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Avisa no momento exato em que o aluno embarca na van ou é entregue.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-conclusao-parada"
                checked={configuracoes?.notificar_conclusao_parada ?? false}
                loading={updatingKey === "notificar_conclusao_parada"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_conclusao_parada",
                    configuracoes?.notificar_conclusao_parada ?? false
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
