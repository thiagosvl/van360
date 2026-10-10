import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { toast } from "@/utils/notifications/toast";
import {
  useAdminUserDetails,
  useUpdateUserAdmin,
  useUpdateSubscriptionAdmin,
  useResetPasswordAdmin,
  useAdminUserLogs,
  useAdminUserNotifications,
  useDeleteUserAdmin,
  useRemoveUserReferralAdmin,
  useAdminImpersonateUser,
  useDeleteInvoiceAdmin,
  useConfirmInvoicePaymentAdmin,
  useAdminUserContracts,
  useAdminUserPassageiros,
  useAdminUserPrePassageiros,
  useAdminUserVeiculos,
  useAdminUserEscolas,
  useAdminUserEquipe,
  useAdminUserReferral,
} from "@/hooks/api/adminHooks";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Save,
  Loader2,
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  Key,
  Check,
  Eye,
  ExternalLink,
  Terminal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  Filter,
  X,
  Bus,
  GraduationCap,
  Users,
  Clock,
  LayoutDashboard,
  Share2,
  Settings,
  FolderKanban,
  Copy,
  MapPin,
  PenTool,
  FileText,
  CheckCircle2,
  UserCheck,
  UserPlus,
  Edit2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { AdminUserPassengersTab } from "@/components/features/admin/user-details/AdminUserPassengersTab";
import { AdminUserVehiclesTab } from "@/components/features/admin/user-details/AdminUserVehiclesTab";
import { AdminUserSchoolsTab } from "@/components/features/admin/user-details/AdminUserSchoolsTab";
import { AdminUserPendingRequestsTab } from "@/components/features/admin/user-details/AdminUserPendingRequestsTab";
import { AdminUserReferralTab } from "@/components/features/admin/user-details/AdminUserReferralTab";
import { AdminUserEquipeTab } from "@/components/features/admin/user-details/AdminUserEquipeTab";
import { Banner } from "@/components/ui/Banner";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";
import { NotificationLogsList, NotificationFiltersState, NOTIFICATION_FILTER_ALL } from "@/components/features/admin/NotificationLogsList";
import { AdminUserFinancialConfigCard } from "@/components/features/admin/user-details/AdminUserFinancialConfigCard";
import { RepasseLogsList } from "@/components/features/admin/RepasseLogsList";
import { useAdminRepasses, useAdminRetryRepasse } from "@/hooks/api/admin/useAdminRepasseHooks";
import { RepasseFiltersState } from "@/types/admin-repasse";
import { NotificationCategoryEnum } from "@/utils/formatters/notificationEvents";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { formatarChavePix } from "@/utils/formatters/pix";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { APP_AVAILABILITY } from "@/utils/detectPlatform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayout } from "@/contexts/LayoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SubscriptionStatus, SubscriptionInvoiceStatus, CheckoutPaymentMethod, AtividadeAcao, AtividadeEntidadeTipo, AdminUserTab, AdminUserSubTab, DriverContractConfigStatus,
  ContractMultaTipo, IndicacaoStatus, CanalAquisicao
} from "@/types/enums";

const ADMIN_USER_TABS = Object.values(AdminUserTab);
const ADMIN_USER_SUBTABS = Object.values(AdminUserSubTab);
import { cpfCnpjMask as cpfMask, phoneMask, moneyMask, cpfCnpjMask } from "@/utils/masks";
import { SubscriptionStatusBadge, SUBSCRIPTION_STATUS_DETAILS } from "@/components/ui/SubscriptionStatusBadge";
import { AdminKpiCard } from "@/components/ui/AdminKpiCard";
import { ROUTES } from "@/constants/routes";
import { InvoiceStatusBadge } from "@/components/ui/InvoiceStatusBadge";
import { PAYMENT_METHOD_LABELS } from "@/constants/paymentMethods";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/forms";
import { cpfCnpjSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { dateMask as maskDate } from "@/utils/masks";
import { toPersistenceString, getNowBR, getEndOfDayBR, toISODateTimeBR, formatSafeBrazilianDate, formatDateTime } from "@/utils/dateUtils";
import { AdminUserContractsTab } from "@/components/features/admin/user-details/AdminUserContractsTab";
import { formatCurrency } from "@/utils/formatters";
import { CanalAquisicaoLabels, resolveOrigemAtribuicao } from "@/utils/acquisition-channel.utils";
import { AcquisitionBadge } from "@/components/ui/AcquisitionBadge";
import { DispositivoCadastroLabels } from "@/utils/dispositivo-cadastro.utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { openBrowserLink } from "@/utils/browser";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = Object.entries(SUBSCRIPTION_STATUS_DETAILS).map(([value, detail]) => ({
  value,
  label: detail.label,
}));

const userSchema = z.object({
  nome: z.string()
    .min(2, "Deve ter pelo menos 2 caracteres")
    .refine((val) => val.trim().split(/\s+/).length >= 2, "Digite seu nome e sobrenome"),
  apelido: z.string().optional(),
  cpfcnpj: cpfCnpjSchema,
  telefone: phoneSchema,
  email: emailSchema,
  ativo: z.boolean(),
  cobranca_aviso_previo_whatsapp_ativo: z.boolean().optional(),
  data_nascimento: z.string().optional().refine((val) => {
    if (!val) return true;
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(val)) return false;
    return true;
  }, "Data inválida"),
  razao_social: z.string().optional(),
}).superRefine((data, ctx) => {
  const isCnpj = data.cpfcnpj.replace(/\D/g, "").length > 11;
  if (isCnpj && (!data.razao_social || data.razao_social.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Razão social é obrigatória para CNPJ",
      path: ["razao_social"],
    });
  }
});

