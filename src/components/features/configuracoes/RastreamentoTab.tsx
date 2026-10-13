import { memo, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfiguracoesToggleTabSkeleton } from "@/components/skeletons";
import { Banner } from "@/components/ui/Banner";
import { useConfiguracoes } from "@/hooks";
import { Radio } from "lucide-react";
import { useAppPermissions } from "@/hooks/business/useAppPermissions";
import { Capacitor } from "@capacitor/core";
import { toast } from "@/utils/notifications/toast";
import { AppPermissionStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

export const RastreamentoTab = memo(function RastreamentoTab() {
  const { configuracoes, isLoading, updateConfiguracoes } = useConfiguracoes();
  const { locationStatus, requestLocationPermission, openDeviceSettings } = useAppPermissions();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const modosRef = useRef<HTMLDivElement>(null);

  const handleToggle = async (currentValue: boolean) => {
    if (updatingKey) return;
    const nextValue = !currentValue;

    if (nextValue && Capacitor.isNativePlatform()) {
      let currentPerm = locationStatus;
      if (currentPerm === AppPermissionStatus.PROMPT) {
        currentPerm = await requestLocationPermission();
      }

      if (currentPerm === AppPermissionStatus.DENIED) {
        toast.error("Permissão de localização necessária", {
          description:
            "Para permitir o rastreamento em tempo real, habilite a localização nas configurações do dispositivo.",
          action: {
            label: "Abrir Ajustes",
            onClick: () => openDeviceSettings(),
          },
        });
        return;
      }
    }

    setUpdatingKey("rastreamento_ativo");
    try {
      await updateConfiguracoes({ rastreamento_ativo: nextValue });
      if (nextValue) {
        setTimeout(() => {
          modosRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    } catch {
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleModoRastreamentoChange = async (modo: "completo" | "apenas_proximo") => {
    if (updatingKey || configuracoes?.rastreamento_modo === modo) return;
    setUpdatingKey("rastreamento_modo");
    try {
      await updateConfiguracoes({ rastreamento_modo: modo });
    } catch {
    } finally {
      setUpdatingKey(null);
    }
  };

  if (isLoading) {
    return <ConfiguracoesToggleTabSkeleton cardCount={2} rowCount={2} />;
  }

  const rastreamentoAtivo = configuracoes?.rastreamento_ativo ?? true;
  const rastreamentoModo = configuracoes?.rastreamento_modo ?? "completo";

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] pb-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <Radio className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Rastreamento em Tempo Real (GPS)
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Defina a visibilidade do mapa ao vivo para os pais no portal
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-1">
          <div className="space-y-0.5 min-w-0 pr-2">
            <h3 className="text-sm font-medium text-[#0a0a0a]">
              Permitir rastreamento pelos pais
            </h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              Disponibiliza a visualização do mapa com a localização da van em tempo real.
            </p>
          </div>

          <div className="shrink-0">
            <Switch
              id="switch-rastreamento-ativo"
              checked={rastreamentoAtivo}
              loading={updatingKey === "rastreamento_ativo"}
              onCheckedChange={() => handleToggle(rastreamentoAtivo)}
            />
          </div>
        </div>

        {rastreamentoAtivo ? (
          <div ref={modosRef} className="space-y-3 pt-5 border-t border-[#e5e5e5]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Modo de Rastreamento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModoRastreamentoChange("completo")}
                disabled={updatingKey !== null}
                className={cn(
                  "p-4 rounded-[18px] border text-left transition-all relative flex items-start gap-3.5 cursor-pointer",
                  rastreamentoModo === "completo"
                    ? "border-primary ring-1 ring-primary bg-[#fafafa] shadow-xs"
                    : "border-[#e5e5e5] bg-white hover:border-primary/40 hover:bg-[#fafafa]"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      rastreamentoModo === "completo"
                        ? "border-primary bg-primary"
                        : "border-[#e5e5e5] bg-white"
                    )}
                  >
                    {rastreamentoModo === "completo" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-sm font-medium text-[#0a0a0a] block leading-tight">
                    Rastreamento Completo
                  </span>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Os responsáveis acompanham a van ao vivo desde o início da rota até o desembarque do aluno.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModoRastreamentoChange("apenas_proximo")}
                disabled={updatingKey !== null}
                className={cn(
                  "p-4 rounded-[18px] border text-left transition-all relative flex items-start gap-3.5 cursor-pointer",
                  rastreamentoModo === "apenas_proximo"
                    ? "border-primary ring-1 ring-primary bg-[#fafafa] shadow-xs"
                    : "border-[#e5e5e5] bg-white hover:border-primary/40 hover:bg-[#fafafa]"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      rastreamentoModo === "apenas_proximo"
                        ? "border-primary bg-primary"
                        : "border-[#e5e5e5] bg-white"
                    )}
                  >
                    {rastreamentoModo === "apenas_proximo" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-sm font-medium text-[#0a0a0a] block leading-tight">
                    Apenas Próximo da Fila
                  </span>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    O mapa ao vivo é liberado apenas quando a van estiver a caminho do aluno (1 parada antes) até o desembarque.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <Banner
              variant="info"
              description="Com a opção desativada, os responsáveis não poderão acompanhar a van no mapa em tempo real."
            />
          </div>
        )}
      </div>
    </div>
  );
});
