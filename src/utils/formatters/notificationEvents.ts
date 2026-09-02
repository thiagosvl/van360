import {
  Bell,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  FileCheck,
  RotateCcw,
  Sparkles,
  Key,
  Shield,
  ShieldCheck,
  BarChart2,
  Gift,
  Calendar,
  Clock,
  UserPlus,
  UserCheck,
  LucideIcon,
} from "lucide-react";
import { AdminNotificationLogItem } from "@/services/api/admin/admin-notification.api";
import { phoneMask } from "@/utils/masks";
import {
  NotificationEventEnum,
  NotificationChannelEnum,
  NotificationStatusEnum,
} from "@/types/enums";

export enum NotificationCategoryEnum {
  TODOS = "TODOS",
  ROTA = "ROTA",
  COBRANCA = "COBRANCA",
  CONTRATO = "CONTRATO",
  MOTORISTA = "MOTORISTA",
  SISTEMA = "SISTEMA",
}

export enum NotificationAudienceEnum {
  RESPONSAVEL = "RESPONSAVEL",
  MOTORISTA = "MOTORISTA",
  ADMIN = "ADMIN",
}

export interface EventMeta {
  title: string;
  category: NotificationCategoryEnum;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export interface AudienceInfo {
  type: NotificationAudienceEnum;
  label: string;
  badgeStyle: string;
  primaryName: string;
  subName?: string;
}

const EVENT_METADATA: Record<NotificationEventEnum, EventMeta> = {
  [NotificationEventEnum.ROTA_INICIADA_IDA]: { title: "Início da Rota (Ida)", category: NotificationCategoryEnum.ROTA, icon: Navigation, iconBg: "bg-sky-500/10 border-sky-500/20", iconColor: "text-sky-400" },
  [NotificationEventEnum.ROTA_A_CAMINHO_IDA]: { title: "Van a Caminho (Ida)", category: NotificationCategoryEnum.ROTA, icon: Navigation, iconBg: "bg-sky-500/10 border-sky-500/20", iconColor: "text-sky-400" },
  [NotificationEventEnum.ROTA_EMBARCOU_IDA]: { title: "Embarque Confirmado (Ida)", category: NotificationCategoryEnum.ROTA, icon: UserCheck, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.ROTA_DESFEITO_EMBARQUE_IDA]: { title: "Embarque Desfeito (Ida)", category: NotificationCategoryEnum.ROTA, icon: RotateCcw, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.ROTA_INICIADA_VOLTA]: { title: "Início da Rota (Volta)", category: NotificationCategoryEnum.ROTA, icon: Navigation, iconBg: "bg-sky-500/10 border-sky-500/20", iconColor: "text-sky-400" },
  [NotificationEventEnum.ROTA_A_CAMINHO_VOLTA]: { title: "Van a Caminho (Volta)", category: NotificationCategoryEnum.ROTA, icon: Navigation, iconBg: "bg-sky-500/10 border-sky-500/20", iconColor: "text-sky-400" },
  [NotificationEventEnum.ROTA_DESEMBARCOU_VOLTA]: { title: "Desembarque Confirmado (Volta)", category: NotificationCategoryEnum.ROTA, icon: CheckCircle2, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.ROTA_DESFEITO_DESEMBARQUE_VOLTA]: { title: "Desembarque Desfeito (Volta)", category: NotificationCategoryEnum.ROTA, icon: RotateCcw, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.ROTA_REORDENADA]: { title: "Ordem da Rota Alterada", category: NotificationCategoryEnum.ROTA, icon: RotateCcw, iconBg: "bg-indigo-500/10 border-indigo-500/20", iconColor: "text-indigo-400" },

  [NotificationEventEnum.PASSAGEIRO_RECIBO_PAGAMENTO]: { title: "Recibo de Pagamento", category: NotificationCategoryEnum.COBRANCA, icon: Receipt, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.PASSAGEIRO_VENCIMENTO_PROXIMO]: { title: "Cobrança a Vencer", category: NotificationCategoryEnum.COBRANCA, icon: Calendar, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.PASSAGEIRO_VENCIMENTO_HOJE]: { title: "Cobrança Vence Hoje", category: NotificationCategoryEnum.COBRANCA, icon: AlertTriangle, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.PASSAGEIRO_ATRASADO]: { title: "Cobrança em Atraso", category: NotificationCategoryEnum.COBRANCA, icon: AlertTriangle, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" },

  [NotificationEventEnum.PASSAGEIRO_CONTRATO_DISPONIVEL]: { title: "Contrato para Assinatura", category: NotificationCategoryEnum.CONTRATO, icon: FileText, iconBg: "bg-purple-500/10 border-purple-500/20", iconColor: "text-purple-400" },
  [NotificationEventEnum.PASSAGEIRO_CONTRATO_ASSINADO]: { title: "Contrato Assinado", category: NotificationCategoryEnum.CONTRATO, icon: FileCheck, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.MOTORISTA_CONTRATO_ASSINADO]: { title: "Contrato Assinado pelo Responsável", category: NotificationCategoryEnum.CONTRATO, icon: FileCheck, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },

  [NotificationEventEnum.MOTORISTA_RESUMO_SEMANAL_PARCELAS]: { title: "Resumo Semanal das Parcelas", category: NotificationCategoryEnum.MOTORISTA, icon: BarChart2, iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-400" },
  [NotificationEventEnum.MOTORISTA_ANIVERSARIANTES_SEMANA]: { title: "Aniversariantes da Semana", category: NotificationCategoryEnum.MOTORISTA, icon: Gift, iconBg: "bg-pink-500/10 border-pink-500/20", iconColor: "text-pink-400" },
  [NotificationEventEnum.MOTORISTA_TESTE_BOAS_VINDAS]: { title: "Boas-vindas ao App", category: NotificationCategoryEnum.MOTORISTA, icon: Sparkles, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.MOTORISTA_TESTE_ENCERRADO]: { title: "Período de Teste Encerrado", category: NotificationCategoryEnum.MOTORISTA, icon: Clock, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_TRIAL_D14_ULTIMO_AVISO]: { title: "Último Aviso de Teste (D14)", category: NotificationCategoryEnum.MOTORISTA, icon: AlertTriangle, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_TRIAL_RECUPERACAO_1]: { title: "Oferta de Recuperação Trial", category: NotificationCategoryEnum.MOTORISTA, icon: Sparkles, iconBg: "bg-indigo-500/10 border-indigo-500/20", iconColor: "text-indigo-400" },
  [NotificationEventEnum.MOTORISTA_TRIAL_RECUPERACAO_2]: { title: "Oferta Final Trial", category: NotificationCategoryEnum.MOTORISTA, icon: Sparkles, iconBg: "bg-indigo-500/10 border-indigo-500/20", iconColor: "text-indigo-400" },

  [NotificationEventEnum.MOTORISTA_ASSINATURA_PAGO]: { title: "Assinatura SaaS Paga", category: NotificationCategoryEnum.MOTORISTA, icon: CheckCircle2, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.MOTORISTA_ASSINATURA_VENCENDO]: { title: "Assinatura SaaS a Vencer", category: NotificationCategoryEnum.MOTORISTA, icon: Calendar, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_ASSINATURA_VENCEU]: { title: "Assinatura SaaS Vencida", category: NotificationCategoryEnum.MOTORISTA, icon: AlertTriangle, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" },
  [NotificationEventEnum.MOTORISTA_ASSINATURA_ATRASADA]: { title: "Assinatura SaaS Atrasada", category: NotificationCategoryEnum.MOTORISTA, icon: AlertTriangle, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" },
  [NotificationEventEnum.MOTORISTA_ASSINATURA_FALHA_CARTAO]: { title: "Falha no Pagamento da Assinatura", category: NotificationCategoryEnum.MOTORISTA, icon: AlertTriangle, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" },
  [NotificationEventEnum.MOTORISTA_RENOVACAO_LEMBRETE]: { title: "Lembrete de Renovação", category: NotificationCategoryEnum.MOTORISTA, icon: Calendar, iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-400" },
  [NotificationEventEnum.MOTORISTA_RENOVACAO_URGENCIA]: { title: "Urgência de Renovação", category: NotificationCategoryEnum.MOTORISTA, icon: AlertTriangle, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_RENOVACAO_RECUPERACAO_1]: { title: "Recuperação de Renovação", category: NotificationCategoryEnum.MOTORISTA, icon: Sparkles, iconBg: "bg-indigo-500/10 border-indigo-500/20", iconColor: "text-indigo-400" },
  [NotificationEventEnum.MOTORISTA_RENOVACAO_RECUPERACAO_FINAL]: { title: "Última Chance de Renovação", category: NotificationCategoryEnum.MOTORISTA, icon: Sparkles, iconBg: "bg-indigo-500/10 border-indigo-500/20", iconColor: "text-indigo-400" },

  [NotificationEventEnum.MOTORISTA_CADASTRO_ADMIN]: { title: "Cadastro Criado pelo Administrador", category: NotificationCategoryEnum.MOTORISTA, icon: UserPlus, iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-400" },
  [NotificationEventEnum.MOTORISTA_RESET_SENHA_ADMIN]: { title: "Senha Redefinida pelo Administrador", category: NotificationCategoryEnum.MOTORISTA, icon: Key, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_INDICACAO_BONUS]: { title: "Bônus por Indicação", category: NotificationCategoryEnum.MOTORISTA, icon: Gift, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.MOTORISTA_INDICACAO_CADASTRO]: { title: "Novo Motorista Indicado", category: NotificationCategoryEnum.MOTORISTA, icon: UserPlus, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.MOTORISTA_NOVO_PRE_CADASTRO]: { title: "Novo Pré-cadastro Recebido", category: NotificationCategoryEnum.MOTORISTA, icon: UserPlus, iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-400" },
  [NotificationEventEnum.MOTORISTA_EQUIPE_CADASTRO]: { title: "Novo Membro de Equipe", category: NotificationCategoryEnum.MOTORISTA, icon: UserPlus, iconBg: "bg-indigo-500/10 border-indigo-500/20", iconColor: "text-indigo-400" },
  [NotificationEventEnum.MOTORISTA_EQUIPE_RESET_SENHA]: { title: "Senha de Equipe Redefinida", category: NotificationCategoryEnum.MOTORISTA, icon: Key, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_EQUIPE_STATUS_ALTERADO]: { title: "Status de Equipe Alterado", category: NotificationCategoryEnum.MOTORISTA, icon: RotateCcw, iconBg: "bg-slate-800 border-slate-700", iconColor: "text-slate-300" },
  [NotificationEventEnum.MOTORISTA_AUSENCIA_REGISTRADA]: { title: "Ausência de Aluno Registrada", category: NotificationCategoryEnum.ROTA, icon: Calendar, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.MOTORISTA_AUSENCIA_REMOVIDA]: { title: "Ausência de Aluno Cancelada", category: NotificationCategoryEnum.ROTA, icon: CheckCircle2, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },

  [NotificationEventEnum.AUTH_RECUPERACAO_SENHA]: { title: "Recuperação de Senha", category: NotificationCategoryEnum.SISTEMA, icon: Key, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
  [NotificationEventEnum.AUTH_SENHA_ALTERADA]: { title: "Senha Alterada", category: NotificationCategoryEnum.SISTEMA, icon: ShieldCheck, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.PASSAGEIRO_PIN_RESET]: { title: "Redefinição de PIN", category: NotificationCategoryEnum.SISTEMA, icon: Key, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },

  [NotificationEventEnum.ADMIN_NOVO_CADASTRO]: { title: "Novo Cadastro na Plataforma", category: NotificationCategoryEnum.SISTEMA, icon: Shield, iconBg: "bg-purple-500/10 border-purple-500/20", iconColor: "text-purple-400" },
  [NotificationEventEnum.ADMIN_NOVA_ASSINATURA]: { title: "Nova Assinatura Realizada", category: NotificationCategoryEnum.SISTEMA, icon: CheckCircle2, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  [NotificationEventEnum.ADMIN_ASSINATURA_CANCELADA]: { title: "Assinatura Cancelada", category: NotificationCategoryEnum.SISTEMA, icon: AlertTriangle, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" },
  [NotificationEventEnum.ADMIN_ASSINATURA_FALHA_PAGAMENTO]: { title: "Falha no Pagamento de Assinatura", category: NotificationCategoryEnum.SISTEMA, icon: AlertTriangle, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" },
  [NotificationEventEnum.ADMIN_SISTEMA_ALERTA]: { title: "Alerta do Sistema", category: NotificationCategoryEnum.SISTEMA, icon: AlertTriangle, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" },
};

export function getEventMeta(evento: string): EventMeta {
  const normalized = (evento || "").toUpperCase() as NotificationEventEnum;
  const meta = EVENT_METADATA[normalized];
  if (meta) return meta;

  const isRota = normalized.startsWith("ROTA_");
  const isPassageiro = normalized.startsWith("PASSAGEIRO_");
  const isMotorista = normalized.startsWith("MOTORISTA_");
  const isAdmin = normalized.startsWith("ADMIN_");

  let category: NotificationCategoryEnum = NotificationCategoryEnum.SISTEMA;
  if (isRota) category = NotificationCategoryEnum.ROTA;
  else if (isPassageiro) category = NotificationCategoryEnum.COBRANCA;
  else if (isMotorista) category = NotificationCategoryEnum.MOTORISTA;
  else if (isAdmin) category = NotificationCategoryEnum.SISTEMA;

  return {
    title: evento.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    category,
    icon: Bell,
    iconBg: "bg-slate-800 border-slate-700",
    iconColor: "text-slate-300",
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatRecipientContact(destinatario: string, canal?: string): string {
  if (!destinatario) return "Não informado";
  const trimmed = destinatario.trim();

  if (UUID_REGEX.test(trimmed)) {
    return "Dispositivo (Push App)";
  }

  if (trimmed.toUpperCase() === "TELEGRAM_ADMIN" || trimmed.toUpperCase() === "TELEGRAM") {
    return "Bot Admin (Telegram)";
  }

  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  if (canal?.toUpperCase() === NotificationChannelEnum.FIREBASE && !/^\+?\d{8,15}$/.test(trimmed)) {
    return "Dispositivo (Push App)";
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits || digits.length < 8) return trimmed;
  const cleanDigits = digits.replace(/^55(\d{10,11})$/, "$1");
  return phoneMask(cleanDigits) || trimmed;
}

export function getAudienceInfo(item: AdminNotificationLogItem): AudienceInfo {
  const normEvent = (item.evento || "").toUpperCase();
  const destUpper = (item.destinatario || "").toUpperCase();

  if (normEvent.startsWith("ADMIN_") || destUpper.includes("TELEGRAM_ADMIN") || destUpper.includes("TELEGRAM")) {
    return {
      type: NotificationAudienceEnum.ADMIN,
      label: "Admin / Sistema",
      badgeStyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      primaryName: "Canal do Administrador",
      subName: undefined,
    };
  }

  const isPassengerEvent = normEvent.startsWith("PASSAGEIRO_") || normEvent.startsWith("ROTA_");
  const hasPassengerId = !!(item as { passageiro_id?: string | null }).passageiro_id;

  if (isPassengerEvent || hasPassengerId) {
    const nomeResp = (item.payload?.nomeResponsavel as string) || null;
    const nomeAluno = (item.payload?.nomePassageiro as string) || null;
    return {
      type: NotificationAudienceEnum.RESPONSAVEL,
      label: "Responsável",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      primaryName: nomeResp || nomeAluno || "Responsável do Aluno",
      subName: nomeAluno && nomeResp ? `Aluno: ${nomeAluno}` : undefined,
    };
  }

  const nomeMotorista = (item.payload?.nomeMotorista as string) || (item.payload?.nome as string) || null;
  return {
    type: NotificationAudienceEnum.MOTORISTA,
    label: "Motorista",
    badgeStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    primaryName: nomeMotorista || "Motorista da Conta",
    subName: undefined,
  };
}
