import { memo, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/ui/Banner";
import { useConfiguracoes } from "@/hooks";
import { Radio, Loader2 } from "lucide-react";

export const RastreamentoTab = memo(function RastreamentoTab() {
  const { configuracoes, isLoading, updateConfiguracoes } = useConfiguracoes();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const modosRef = useRef<HTMLDivElement>(null);

  const handleToggle = async (currentValue: boolean) => {
    if (updatingKey) return;
    const nextValue = !currentValue;
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
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const rastreamentoAtivo = configuracoes?.rastreamento_ativo ?? true;
  const rastreamentoModo = configuracoes?.rastreamento_modo ?? "completo";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Rastreamento em Tempo Real (GPS)
            </h2>
            <p className="text-xs text-slate-500">
              Defina a visibilidade do mapa ao vivo para os pais no portal
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-1">
          <div className="space-y-0.5 min-w-0 pr-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Permitir rastreamento pelos pais
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Disponibiliza a visualização do mapa com a localização da van em tempo real.
            </p>
          </div>

          <div className="shrink-0 w-11 h-6 flex items-center justify-center">
            {updatingKey === "rastreamento_ativo" ? (
              <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
            ) : (
              <Switch
                id="switch-rastreamento-ativo"
                checked={rastreamentoAtivo}
                onCheckedChange={() => handleToggle(rastreamentoAtivo)}
              />
            )}
          </div>
        </div>

        {rastreamentoAtivo ? (
          <div ref={modosRef} className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Modo de Rastreamento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModoRastreamentoChange("completo")}
                disabled={updatingKey !== null}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative flex items-start gap-3 cursor-pointer ${
                  rastreamentoModo === "completo"
                    ? "border-[#1a3a5c] ring-2 ring-[#1a3a5c]/10 bg-[#1a3a5c]/5 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      rastreamentoModo === "completo"
                        ? "border-[#1a3a5c] bg-[#1a3a5c]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {rastreamentoModo === "completo" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                    Rastreamento Completo
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Os responsáveis acompanham a van ao vivo desde o início da rota até o desembarque do passageiro.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModoRastreamentoChange("apenas_proximo")}
                disabled={updatingKey !== null}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative flex items-start gap-3 cursor-pointer ${
                  rastreamentoModo === "apenas_proximo"
                    ? "border-[#1a3a5c] ring-2 ring-[#1a3a5c]/10 bg-[#1a3a5c]/5 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      rastreamentoModo === "apenas_proximo"
                        ? "border-[#1a3a5c] bg-[#1a3a5c]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {rastreamentoModo === "apenas_proximo" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                    Apenas Próximo da Fila
                  </span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    O mapa ao vivo é liberado apenas quando a van estiver a caminho do passageiro (1 parada antes) até o desembarque.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <Banner
            variant="info"
            description="Como a opção está desativada, os pais e responsáveis não poderão acompanhar a van no mapa em tempo real."
          />
        )}
      </div>
    </div>
  );
});
