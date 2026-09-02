import { memo, useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/ui/Banner";
import { useConfiguracoes } from "@/hooks";
import { ReceiptText, Navigation, Smartphone, Loader2, Mail, Minus, Plus, CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

type ConfigKey =
  | "notificar_pais_cobrancas"
  | "cobranca_aviso_previo_ativo"
  | "cobranca_vencimento_hoje_ativo"
  | "cobranca_atraso_3_dias_ativo"
  | "cobranca_atraso_5_dias_ativo"
  | "cobranca_atraso_7_dias_ativo"
  | "notificar_inicio_rota"
  | "notificar_proxima_parada"
  | "notificar_conclusao_parada";

type NotificationChannel = "whatsapp" | "app" | "email";

const CHANNEL_CONFIG: Record<NotificationChannel, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  whatsapp: { label: "WhatsApp", icon: WhatsAppIcon },
  app: { label: "App", icon: Smartphone },
  email: { label: "E-mail", icon: Mail },
};

function NotificationChannelsList({ channels }: { channels: NotificationChannel[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
      {channels.map((channel) => {
        const config = CHANNEL_CONFIG[channel];
        const Icon = config.icon;
        return (
          <span
            key={channel}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-normal leading-none shrink-0 bg-slate-50/60 text-slate-400 border border-slate-200/60"
          >
            <Icon className="w-2.5 h-2.5 text-slate-400 opacity-70" />
            <span>{config.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export const NotificacoesPaisTab = memo(function NotificacoesPaisTab() {
  const { configuracoes, isLoading, updateConfiguracoes } = useConfiguracoes();
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const diasPadrao = configuracoes?.dias_aviso_vencimento_padrao_sistema ?? 2;
  const diasServidor = configuracoes?.cobranca_dias_aviso_previo ?? diasPadrao;

  const [localDias, setLocalDias] = useState<number>(diasServidor);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!isDirtyRef.current) {
      setLocalDias(diasServidor);
    }
  }, [diasServidor]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

  const handleDiasStep = (delta: number) => {
    if (updatingKey === "cobranca_dias_aviso_previo") return;

    const nextVal = Math.max(1, Math.min(5, localDias + delta));
    if (nextVal === localDias) return;

    setLocalDias(nextVal);
    isDirtyRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setUpdatingKey("cobranca_dias_aviso_previo");
      try {
        await updateConfiguracoes({ cobranca_dias_aviso_previo: nextVal });
      } catch {
        setLocalDias(diasServidor);
      } finally {
        setUpdatingKey(null);
        isDirtyRef.current = false;
      }
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  const lembretesPaisAtivos = configuracoes?.notificar_pais_cobrancas ?? true;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Notificações de Cobrança aos Pais */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0 pr-1">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
              <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#1a3a5c]">
                Cobranças e Pagamentos
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Lembretes automáticos de pagamento de parcelas aos responsáveis
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Switch
              id="switch-notificar-pais-cobrancas"
              checked={lembretesPaisAtivos}
              loading={updatingKey === "notificar_pais_cobrancas"}
              onCheckedChange={() =>
                handleToggle("notificar_pais_cobrancas", lembretesPaisAtivos)
              }
            />
          </div>
        </div>

        {lembretesPaisAtivos ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-[11px] sm:text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                Ao registrar o pagamento de uma parcela, os lembretes seguintes <strong>não serão mais enviados</strong>.
              </span>
            </div>

            <div className="divide-y divide-slate-100 space-y-3.5 pt-1">
              {/* 1. Lembrete Prévio */}
              <div className="space-y-2 pt-1 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                      Lembrete de vencimento próximo
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Lembrete enviado aos pais antes da data de vencimento da parcela.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Switch
                      id="switch-cobranca-aviso-previo-ativo"
                      checked={configuracoes?.cobranca_aviso_previo_ativo ?? true}
                      loading={updatingKey === "cobranca_aviso_previo_ativo"}
                      onCheckedChange={() =>
                        handleToggle(
                          "cobranca_aviso_previo_ativo",
                          configuracoes?.cobranca_aviso_previo_ativo ?? true
                        )
                      }
                    />
                  </div>
                </div>

                {(configuracoes?.cobranca_aviso_previo_ativo ?? true) && (
                  <div className="space-y-2 pt-0.5">
                    <div className="space-y-1 max-w-xs">
                      <span className="text-[11px] sm:text-xs font-medium text-slate-600 block">
                        Antecedência do lembrete:
                      </span>
                      <div className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200/90 p-1 shadow-2xs">
                        <button
                          type="button"
                          disabled={localDias <= 1 || updatingKey === "cobranca_dias_aviso_previo"}
                          onClick={() => handleDiasStep(-1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200/60 shadow-2xs"
                          title="Diminuir antecedência"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#1a3a5c] px-2 text-center select-none flex items-center justify-center gap-1.5 min-w-[90px]">
                          {updatingKey === "cobranca_dias_aviso_previo" ? (
                            <Loader2 className="w-3 h-3 text-[#1a3a5c] animate-spin" />
                          ) : null}
                          <span>
                            {localDias} {localDias === 1 ? "dia antes" : "dias antes"}
                          </span>
                        </span>
                        <button
                          type="button"
                          disabled={localDias >= 5 || updatingKey === "cobranca_dias_aviso_previo"}
                          onClick={() => handleDiasStep(1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-slate-200/60 shadow-2xs"
                          title="Aumentar antecedência"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <NotificationChannelsList channels={["app", "email"]} />
                  </div>
                )}
              </div>

              {/* 2. Lembrete no Dia do Vencimento */}
              <div className="space-y-2 pt-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                      Lembrete no dia do vencimento
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      Lembrete enviado exatamente na data em que a parcela vence.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Switch
                      id="switch-cobranca-vencimento-hoje-ativo"
                      checked={configuracoes?.cobranca_vencimento_hoje_ativo ?? true}
                      loading={updatingKey === "cobranca_vencimento_hoje_ativo"}
                      onCheckedChange={() =>
                        handleToggle(
                          "cobranca_vencimento_hoje_ativo",
                          configuracoes?.cobranca_vencimento_hoje_ativo ?? true
                        )
                      }
                    />
                  </div>
                </div>

                <NotificationChannelsList channels={["whatsapp", "app", "email"]} />
              </div>

              {/* 3. Lembrete de Atraso 3 Dias */}
              <div className="space-y-2 pt-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                      Lembrete de atraso (3 dias)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      1º lembrete de cobrança após 3 dias do vencimento.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Switch
                      id="switch-cobranca-atraso-3-dias-ativo"
                      checked={configuracoes?.cobranca_atraso_3_dias_ativo ?? true}
                      loading={updatingKey === "cobranca_atraso_3_dias_ativo"}
                      onCheckedChange={() =>
                        handleToggle(
                          "cobranca_atraso_3_dias_ativo",
                          configuracoes?.cobranca_atraso_3_dias_ativo ?? true
                        )
                      }
                    />
                  </div>
                </div>

                <NotificationChannelsList channels={["whatsapp", "app", "email"]} />
              </div>

              {/* 4. Lembrete de Atraso 5 Dias */}
              <div className="space-y-2 pt-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                      Lembrete de atraso (5 dias)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      2º lembrete de cobrança após 5 dias do vencimento.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Switch
                      id="switch-cobranca-atraso-5-dias-ativo"
                      checked={configuracoes?.cobranca_atraso_5_dias_ativo ?? true}
                      loading={updatingKey === "cobranca_atraso_5_dias_ativo"}
                      onCheckedChange={() =>
                        handleToggle(
                          "cobranca_atraso_5_dias_ativo",
                          configuracoes?.cobranca_atraso_5_dias_ativo ?? true
                        )
                      }
                    />
                  </div>
                </div>

                <NotificationChannelsList channels={["app", "email"]} />
              </div>

              {/* 5. Lembrete de Atraso 7 Dias */}
              <div className="space-y-2 pt-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0 pr-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                      Lembrete de atraso (7 dias)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      3º lembrete de cobrança após 7 dias do vencimento.
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Switch
                      id="switch-cobranca-atraso-7-dias-ativo"
                      checked={configuracoes?.cobranca_atraso_7_dias_ativo ?? true}
                      loading={updatingKey === "cobranca_atraso_7_dias_ativo"}
                      onCheckedChange={() =>
                        handleToggle(
                          "cobranca_atraso_7_dias_ativo",
                          configuracoes?.cobranca_atraso_7_dias_ativo ?? true
                        )
                      }
                    />
                  </div>
                </div>

                <NotificationChannelsList channels={["app", "email"]} />
              </div>
            </div>
          </div>
        ) : (
          <Banner
            variant="warning"
            title="Atenção:"
            description="O envio automático está desativado. Nenhum lembrete de parcela será enviado para os pais, mesmo que o aluno esteja com lembretes ativados na carteirinha."
          />
        )}
      </div>

      {/* Notificações de Rota aos Pais */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 text-[#1a3a5c] flex items-center justify-center shrink-0 border border-slate-200/80">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1a3a5c]">
              Rotas e Itinerários
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Avisos operacionais de trajeto e paradas enviados pelo aplicativo
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-3.5 pt-1">
          {/* Item 1: Início de Rota */}
          <div className="flex items-center justify-between gap-3 pt-1 first:pt-0">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                Início de rota
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Avisa os pais quando o trajeto de ida começa ou na saída da escola para a volta.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-inicio-rota"
                checked={configuracoes?.notificar_inicio_rota ?? true}
                loading={updatingKey === "notificar_inicio_rota"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_inicio_rota",
                    configuracoes?.notificar_inicio_rota ?? true
                  )
                }
              />
            </div>
          </div>

          {/* Item 2: Próxima Parada */}
          <div className="flex items-center justify-between gap-3 pt-3.5">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                Próxima parada (Van a caminho)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Avisa o responsável que a residência dele é a próxima parada da fila.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-proxima-parada"
                checked={configuracoes?.notificar_proxima_parada ?? true}
                loading={updatingKey === "notificar_proxima_parada"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_proxima_parada",
                    configuracoes?.notificar_proxima_parada ?? true
                  )
                }
              />
            </div>
          </div>

          {/* Item 3: Conclusão de Parada */}
          <div className="flex items-center justify-between gap-3 pt-3.5">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                Confirmação de embarque e entrega
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                Avisa no momento exato em que o aluno embarca na van ou é entregue.
              </p>
            </div>

            <div className="shrink-0">
              <Switch
                id="switch-notificar-conclusao-parada"
                checked={configuracoes?.notificar_conclusao_parada ?? true}
                loading={updatingKey === "notificar_conclusao_parada"}
                onCheckedChange={() =>
                  handleToggle(
                    "notificar_conclusao_parada",
                    configuracoes?.notificar_conclusao_parada ?? true
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