type UserFormData = z.infer<typeof userSchema>;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function AdminUserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openConfirmationDialog, closeConfirmationDialog, openAdminDispatchNotificationDialog, openAdminDriverCobrancaDemoDialog, openAdminConfigureReferralDialog, openImageFullscreen, setPageTitle } = useLayout();
  const resetPassword = useResetPasswordAdmin();
  const deleteUser = useDeleteUserAdmin();
  const deleteInvoiceMutation = useDeleteInvoiceAdmin(id);
  const confirmPaymentMutation = useConfirmInvoicePaymentAdmin(id);
  const removeReferralMutation = useRemoveUserReferralAdmin();
  const impersonateUser = useAdminImpersonateUser();
  const [resetPasswordData, setResetPasswordData] = useState<{ open: boolean; senha: string } | null>(null);

  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const previewContrato = usePreviewContrato();

  const { data, isLoading } = useAdminUserDetails(id!);
  const sub = data?.assinatura;
  const updateUser = useUpdateUserAdmin();

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ADMIN_USER_TABS.includes(tabParam as AdminUserTab)) return tabParam as AdminUserTab;
    if (tabParam && ADMIN_USER_SUBTABS.includes(tabParam as AdminUserSubTab)) return AdminUserTab.CADASTROS;
    return AdminUserTab.GERAL;
  }, [searchParams]);

  const activeSubTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    const subTabParam = searchParams.get("subtab");
    if (subTabParam && ADMIN_USER_SUBTABS.includes(subTabParam as AdminUserSubTab)) return subTabParam as AdminUserSubTab;
    if (tabParam && ADMIN_USER_SUBTABS.includes(tabParam as AdminUserSubTab)) return tabParam as AdminUserSubTab;
    return AdminUserSubTab.PASSAGEIROS;
  }, [searchParams]);

  const isCadastros = activeTab === AdminUserTab.CADASTROS;
  const isPassageirosTab = isCadastros && activeSubTab === AdminUserSubTab.PASSAGEIROS;
  const isSolicitacoesTab = isCadastros && activeSubTab === AdminUserSubTab.SOLICITACOES;
  const isVeiculosTab = isCadastros && activeSubTab === AdminUserSubTab.VEICULOS;
  const isEscolasTab = isCadastros && activeSubTab === AdminUserSubTab.ESCOLAS;
  const isContratosTab = isCadastros && activeSubTab === AdminUserSubTab.CONTRATOS;
  const isIndicacoesTab = isCadastros && activeSubTab === AdminUserSubTab.INDICACOES;
  const isEquipeTab = isCadastros && activeSubTab === AdminUserSubTab.EQUIPE;

  const { data: passageirosLazy } = useAdminUserPassageiros(id!, {
    enabled: isPassageirosTab || isContratosTab,
  });

  const { data: prePassageirosLazy } = useAdminUserPrePassageiros(id!, {
    enabled: isSolicitacoesTab,
  });

  const { data: veiculosLazy } = useAdminUserVeiculos(id!, {
    enabled: isVeiculosTab,
  });

  const { data: escolasLazy } = useAdminUserEscolas(id!, {
    enabled: isEscolasTab,
  });

  const { data: contratosLazy } = useAdminUserContracts(id!, {
    enabled: isContratosTab,
  });

  const { data: referralLazy } = useAdminUserReferral(id!, {
    enabled: isIndicacoesTab,
  });

  const { data: equipeLazy } = useAdminUserEquipe(id!, {
    enabled: isEquipeTab,
  });

  const passageirosList = passageirosLazy || data?.passageiros || [];
  const prePassageirosList = prePassageirosLazy || data?.prePassageiros || [];
  const veiculosList = veiculosLazy || data?.veiculos || [];
  const escolasList = escolasLazy || data?.escolas || [];
  const contratosList = contratosLazy || data?.contratos || [];
  const equipeList = equipeLazy || data?.equipe || [];
  const referralSummaryData = referralLazy?.referralSummary || data?.referralSummary;
  const referredUsersList = referralLazy?.referredUsers || data?.referredUsers || [];
  const indicadorData = data?.indicador || referralLazy?.indicador;

  const passageirosComContratoSet = useMemo(() => {
    const set = new Set<string>();
    for (const c of contratosList) {
      if (c.passageiro_id) {
        set.add(c.passageiro_id);
      }
    }
    return set;
  }, [contratosList]);

  const passageirosSemContrato = useMemo(() => {
    const totalPassageiros = data?.kpis?.passageirosCount ?? passageirosList.length ?? 0;
    if (passageirosList.length === 0) {
      const totalContratos = data?.kpis?.contratosCount ?? contratosList.length ?? 0;
      return Math.max(0, totalPassageiros - totalContratos);
    }
    return passageirosList.filter((p) => !passageirosComContratoSet.has(p.id)).length;
  }, [data?.kpis?.passageirosCount, data?.kpis?.contratosCount, passageirosList, contratosList, passageirosComContratoSet]);

  const handleOpenMinutaPreview = async () => {
    if (!data?.user) return;
    setIsPreviewPdfOpen(true);
    setPreviewPdfUrl(null);
    try {
      const config = data.user.config_contrato as Record<string, any> | null;
      const result = await previewContrato.mutateAsync({
        usuarioId: data.user.id,
        multaAtraso: config?.multa_atraso,
        jurosAtraso: config?.juros_atraso,
        multaRescisao: config?.multa_rescisao,
        secoes: config?.secoes,
        clausulas: config?.clausulas,
        assinaturaCondutorUrl: data.user.assinatura_digital_url,
      });
      setPreviewPdfUrl(result.url);
    } catch (error) {
      setIsPreviewPdfOpen(false);
      console.error("Erro ao gerar prévia da minuta", error);
    }
  };

  const formatarRegraContrato = (regra?: { valor?: number | string | null; tipo?: string | null } | null) => {
    if (!regra || regra.valor === undefined || regra.valor === null || regra.valor === "") return "—";
    const num = Number(regra.valor);
    if (isNaN(num)) return "—";
    if (regra.tipo === ContractMultaTipo.PERCENTUAL || regra.tipo === "percentual" || regra.tipo === "%") {
      return `${num}%`;
    }
    return formatCurrency(num);
  };
  const updateSub = useUpdateSubscriptionAdmin();

  useEffect(() => {
    setPageTitle("Detalhes do Usuário");
  }, [setPageTitle]);



  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === "cadastros") {
        newParams.set("tab", "cadastros");
        if (!newParams.get("subtab")) {
          newParams.set("subtab", "passageiros");
        }
      } else {
        newParams.set("tab", value);
        newParams.delete("subtab");
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handleSubTabChange = useCallback(
    (subValue: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", "cadastros");
      newParams.set("subtab", subValue);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const [logsPage, setLogsPage] = useState(1);
  const [limitStr, setLimitStr] = useState("25");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const today = toPersistenceString(getNowBR());
  const sevenDaysAgo = toPersistenceString(new Date(getNowBR().getTime() - 7 * 24 * 60 * 60 * 1000));

  const [logsFilter, setLogsFilter] = useState({
    dataInicio: sevenDaysAgo,
    dataFim: today,
    acao: "all",
    entidade: "all"
  });

  const { data: logsData, isFetching: isFetchingLogs, refetch: refetchLogs } = useAdminUserLogs(id!, {
    page: logsPage,
    limit: parseInt(limitStr),
    dataInicio: logsFilter.dataInicio || undefined,
    dataFim: logsFilter.dataFim || undefined,
    acao: logsFilter.acao === "all" ? undefined : logsFilter.acao,
    entidade: logsFilter.entidade === "all" ? undefined : logsFilter.entidade,
  });

  const [notifPage, setNotifPage] = useState(1);
  const [notifLimitStr, setNotifLimitStr] = useState("25");
  const [notifFilters, setNotifFilters] = useState<NotificationFiltersState>({
    categoria: NotificationCategoryEnum.TODOS,
    canal: NOTIFICATION_FILTER_ALL,
    status: NOTIFICATION_FILTER_ALL,
    search: "",
  });

  const { data: notifData, isFetching: isFetchingNotif, refetch: refetchNotif } = useAdminUserNotifications(id!, {
    page: notifPage,
    limit: parseInt(notifLimitStr),
    categoria: notifFilters.categoria === NotificationCategoryEnum.TODOS ? undefined : notifFilters.categoria,
    canal: notifFilters.canal === NOTIFICATION_FILTER_ALL ? undefined : notifFilters.canal,
    status: notifFilters.status === NOTIFICATION_FILTER_ALL ? undefined : notifFilters.status,
    search: notifFilters.search.trim() || undefined,
  });

  const handleNotifFiltersChange = (newFilters: NotificationFiltersState) => {
    setNotifFilters(newFilters);
    setNotifPage(1);
  };

  const [repassePage, setRepassePage] = useState(1);
  const [repasseFilters, setRepasseFilters] = useState<RepasseFiltersState>({
    status: "TODOS",
    search: "",
    dataInicio: "",
    dataFim: "",
  });

  const { data: repasseData, isLoading: isFetchingRepasses } = useAdminRepasses({
    motorista_id: id,
    page: repassePage,
    limit: 20,
    status: repasseFilters.status,
    search: repasseFilters.search.trim() || undefined,
  });

  const retryRepasseMutation = useAdminRetryRepasse();

  const handleRepasseFiltersChange = (newFilters: RepasseFiltersState) => {
    setRepasseFilters(newFilters);
    setRepassePage(1);
  };

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: "",
      apelido: "",
      email: "",
      telefone: "",
      cpfcnpj: "",
      ativo: true,
      data_nascimento: "",
      cobranca_aviso_previo_whatsapp_ativo: false,
    },
  });

  const [subForm, setSubForm] = useState({
    plano_id: "",
    status: "" as string,
    data_vencimento: "",
    trial_ends_at: "",
    valor_base_mensal: "",
    valor_base_anual: "",
    valor_promocional_mensal: "",
    valor_promocional_anual: "",
    data_fim_promocao: "",
  });

  useEffect(() => {
    if (data?.user) {
      const u = data.user;
      const formatBirth = () => {
        if (!u.data_nascimento) return "";
        const clean = u.data_nascimento.trim();
        if (clean.includes("-")) {
          const parts = clean.split("-");
          if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
          }
        }
        return clean;
      };

      userForm.reset({
        nome: u.nome || "",
        razao_social: u.razao_social || "",
        apelido: u.apelido || "",
        email: u.email || "",
        telefone: phoneMask(u.telefone || ""),
        cpfcnpj: cpfMask(u.cpfcnpj || ""),
        ativo: u.ativo ?? true,
        data_nascimento: formatBirth(),
        cobranca_aviso_previo_whatsapp_ativo: data?.configuracoes?.cobranca_aviso_previo_whatsapp_ativo ?? false,
      });
    }
    if (data?.assinatura) {
      const s = data.assinatura;
      setSubForm({
        plano_id: s.plano_id || "",
        status: s.status || "",
        data_vencimento: toDateInputValue(s.data_vencimento),
        trial_ends_at: toDateInputValue(s.trial_ends_at),
        valor_base_mensal: s.valor_base_mensal !== null && s.valor_base_mensal !== undefined ? moneyMask(Number(s.valor_base_mensal)) : "",
        valor_base_anual: s.valor_base_anual !== null && s.valor_base_anual !== undefined ? moneyMask(Number(s.valor_base_anual)) : "",
        valor_promocional_mensal: s.valor_promocional_mensal !== null && s.valor_promocional_mensal !== undefined ? moneyMask(Number(s.valor_promocional_mensal)) : "",
        valor_promocional_anual: s.valor_promocional_anual !== null && s.valor_promocional_anual !== undefined ? moneyMask(Number(s.valor_promocional_anual)) : "",
        data_fim_promocao: toDateInputValue(s.data_fim_promocao),
      });
    }
  }, [data, userForm]);

  const handleSaveUser = (formData: UserFormData) => {
    if (!id) return;

    const nome = formData.nome.trim();
    const email = formData.email.trim();
    const cleanCpf = formData.cpfcnpj.replace(/\D/g, "");
    const cleanPhone = formData.telefone.replace(/\D/g, "");

    updateUser.mutate({
      id,
      data: {
        nome,
        razao_social: formData.razao_social?.trim() || null,
        apelido: formData.apelido?.trim() || null,
        email,
        telefone: cleanPhone,
        cpfcnpj: cleanCpf,
        ativo: formData.ativo,
        data_nascimento: formData.data_nascimento || null,
        cobranca_aviso_previo_whatsapp_ativo: formData.cobranca_aviso_previo_whatsapp_ativo,
      },
    });
  };

  const onUserFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleResetPassword = () => {
    if (!id || !data?.user) return;
    openConfirmationDialog({
      title: "Resetar Senha",
      description: `Deseja realmente redefinir a senha de ${data.user.nome}? Uma nova senha temporária será gerada e enviada automaticamente por WhatsApp para o número cadastrado.`,
      confirmText: "Sim, Resetar",
      variant: "warning",
      onConfirm: async () => {
        try {
          const res: any = await resetPassword.mutateAsync(id);
          closeConfirmationDialog();
          setResetPasswordData({ open: true, senha: res.senha });
        } catch (error) {
          console.error("Falha ao resetar senha", error);
        }
      },
    });
  };

  const handleAddDays = (days: number) => {
    if (!data?.assinatura) return;

    const sub = data.assinatura;

    // Puxa a data de vencimento. Se for nula, puxa do trial. Se ambas forem nulas, hoje.
    const refStr = sub.data_vencimento || sub.trial_ends_at || "";

    const datePart = refStr ? refStr.split("T")[0] : "";

    const baseDate = datePart
      ? new Date(datePart + "T12:00:00")
      : new Date();

    const newDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    const newDateStr = toPersistenceString(newDate);

    setSubForm((p) => ({
      ...p,
      status: SubscriptionStatus.ACTIVE,
      data_vencimento: newDateStr
    }));
  };

  const handleDispatchNotification = () => {
    if (!data?.user) return;
    openAdminDispatchNotificationDialog({
      userId: data.user.id,
      userName: data.user.nome,
      userPhone: data.user.telefone,
      userEmail: data.user.email,
    });
  };

  const handleDispatchDriverCobrancaDemo = () => {
    if (!data?.user) return;
    openAdminDriverCobrancaDemoDialog({
      userId: data.user.id,
      userName: data.user.nome,
      userPhone: data.user.telefone,
      userApelido: data.user.apelido || undefined,
      userChavePix: data.user.chave_pix || undefined,
      userTipoChavePix: data.user.chave_pix_tipo || undefined,
    });
  };

  const handleDeleteUser = () => {
    if (!id || !data?.user) return;
    openConfirmationDialog({
      title: "Excluir Usuário",
      description: `Deseja realmente excluir permanentemente o usuário ${data.user.nome}?`,
      confirmText: "Sim, Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteUser.mutateAsync(id);
          closeConfirmationDialog();
          navigate(ROUTES.PRIVATE.ADMIN.USERS);
        } catch (error) {
          console.error("Falha ao excluir usuário", error);
        }
      },
    });
  };

  const handleDeleteInvoice = (fatura: NonNullable<typeof data>["faturas"][number]) => {
    openConfirmationDialog({
      title: "Excluir Fatura",
      description: `Deseja realmente excluir permanentemente a fatura de ${moneyMask(fatura.valor)} com vencimento em ${formatDate(fatura.data_vencimento)}? Esta ação é irreversível.`,
      confirmText: "Sim, Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteInvoiceMutation.mutateAsync(fatura.id);
          closeConfirmationDialog();
        } catch (error) {
          console.error("Falha ao excluir fatura", error);
        }
      },
    });
  };

  const handleConfirmPayment = (fatura: NonNullable<typeof data>["faturas"][number]) => {
    openConfirmationDialog({
      title: "Registrar Pagamento Manual",
      description: `Deseja realmente confirmar e registrar o pagamento da fatura no valor de ${moneyMask(fatura.valor)}? Esta ação dará baixa na cobrança, renovará a assinatura do motorista e estenderá a validade do plano ${fatura.planos?.nome || ""}.`,
      confirmText: "Sim, Confirmar Pagamento",
      variant: "default",
      onConfirm: async () => {
        try {
          await confirmPaymentMutation.mutateAsync(fatura.id);
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          console.error("Falha ao registrar pagamento da fatura", error);
        }
      },
    });
  };

  const handleCopyImpersonateLink = async () => {
    if (!id) return;
    try {
      const res = await impersonateUser.mutateAsync(id);
      if (res?.impersonateUrl) {
        await navigator.clipboard.writeText(res.impersonateUrl);
        toast.success("Link de acesso copiado! Abra em uma janela anônima.");
      }
    } catch {
      toast.error("Erro ao gerar link de acesso.");
    }
  };

  const handleSaveSub = () => {
    if (!id) return;

    let valorBaseMensalNum: number | null = null;
    if (subForm.valor_base_mensal) {
      const clean = subForm.valor_base_mensal.replace(/\D/g, "");
      if (clean) valorBaseMensalNum = Number(clean) / 100;
    }

    let valorBaseAnualNum: number | null = null;
    if (subForm.valor_base_anual) {
      const clean = subForm.valor_base_anual.replace(/\D/g, "");
      if (clean) valorBaseAnualNum = Number(clean) / 100;
    }

    let valorPromoMensalNum: number | null = null;
    if (subForm.valor_promocional_mensal) {
      const clean = subForm.valor_promocional_mensal.replace(/\D/g, "");
      if (clean) valorPromoMensalNum = Number(clean) / 100;
    }

    let valorPromoAnualNum: number | null = null;
    if (subForm.valor_promocional_anual) {
      const clean = subForm.valor_promocional_anual.replace(/\D/g, "");
      if (clean) valorPromoAnualNum = Number(clean) / 100;
    }

    updateSub.mutate({
      id,
      data: {
        plano_id: subForm.plano_id || undefined,
        status: (subForm.status as SubscriptionStatus) || undefined,
        data_vencimento: subForm.data_vencimento
          ? toISODateTimeBR(getEndOfDayBR(subForm.data_vencimento))
          : null,
        trial_ends_at: subForm.trial_ends_at
          ? toISODateTimeBR(getEndOfDayBR(subForm.trial_ends_at))
          : null,
        valor_base_mensal: valorBaseMensalNum,
        valor_base_anual: valorBaseAnualNum,
        valor_promocional_mensal: valorPromoMensalNum,
        valor_promocional_anual: valorPromoAnualNum,
        data_fim_promocao: subForm.data_fim_promocao
          ? toISODateTimeBR(getEndOfDayBR(subForm.data_fim_promocao))
          : null,
      },
    });
  };

  const formattedFullAddress = useMemo(() => {
    if (!data?.user) return "";
    return formatarEnderecoCompleto({
      cep: data.user.cep,
      logradouro: data.user.logradouro || data.user.endereco,
      numero: data.user.numero,
      bairro: data.user.bairro,
      cidade: data.user.cidade,
      estado: data.user.estado || data.user.uf,
    });
  }, [data?.user]);

  const handleCopy = useCallback((text: string, message: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(message);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="p-8 bg-[#131b2e] border border-slate-800/80 rounded-[2.5rem] shadow-2xl max-w-md w-full flex flex-col items-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-headline font-black text-slate-100">
              Usuário não encontrado
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O motorista solicitado não existe ou foi removido do sistema.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white font-bold text-xs h-10 px-6 mt-2"
            onClick={() => navigate(-1)}
          >
            Voltar para a Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-start">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS)}
          className="rounded-xl border-border bg-card hover:bg-secondary text-foreground text-xs font-medium h-9 px-3.5 gap-2 self-start shadow-xs"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <span>Voltar para motoristas</span>
        </Button>
      </div>

      {data.gestor && (
        <Banner
          variant="info"
          className="rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300 shadow-xs"
          title={
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-sky-200">
              <span>Este usuário é um</span>
              <strong className="text-foreground font-semibold">
                {data.user.tipo === "monitor" ? "Monitor(a)" : "Motorista Auxiliar"}
              </strong>
              <span>vinculado à equipe de</span>
              <Link
                to={`/admin/usuarios/${data.gestor.id}`}
                className="font-medium underline text-primary hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <span>{data.gestor.nome}{data.gestor.apelido ? ` (${data.gestor.apelido})` : ""}</span>
                <ExternalLink className="h-3 w-3 inline" />
              </Link>
              {data.veiculo_vinculado && (
                <span className="text-muted-foreground">
                  • Veículo atribuído: <strong className="text-foreground font-medium">{data.veiculo_vinculado.modelo} ({data.veiculo_vinculado.placa})</strong>
                </span>
              )}
            </div>
          }
        />
      )}

      {/* HEADER DE TOPO EXECUTIVO */}
      <div className="p-5 md:p-6 bg-card border border-border rounded-3xl shadow-xs space-y-4 relative">
        {/* BOTÃO COPIAR ID NO CANTO SUPERIOR DIREITO (APENAS MOBILE) */}
        <button
          type="button"
          onClick={() => handleCopy(data.user.id, "ID do usuário copiado!")}
          className="md:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border flex items-center justify-center cursor-pointer"
          title="Copiar ID do usuário"
        >
          <Copy className="h-4 w-4 text-primary" />
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4 min-w-0 pr-10 md:pr-0">
            <div
              role={data.user.logo_url ? "button" : undefined}
              tabIndex={data.user.logo_url ? 0 : undefined}
              onClick={
                data.user.logo_url
                  ? () => openImageFullscreen({ imageUrl: data.user.logo_url!, alt: data.user.apelido || data.user.nome })
                  : undefined
              }
              className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center font-semibold text-xl shrink-0 shadow-xs overflow-hidden",
                data.user.logo_url
                  ? "bg-card border border-border p-0.5 cursor-pointer"
                  : "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              {data.user.logo_url ? (
                <img
                  src={data.user.logo_url}
                  alt={data.user.apelido || data.user.nome}
                  className="h-full w-full object-contain"
                />
              ) : (
                (data.user.apelido || data.user.nome).charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-headline font-semibold text-foreground leading-tight break-words">
                  {data.user.apelido || data.user.nome}
                </h1>

                {data.user.apelido && (
                  <span className="text-sm font-normal text-muted-foreground break-words">
                    ({data.user.nome})
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(data.user.id, "ID do usuário copiado!")}
                  className="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary shrink-0 cursor-pointer"
                  title="Copiar ID do usuário"
                >
                  <Copy className="h-4 w-4 text-primary" />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                {(data.user.tipo === "motorista_auxiliar" || data.user.tipo === "monitor" || data.gestor) && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                    <span>{data.user.tipo === "monitor" ? "Monitor(a)" : "Motorista Auxiliar"}</span>
                  </span>
                )}
                {data.gestor && (
                  <Link
                    to={`/admin/usuarios/${data.gestor.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                    title="Ver motorista gestor"
                  >
                    <span>Gestor: {data.gestor.apelido || data.gestor.nome}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                {data.assinatura && (
                  <SubscriptionStatusBadge
                    status={data.assinatura.status}
                    dataVencimento={data.assinatura.data_vencimento}
                  />
                )}
                {data.dispositivos && (
                  data.dispositivos.total > 0 ? (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      title={`${data.dispositivos.total} ${data.dispositivos.total === 1 ? "aparelho conectado ao app" : "aparelhos conectados ao app"}`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>{data.dispositivos.total} {data.dispositivos.total === 1 ? "app conectado" : "apps conectados"}</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border"
                      title="Nenhum dispositivo móvel com push ativo"
                    >
                      <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Sem app</span>
                    </span>
                  )
                )}
                {data.ultimo_acesso && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground border border-border"
                    title={`Último acesso registrado em ${formatDateTime(data.ultimo_acesso.data_hora)} via ${DispositivoCadastroLabels[data.ultimo_acesso.dispositivo] || data.ultimo_acesso.dispositivo}`}
                  >
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Último acesso: {formatDateTime(data.ultimo_acesso.data_hora)} ({DispositivoCadastroLabels[data.ultimo_acesso.dispositivo] || data.ultimo_acesso.dispositivo})
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 md:border-t-0 md:pt-0 grid grid-cols-2 gap-2 w-full md:flex md:flex-wrap md:items-center md:gap-2 md:w-auto">
            <Button
              type="button"
              size="sm"
              disabled={impersonateUser.isPending}
              onClick={handleCopyImpersonateLink}
              className="col-span-2 md:col-auto rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-medium h-9 px-3 gap-1.5 shadow-xs flex items-center justify-center"
            >
              {impersonateUser.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
              )}
              <span>Link de acesso</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDispatchNotification}
              className="col-span-1 md:col-auto rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-medium h-9 px-3 gap-1.5 shadow-xs flex items-center justify-center"
            >
              <Bell className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Notificação teste</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDispatchDriverCobrancaDemo}
              className="col-span-1 md:col-auto rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-medium h-9 px-3 gap-1.5 shadow-xs flex items-center justify-center"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Cobrança teste</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleResetPassword}
              className="col-span-1 md:col-auto rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-medium h-9 px-3 gap-1.5 shadow-xs flex items-center justify-center"
            >
              <Key className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Resetar Senha</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteUser}
              className="col-span-1 md:col-auto rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 hover:border-rose-500/70 hover:text-rose-200 text-xs font-semibold h-9 px-3 gap-1.5 transition-all shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="truncate">Excluir</span>
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* SELETOR MOBILE (DROPDOWN PRINCIPAL < 768px) */}
        <div className="md:hidden w-full bg-card border border-border p-2 rounded-2xl shadow-xs mb-6 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground block px-1 text-left">
            Navegação de seções
          </label>
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full bg-secondary/60 border-input text-foreground font-medium h-10 rounded-xl focus:ring-primary text-xs">
              <SelectValue placeholder="Selecione uma visão" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground rounded-2xl">
              <SelectItem value="geral" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span>Visão Geral</span>
                </span>
              </SelectItem>
              <SelectItem value="dados" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span>Dados e Configurações</span>
                </span>
              </SelectItem>
              <SelectItem value="cobrancas" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span>Cobranças</span>
                </span>
              </SelectItem>
              <SelectItem value="repasses" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span>Repasses Pix</span>
                </span>
              </SelectItem>
              <SelectItem value="logs" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  <span>Histórico de Atividades</span>
                </span>
              </SelectItem>
              <SelectItem value="cadastros" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-purple-400" />
                  <span>Cadastros do Motorista</span>
                </span>
              </SelectItem>
              <SelectItem value="notificacoes" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-400" />
                  <span>Notificações</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SELETOR DESKTOP (BARRA DE 6 ABAS PRINCIPAIS ≥ 768px) */}
        <div className="hidden md:block bg-card/80 border border-border p-1 rounded-2xl shadow-xs mb-6 overflow-x-auto [scrollbar-width:none]">
          <TabsList className="flex w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
            <TabsTrigger
              value="geral"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Visão Geral</span>
            </TabsTrigger>

            <TabsTrigger
              value="dados"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Dados e Configurações</span>
            </TabsTrigger>

            <TabsTrigger
              value="cobrancas"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Cobranças</span>
            </TabsTrigger>

            <TabsTrigger
              value="repasses"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Repasses</span>
            </TabsTrigger>

            <TabsTrigger
              value="logs"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Histórico</span>
            </TabsTrigger>

            <TabsTrigger
              value="cadastros"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Cadastros do Motorista</span>
            </TabsTrigger>

            <TabsTrigger
              value="notificacoes"
              className="rounded-xl h-9 font-headline font-medium text-xs transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Notificações</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ABA 1: VISÃO GERAL (KPIS DO MOTORISTA + RESUMO CADASTRAL CATEGORIZADO) */}
        <TabsContent value="geral" className="space-y-6 m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <AdminKpiCard
              title="Alunos"
              value={data.kpis?.passageirosCount ?? 0}
              subtext={`${data.kpis?.solicitacoesPendentesCount ?? 0} ${(data.kpis?.solicitacoesPendentesCount ?? 0) === 1 ? "solicitação pendente" : "solicitações pendentes"}`}
              cardBorder="border-border/80"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<Users className="h-5 w-5" />}
              onClick={() => handleSubTabChange(AdminUserSubTab.PASSAGEIROS)}
            />

            <AdminKpiCard
              title="Veículos"
              value={data.kpis?.veiculosCount ?? 0}
              subtext="Veículos na frota"
              cardBorder="border-border/80"
              iconBg="bg-primary/10 text-primary border-primary/20"
              icon={<Bus className="h-5 w-5" />}
              onClick={() => handleSubTabChange(AdminUserSubTab.VEICULOS)}
            />

            <AdminKpiCard
              title="Escolas"
              value={data.kpis?.escolasCount ?? 0}
              subtext="Escolas atendidas"
              cardBorder="border-border/80"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<GraduationCap className="h-5 w-5" />}
              onClick={() => handleSubTabChange(AdminUserSubTab.ESCOLAS)}
            />

            <AdminKpiCard
              title="Contratos"
              value={data.kpis?.contratosCount ?? data.contratos?.length ?? 0}
              subtext={`${passageirosSemContrato} ${passageirosSemContrato === 1 ? "aluno sem contrato" : "alunos sem contrato"}`}
              cardBorder="border-border/80"
              iconBg="bg-sky-500/10 text-sky-400 border-sky-500/20"
              icon={<FileText className="h-5 w-5" />}
              onClick={() => handleSubTabChange(AdminUserSubTab.CONTRATOS)}
            />

            <AdminKpiCard
              title="Equipe"
              value={data.kpis?.equipeCount ?? data.equipe?.length ?? 0}
              subtext={`${data.kpis?.equipeCount ?? data.equipe?.length ?? 0} ${(data.kpis?.equipeCount ?? data.equipe?.length ?? 0) === 1 ? "membro cadastrado" : "membros cadastrados"}`}
              cardBorder="border-border/80"
              iconBg="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              icon={<UserCheck className="h-5 w-5" />}
              onClick={() => handleSubTabChange(AdminUserSubTab.EQUIPE)}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {/* 4 CARDS AVULSOS DO RESUMO CADASTRAL DO MOTORISTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

            {/* CATEGORIA 1: DADOS PESSOAIS & IDENTIFICAÇÃO */}
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
              <CardHeader className="p-4 border-b border-border/40 bg-secondary/30">
                <CardTitle className="text-xs font-headline font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Identificação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Apelido
                    </span>
                    <span className="font-normal text-foreground block">
                      {data.user.apelido || "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      {data.user.cpfcnpj && data.user.cpfcnpj.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"}
                    </span>
                    <span className="font-mono font-normal text-foreground block">
                      {data.user.cpfcnpj ? cpfCnpjMask(data.user.cpfcnpj) : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Razão social
                    </span>
                    <span className="font-normal text-foreground block">
                      {data.user.razao_social || "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Data de nascimento
                    </span>
                    <span className="font-normal text-foreground block">
                      {formatDate(data.user.data_nascimento)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Tipo de conta
                    </span>
                    <span className="font-medium text-emerald-400 block capitalize">
                      {data.user.tipo || "motorista"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CATEGORIA 2: CONTATO & LOCALIZAÇÃO */}
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
              <CardHeader className="p-4 border-b border-border/40 bg-secondary/30">
                <CardTitle className="text-xs font-headline font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>Contato & Endereço</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Telefone
                    </span>
                    {data.user.telefone ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-normal text-foreground">
                          {phoneMask(data.user.telefone)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(data.user.telefone, "Telefone copiado!")}
                          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Copiar telefone"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      E-mail
                    </span>
                    <span className="font-normal text-foreground block truncate mt-0.5">
                      {data.user.email || "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Endereço completo
                    </span>
                    <span className="font-normal text-foreground block leading-relaxed mt-0.5">
                      {formattedFullAddress || "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CATEGORIA 3: FINANCEIRO & SISTEMA */}
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
              <CardHeader className="p-4 border-b border-border/40 bg-secondary/30">
                <CardTitle className="text-xs font-headline font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span>Financeiro & Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Chave Pix
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-normal text-foreground">
                        {data.user.chave_pix ? formatarChavePix(data.user.chave_pix, data.user.chave_pix_tipo) : "—"}
                      </span>
                      {data.user.chave_pix && (
                        <button
                          type="button"
                          onClick={() => handleCopy(data.user.chave_pix!, "Chave Pix copiada!")}
                          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Copiar Chave Pix"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Canal de aquisição
                    </span>
                    <span className="font-normal text-foreground block">
                      {data.user.canal_aquisicao
                        ? CanalAquisicaoLabels[data.user.canal_aquisicao as keyof typeof CanalAquisicaoLabels] || data.user.canal_aquisicao
                        : indicadorData
                          ? CanalAquisicaoLabels[CanalAquisicao.INDICACAO]
                          : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Indicado por
                    </span>
                    {indicadorData ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${indicadorData.id}`}
                        className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline text-left block"
                      >
                        {indicadorData.nome}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleTabChange("dados");
                        }}
                        className="font-normal text-muted-foreground hover:text-foreground text-left block cursor-pointer"
                      >
                        Cadastro direto / orgânico
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Dispositivo de cadastro
                    </span>
                    <span className="font-normal text-foreground block">
                      {data.user.dispositivo_cadastro ? DispositivoCadastroLabels[data.user.dispositivo_cadastro as keyof typeof DispositivoCadastroLabels] || data.user.dispositivo_cadastro : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Dispositivos conectados (App / Push)
                    </span>
                    {data.dispositivos && data.dispositivos.total > 0 ? (
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Smartphone className="h-3 w-3" />
                            {data.dispositivos.total} {data.dispositivos.total === 1 ? "aparelho conectado" : "aparelhos conectados"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {data.dispositivos.itens.map((disp) => (
                            <span key={disp.id} className="text-[11px] text-muted-foreground block font-mono">
                              <span className="capitalize font-medium text-foreground">{disp.plataforma}</span>
                              {disp.atualizado_em && (
                                <span className="text-muted-foreground"> • Visto em {formatDateTime(disp.atualizado_em)}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground border border-border">
                          <Smartphone className="h-3 w-3 text-muted-foreground" />
                          Nenhum aparelho conectado
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Origem / Atribuição (UTMs)
                    </span>
                    <AcquisitionBadge
                      origem={resolveOrigemAtribuicao(
                        data.user.metadados_cadastro as Record<string, unknown> | null,
                        data.user.dispositivo_cadastro,
                        data.user.canal_aquisicao
                      )}
                      showDetail
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Data de cadastro
                    </span>
                    <span className="font-normal text-foreground block font-mono">
                      {formatDateTime(data.user.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CATEGORIA 4: CONTRATOS DIGITAIS & MINUTA */}
            {(() => {
              const hasSignature = !!data.user.assinatura_digital_url;
              const config = data.user.config_contrato as Record<string, any> | null;

              const statusConfig = !hasSignature
                ? DriverContractConfigStatus.NAO_CONFIGURADO
                : config?.usar_contratos === false
                  ? DriverContractConfigStatus.DESATIVADO
                  : DriverContractConfigStatus.ATIVO;

              const isConfigurado = statusConfig !== DriverContractConfigStatus.NAO_CONFIGURADO;

              return (
                <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
                  <CardHeader className="p-4 border-b border-border/40 bg-secondary/30">
                    <CardTitle className="text-xs font-headline font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span>Contratos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {isConfigurado ? (
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-[11px] font-medium text-muted-foreground block">
                              Multa de atraso
                            </span>
                            <span className="font-mono font-medium text-foreground block">
                              {formatarRegraContrato(config?.multa_atraso || { valor: 10, tipo: "fixo" })}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] font-medium text-muted-foreground block">
                              Juros de atraso
                            </span>
                            <span className="font-mono font-medium text-foreground block">
                              {formatarRegraContrato(config?.juros_atraso || { valor: 1, tipo: "percentual" })}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] font-medium text-muted-foreground block">
                              Multa de rescisão
                            </span>
                            <span className="font-mono font-medium text-foreground block">
                              {formatarRegraContrato(config?.multa_rescisao || { valor: 15, tipo: "fixo" })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground font-normal py-3 leading-relaxed">
                          O módulo de contratos digitais não foi configurado por este motorista.
                        </p>
                      )}
                    </div>

                    {/* BOTÕES DE PREVIEW DA MINUTA E ASSINATURA */}
                    <div className="pt-3 border-t border-border/40 space-y-2 mt-4">
                      {isConfigurado && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={previewContrato.isPending}
                          onClick={handleOpenMinutaPreview}
                          className="w-full rounded-xl border border-border bg-card text-foreground hover:bg-secondary h-9 text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          {previewContrato.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          )}
                          <span>Ver minuta do contrato</span>
                        </Button>
                      )}

                      {hasSignature && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setIsSignatureModalOpen(true)}
                          className="w-full rounded-xl border border-border bg-card text-foreground hover:bg-secondary h-9 text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <PenTool className="h-3.5 w-3.5 text-primary" />
                          <span>Ver assinatura digital</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

          </div>
        </TabsContent>

        <TabsContent value="dados" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* CARD 1: DADOS CADASTRAIS DO MOTORISTA */}
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
              <div>
                <CardHeader className="p-5 sm:p-6 border-b border-border/40 bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>Dados cadastrais</span>
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-6">
                  <Form {...userForm}>
                    <form id="user-form" onSubmit={userForm.handleSubmit(handleSaveUser, onUserFormError)} className="space-y-6">
                      {(() => {
                        const cpfcnpjValue = userForm.watch("cpfcnpj") || "";
                        const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;

                        return (
                          <>
                            {/* SEÇÃO 1: IDENTIFICAÇÃO */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                                Identificação & documentação
                              </h4>

                              <FormField
                                control={userForm.control}
                                name="cpfcnpj"
                                render={({ field }) => (
                                  <FormItem className="space-y-1.5">
                                    <FormLabel className="text-xs font-medium text-foreground">
                                      CPF ou CNPJ {isCnpj && <span className="text-rose-400">*</span>}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        maxLength={18}
                                        onChange={(e) => field.onChange(cpfMask(e.target.value))}
                                        inputMode="numeric"
                                        placeholder="Digite o CPF ou CNPJ"
                                        className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={userForm.control}
                                name="razao_social"
                                render={({ field, fieldState, formState }) => (
                                  <FormItem className="space-y-1.5">
                                    <FormLabel className="text-xs font-medium text-foreground">
                                      Razão social {isCnpj && <span className="text-rose-400">*</span>}
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="Razão social do motorista (obrigatória para CNPJ)"
                                        className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground"
                                        aria-invalid={!!fieldState.error || (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                    {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                                      <p className="text-xs font-medium text-rose-500 mt-1">Razão social é obrigatória para CNPJ</p>
                                    )}
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={userForm.control}
                                  name="nome"
                                  render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                      <FormLabel className="text-xs font-medium text-foreground">
                                        Nome completo <span className="text-rose-400">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Nome completo do motorista"
                                          className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={userForm.control}
                                  name="apelido"
                                  render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                      <FormLabel className="text-xs font-medium text-foreground">
                                        Nome do transporte / apelido
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="Ex.: Tio Thiago"
                                          className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* SEÇÃO 2: CONTATO E INFORMAÇÕES PESSOAIS */}
                            <div className="pt-5 border-t border-border/40 space-y-4">
                              <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                                Contato & informações pessoais
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={userForm.control}
                                  name="telefone"
                                  render={({ field }) => (
                                    <PhoneInput
                                      field={field}
                                      label="Telefone (WhatsApp)"
                                      placeholder="(00) 00000-0000"
                                      labelClassName="text-xs font-medium text-foreground"
                                      inputClassName="pl-11 h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary"
                                    />
                                  )}
                                />

                                <FormField
                                  control={userForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                      <FormLabel className="text-xs font-medium text-foreground">
                                        E-mail de acesso <span className="text-rose-400">*</span>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="email"
                                          placeholder="motorista@email.com"
                                          className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                  control={userForm.control}
                                  name="data_nascimento"
                                  render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                      <FormLabel className="text-xs font-medium text-foreground">
                                        Data de nascimento
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          inputMode="numeric"
                                          maxLength={10}
                                          onChange={(e) => field.onChange(maskDate(e.target.value))}
                                          placeholder="dd/mm/aaaa"
                                          className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary placeholder:text-muted-foreground font-mono"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* SEÇÃO 3: STATUS DA CONTA */}
                            <div className="pt-5 border-t border-border/40 flex items-center justify-between">
                              <FormField
                                control={userForm.control}
                                name="ativo"
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium text-foreground cursor-pointer">
                                          Status da conta
                                        </Label>
                                        <div className="flex items-center gap-3">
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                          <ActiveStatusBadge active={field.value} />
                                        </div>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* SEÇÃO 4: RECURSOS ESPECIAIS & PERMISSÕES */}
                            <div className="pt-5 border-t border-border/40">
                              <FormField
                                control={userForm.control}
                                name="cobranca_aviso_previo_whatsapp_ativo"
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-0.5">
                                          <Label className="text-xs font-medium text-foreground cursor-pointer">
                                            WhatsApp no lembrete prévio
                                          </Label>
                                          <p className="text-[11px] text-muted-foreground">
                                            Permite enviar lembretes com antecedência via WhatsApp para os responsáveis deste motorista.
                                          </p>
                                        </div>
                                        <div className="pt-0.5 shrink-0">
                                          <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                          />
                                        </div>
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </form>
                  </Form>
                </CardContent>
              </div>

              <CardContent className="p-5 sm:p-6 pt-0">
                <Button
                  type="submit"
                  form="user-form"
                  disabled={updateUser.isPending}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {updateUser.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Salvar dados cadastrais
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* CARD 2: ASSINATURA & ACESSO */}
            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground flex flex-col justify-between">
              <div>
                <CardHeader className="p-5 sm:p-6 border-b border-border/40 bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Assinatura & acesso</span>
                    </CardTitle>
                    {data.assinatura?.status && (
                      <SubscriptionStatusBadge status={subForm.status || data.assinatura.status} />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 sm:p-6 space-y-6">
                  {!sub ? (
                    <p className="text-xs text-muted-foreground py-8 text-center">
                      Nenhuma assinatura encontrada para este usuário.
                    </p>
                  ) : (
                    <>
                      {/* SEÇÃO 1: PLANO E VIGÊNCIA */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                          Plano & vigência da conta
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Plano contratado</Label>
                            <Select
                              value={subForm.plano_id}
                              onValueChange={(val) => setSubForm(p => ({ ...p, plano_id: val }))}
                            >
                              <SelectTrigger className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus:ring-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {data.planos.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="text-xs">
                                    {p.nome} — R$ {Number(p.valor).toFixed(2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Status do plano</Label>
                            <Select
                              value={subForm.status}
                              onValueChange={(val) => setSubForm(p => ({
                                ...p,
                                status: val,
                                data_vencimento: toDateInputValue(data?.assinatura?.data_vencimento),
                                trial_ends_at: toDateInputValue(data?.assinatura?.trial_ends_at),
                              }))}
                            >
                              <SelectTrigger className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus:ring-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value} className="text-xs">
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Data de vencimento</span>
                            </Label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={subForm.data_vencimento}
                                onChange={(e) => setSubForm(p => ({ ...p, data_vencimento: e.target.value }))}
                                disabled={subForm.status === SubscriptionStatus.TRIAL}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed pr-10 font-mono"
                              />
                              {subForm.data_vencimento && subForm.status !== SubscriptionStatus.TRIAL && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, data_vencimento: "" }));
                                  }}
                                  title="Limpar data de vencimento"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Fim do período trial</span>
                            </Label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={subForm.trial_ends_at}
                                onChange={(e) => setSubForm(p => ({ ...p, trial_ends_at: e.target.value }))}
                                disabled={subForm.status !== SubscriptionStatus.TRIAL}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed pr-10 font-mono"
                              />
                              {subForm.trial_ends_at && subForm.status === SubscriptionStatus.TRIAL && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, trial_ends_at: "" }));
                                  }}
                                  title="Limpar fim do trial"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SEÇÃO 2: CONCEDER ACESSO */}
                      <div className="pt-5 border-t border-border/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>Conceder acesso (cortesia)</span>
                          </h4>
                          <span className="text-[11px] text-muted-foreground">Prorroga a vigência em 1 clique</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { days: 15, label: "+15 dias" },
                            { days: 30, label: "+1 mês" },
                            { days: 90, label: "+3 meses" },
                            { days: 180, label: "+6 meses" },
                            { days: 365, label: "+1 ano" },
                          ].map((shortcut) => (
                            <Button
                              key={shortcut.days}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddDays(shortcut.days)}
                              className="h-8 px-3 text-xs font-medium rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-all shadow-xs"
                            >
                              {shortcut.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* SEÇÃO 3: PREÇOS & DESCONTOS */}
                      <div className="pt-5 border-t border-border/40 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-2">
                            <span>Desconto / promoção especial</span>
                          </h4>
                          {(() => {
                            const cleanValMensal = (subForm.valor_promocional_mensal || "").replace(/\D/g, "");
                            const cleanValAnual = (subForm.valor_promocional_anual || "").replace(/\D/g, "");
                            const hasPromo = (cleanValMensal && Number(cleanValMensal) > 0) || (cleanValAnual && Number(cleanValAnual) > 0);
                            if (!hasPromo) return null;
                            if (!subForm.data_fim_promocao) {
                              return <span className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">Definitivo</span>;
                            }
                            const fim = getEndOfDayBR(subForm.data_fim_promocao).getTime();
                            if (fim >= getNowBR().getTime()) {
                              return <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">Ativo</span>;
                            } else {
                              return <span className="text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">Expirado</span>;
                            }
                          })()}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Valor base (mensal)</Label>
                            <div className="relative">
                              <Input
                                placeholder="Valor base do plano"
                                value={subForm.valor_base_mensal}
                                onChange={(e) => setSubForm(p => ({ ...p, valor_base_mensal: moneyMask(e.target.value) }))}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary pr-10 font-mono"
                              />
                              {subForm.valor_base_mensal && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, valor_base_mensal: "" }));
                                  }}
                                  title="Limpar valor base mensal"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Valor base (anual)</Label>
                            <div className="relative">
                              <Input
                                placeholder="Valor base do plano"
                                value={subForm.valor_base_anual}
                                onChange={(e) => setSubForm(p => ({ ...p, valor_base_anual: moneyMask(e.target.value) }))}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary pr-10 font-mono"
                              />
                              {subForm.valor_base_anual && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, valor_base_anual: "" }));
                                  }}
                                  title="Limpar valor base anual"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Promoção mensal</Label>
                            <div className="relative">
                              <Input
                                placeholder="R$ Promocional"
                                value={subForm.valor_promocional_mensal}
                                onChange={(e) => setSubForm(p => ({ ...p, valor_promocional_mensal: moneyMask(e.target.value) }))}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary pr-10 font-mono"
                              />
                              {subForm.valor_promocional_mensal && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, valor_promocional_mensal: "" }));
                                  }}
                                  title="Limpar valor promocional mensal"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Promoção anual</Label>
                            <div className="relative">
                              <Input
                                placeholder="R$ Promocional"
                                value={subForm.valor_promocional_anual}
                                onChange={(e) => setSubForm(p => ({ ...p, valor_promocional_anual: moneyMask(e.target.value) }))}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary pr-10 font-mono"
                              />
                              {subForm.valor_promocional_anual && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, valor_promocional_anual: "" }));
                                  }}
                                  title="Limpar valor promocional anual"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-foreground">Validade da promoção</Label>
                            <div className="relative">
                              <Input
                                type="date"
                                value={subForm.data_fim_promocao}
                                onChange={(e) => setSubForm(p => ({ ...p, data_fim_promocao: e.target.value }))}
                                className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary pr-10 font-mono"
                              />
                              {subForm.data_fim_promocao && (
                                <div
                                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer z-10 flex bg-card rounded p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSubForm(p => ({ ...p, data_fim_promocao: "" }));
                                  }}
                                  title="Remover data de validade"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </div>

              {sub && (
                <CardContent className="p-5 sm:p-6 pt-0">
                  <Button
                    type="button"
                    onClick={handleSaveSub}
                    disabled={updateSub.isPending}
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    {updateSub.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1.5" />
                        Salvar configurações da assinatura
                      </>
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>

            <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground">
              <CardHeader className="p-5 sm:p-6 border-b border-border/40 bg-secondary/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span>Origem da indicação</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Informações sobre a indicação que trouxe {data.user.nome} para a plataforma.
                    </p>
                  </div>

                  {indicadorData ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openAdminConfigureReferralDialog({
                            userId: data.user.id,
                            userName: data.user.nome,
                            currentIndicadorId: indicadorData?.id,
                            currentIndicadorNome: indicadorData?.nome,
                          })
                        }
                        className="h-8 px-3 rounded-xl border-border bg-card text-foreground hover:bg-secondary text-xs font-medium gap-1.5 shadow-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Alterar indicador
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          openConfirmationDialog({
                            title: "Desvincular Indicador",
                            description: `Tem certeza que deseja remover o vínculo de indicação de ${data.user.nome}?`,
                            confirmText: "Sim, Desvincular",
                            cancelText: "Cancelar",
                            variant: "destructive",
                            onConfirm: async () => {
                              await removeReferralMutation.mutateAsync(data.user.id);
                            },
                          })
                        }
                        disabled={removeReferralMutation.isPending}
                        className="h-8 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Desvincular
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        openAdminConfigureReferralDialog({
                          userId: data.user.id,
                          userName: data.user.nome,
                        })
                      }
                      className="h-8 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Atribuir indicador
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                {indicadorData ? (
                  <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          Motorista indicador
                        </span>
                        <Link
                          to={`${ROUTES.PRIVATE.ADMIN.USERS}/${indicadorData.id}`}
                          className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors block"
                        >
                          {indicadorData.nome}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        {indicadorData.status === IndicacaoStatus.PENDING && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="h-3.5 w-3.5" />
                            Em teste (aguardando 1ª mensalidade)
                          </span>
                        )}
                        {indicadorData.status === IndicacaoStatus.COMPLETED && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Convertido (bônus concedido)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          WhatsApp / Telefone
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-medium text-foreground">
                            {phoneMask(indicadorData.telefone) || "—"}
                          </span>
                          {indicadorData.telefone && (
                            <button
                              type="button"
                              onClick={() => {
                                const cleanPhone = indicadorData?.telefone?.replace(/\D/g, "") || "";
                                if (cleanPhone) {
                                  openBrowserLink(buildWhatsAppUrl(cleanPhone, `Olá ${indicadorData!.nome}!`));
                                }
                              }}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                              title="Abrir no WhatsApp"
                            >
                              <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          E-mail
                        </span>
                        <span className="font-medium text-foreground truncate block mt-0.5">
                          {indicadorData.email || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          Data do vínculo
                        </span>
                        <span className="font-medium text-foreground block mt-0.5">
                          {indicadorData.created_at ? formatSafeBrazilianDate(indicadorData.created_at) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Banner
                      variant="neutral"
                      title="Nenhum indicador vinculado"
                      description="Este motorista realizou o cadastro diretamente na plataforma, sem link ou telefone de indicação."
                    />
                    <p className="text-xs text-muted-foreground">
                      Caso ele informe que foi indicado por outro motorista, clique no botão &quot;Atribuir indicador&quot; para pesquisar e vincular.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <AdminUserFinancialConfigCard
              userId={id!}
              initialConfig={(data as any).configuracao_financeira}
            />
          </div>
        </TabsContent>

        <TabsContent value="cobrancas" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Histórico de cobranças</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4">
              {data.faturas.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <CreditCard className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Nenhuma fatura encontrada.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto [scrollbar-width:thin]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border text-[11px] font-medium text-muted-foreground">
                          <th className="pb-3">Criação</th>
                          <th className="pb-3">Plano</th>
                          <th className="pb-3">Valor</th>
                          <th className="pb-3">Método</th>
                          <th className="pb-3">Vencimento</th>
                          <th className="pb-3">Pagamento</th>
                          <th className="pb-3 text-center">Status</th>
                          <th className="pb-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...data.faturas]
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((f) => (
                            <tr key={f.id} className="border-b border-border/40 hover:bg-secondary/40 transition-colors">
                              <td className="py-3 text-xs font-medium text-foreground">
                                {formatDateTime(f.created_at)}
                              </td>
                              <td className="py-3 text-xs text-muted-foreground font-medium">
                                {f.planos?.nome || "—"}
                              </td>
                              <td className="py-3 text-xs font-semibold text-foreground font-headline">
                                {moneyMask(f.valor)}
                              </td>
                              <td className="py-3 text-xs text-muted-foreground">
                                {f.metodo_pagamento ? (PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento?.toUpperCase()) : "—"}
                              </td>
                              <td className="py-3 text-xs text-muted-foreground">
                                {formatDate(f.data_vencimento)}
                              </td>
                              <td className="py-3 text-xs text-muted-foreground">
                                {f.data_pagamento ? formatDateTime(f.data_pagamento) : "—"}
                              </td>
                              <td className="py-3 text-center">
                                <InvoiceStatusBadge status={f.status} />
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {f.status !== SubscriptionInvoiceStatus.PAID && (
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      title="Registrar pagamento (Dar baixa)"
                                      disabled={confirmPaymentMutation.isPending || deleteInvoiceMutation.isPending}
                                      onClick={() => handleConfirmPayment(f)}
                                      className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    title="Excluir fatura"
                                    disabled={deleteInvoiceMutation.isPending || confirmPaymentMutation.isPending}
                                    onClick={() => handleDeleteInvoice(f)}
                                    className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {[...data.faturas]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((f) => (
                        <div key={f.id} className="p-4 bg-secondary/40 rounded-2xl border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted-foreground">
                              Criada em {formatDateTime(f.created_at)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <InvoiceStatusBadge status={f.status} />
                              {f.status !== SubscriptionInvoiceStatus.PAID && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  title="Registrar pagamento (Dar baixa)"
                                  disabled={confirmPaymentMutation.isPending || deleteInvoiceMutation.isPending}
                                  onClick={() => handleConfirmPayment(f)}
                                  className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                title="Excluir fatura"
                                disabled={deleteInvoiceMutation.isPending || confirmPaymentMutation.isPending}
                                onClick={() => handleDeleteInvoice(f)}
                                className="h-7 w-7 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors inline-flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-foreground">{f.planos?.nome || "—"}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {f.metodo_pagamento ? (PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento?.toUpperCase()) : "—"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold font-headline text-foreground">{moneyMask(f.valor)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px]">
                            <div>
                              <span className="font-medium text-muted-foreground block">Vencimento</span>
                              <span className="font-semibold text-foreground">{formatDate(f.data_vencimento)}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-muted-foreground block">Pagamento</span>
                              <span className="font-semibold text-foreground">
                                {f.data_pagamento ? formatDateTime(f.data_pagamento) : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repasses" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                <span>Repasses Pix do motorista</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4">
              <RepasseLogsList
                repasses={repasseData?.data || []}
                isLoading={isFetchingRepasses}
                filters={repasseFilters}
                onFiltersChange={handleRepasseFiltersChange}
                hideDriverColumn={true}
                onRetry={(repasseId) => retryRepasseMutation.mutate(repasseId)}
                isRetryingId={retryRepasseMutation.isPending ? (retryRepasseMutation.variables as string) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>Histórico de atividades</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsMobileFiltersOpen(p => !p)}
                    className={`md:hidden h-8 rounded-xl px-2.5 flex items-center gap-1.5 border transition-all text-xs font-medium cursor-pointer ${isMobileFiltersOpen
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:bg-secondary"
                      }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setLogsPage(1); refetchLogs(); }}
                    disabled={isFetchingLogs}
                    className="h-8 rounded-xl text-foreground bg-card border border-border hover:bg-secondary px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? "animate-spin text-primary" : ""}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4">
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${!isMobileFiltersOpen ? 'hidden md:grid' : ''}`}>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Data início</Label>
                  <Input
                    type="date"
                    value={logsFilter.dataInicio}
                    onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataInicio: e.target.value })) }}
                    className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Data fim</Label>
                  <Input
                    type="date"
                    value={logsFilter.dataFim}
                    onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataFim: e.target.value })) }}
                    className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Ação</Label>
                  <Select value={logsFilter.acao} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, acao: val })) }}>
                    <SelectTrigger className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Todas as ações</SelectItem>
                      {Object.values(AtividadeAcao).map(acao => (
                        <SelectItem key={acao} value={acao} className="text-xs capitalize">{acao.replace(/_/g, " ").toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Entidade</Label>
                  <Select value={logsFilter.entidade} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, entidade: val })) }}>
                    <SelectTrigger className="h-10 rounded-xl bg-secondary/60 border-border text-foreground text-xs focus-visible:ring-primary">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Todas as entidades</SelectItem>
                      {Object.values(AtividadeEntidadeTipo).map(ent => (
                        <SelectItem key={ent} value={ent} className="text-xs capitalize">{ent.replace(/_/g, " ").toLowerCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ActivityLogsList logs={logsData?.data || []} isLoading={isFetchingLogs} hideUserColumn />

              {logsData && logsData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border/40 gap-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Página {logsData.page} de {Math.max(1, Math.ceil(logsData.total / logsData.limit))} ({logsData.total} logs)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Exibir:</Label>
                      <Select value={limitStr} onValueChange={(val) => { setLimitStr(val); setLogsPage(1); }}>
                        <SelectTrigger className="h-8 rounded-xl bg-secondary/60 border-border text-xs text-foreground focus-visible:ring-primary w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25" className="text-xs">25</SelectItem>
                          <SelectItem value="50" className="text-xs">50</SelectItem>
                          <SelectItem value="100" className="text-xs">100</SelectItem>
                          <SelectItem value="250" className="text-xs">250</SelectItem>
                          <SelectItem value="500" className="text-xs">500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={logsPage <= 1}
                        onClick={() => setLogsPage((p) => p - 1)}
                        className="h-8 w-8 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={logsPage >= Math.ceil(logsData.total / logsData.limit)}
                        onClick={() => setLogsPage((p) => p + 1)}
                        className="h-8 w-8 rounded-xl border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: CADASTROS DO MOTORISTA (COM SUB-NAVEGAÇÃO LATERAL/SUPERIOR) */}
        <TabsContent value="cadastros" className="space-y-6 m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* MENU SUB-NAVEGAÇÃO LATERAL NO DESKTOP / SELETOR NO MOBILE */}
            <div className="w-full md:w-64 bg-card border border-border rounded-3xl p-3 shadow-xs shrink-0">
              <div className="px-3 py-2 mb-2 hidden md:block border-b border-border/40">
                <p className="text-xs font-semibold text-foreground tracking-tight">
                  Módulos do motorista
                </p>
              </div>

              {/* SELETOR MOBILE (< 768px) */}
              <div className="md:hidden">
                <Select value={activeSubTab} onValueChange={(val) => handleSubTabChange(val as AdminUserSubTab)}>
                  <SelectTrigger className="w-full bg-secondary/60 border-input text-foreground font-medium h-10 rounded-xl focus:ring-primary text-xs">
                    <SelectValue placeholder="Selecione um módulo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-2xl">
                    <SelectItem value="passageiros" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-400" />
                          <span>Alunos</span>
                        </span>
                        {data.kpis?.passageirosCount !== undefined && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {data.kpis.passageirosCount}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="solicitacoes" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-rose-400" />
                          <span>Solicitações</span>
                        </span>
                        {data.kpis?.solicitacoesPendentesCount !== undefined && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {data.kpis.solicitacoesPendentesCount}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="veiculos" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-amber-400" />
                          <span>Veículos</span>
                        </span>
                        {data.kpis?.veiculosCount !== undefined && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {data.kpis.veiculosCount}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="escolas" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-400" />
                          <span>Escolas</span>
                        </span>
                        {data.kpis?.escolasCount !== undefined && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {data.kpis.escolasCount}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                    <SelectItem value="contratos" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-400" />
                          <span>Contratos</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {data.kpis?.contratosCount ?? data.contratos?.length ?? 0}
                        </span>
                      </span>
                    </SelectItem>
                    <SelectItem value="indicacoes" className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <Share2 className="h-4 w-4 text-purple-400" />
                          <span>Indicações</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {data.referralSummary?.total ?? 0}
                        </span>
                      </span>
                    </SelectItem>
                    <SelectItem value={AdminUserSubTab.EQUIPE} className="text-xs font-medium py-2 rounded-xl focus:bg-primary focus:text-primary-foreground cursor-pointer">
                      <span className="flex items-center justify-between w-full gap-2">
                        <span className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-cyan-400" />
                          <span>Equipe</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {data.kpis?.equipeCount ?? data.equipe?.length ?? 0}
                        </span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* LISTA LATERAL DESKTOP (≥ 768px) */}
              <div className="hidden md:flex flex-col gap-1.5 p-0.5">
                {/* 1. PASSAGEIROS */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange("passageiros")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === "passageiros"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <Users className={`h-4 w-4 shrink-0 ${activeSubTab === "passageiros" ? "text-primary-foreground" : "text-emerald-400"}`} />
                  <span className="flex-1">Alunos</span>
                  {data.kpis?.passageirosCount !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === "passageiros" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                      {data.kpis.passageirosCount}
                    </span>
                  )}
                </button>

                {/* 2. SOLICITAÇÕES */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange("solicitacoes")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === "solicitacoes"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <Clock className={`h-4 w-4 shrink-0 ${activeSubTab === "solicitacoes" ? "text-primary-foreground" : "text-rose-400"}`} />
                  <span className="flex-1">Solicitações</span>
                  {data.kpis?.solicitacoesPendentesCount !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === "solicitacoes" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                      {data.kpis.solicitacoesPendentesCount}
                    </span>
                  )}
                </button>

                {/* 3. VEÍCULOS */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange("veiculos")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === "veiculos"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <Bus className={`h-4 w-4 shrink-0 ${activeSubTab === "veiculos" ? "text-primary-foreground" : "text-amber-400"}`} />
                  <span className="flex-1">Veículos</span>
                  {data.kpis?.veiculosCount !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === "veiculos" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                      {data.kpis.veiculosCount}
                    </span>
                  )}
                </button>

                {/* 4. ESCOLAS */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange("escolas")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === "escolas"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <GraduationCap className={`h-4 w-4 shrink-0 ${activeSubTab === "escolas" ? "text-primary-foreground" : "text-purple-400"}`} />
                  <span className="flex-1">Escolas</span>
                  {data.kpis?.escolasCount !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === "escolas" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}>
                      {data.kpis.escolasCount}
                    </span>
                  )}
                </button>

                {/* 5. CONTRATOS */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange("contratos")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === "contratos"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <FileText className={`h-4 w-4 shrink-0 ${activeSubTab === "contratos" ? "text-primary-foreground" : "text-emerald-400"}`} />
                  <span className="flex-1">Contratos</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === "contratos" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                    {data.kpis?.contratosCount ?? data.contratos?.length ?? 0}
                  </span>
                </button>

                {/* 6. INDICAÇÕES */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange("indicacoes")}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === "indicacoes"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <Share2 className={`h-4 w-4 shrink-0 ${activeSubTab === "indicacoes" ? "text-primary-foreground" : "text-purple-400"}`} />
                  <span className="flex-1">Indicações</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === "indicacoes" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                    {data.referralSummary?.total ?? 0}
                  </span>
                </button>

                {/* 7. EQUIPE */}
                <button
                  type="button"
                  onClick={() => handleSubTabChange(AdminUserSubTab.EQUIPE)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all w-full text-left whitespace-nowrap cursor-pointer ${activeSubTab === AdminUserSubTab.EQUIPE
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                >
                  <UserCheck className={`h-4 w-4 shrink-0 ${activeSubTab === AdminUserSubTab.EQUIPE ? "text-primary-foreground" : "text-cyan-400"}`} />
                  <span className="flex-1">Equipe</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activeSubTab === AdminUserSubTab.EQUIPE ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                    {data.kpis?.equipeCount ?? data.equipe?.length ?? 0}
                  </span>
                </button>
              </div>
            </div>

            {/* CONTEÚDO DO MÓDULO SELECIONADO */}
            <div className="flex-1 w-full min-w-0">
              {activeSubTab === "passageiros" && (
                <AdminUserPassengersTab
                  passageiros={passageirosList}
                  userId={id}
                  motoristaNome={data?.user?.apelido || data?.user?.nome}
                />
              )}
              {activeSubTab === "solicitacoes" && (
                <AdminUserPendingRequestsTab
                  solicitacoes={prePassageirosList}
                  userId={data.user.id}
                />
              )}
              {activeSubTab === "veiculos" && (
                <AdminUserVehiclesTab veiculos={veiculosList} />
              )}
              {activeSubTab === "escolas" && (
                <AdminUserSchoolsTab escolas={escolasList} />
              )}
              {activeSubTab === "contratos" && (
                <AdminUserContractsTab
                  user={data.user}
                  kpis={data.kpis}
                  passageiros={passageirosList}
                  contratos={contratosList}
                />
              )}
              {activeSubTab === "indicacoes" && (
                <AdminUserReferralTab
                  user={data.user}
                  referralSummary={referralSummaryData}
                  referredUsers={referredUsersList}
                />
              )}
              {activeSubTab === AdminUserSubTab.EQUIPE && (
                <AdminUserEquipeTab equipe={equipeList} />
              )}
            </div>
          </div>
        </TabsContent>

        {/* ABA 6: NOTIFICAÇÕES DO MOTORISTA */}
        <TabsContent value="notificacoes" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <Card className="border border-border shadow-xs rounded-3xl overflow-hidden bg-card text-foreground">
            <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-headline font-semibold text-foreground tracking-tight">
                  <Bell className="h-4 w-4 text-primary" />
                  <span>Histórico de notificações</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setNotifPage(1); refetchNotif(); }}
                    disabled={isFetchingNotif}
                    className="h-8 rounded-xl text-foreground bg-card border border-border hover:bg-secondary px-3 flex items-center gap-1.5 transition-all text-xs font-medium shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingNotif ? "animate-spin text-primary" : ""}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-4">
              <NotificationLogsList
                notifications={notifData?.data || []}
                isLoading={isFetchingNotif}
                filters={notifFilters}
                onFiltersChange={handleNotifFiltersChange}
              />

              {notifData && notifData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-border/40 gap-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Página {notifData.page} de {Math.max(1, Math.ceil(notifData.total / notifData.limit))} ({notifData.total} notificações)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-muted-foreground">Exibir:</Label>
                      <Select value={notifLimitStr} onValueChange={(val) => { setNotifLimitStr(val); setNotifPage(1); }}>
                        <SelectTrigger className="h-9 rounded-lg bg-background border border-border text-xs text-foreground focus-visible:ring-0 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="25" className="text-xs">25</SelectItem>
                          <SelectItem value="50" className="text-xs">50</SelectItem>
                          <SelectItem value="100" className="text-xs">100</SelectItem>
                          <SelectItem value="250" className="text-xs">250</SelectItem>
                          <SelectItem value="500" className="text-xs">500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={notifPage <= 1}
                        onClick={() => setNotifPage((p) => p - 1)}
                        className="h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={notifPage >= Math.ceil(notifData.total / notifData.limit)}
                        onClick={() => setNotifPage((p) => p + 1)}
                        className="h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {resetPasswordData?.open && (
        <AdminBaseDialog open={resetPasswordData.open} onOpenChange={() => setResetPasswordData(null)} maxWidth="md">
          <AdminBaseDialog.Header
            title="Senha redefinida"
            icon={<Check className="w-5 h-5 text-emerald-400" />}
            onClose={() => setResetPasswordData(null)}
          />
          <AdminBaseDialog.Body>
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-in scale-in duration-500">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-foreground">Senha redefinida com sucesso!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  A nova senha temporária foi gerada com sucesso e pode ser compartilhada com o motorista.
                </p>
              </div>

              <div className="p-4 bg-secondary/30 rounded-2xl border border-border text-left space-y-3 max-w-sm mx-auto">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">Motorista</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{data.user.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">CPF / CNPJ de login</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{cpfMask(data.user.cpfcnpj)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">Nova senha temporária</p>
                  <p className="text-sm font-mono font-semibold text-amber-400 mt-0.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg inline-block select-all tracking-wider">
                    {resetPasswordData.senha}
                  </p>
                </div>
              </div>
            </div>
          </AdminBaseDialog.Body>
          <AdminBaseDialog.Footer>
            <AdminBaseDialog.Action
              label="Copiar acesso"
              variant="primary"
              onClick={async () => {
                const cleanedCpf = data.user.cpfcnpj.replace(/\D/g, "");
                let maskedCpf = "";
                if (cleanedCpf.length <= 11) {
                  maskedCpf = `${cleanedCpf.slice(0, 3)}.${cleanedCpf.slice(3, 4)}**.***-${cleanedCpf.slice(9, 11)}`;
                } else {
                  maskedCpf = `${cleanedCpf.slice(0, 2)}.${cleanedCpf.slice(2, 3)}**.***/****-${cleanedCpf.slice(12, 14)}`;
                }
                const storeText = APP_AVAILABILITY.ios
                  ? "Google Play Store / Apple App Store"
                  : "Google Play Store";
                const text = `*Nova Senha Provisória - Van360!* 🔐\n\nOlá *${data.user.nome}*,\nSua senha foi redefinida pelo administrador do sistema.\n\n*Novos dados de acesso:*\n👤 Documento: ${maskedCpf}\n🔑 Senha temporária: ${resetPasswordData.senha}\n\n*Como acessar?*\nVocê pode entrar baixando nosso aplicativo *Van360* na ${storeText} ou acessar diretamente pelo navegador no link abaixo:\n🔗 ${import.meta.env.VITE_PUBLIC_APP_DOMAIN}/login`;
                await navigator.clipboard.writeText(text);
                toast.success("Dados de acesso copiados!");
              }}
            />
          </AdminBaseDialog.Footer>
        </AdminBaseDialog>
      )}

      {/* DIÁLOGO DE PRÉVIA DA MINUTA DO CONTRATO */}
      <PdfPreviewDialog
        isOpen={isPreviewPdfOpen}
        isLoading={previewContrato.isPending}
        onClose={() => safeCloseDialog(() => setIsPreviewPdfOpen(false))}
        pdfUrl={previewPdfUrl}
        title={`Minuta do Contrato — ${data.user.nome}`}
        fileName={`minuta_contrato_${data.user.nome.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`}
        showDownload={true}
        variant="admin"
      />

      {/* DIÁLOGO DE ASSINATURA DIGITAL DO MOTORISTA */}
      {data.user.assinatura_digital_url && (
        <AdminBaseDialog
          open={isSignatureModalOpen}
          onOpenChange={setIsSignatureModalOpen}
          description="Assinatura digital cadastrada pelo motorista no aplicativo."
        >
          <AdminBaseDialog.Header
            title={`Assinatura digital — ${data.user.nome}`}
            onClose={() => setIsSignatureModalOpen(false)}
          />
          <AdminBaseDialog.Body>
            <div className="p-6 bg-white rounded-2xl border border-border flex items-center justify-center">
              <img
                src={data.user.assinatura_digital_url}
                alt="Assinatura Digital"
                className="max-h-48 object-contain"
              />
            </div>
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </div>
  );
}

