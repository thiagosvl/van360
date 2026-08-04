import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfiguracoes } from "@/hooks";
import { Users, Smartphone, ShieldCheck, Loader2 } from "lucide-react";

type ConfigKey =
  | "notificar_pais_cobrancas"
  | "notificar_motorista_parcelas"
  | "notificar_motorista_aniversarios";

export const NotificacoesTab = memo(function NotificacoesTab() {
  const { configuracoes, isLoading, updateConfiguracoes } = useConfiguracoes();
  const [updatingKey, setUpdatingKey] = useState<ConfigKey | null>(null);

  const handleToggle = async (key: ConfigKey, currentValue: boolean) => {
    if (updatingKey) return;
    setUpdatingKey(key);
    try {
      await updateConfiguracoes({ [key]: !currentValue });
    } catch (error) {
    } finally {
      setUpdatingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SUBGRUPO 1: Notificações para os Pais */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Notificações para os Pais
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-1">
          <div className="space-y-0.5 min-w-0 pr-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Lembretes de pagamento de parcelas
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Envia avisos automáticos de vencimento e lembretes de pagamento aos responsáveis.
            </p>
          </div>

          <div className="shrink-0 w-11 h-6 flex items-center justify-center">
            {updatingKey === "notificar_pais_cobrancas" ? (
              <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
            ) : (
              <Switch
                id="switch-notificar-pais-cobrancas"
                checked={configuracoes?.notificar_pais_cobrancas ?? true}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_pais_cobrancas",
                    configuracoes?.notificar_pais_cobrancas ?? true
                  )
                }
              />
            )}
          </div>
        </div>

        {!(configuracoes?.notificar_pais_cobrancas ?? true) && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-3 text-amber-800 text-xs animate-in fade-in duration-300">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Aviso:</strong> O envio automático está desativado. Nenhum lembrete de parcela será enviado para os pais, mesmo que o passageiro esteja com lembretes ativados na carteirinha.
            </span>
          </div>
        )}
      </div>

      {/* SUBGRUPO 2: Minhas Notificações (Motorista) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Minhas Notificações
            </h2>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-4 pt-1">
          {/* Item 1: Resumo de Parcelas */}
          <div className="flex items-center justify-between gap-4 pt-1 first:pt-0">
            <div className="space-y-0.5 min-w-0 pr-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Resumo de parcelas dos passageiros
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Relatório com as parcelas pendentes e próximas a vencer dos seus passageiros.
              </p>
            </div>

            <div className="shrink-0 w-11 h-6 flex items-center justify-center">
              {updatingKey === "notificar_motorista_parcelas" ? (
                <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
              ) : (
                <Switch
                  id="switch-notificar-motorista-parcelas"
                  checked={configuracoes?.notificar_motorista_parcelas ?? true}
                  onCheckedChange={() =>
                    handleToggle(
                      "notificar_motorista_parcelas",
                      configuracoes?.notificar_motorista_parcelas ?? true
                    )
                  }
                />
              )}
            </div>
          </div>

          {/* Item 2: Aniversários */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="space-y-0.5 min-w-0 pr-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Lembrete de aniversariantes da semana
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Resumo semanal com os passageiros que fazem aniversário.
              </p>
            </div>

            <div className="shrink-0 w-11 h-6 flex items-center justify-center">
              {updatingKey === "notificar_motorista_aniversarios" ? (
                <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
              ) : (
                <Switch
                  id="switch-notificar-motorista-aniversarios"
                  checked={configuracoes?.notificar_motorista_aniversarios ?? true}
                  onCheckedChange={() =>
                    handleToggle(
                      "notificar_motorista_aniversarios",
                      configuracoes?.notificar_motorista_aniversarios ?? true
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
