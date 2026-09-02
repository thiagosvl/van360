import { useState } from "react";
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Mail,
  MessageSquare,
  User,
  Radio,
} from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
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
    id: NotificationEventEnum.MOTORISTA_ANIVERSARIANTES_SEMANA,
    title: "Aniversariantes da Semana",
    description: "Cruza os alunos ativos do motorista e envia a lista de aniversariantes da semana atual.",
    channels: [
      { type: "push", label: "Push no Celular" },
    ],
    category: "Operacional",
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
      onClose();
    } catch {
      // erro tratado no onError do hook
    }
  };

  const formattedPhone = userPhone ? phoneMask(userPhone) : null;

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="xl"
      description="Diálogo de teste e disparo manual de notificações para motorista"
    >
      <AdminBaseDialog.Header
        title="Disparar Notificação de Teste"
        subtitle="Selecione um evento operacional para testar o envio em tempo real."
        icon={<Bell className="h-5 w-5 text-blue-400" />}
        onClose={onClose}
      />

      <AdminBaseDialog.Body>
        <div className="space-y-5 py-1">
          {/* Card do Destinatário no Tema Dark */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                {userName ? userName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{userName || "Motorista"}</p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-0.5">
                  {formattedPhone && <span>{formattedPhone}</span>}
                  {formattedPhone && userEmail && <span>•</span>}
                  {userEmail && <span className="truncate">{userEmail}</span>}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              Destinatário
            </span>
          </div>

          {/* Lista de Seleção de Eventos */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-0.5">
              Selecione o Evento Operacional
            </label>

            <div className="grid gap-3">
              {NOTIFICATION_EVENTS.map((event) => {
                const isSelected = selectedEventId === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/30"
                        : "border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-blue-400 bg-blue-500 text-white shadow-sm"
                              : "border-slate-600 bg-slate-900"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">
                          {event.title}
                        </h4>
                      </div>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        {event.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300/80 mt-2 pl-8 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3 pl-8 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400">
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

          {/* Banner de Aviso de Dados Reais */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
              O disparo consulta a base de dados real do motorista. Se não houver cobranças pendentes ou aniversariantes para a semana atual, o sistema avisará informando a ausência de dados.
            </p>
          </div>
        </div>
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={dispatchMutation.isPending}
        />
        <AdminBaseDialog.Action
          label={dispatchMutation.isPending ? "Enviando..." : "Disparar Notificação"}
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


