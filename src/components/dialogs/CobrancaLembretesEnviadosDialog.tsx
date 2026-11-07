import { UnifiedEmptyState } from "@/components/empty";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { useAppPreferences, useCobrancaLembretesEnviados } from "@/hooks";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { Cobranca, CobrancaLembreteEnviado } from "@/types/cobranca";
import { CobrancaLembreteTipoEnum, ModoCobrancaEnum } from "@/types/enums";
import {
  formatarDataCurtaBR,
  formatarHoraMinuto,
  getMesNome,
} from "@/utils/formatters";
import { formatRecipientContact } from "@/utils/formatters/notificationEvents";
import {
  AlertCircle,
  BadgePercent,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";

export interface CobrancaLembretesEnviadosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cobranca: Cobranca;
  modoEfetivo?: ModoCobrancaEnum | string;
}

function getLembreteItemPresentation(
  item: CobrancaLembreteEnviado,
  isAutomatica: boolean
) {
  const prefixo = isAutomatica ? "Cobrança" : "Lembrete";
  const sufixoGenero = isAutomatica ? "a" : "o";
  const dias = item.dias_referencia ?? 0;

  switch (item.tipo) {
    case CobrancaLembreteTipoEnum.ANTECIPADO:
      return {
        titulo: `${prefixo} antecipad${sufixoGenero}`,
        subtitulo:
          dias === 1
            ? "1 dia antes do vencimento"
            : `${dias > 0 ? dias : 2} dias antes do vencimento`,
        icon: <Calendar className="h-4 w-4 text-[#0a0a0a]" />,
      };

    case CobrancaLembreteTipoEnum.VENCIMENTO_HOJE:
      return {
        titulo: `${prefixo} no dia do vencimento`,
        subtitulo: "Enviado na data de vencimento",
        icon: <Clock className="h-4 w-4 text-[#0a0a0a]" />,
      };

    case CobrancaLembreteTipoEnum.ATRASO:
      return {
        titulo: `${prefixo} em atraso`,
        subtitulo:
          dias === 1
            ? "1 dia após o vencimento"
            : `${dias > 0 ? dias : 3} dias após o vencimento`,
        icon: <AlertCircle className="h-4 w-4 text-[#0a0a0a]" />,
      };

    case CobrancaLembreteTipoEnum.ISENCAO_ENCARGOS:
      return {
        titulo: "Reenvio com isenção de encargos",
        subtitulo: "Novo Pix sem multa e juros",
        icon: <BadgePercent className="h-4 w-4 text-[#0a0a0a]" />,
      };

    default:
      return {
        titulo: `${prefixo} enviad${sufixoGenero}`,
        subtitulo: "Enviado via WhatsApp",
        icon: <Bell className="h-4 w-4 text-[#0a0a0a]" />,
      };
  }
}

export function CobrancaLembretesEnviadosDialog({
  open,
  onOpenChange,
  cobranca,
  modoEfetivo = ModoCobrancaEnum.LEMBRETES,
}: CobrancaLembretesEnviadosDialogProps) {
  const { formatAlunoNome } = useAppPreferences();
  const isAutomatica = modoEfetivo === ModoCobrancaEnum.AUTOMATICA;
  const isProjection = cobranca.isProjection === true;

  const { data: lembretes = [], isLoading } = useCobrancaLembretesEnviados(
    cobranca.id,
    {
      enabled: open && !isProjection,
    }
  );

  const alunoNome = formatAlunoNome(cobranca.passageiro?.nome || "Aluno");
  const mesAnoTexto = `${getMesNome(cobranca.mes)}/${cobranca.ano}`;

  const tituloDialog = isAutomatica
    ? "Cobranças Enviadas"
    : "Lembretes Enviados";

  const bannerDescription = isAutomatica
    ? "Aqui constam apenas as cobranças enviadas automaticamente pelo Van360 no WhatsApp do responsável."
    : "Aqui constam apenas os lembretes enviados automaticamente pelo Van360 no WhatsApp do responsável.";

  const emptyTitle = isAutomatica
    ? "Nenhuma cobrança enviada"
    : "Nenhum lembrete enviado";

  const emptyDescription = isAutomatica
    ? "Ainda não houve envio automático de cobrança no WhatsApp para esta parcela."
    : "Ainda não houve envio automático de lembrete no WhatsApp para esta parcela.";

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => safeCloseDialog(() => onOpenChange(val))}
      maxWidth="md"
    >
      <BaseDialog.Header
        title={tituloDialog}
        subtitle={`${alunoNome} • Parcela de ${mesAnoTexto}`}
        icon={<WhatsAppIcon className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body>
        <div className="space-y-4">
          <Banner variant="neutral" description={bannerDescription} />

          {!isProjection && isLoading ? (
            <div className="space-y-2.5">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className="h-16 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] animate-pulse"
                />
              ))}
            </div>
          ) : isProjection || lembretes.length === 0 ? (
            <UnifiedEmptyState
              icon={Bell}
              title={emptyTitle}
              description={emptyDescription}
              className="shadow-none"
            />
          ) : (
            <div className="space-y-2.5">
              {lembretes.map((item) => {
                const info = getLembreteItemPresentation(item, isAutomatica);
                const dataCurta = formatarDataCurtaBR(item.enviado_em);
                const horaMinuto = formatarHoraMinuto(item.enviado_em);
                const telefoneFormatado = item.destinatario
                  ? formatRecipientContact(item.destinatario, "WABA")
                  : null;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-[18px] bg-white border border-[#e5e5e5] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center shrink-0">
                        {info.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0a0a0a] leading-tight truncate">
                          {info.titulo}
                        </p>
                        <p className="text-xs text-[#737373] font-normal mt-0.5 truncate">
                          {info.subtitulo}
                          {telefoneFormatado ? ` • ${telefoneFormatado}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a0a0a] tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{dataCurta}</span>
                      </div>
                      {horaMinuto && (
                        <span className="text-[11px] text-[#737373] font-normal tabular-nums mt-0.5">
                          às {horaMinuto}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar"
          variant="secondary"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
export default CobrancaLembretesEnviadosDialog;
