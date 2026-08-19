import { memo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/ui/Banner";
import { useConfiguracoes } from "@/hooks";
import { Users, Smartphone, Loader2 } from "lucide-react";

type ConfigKey =
  | "notificar_pais_cobrancas"
  | "notificar_motorista_parcelas"
  | "notificar_motorista_aniversarios"
  | "notificar_inicio_rota"
  | "notificar_proxima_parada"
  | "notificar_conclusao_parada";

export const NotificacoesTab = memo(function NotificacoesTab() {
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
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GRUPO 1: Notificações para os Pais */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Notificações para os Pais
            </h2>
            <p className="text-xs text-slate-500">
              Avisos automáticos enviados aos responsáveis pelo aplicativo
            </p>
          </div>
        </div>

        {/* SEÇÃO A: Andamento da Rota */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Andamento da Rota
          </h3>

          <div className="divide-y divide-slate-100 space-y-4 pt-1">
            {/* Item 1: Início de Rota */}
            <div className="flex items-center justify-between gap-4 pt-1 first:pt-0">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h4 className="text-sm font-semibold text-slate-800">
                  Início de rota
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Avisa os pais quando o trajeto de ida começa ou na saída da escola para a volta.
                </p>
              </div>

              <div className="shrink-0 w-11 h-6 flex items-center justify-center">
                {updatingKey === "notificar_inicio_rota" ? (
                  <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
                ) : (
                  <Switch
                    id="switch-notificar-inicio-rota"
                    checked={configuracoes?.notificar_inicio_rota ?? true}
                    onCheckedChange={() =>
                      handleToggle(
                        "notificar_inicio_rota",
                        configuracoes?.notificar_inicio_rota ?? true
                      )
                    }
                  />
                )}
              </div>
            </div>

            {/* Item 2: Próxima Parada */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h4 className="text-sm font-semibold text-slate-800">
                  Próxima parada (Van a caminho)
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Avisa o responsável que a residência dele é a próxima parada da fila.
                </p>
              </div>

              <div className="shrink-0 w-11 h-6 flex items-center justify-center">
                {updatingKey === "notificar_proxima_parada" ? (
                  <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
                ) : (
                  <Switch
                    id="switch-notificar-proxima-parada"
                    checked={configuracoes?.notificar_proxima_parada ?? true}
                    onCheckedChange={() =>
                      handleToggle(
                        "notificar_proxima_parada",
                        configuracoes?.notificar_proxima_parada ?? true
                      )
                    }
                  />
                )}
              </div>
            </div>

            {/* Item 3: Conclusão de Parada */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="space-y-0.5 min-w-0 pr-2">
                <h4 className="text-sm font-semibold text-slate-800">
                  Confirmação de embarque e entrega
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Avisa no momento exato em que o passageiro embarca na van ou é entregue.
                </p>
              </div>

              <div className="shrink-0 w-11 h-6 flex items-center justify-center">
                {updatingKey === "notificar_conclusao_parada" ? (
                  <Loader2 className="w-5 h-5 text-[#1a3a5c] animate-spin" />
                ) : (
                  <Switch
                    id="switch-notificar-conclusao-parada"
                    checked={configuracoes?.notificar_conclusao_parada ?? true}
                    onCheckedChange={() =>
                      handleToggle(
                        "notificar_conclusao_parada",
                        configuracoes?.notificar_conclusao_parada ?? true
                      )
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO B: Cobranças e Parcelas */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Cobranças e Parcelas
          </h3>

          <div className="flex items-center justify-between gap-4 py-1">
            <div className="space-y-0.5 min-w-0 pr-2">
              <h4 className="text-sm font-semibold text-slate-800">
                Lembretes de pagamento de parcelas
              </h4>
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
            <Banner
              variant="warning"
              title="Atenção:"
              description="O envio automático está desativado. Nenhum lembrete de parcela será enviado para os pais, mesmo que o passageiro esteja com lembretes ativados na carteirinha."
            />
          )}
        </div>
      </div>

      {/* SUBGRUPO 4: Minhas Notificações (Motorista) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1a3a5c]">
              Minhas Notificações
            </h2>
            <p className="text-xs text-slate-500">
              Lembretes operacionais enviados via notificação no seu celular
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-4 pt-1">
          {/* Item 1: Lembrete de Parcelas e Pagamentos */}
          <div className="flex items-center justify-between gap-4 pt-1 first:pt-0">
            <div className="space-y-0.5 min-w-0 pr-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Lembrete de pagamentos e parcelas
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Notificação semanal para você acompanhar os pagamentos e dar baixa nas parcelas recebidas.
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
                Notificação semanal para você se lembrar de parabenizar os passageiros que fazem aniversário.
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
