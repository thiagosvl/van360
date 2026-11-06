import { Switch } from "@/components/ui/switch";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  ModoCobranca,
  MODO_COBRANCA,
  PAGAMENTOS_CONFIG_KEY,
  PagamentosConfigKey,
} from "@/hooks/ui/usePagamentosTabViewModel";
import { UsuarioConfiguracoes } from "@/services/api/configuracoes.api";
import { Loader2, Minus, Plus, ReceiptText, Smartphone } from "lucide-react";

interface LembretesPaisSectionProps {
  modoVisual: ModoCobranca;
  isBusy: boolean;
  updatingKey: string | null;
  configuracoes: UsuarioConfiguracoes | undefined;
  localDias: number;
  enviarRecibo: boolean;
  onOpenPreviewCobranca: () => void;
  onToggleAviso: (key: PagamentosConfigKey, currentValue: boolean) => void;
  onDiasStep: (delta: number) => void;
  onToggleReciboAutomatico: (checked: boolean) => void;
}

export function LembretesPaisSection({
  modoVisual,
  isBusy,
  updatingKey,
  configuracoes,
  localDias,
  enviarRecibo,
  onOpenPreviewCobranca,
  onToggleAviso,
  onDiasStep,
  onToggleReciboAutomatico,
}: LembretesPaisSectionProps) {
  const isAutomatica = modoVisual === MODO_COBRANCA.AUTOMATICA;

  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5e5] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <ReceiptText className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Mensagens Automáticas aos Pais
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Escolha quais avisos serão enviados para os responsáveis
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={onOpenPreviewCobranca}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-[18px] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] text-xs font-medium transition-colors cursor-pointer border border-[#e5e5e5] shrink-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
          Ver exemplo no WhatsApp
        </button>
      </div>

      <div className="divide-y divide-[#e5e5e5] space-y-4 pt-1">
        <div className="space-y-2.5 pt-1 first:pt-0">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                Antes do vencimento
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Avisa os pais com antecedência que a parcela está próxima de vencer.
              </p>
            </div>

            <div className="shrink-0 self-start pt-0.5">
              <Switch
                id="switch-cobranca-aviso-previo-ativo"
                checked={configuracoes?.cobranca_aviso_previo_ativo ?? true}
                loading={updatingKey === PAGAMENTOS_CONFIG_KEY.AVISO_PREVIO_ATIVO}
                disabled={isBusy}
                onCheckedChange={() =>
                  onToggleAviso(
                    PAGAMENTOS_CONFIG_KEY.AVISO_PREVIO_ATIVO,
                    configuracoes?.cobranca_aviso_previo_ativo ?? true
                  )
                }
              />
            </div>
          </div>

          {(configuracoes?.cobranca_aviso_previo_ativo ?? true) && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs font-medium text-[#737373]">
                Quantos dias antes:
              </span>
              <div className="inline-flex items-center bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-1">
                <button
                  type="button"
                  disabled={localDias <= 1 || isBusy}
                  onClick={() => onDiasStep(-1)}
                  className="w-7 h-7 flex items-center justify-center rounded-[14px] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-[#e5e5e5] cursor-pointer"
                  title="Diminuir antecedência"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-medium text-[#0a0a0a] px-3 text-center select-none flex items-center justify-center gap-1.5 min-w-[92px]">
                  {updatingKey === PAGAMENTOS_CONFIG_KEY.DIAS_AVISO_PREVIO ? (
                    <Loader2 className="w-3 h-3 text-[#0a0a0a] animate-spin" />
                  ) : null}
                  <span>
                    {localDias} {localDias === 1 ? "dia antes" : "dias antes"}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={localDias >= 5 || isBusy}
                  onClick={() => onDiasStep(1)}
                  className="w-7 h-7 flex items-center justify-center rounded-[14px] bg-white text-[#0a0a0a] hover:bg-[#f5f5f5] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-[#e5e5e5] cursor-pointer"
                  title="Aumentar antecedência"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-[#737373]">Canal:</span>
            {configuracoes?.cobranca_aviso_previo_whatsapp_ativo ? (
              <>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#25D366]/10 text-[#128C7E] font-medium text-[10px] border border-[#25D366]/20 leading-none">
                  <WhatsAppIcon className="w-2.5 h-2.5 text-[#25D366]" />
                  WhatsApp
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#f5f5f5] text-[#525252] font-medium text-[10px] border border-[#e5e5e5] leading-none">
                  <Smartphone className="w-2.5 h-2.5 text-[#737373]" />
                  App dos Pais
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#f5f5f5] text-[#525252] font-medium text-[10px] border border-[#e5e5e5] leading-none">
                <Smartphone className="w-2.5 h-2.5 text-[#737373]" />
                App dos Pais
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 items-start">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                No dia do vencimento
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Envia a mensagem na data exata em que a parcela vence.
              </p>
            </div>

            <div className="shrink-0 self-start pt-0.5 sm:row-span-2">
              <Switch
                id="switch-cobranca-vencimento-hoje-ativo"
                checked={configuracoes?.cobranca_vencimento_hoje_ativo ?? true}
                loading={updatingKey === PAGAMENTOS_CONFIG_KEY.VENCIMENTO_HOJE_ATIVO}
                disabled={isBusy}
                onCheckedChange={() =>
                  onToggleAviso(
                    PAGAMENTOS_CONFIG_KEY.VENCIMENTO_HOJE_ATIVO,
                    configuracoes?.cobranca_vencimento_hoje_ativo ?? true
                  )
                }
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-[#737373]">Canal:</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#25D366]/10 text-[#128C7E] font-medium text-[10px] border border-[#25D366]/20 leading-none">
                <WhatsAppIcon className="w-2.5 h-2.5 text-[#25D366]" />
                WhatsApp
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#f5f5f5] text-[#525252] font-medium text-[10px] border border-[#e5e5e5] leading-none">
                <Smartphone className="w-2.5 h-2.5 text-[#737373]" />
                App dos Pais
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 items-start">
            <div className="space-y-0.5 min-w-0 pr-1">
              <h3 className="text-sm font-medium text-[#0a0a0a] leading-tight">
                Em atraso (3 dias após vencer)
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                Lembra o responsável caso a parcela continue em aberto após 3 dias.
              </p>
            </div>

            <div className="shrink-0 self-start pt-0.5 sm:row-span-2">
              <Switch
                id="switch-cobranca-atraso-3-dias-ativo"
                checked={configuracoes?.cobranca_atraso_3_dias_ativo ?? true}
                loading={updatingKey === PAGAMENTOS_CONFIG_KEY.ATRASO_3_DIAS_ATIVO}
                disabled={isBusy}
                onCheckedChange={() =>
                  onToggleAviso(
                    PAGAMENTOS_CONFIG_KEY.ATRASO_3_DIAS_ATIVO,
                    configuracoes?.cobranca_atraso_3_dias_ativo ?? true
                  )
                }
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-[#737373]">Canal:</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#25D366]/10 text-[#128C7E] font-medium text-[10px] border border-[#25D366]/20 leading-none">
                <WhatsAppIcon className="w-2.5 h-2.5 text-[#25D366]" />
                WhatsApp
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[8px] bg-[#f5f5f5] text-[#525252] font-medium text-[10px] border border-[#e5e5e5] leading-none">
                <Smartphone className="w-2.5 h-2.5 text-[#737373]" />
                App dos Pais
              </span>
            </div>
          </div>
        </div>

        {isAutomatica && (
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 pr-1">
                <label
                  htmlFor="switch-enviar-recibo"
                  className="text-sm font-medium text-[#0a0a0a] leading-tight cursor-pointer block"
                >
                  Recibo automático após pagamento
                </label>
                <p className="text-xs text-[#737373] leading-relaxed mt-0.5">
                  Envia o recibo oficial no WhatsApp do pai assim que o pagamento Pix é confirmado.
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  id="switch-enviar-recibo"
                  checked={enviarRecibo}
                  disabled={isBusy}
                  onCheckedChange={onToggleReciboAutomatico}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
