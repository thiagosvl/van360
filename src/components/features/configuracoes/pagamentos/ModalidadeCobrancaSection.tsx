import { Banner } from "@/components/ui/Banner";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ModoCobranca, MODO_COBRANCA } from "@/hooks/ui/usePagamentosTabViewModel";
import { cn } from "@/lib/utils";
import {
  Check,
  CreditCard,
  Loader2,
  Play,
} from "lucide-react";

interface ModalidadeCobrancaSectionProps {
  modoVisual: ModoCobranca;
  changingTargetModo: ModoCobranca | null;
  isBusy: boolean;
  taxaFormatada: string;
  quantidadeExcecoesAtuais: number;
  onSelectModo: (modo: ModoCobranca) => void;
  onWatchVideo: () => void;
  onOpenPreviewCobranca: (modo?: ModoCobranca) => void;
}

export function ModalidadeCobrancaSection({
  modoVisual,
  changingTargetModo,
  isBusy,
  taxaFormatada,
  quantidadeExcecoesAtuais,
  onSelectModo,
  onWatchVideo,
  onOpenPreviewCobranca,
}: ModalidadeCobrancaSectionProps) {
  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-[#e5e5e5] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
            <CreditCard className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#0a0a0a] tracking-tight">
              Como você deseja cobrar os pais?
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Escolha o modo padrão da sua conta
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSelectModo(MODO_COBRANCA.DESATIVADO)}
          className={cn(
            "group p-4 rounded-[18px] border text-left transition-all flex flex-col justify-between gap-2 sm:gap-3 cursor-pointer relative disabled:opacity-60 disabled:cursor-not-allowed",
            modoVisual === MODO_COBRANCA.DESATIVADO
              ? "border-2 border-primary bg-primary/[0.02] shadow-xs"
              : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]/70 hover:border-[#737373]/30"
          )}
        >
          <div className="space-y-1.5 sm:space-y-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                  changingTargetModo === MODO_COBRANCA.DESATIVADO
                    ? "border-primary bg-primary/10 text-primary"
                    : modoVisual === MODO_COBRANCA.DESATIVADO
                      ? "bg-primary border-primary text-white shadow-2xs"
                      : "border-[#d4d4d4] bg-white group-hover:border-[#a3a3a3]"
                )}
              >
                {changingTargetModo === MODO_COBRANCA.DESATIVADO ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : modoVisual === MODO_COBRANCA.DESATIVADO ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : null}
              </div>
              <h4 className="text-sm font-semibold text-[#0a0a0a] leading-snug">
                Desativado (Manual)
              </h4>
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              Sem avisos automáticos. Você cobra, recebe e dá baixa manualmente.
            </p>
          </div>
        </button>

        <div
          role="button"
          tabIndex={isBusy ? -1 : 0}
          onClick={() => !isBusy && onSelectModo(MODO_COBRANCA.LEMBRETES)}
          onKeyDown={(e) => {
            if (!isBusy && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onSelectModo(MODO_COBRANCA.LEMBRETES);
            }
          }}
          className={cn(
            "group p-4 rounded-[18px] border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer relative",
            isBusy && "opacity-60 cursor-not-allowed",
            modoVisual === MODO_COBRANCA.LEMBRETES
              ? "border-2 border-primary bg-primary/[0.02] shadow-xs"
              : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]/70 hover:border-[#737373]/30"
          )}
        >
          <div className="space-y-1.5 sm:space-y-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                  changingTargetModo === MODO_COBRANCA.LEMBRETES
                    ? "border-primary bg-primary/10 text-primary"
                    : modoVisual === MODO_COBRANCA.LEMBRETES
                      ? "bg-primary border-primary text-white shadow-2xs"
                      : "border-[#d4d4d4] bg-white group-hover:border-[#a3a3a3]"
                )}
              >
                {changingTargetModo === MODO_COBRANCA.LEMBRETES ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : modoVisual === MODO_COBRANCA.LEMBRETES ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : null}
              </div>
              <h4 className="text-sm font-semibold text-[#0a0a0a] leading-snug">
                Lembretes no WhatsApp
              </h4>
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              Envia lembretes de vencimento no WhatsApp. Você confere e dá baixa manualmente.
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#e5e5e5]/80">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreviewCobranca(MODO_COBRANCA.LEMBRETES);
              }}
              className="w-full inline-flex items-center justify-center gap-2 h-8 px-3 rounded-[14px] bg-[#fafafa] hover:bg-[#f0f0f0] text-[#0a0a0a] text-xs font-medium transition-colors border border-[#e5e5e5] cursor-pointer"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Ver exemplo no WhatsApp</span>
            </button>
          </div>
        </div>

        <div
          role="button"
          tabIndex={isBusy ? -1 : 0}
          onClick={() => !isBusy && onSelectModo(MODO_COBRANCA.AUTOMATICA)}
          onKeyDown={(e) => {
            if (!isBusy && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onSelectModo(MODO_COBRANCA.AUTOMATICA);
            }
          }}
          className={cn(
            "group p-4 rounded-[18px] border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer relative",
            isBusy && "opacity-60 cursor-not-allowed",
            modoVisual === MODO_COBRANCA.AUTOMATICA
              ? "border-2 border-emerald-600 bg-emerald-50/40 shadow-xs"
              : "border-[#e5e5e5] bg-white hover:bg-[#fafafa]/70 hover:border-[#737373]/30"
          )}
        >
          <div className="space-y-1.5 sm:space-y-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                  changingTargetModo === MODO_COBRANCA.AUTOMATICA
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-600"
                    : modoVisual === MODO_COBRANCA.AUTOMATICA
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                      : "border-[#d4d4d4] bg-white group-hover:border-[#a3a3a3]"
                )}
              >
                {changingTargetModo === MODO_COBRANCA.AUTOMATICA ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : modoVisual === MODO_COBRANCA.AUTOMATICA ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : null}
              </div>
              <h4 className="text-sm font-semibold text-[#0a0a0a] leading-snug">
                Cobrança & Baixa Automática
              </h4>
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              Envia QR Code Pix no WhatsApp, dá baixa na hora, envia o recibo e transfere para sua conta (taxa de {taxaFormatada}).
            </p>
          </div>

          <div className="pt-2.5 border-t border-[#e5e5e5]/80 space-y-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWatchVideo();
              }}
              className="w-full inline-flex items-center justify-center gap-2 h-8 px-3 rounded-[14px] bg-primary/[0.06] hover:bg-primary/[0.12] text-primary text-xs font-semibold transition-colors border border-primary/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-primary shrink-0" />
              <span>Ver vídeo de como funciona</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreviewCobranca(MODO_COBRANCA.AUTOMATICA);
              }}
              className="w-full inline-flex items-center justify-center gap-2 h-8 px-3 rounded-[14px] bg-[#fafafa] hover:bg-[#f0f0f0] text-[#0a0a0a] text-xs font-medium transition-colors border border-[#e5e5e5] cursor-pointer"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Ver exemplo no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {quantidadeExcecoesAtuais > 0 && (
        <Banner
          variant="neutral"
          description={`Você possui ${quantidadeExcecoesAtuais} ${
            quantidadeExcecoesAtuais === 1
              ? "aluno com regra personalizada na carteirinha"
              : "alunos com regras personalizadas na carteirinha"
          }.`}
        />
      )}
    </div>
  );
}
