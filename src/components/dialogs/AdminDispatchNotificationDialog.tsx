import { useState } from "react";
import {
  Bell,
  Send,
  CheckCircle2,
  Smartphone,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Banner } from "@/components/ui/Banner";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useDispatchDriverNotificationAdmin } from "@/hooks/api/adminHooks";
import { phoneMask } from "@/utils/masks";
import { NotificationEventEnum } from "@/types/enums";

export interface AdminDispatchNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
}

export type NotificationChannelType = "push" | "whatsapp" | "email";

interface NotificationEventConfig {
  id: NotificationEventEnum;
  title: string;
  description: string;
  channels: Array<{
    type: NotificationChannelType;
    label: string;
  }>;
  category: string;
}

const NOTIFICATION_EVENTS: NotificationEventConfig[] = [
  {
    id: NotificationEventEnum.MOTORISTA_RESUMO_SEMANAL_PARCELAS,
    title: "Resumo Semanal das Parcelas",
    description: "Calcula e consolida cobranças atrasadas e a vencer nos próximos 7 dias para envio direto ao app.",
    channels: [
      { type: "push", label: "Push no Celular" },
    ],
    category: "Operacional",
  },
  {
    id: NotificationEventEnum.MOTORISTA_COBRANCAS_HOJE,
    title: "Alerta de Parcelas Vencendo Hoje",
    description: "Verifica as parcelas escolares que vencem hoje (ou notifica que está em dia / ativação se não tem alunos cadastrados).",
    channels: [
      { type: "push", label: "Push no Celular" },
    ],
    category: "Operacional",
  },
  {
    id: NotificationEventEnum.MOTORISTA_ANIVERSARIANTES_SEMANA,
    title: "Aniversariantes da Semana",
    description: "Cruza os alunos ativos do motorista e envia a lista de aniversariantes da semana atual.",
    channels: [
      { type: "push", label: "Push no Celular" },
    ],
    category: "Operacional",
  },
  {
    id: NotificationEventEnum.MOTORISTA_ASSINATURA_VENCENDO,
    title: "Assinatura SaaS a Vencer",
    description: "Envia o lembrete de renovação da assinatura com código Pix Copia e Cola e link de pagamento.",
    channels: [
      { type: "whatsapp", label: "WhatsApp" },
      { type: "email", label: "E-mail" },
    ],
    category: "SaaS / Financeiro",
  },
  {
    id: NotificationEventEnum.MOTORISTA_TRIAL_D14_ULTIMO_AVISO,
    title: "Último Dia de Teste Grátis (D-14)",
    description: "Envia o aviso de encerramento do período de teste com os benefícios da plataforma e link direto para assinar.",
    channels: [
      { type: "email", label: "E-mail" },
      { type: "push", label: "Push no Celular" },
    ],
    category: "SaaS / Onboarding",
  },
  {
    id: NotificationEventEnum.MOTORISTA_TESTE_ENCERRADO,
    title: "Período de Teste Encerrado",
    description: "Notifica que o período de testes grátis chegou ao fim e disponibiliza o botão para assinar e reativar.",
    channels: [
      { type: "email", label: "E-mail" },
      { type: "push", label: "Push no Celular" },
    ],
    category: "SaaS / Onboarding",
  },
];

function ChannelBadge({ type, label }: { type: NotificationChannelType; label: string }) {
  if (type === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
        {label}
      </span>
    );
  }

  if (type === "email") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
        <Mail className="h-3.5 w-3.5 text-sky-400" />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
      <Smartphone className="h-3.5 w-3.5 text-blue-400" />
      {label}
    </span>
  );
}

export default function AdminDispatchNotificationDialog({
  isOpen,
  onClose,
  userId,
  userName,
  userPhone,
  userEmail,
}: AdminDispatchNotificationDialogProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(NOTIFICATION_EVENTS[0].id);
  const dispatchMutation = useDispatchDriverNotificationAdmin();

  const handleDispatch = async () => {
    if (!userId || !selectedEventId) return;

    try {
      await dispatchMutation.mutateAsync({
        id: userId,
        data: { evento: selectedEventId },
      });
      safeCloseDialog(onClose);
    } catch {
      // erro tratado no onError do hook
    }
  };

  const formattedPhone = userPhone ? phoneMask(userPhone) : null;

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) safeCloseDialog(onClose);
      }}
      maxWidth="xl"
      description="Diálogo de teste e disparo manual de notificações para motorista"
    >
      <AdminBaseDialog.Header
        title="Disparar notificação de teste"
        subtitle="Selecione um evento operacional para testar o envio em tempo real."
        icon={<Bell className="h-5 w-5 text-primary" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <AdminBaseDialog.Body>
        <div className="space-y-4 py-1">
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{userName || "Motorista"}</p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
                  {formattedPhone && <span>{formattedPhone}</span>}
                  {formattedPhone && userEmail && <span>•</span>}
                  {userEmail && <span className="truncate">{userEmail}</span>}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
              Destinatário
            </span>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground block px-0.5">
              Selecione o evento operacional
            </label>

            <div className="grid gap-2.5">
              {NOTIFICATION_EVENTS.map((event) => {
                const isSelected = selectedEventId === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-border/80 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-secondary"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                          {event.title}
                        </h4>
                      </div>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground border border-border shrink-0">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 pl-8 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3 pl-8 flex-wrap">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Canais acionados:
                      </span>
                      {event.channels.map((ch, idx) => (
                        <ChannelBadge key={idx} type={ch.type} label={ch.label} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Banner
            variant="warning"
            title="Atenção ao contexto do motorista"
            description="O disparo consulta a base de dados real do motorista. Se não houver cobranças pendentes ou aniversariantes para a semana atual, o sistema avisará informando a ausência de dados."
          />
        </div>
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          disabled={dispatchMutation.isPending}
        />
        <AdminBaseDialog.Action
          label={dispatchMutation.isPending ? "Enviando..." : "Disparar notificação"}
          variant="primary"
          icon={<Send className="h-4 w-4" />}
          onClick={handleDispatch}
          loading={dispatchMutation.isPending}
          disabled={dispatchMutation.isPending}
        />
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}
