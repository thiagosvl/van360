import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import {
  useAdminUserDetails,
  useUpdateUserAdmin,
  useUpdateSubscriptionAdmin,
  useResetPasswordAdmin,
  useAdminUserLogs,
  useDeleteUserAdmin,
} from "@/hooks/api/adminHooks";
import { AdminUserLogItem } from "@/services/api/admin.api";
import {
  ArrowLeft,
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
  FileCheck,
  Share2,
  Settings,
  FolderKanban,
  Copy,
  MapPin,
  PenTool,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { AdminUserPassengersTab } from "@/components/features/admin/user-details/AdminUserPassengersTab";
import { AdminUserVehiclesTab } from "@/components/features/admin/user-details/AdminUserVehiclesTab";
import { AdminUserSchoolsTab } from "@/components/features/admin/user-details/AdminUserSchoolsTab";
import { AdminUserPendingRequestsTab } from "@/components/features/admin/user-details/AdminUserPendingRequestsTab";
import { AdminUserReferralTab } from "@/components/features/admin/user-details/AdminUserReferralTab";
import { ActivityLogsList } from "@/components/features/admin/ActivityLogsList";
import { ActiveStatusBadge } from "@/components/ui/ActiveStatusBadge";
import { formatarChavePix } from "@/utils/formatters/pix";
import { formatarEnderecoCompleto } from "@/utils/formatters/address";
import { usePreviewContrato } from "@/hooks/api/useContratos";
import { PdfPreviewDialog } from "@/components/common/PdfPreviewDialog";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayout } from "@/contexts/LayoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SubscriptionStatus, CheckoutPaymentMethod, AtividadeAcao, AtividadeEntidadeTipo, AdminUserTab, AdminUserSubTab, DriverContractConfigStatus,
  ContractMultaTipo
} from "@/types/enums";

const ADMIN_USER_TABS = Object.values(AdminUserTab);
const ADMIN_USER_SUBTABS = Object.values(AdminUserSubTab);
import { cpfCnpjMask as cpfMask, phoneMask, moneyMask, cpfCnpjMask } from "@/utils/masks";
import { toast } from "sonner";
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
import { emailSchema } from "@/schemas/common";
import { dateMask as maskDate } from "@/utils/masks";
import { toPersistenceString, getNowBR, toISODateTimeBR } from "@/utils/dateUtils";
import { AdminUserContractsTab } from "@/components/features/admin/user-details/AdminUserContractsTab";
import { formatCurrency } from "@/utils/formatters";

const STATUS_OPTIONS = Object.entries(SUBSCRIPTION_STATUS_DETAILS).map(([value, detail]) => ({
  value,
  label: detail.label,
}));

const userSchema = z.object({
  nome: z.string()
    .min(2, "Deve ter pelo menos 2 caracteres")
    .refine((val) => val.trim().split(/\s+/).length >= 2, "Digite seu nome e sobrenome"),
  apelido: z.string().optional(),
  cpfcnpj: z.string().min(14, "CPF/CNPJ incompleto"),
  telefone: z.string().min(14, "Telefone incompleto"),
  email: emailSchema,
  ativo: z.boolean(),
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
  const { openConfirmationDialog, closeConfirmationDialog, setPageTitle } = useLayout();
  const resetPassword = useResetPasswordAdmin();
  const deleteUser = useDeleteUserAdmin();
  const [resetPasswordData, setResetPasswordData] = useState<{ open: boolean; senha: string } | null>(null);

  const [isPreviewPdfOpen, setIsPreviewPdfOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const previewContrato = usePreviewContrato();

  const { data, isLoading } = useAdminUserDetails(id!);
  const sub = data?.assinatura;
  const updateUser = useUpdateUserAdmin();

  const handleOpenMinutaPreview = async () => {
    if (!data?.user) return;
    try {
      const config = data.user.config_contrato as Record<string, any> | null;
      const result = await previewContrato.mutateAsync({
        multaAtraso: config?.multa_atraso,
        jurosAtraso: config?.juros_atraso,
        multaRescisao: config?.multa_rescisao,
        secoes: config?.secoes,
        clausulas: config?.clausulas,
        assinaturaCondutorUrl: data.user.assinatura_digital_url,
      });
      setPreviewPdfUrl(result.url);
      setIsPreviewPdfOpen(true);
    } catch (error) {
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
      });
    }
    if (data?.assinatura) {
      const s = data.assinatura;
      setSubForm({
        plano_id: s.plano_id || "",
        status: s.status || "",
        data_vencimento: toDateInputValue(s.data_vencimento),
        trial_ends_at: toDateInputValue(s.trial_ends_at),
        valor_base_mensal: s.valor_base_mensal !== null && s.valor_base_mensal !== undefined ? moneyMask((Number(s.valor_base_mensal) * 100).toString()) : "",
        valor_base_anual: s.valor_base_anual !== null && s.valor_base_anual !== undefined ? moneyMask((Number(s.valor_base_anual) * 100).toString()) : "",
        valor_promocional_mensal: s.valor_promocional_mensal !== null && s.valor_promocional_mensal !== undefined ? moneyMask((Number(s.valor_promocional_mensal) * 100).toString()) : "",
        valor_promocional_anual: s.valor_promocional_anual !== null && s.valor_promocional_anual !== undefined ? moneyMask((Number(s.valor_promocional_anual) * 100).toString()) : "",
        data_fim_promocao: toDateInputValue(s.data_fim_promocao),
      });
    }
  }, [data]);

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
          ? toISODateTimeBR(subForm.data_vencimento + "T23:59:59")
          : null,
        trial_ends_at: subForm.trial_ends_at
          ? toISODateTimeBR(subForm.trial_ends_at + "T23:59:59")
          : null,
        valor_base_mensal: valorBaseMensalNum,
        valor_base_anual: valorBaseAnualNum,
        valor_promocional_mensal: valorPromoMensalNum,
        valor_promocional_anual: valorPromoAnualNum,
        data_fim_promocao: subForm.data_fim_promocao
          ? toISODateTimeBR(subForm.data_fim_promocao + "T23:59:59")
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
      {/* HEADER DE TOPO STITCH DESIGN */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border border-slate-800/80 rounded-[2rem] shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
              {data.user.nome.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-headline font-black text-white truncate leading-tight">
                  {data.user.nome}
                </h1>
                <button
                  type="button"
                  onClick={() => handleCopy(data.user.id, "ID do usuário copiado!")}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/80"
                  title="Copiar ID do usuário"
                >
                  <Copy className="h-4 w-4" />
                </button>

                {data.user.apelido && (
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                    "{data.user.apelido}"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-0.5">
                <ActiveStatusBadge active={data.user.ativo} />

                {data.assinatura && (
                  <SubscriptionStatusBadge
                    status={data.assinatura.status}
                    dataVencimento={data.assinatura.data_vencimento}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              className="rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold h-9 gap-1.5"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Resetar Senha</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteUser}
              className="rounded-xl border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold h-9 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
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
        <div className="md:hidden w-full bg-slate-900/90 border border-slate-800/80 p-2 rounded-[1.25rem] shadow-xl mb-6">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white font-bold h-12 rounded-[0.85rem] focus:ring-blue-500 text-xs">
              <SelectValue placeholder="Selecione uma visão" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl">
              <SelectItem value="geral" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-blue-400" />
                  <span>Visão Geral</span>
                </span>
              </SelectItem>
              <SelectItem value="dados" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-400" />
                  <span>Dados e Configurações</span>
                </span>
              </SelectItem>
              <SelectItem value="cobrancas" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span>Cobranças</span>
                </span>
              </SelectItem>
              <SelectItem value="logs" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-400" />
                  <span>Histórico de Atividades</span>
                </span>
              </SelectItem>
              <SelectItem value="cadastros" className="text-xs font-bold py-2.5 rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer">
                <span className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-purple-400" />
                  <span>Cadastros do Motorista</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SELETOR DESKTOP (BARRA DE 5 ABAS PRINCIPAIS ≥ 768px) */}
        <div className="hidden md:block bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-[1.25rem] shadow-xl mb-6">
          <TabsList className="flex w-full min-h-[48px] bg-transparent p-0 gap-1.5 mt-0">
            <TabsTrigger
              value="geral"
              className="rounded-[1rem] h-full font-headline font-bold text-[12px] lg:text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4 text-blue-300 shrink-0" />
              <span>Visão Geral</span>
            </TabsTrigger>

            <TabsTrigger
              value="dados"
              className="rounded-[1rem] h-full font-headline font-bold text-[12px] lg:text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4 text-blue-300 shrink-0" />
              <span>Dados e Configurações</span>
            </TabsTrigger>

            <TabsTrigger
              value="cobrancas"
              className="rounded-[1rem] h-full font-headline font-bold text-[12px] lg:text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4 text-amber-300 shrink-0" />
              <span>Cobranças</span>
            </TabsTrigger>

            <TabsTrigger
              value="logs"
              className="rounded-[1rem] h-full font-headline font-bold text-[12px] lg:text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Terminal className="h-4 w-4 text-slate-300 shrink-0" />
              <span>Histórico</span>
            </TabsTrigger>

            <TabsTrigger
              value="cadastros"
              className="rounded-[1rem] h-full font-headline font-bold text-[12px] lg:text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <FolderKanban className="h-4 w-4 text-purple-300 shrink-0" />
              <span>Cadastros do Motorista</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ABA 1: VISÃO GERAL (KPIS DO MOTORISTA + RESUMO CADASTRAL CATEGORIZADO) */}
        <TabsContent value="geral" className="space-y-6 m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard
              title="PASSAGEIROS"
              value={data.kpis?.passageirosCount ?? 0}
              subtext="Passageiros cadastrados"
              cardBorder="border-emerald-500/40 shadow-emerald-500/10"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              icon={<Users className="h-5 w-5" />}
              onClick={() => handleSubTabChange("passageiros")}
            />

            <AdminKpiCard
              title="VEÍCULOS"
              value={data.kpis?.veiculosCount ?? 0}
              subtext="Veículos na frota"
              cardBorder="border-blue-500/40 shadow-blue-500/10"
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
              icon={<Bus className="h-5 w-5" />}
              onClick={() => handleSubTabChange("veiculos")}
            />

            <AdminKpiCard
              title="ESCOLAS"
              value={data.kpis?.escolasCount ?? 0}
              subtext="Escolas atendidas"
              cardBorder="border-purple-500/40 shadow-purple-500/10"
              iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
              icon={<GraduationCap className="h-5 w-5" />}
              onClick={() => handleSubTabChange("escolas")}
            />

            <AdminKpiCard
              title="SOLICITAÇÕES PENDENTES"
              value={data.kpis?.solicitacoesPendentesCount ?? 0}
              subtext="Aprovações pendentes"
              cardBorder="border-amber-500/40 shadow-amber-500/10"
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              icon={<Clock className="h-5 w-5" />}
              onClick={() => handleSubTabChange("solicitacoes")}
            />
          </div>

          {/* RESUMO CADASTRAL CATEGORIZADO DO MOTORISTA */}
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100">
            <CardHeader className="p-6 border-b border-slate-800/80 bg-slate-900/40">
              <div className="space-y-1">
                <CardTitle className="text-xs font-headline font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  Resumo Cadastral do Motorista
                </CardTitle>
                <p className="text-[11px] font-medium text-slate-400">
                  Visão consolidada dos dados pessoais, de contato, financeiros e contratuais.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* CATEGORIA 1: DADOS PESSOAIS & IDENTIFICAÇÃO */}
                <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 mb-3">
                      <User className="h-4 w-4 text-blue-400" />
                      <h3 className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider">
                        Identificação
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Apelido
                        </span>
                        <span className="font-medium text-slate-300 block">
                          {data.user.apelido || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          {data.user.cpfcnpj && data.user.cpfcnpj.replace(/\D/g, "").length > 11 ? "CNPJ" : "CPF"}
                        </span>
                        <span className="font-mono font-medium text-slate-300 block">
                          {data.user.cpfcnpj ? cpfCnpjMask(data.user.cpfcnpj) : "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Razão Social
                        </span>
                        <span className="font-medium text-slate-300 block">
                          {data.user.razao_social || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Data de Nascimento
                        </span>
                        <span className="font-medium text-slate-300 block">
                          {formatDate(data.user.data_nascimento)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Tipo de Conta
                        </span>
                        <span className="font-semibold text-emerald-400 uppercase block">
                          {data.user.tipo || "MOTORISTA"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORIA 2: CONTATO & LOCALIZAÇÃO */}
                <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 mb-3">
                      <MapPin className="h-4 w-4 text-purple-400" />
                      <h3 className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider">
                        Contato & Endereço
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Telefone / WhatsApp
                        </span>
                        {data.user.telefone ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-medium text-slate-200">
                              {phoneMask(data.user.telefone)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(data.user.telefone, "Telefone copiado!")}
                              className="text-slate-400 hover:text-white transition-colors"
                              title="Copiar telefone"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">—</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          E-mail de Contato
                        </span>
                        <span className="font-medium text-slate-200 block truncate mt-0.5">
                          {data.user.email || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Endereço Completo
                        </span>
                        <span className="font-medium text-slate-300 block leading-relaxed mt-0.5">
                          {formattedFullAddress || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORIA 3: FINANCEIRO & SISTEMA */}
                <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 mb-3">
                      <CreditCard className="h-4 w-4 text-amber-400" />
                      <h3 className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider">
                        Financeiro & Sistema
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Chave Pix
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-medium text-slate-200">
                            {formatarChavePix(data.user.chave_pix, data.user.chave_pix_tipo)}
                          </span>
                          {data.user.chave_pix && (
                            <button
                              type="button"
                              onClick={() => handleCopy(data.user.chave_pix!, "Chave Pix copiada!")}
                              className="text-slate-400 hover:text-white transition-colors"
                              title="Copiar Chave Pix"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Canal de Aquisição
                        </span>
                        <span className="font-medium text-slate-300 block">
                          {data.user.canal_aquisicao || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          Data de Cadastro
                        </span>
                        <span className="font-medium text-slate-300 block">
                          {formatDate(data.user.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORIA 4: CONTRATOS DIGITAIS & MINUTA */}
                {(() => {
                  const config = data.user.config_contrato as Record<string, any> | null;
                  const hasSignature = !!data.user.assinatura_digital_url;
                  const hasConfig =
                    !!config &&
                    (config.usar_contratos !== undefined ||
                      (Array.isArray(config.secoes) && config.secoes.length > 0) ||
                      (Array.isArray(config.clausulas) && config.clausulas.length > 0) ||
                      !!config.multa_atraso ||
                      !!config.juros_atraso ||
                      !!config.multa_rescisao);

                  const statusConfig =
                    !hasConfig && !hasSignature
                      ? DriverContractConfigStatus.NAO_CONFIGURADO
                      : config?.usar_contratos === false
                      ? DriverContractConfigStatus.DESATIVADO
                      : DriverContractConfigStatus.ATIVO;

                  const isConfigurado = statusConfig !== DriverContractConfigStatus.NAO_CONFIGURADO;
                  const isAtivo = statusConfig === DriverContractConfigStatus.ATIVO;

                  return (
                    <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-800/80 mb-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                            <h3 className="text-xs font-headline font-black text-slate-200 uppercase tracking-wider truncate">
                              Contratos Digitais
                            </h3>
                          </div>

                          {statusConfig === DriverContractConfigStatus.ATIVO && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                              <CheckCircle2 className="h-2.5 w-2.5" /> MÓDULO ATIVO
                            </span>
                          )}
                          {statusConfig === DriverContractConfigStatus.DESATIVADO && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                              <AlertTriangle className="h-2.5 w-2.5" /> INATIVO
                            </span>
                          )}
                          {statusConfig === DriverContractConfigStatus.NAO_CONFIGURADO && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                              <AlertTriangle className="h-2.5 w-2.5" /> NÃO CONFIGURADO
                            </span>
                          )}
                        </div>

                        {isConfigurado ? (
                          <div className="space-y-3 text-xs">
                            <div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Multa de Atraso
                              </span>
                              <span className="font-mono font-medium text-slate-300 block">
                                {formatarRegraContrato(config?.multa_atraso || { valor: 10, tipo: "fixo" })}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Juros de Atraso
                              </span>
                              <span className="font-mono font-medium text-slate-300 block">
                                {formatarRegraContrato(config?.juros_atraso || { valor: 1, tipo: "percentual" })}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Multa de Rescisão
                              </span>
                              <span className="font-mono font-medium text-slate-300 block">
                                {formatarRegraContrato(config?.multa_rescisao || { valor: 15, tipo: "fixo" })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 font-medium py-3 leading-relaxed">
                            O módulo de contratos digitais não foi configurado por este motorista.
                          </p>
                        )}
                      </div>

                      {/* BOTÕES DE PREVIEW DA MINUTA E ASSINATURA */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2 mt-4">
                        {isConfigurado && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={previewContrato.isPending}
                            onClick={handleOpenMinutaPreview}
                            className="w-full rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 h-9 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {previewContrato.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )}
                            <span>Ver Minuta do Contrato</span>
                          </Button>
                        )}

                        {hasSignature && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsSignatureModalOpen(true)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white h-8 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <PenTool className="h-3.5 w-3.5 text-blue-400" />
                            <span>Ver Assinatura Digital</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                  <User className="h-4 w-4 text-blue-400" />
                  Dados Cadastrais
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(handleSaveUser, onUserFormError)} className="space-y-5">
                    {(() => {
                      const cpfcnpjValue = userForm.watch("cpfcnpj") || "";
                      const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;

                      return (
                        <>
                          <div className="mb-4">
                            <FormField
                              control={userForm.control}
                              name="cpfcnpj"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      onChange={(e) => field.onChange(cpfMask(e.target.value))}
                                      inputMode="numeric"
                                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 placeholder:text-slate-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={userForm.control}
                            name="razao_social"
                            render={({ field, fieldState, formState }) => (
                              <FormItem className="space-y-2 mb-4">
                                <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                  Razão Social {isCnpj && <span className="text-red-600">*</span>}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ""}
                                    className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 placeholder:text-slate-500"
                                    aria-invalid={!!fieldState.error || (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                                {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                                  <p className="text-[0.8rem] font-medium text-red-500 mt-1.5 ml-1">Razão social é obrigatória para CNPJ</p>
                                )}
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <FormField
                              control={userForm.control}
                              name="nome"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    Nome
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 placeholder:text-slate-500"
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
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    Apelido
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 placeholder:text-slate-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <FormField
                              control={userForm.control}
                              name="telefone"
                              render={({ field }) => (
                                <PhoneInput
                                  field={field}
                                  label="Telefone"
                                  placeholder="(00) 00000-0000"
                                  labelClassName="text-[11px] font-black text-slate-400 uppercase tracking-widest"
                                  inputClassName="pl-11 h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500"
                                />
                              )}
                            />
                            <FormField
                              control={userForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest">E-mail</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="email"
                                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 placeholder:text-slate-500"
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
                                <FormItem className="space-y-2">
                                  <FormLabel className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      inputMode="numeric"
                                      maxLength={10}
                                      onChange={(e) => field.onChange(maskDate(e.target.value))}
                                      placeholder="dd/mm/aaaa"
                                      className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 placeholder:text-slate-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </>
                      );
                    })()}



                    <div className="flex items-center justify-between pt-2">
                      <FormField
                        control={userForm.control}
                        name="ativo"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <Label className="text-xs font-bold text-slate-300">
                                  {field.value ? "Conta Ativa" : "Conta Inativa"}
                                </Label>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        type="submit"
                        disabled={updateUser.isPending}
                        className="w-full h-11 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                      >
                        {updateUser.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleResetPassword}
                        type="button"
                        variant="outline"
                        disabled={resetPassword.isPending}
                        className="w-full h-11 rounded-xl bg-slate-800/60 border-red-800/60 text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        {resetPassword.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Resetar Senha
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleDeleteUser}
                        type="button"
                        variant="destructive"
                        disabled={deleteUser.isPending}
                        className="w-full h-11 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        {deleteUser.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                {!sub ? (
                  <p className="text-sm text-slate-400 py-8 text-center">
                    Nenhuma assinatura encontrada para este usuário.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Plano</Label>
                        <Select
                          value={subForm.plano_id}
                          onValueChange={(val) => setSubForm(p => ({ ...p, plano_id: val }))}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {data.planos.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome} — R$ {Number(p.valor).toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</Label>
                        <Select
                          value={subForm.status}
                          onValueChange={(val) => setSubForm(p => ({
                            ...p,
                            status: val,
                            data_vencimento: toDateInputValue(data?.assinatura?.data_vencimento),
                            trial_ends_at: toDateInputValue(data?.assinatura?.trial_ends_at),
                          }))}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Data de Vencimento
                        </Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={subForm.data_vencimento}
                            onChange={(e) => setSubForm(p => ({ ...p, data_vencimento: e.target.value }))}
                            disabled={subForm.status === SubscriptionStatus.TRIAL}
                            className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                          />
                          {subForm.data_vencimento && subForm.status !== SubscriptionStatus.TRIAL && (
                            <div
                              className="absolute right-12 top-3 text-slate-400 hover:text-white cursor-pointer z-10 flex bg-slate-800/90 rounded p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSubForm(p => ({ ...p, data_vencimento: "" }));
                              }}
                              title="Remover data de vencimento"
                            >
                              <X className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Fim do Trial
                        </Label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={subForm.trial_ends_at}
                            onChange={(e) => setSubForm(p => ({ ...p, trial_ends_at: e.target.value }))}
                            disabled={subForm.status !== SubscriptionStatus.TRIAL}
                            className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                          />
                          {subForm.trial_ends_at && subForm.status === SubscriptionStatus.TRIAL && (
                            <div
                              className="absolute right-12 top-3 text-slate-400 hover:text-white cursor-pointer z-10 flex bg-slate-800/90 rounded p-0.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSubForm(p => ({ ...p, trial_ends_at: "" }));
                              }}
                              title="Remover fim do trial"
                            >
                              <X className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 pb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Conceder acesso:</span>
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
                          className="h-7 px-2.5 text-[10px] font-bold rounded-lg bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                        >
                          {shortcut.label}
                        </Button>
                      ))}
                    </div>

                    <div className="border-t border-slate-800 pt-5 pb-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        Desconto / Promoção Especial
                        {(() => {
                          const cleanValMensal = (subForm.valor_promocional_mensal || "").replace(/\D/g, "");
                          const cleanValAnual = (subForm.valor_promocional_anual || "").replace(/\D/g, "");
                          if ((!cleanValMensal || Number(cleanValMensal) <= 0) && (!cleanValAnual || Number(cleanValAnual) <= 0)) return null;
                          if (!subForm.data_fim_promocao) {
                            return <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Definitivo</span>;
                          }
                          const fim = new Date(subForm.data_fim_promocao + "T23:59:59").getTime();
                          if (fim >= new Date().getTime()) {
                            return <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Ativo</span>;
                          } else {
                            return <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Expirado</span>;
                          }
                        })()}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Valor Base (Mensal)
                          </Label>
                          <div className="relative">
                            <Input
                              placeholder="Pendente"
                              value={subForm.valor_base_mensal}
                              onChange={(e) => setSubForm(p => ({ ...p, valor_base_mensal: moneyMask(e.target.value) }))}
                              className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 pr-10"
                            />
                            {subForm.valor_base_mensal && (
                              <div
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSubForm(p => ({ ...p, valor_base_mensal: "" }));
                                }}
                                title="Limpar valor base mensal"
                              >
                                <X className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Valor Base (Anual)
                          </Label>
                          <div className="relative">
                            <Input
                              placeholder="Pendente"
                              value={subForm.valor_base_anual}
                              onChange={(e) => setSubForm(p => ({ ...p, valor_base_anual: moneyMask(e.target.value) }))}
                              className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 pr-10"
                            />
                            {subForm.valor_base_anual && (
                              <div
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSubForm(p => ({ ...p, valor_base_anual: "" }));
                                }}
                                title="Limpar valor base anual"
                              >
                                <X className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Valor Promocional (Mensal)
                          </Label>
                          <div className="relative">
                            <Input
                              placeholder="R$ Base"
                              value={subForm.valor_promocional_mensal}
                              onChange={(e) => setSubForm(p => ({ ...p, valor_promocional_mensal: moneyMask(e.target.value) }))}
                              className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 pr-10"
                            />
                            {subForm.valor_promocional_mensal && (
                              <div
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSubForm(p => ({ ...p, valor_promocional_mensal: "" }));
                                }}
                                title="Limpar valor promocional mensal"
                              >
                                <X className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Valor Promocional (Anual)
                          </Label>
                          <div className="relative">
                            <Input
                              placeholder="R$ Base"
                              value={subForm.valor_promocional_anual}
                              onChange={(e) => setSubForm(p => ({ ...p, valor_promocional_anual: moneyMask(e.target.value) }))}
                              className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 pr-10"
                            />
                            {subForm.valor_promocional_anual && (
                              <div
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSubForm(p => ({ ...p, valor_promocional_anual: "" }));
                                }}
                                title="Limpar valor promocional anual"
                              >
                                <X className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            Data de Validade
                          </Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={subForm.data_fim_promocao}
                              onChange={(e) => setSubForm(p => ({ ...p, data_fim_promocao: e.target.value }))}
                              className="h-11 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0 focus:border-blue-500 pr-12"
                            />
                            {subForm.data_fim_promocao && (
                              <div
                                className="absolute right-12 top-3 text-slate-400 hover:text-white cursor-pointer z-10 flex bg-slate-800/90 rounded p-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSubForm(p => ({ ...p, data_fim_promocao: "" }));
                                }}
                                title="Remover data de validade"
                              >
                                <X className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveSub}
                      disabled={updateSub.isPending}
                      className="w-full h-11 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                    >
                      {updateSub.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Assinatura
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cobrancas" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100 animate-in fade-in duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                <CreditCard className="h-4 w-4 text-blue-400" />
                Histórico de Cobranças
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {data.faturas.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <CreditCard className="h-12 w-12 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-400">Nenhuma fatura encontrada.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Plano</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Método</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Vencimento</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Pagamento</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...data.faturas]
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((f) => (
                            <tr key={f.id} className="border-b border-slate-800/60 hover:bg-slate-800/50 transition-colors">
                              <td className="py-4 text-xs font-semibold text-slate-200">
                                {formatDate(f.created_at)}
                              </td>
                              <td className="py-4 text-xs text-slate-400 font-medium">
                                {f.planos?.nome || "—"}
                              </td>
                              <td className="py-4 text-xs font-bold text-white">
                                {moneyMask(f.valor)}
                              </td>
                              <td className="py-4 text-xs text-slate-400">
                                {f.metodo_pagamento ? (PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento?.toUpperCase()) : "—"}
                              </td>
                              <td className="py-4 text-xs text-slate-400">
                                {formatDate(f.data_vencimento)}
                              </td>
                              <td className="py-4 text-xs text-slate-400">
                                {f.data_pagamento ? formatDate(f.data_pagamento) : "—"}
                              </td>
                              <td className="py-4 text-right">
                                <InvoiceStatusBadge status={f.status} />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-4">
                    {[...data.faturas]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((f) => (
                        <div key={f.id} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              {formatDate(f.created_at)}
                            </span>
                            <InvoiceStatusBadge status={f.status} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-200">{f.planos?.nome || "—"}</p>
                              <p className="text-[10px] text-slate-400">
                                {f.metodo_pagamento ? (PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento?.toUpperCase()) : "—"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-white">{moneyMask(f.valor)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                            <div>
                              <span className="font-semibold text-slate-400 block uppercase tracking-wider">Vencimento</span>
                              <span className="font-bold text-slate-200">{formatDate(f.data_vencimento)}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-slate-400 block uppercase tracking-wider">Pagamento</span>
                              <span className="font-bold text-slate-200">
                                {f.data_pagamento ? formatDate(f.data_pagamento) : "—"}
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

        <TabsContent value="logs" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
          <Card className="border border-slate-800/80 shadow-2xl rounded-[2rem] overflow-hidden bg-[#131b2e] text-slate-100 animate-in fade-in duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-white uppercase tracking-tight">
                  <Terminal className="h-4 w-4 text-blue-400" />
                  Histórico de Atividades
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileFiltersOpen(p => !p)}
                    className={`md:hidden h-8 rounded-xl px-2 flex items-center gap-1.5 ${isMobileFiltersOpen ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setLogsPage(1); refetchLogs(); }}
                    disabled={isFetchingLogs}
                    className="h-8 rounded-xl text-blue-400 hover:bg-blue-500/10 px-3 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLogs ? "animate-spin" : ""}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Atualizar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${!isMobileFiltersOpen ? 'hidden md:grid' : ''}`}>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Início</Label>
                  <Input
                    type="date"
                    value={logsFilter.dataInicio}
                    onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataInicio: e.target.value })) }}
                    className="h-10 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fim</Label>
                  <Input
                    type="date"
                    value={logsFilter.dataFim}
                    onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataFim: e.target.value })) }}
                    className="h-10 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</Label>
                  <Select value={logsFilter.acao} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, acao: val })) }}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-[13px] focus-visible:ring-0">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as ações</SelectItem>
                      {Object.values(AtividadeAcao).map(acao => (
                        <SelectItem key={acao} value={acao} className="text-[13px]">{acao.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidade</Label>
                  <Select value={logsFilter.entidade} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, entidade: val })) }}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-800/60 border-slate-700/80 text-slate-100 text-[13px] focus-visible:ring-0">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as entidades</SelectItem>
                      {Object.values(AtividadeEntidadeTipo).map(ent => (
                        <SelectItem key={ent} value={ent} className="text-[13px]">{ent.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ActivityLogsList logs={logsData?.data || []} isLoading={isFetchingLogs} hideUserColumn />

              {logsData && logsData.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-800 gap-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Página {logsData.page} de {Math.max(1, Math.ceil(logsData.total / logsData.limit))} ({logsData.total} logs)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                      <Select value={limitStr} onValueChange={(val) => { setLimitStr(val); setLogsPage(1); }}>
                        <SelectTrigger className="h-8 rounded-xl bg-slate-800/60 border-slate-700/80 text-xs text-slate-100 focus-visible:ring-0 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="250">250</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={logsPage <= 1}
                        onClick={() => setLogsPage((p) => p - 1)}
                        className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={logsPage >= Math.ceil(logsData.total / logsData.limit)}
                        onClick={() => setLogsPage((p) => p + 1)}
                        className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white disabled:bg-slate-900/40 disabled:border-slate-800/40 disabled:text-slate-600 disabled:opacity-40"
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
            {/* MENU SUB-NAVEGAÇÃO LATERAL NO DESKTOP / BARRA DE ABAS NO MOBILE */}
            <div className="w-full md:w-64 bg-[#131b2e] border border-slate-800/80 rounded-[1.5rem] p-3 shadow-xl shrink-0">
              <div className="px-3 py-2 mb-2 hidden md:block border-b border-slate-800/80">
                <p className="text-[10px] font-black uppercase text-purple-400 tracking-wider">
                  Módulos do Motorista
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Dados geridos pelo motorista
                </p>
              </div>

              <div className="flex md:flex-col overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-1.5 p-0.5">
                <button
                  type="button"
                  onClick={() => handleSubTabChange("passageiros")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${activeSubTab === "passageiros"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <Users className={`h-4 w-4 shrink-0 ${activeSubTab === "passageiros" ? "text-white" : "text-emerald-400"}`} />
                  <span className="flex-1">Passageiros</span>
                  {data.kpis?.passageirosCount !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeSubTab === "passageiros" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-300"
                      }`}>
                      {data.kpis.passageirosCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubTabChange("veiculos")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${activeSubTab === "veiculos"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <Bus className={`h-4 w-4 shrink-0 ${activeSubTab === "veiculos" ? "text-white" : "text-amber-400"}`} />
                  <span className="flex-1">Veículos</span>
                  {data.kpis?.veiculosCount !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeSubTab === "veiculos" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-300"
                      }`}>
                      {data.kpis.veiculosCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubTabChange("escolas")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${activeSubTab === "escolas"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <GraduationCap className={`h-4 w-4 shrink-0 ${activeSubTab === "escolas" ? "text-white" : "text-purple-400"}`} />
                  <span className="flex-1">Escolas</span>
                  {data.kpis?.escolasCount !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeSubTab === "escolas" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-300"
                      }`}>
                      {data.kpis.escolasCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubTabChange("solicitacoes")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${activeSubTab === "solicitacoes"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <Clock className={`h-4 w-4 shrink-0 ${activeSubTab === "solicitacoes" ? "text-white" : "text-rose-400"}`} />
                  <span className="flex-1">Solicitações</span>
                  {data.kpis?.solicitacoesPendentesCount !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeSubTab === "solicitacoes" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-300"
                      }`}>
                      {data.kpis.solicitacoesPendentesCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubTabChange("contratos")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${activeSubTab === "contratos"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <FileCheck className={`h-4 w-4 shrink-0 ${activeSubTab === "contratos" ? "text-white" : "text-emerald-400"}`} />
                  <span className="flex-1">Contratos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubTabChange("indicacoes")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all w-full text-left whitespace-nowrap ${activeSubTab === "indicacoes"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                >
                  <Share2 className={`h-4 w-4 shrink-0 ${activeSubTab === "indicacoes" ? "text-white" : "text-purple-400"}`} />
                  <span className="flex-1">Indicações</span>
                </button>
              </div>
            </div>

            {/* CONTEÚDO DO MÓDULO SELECIONADO */}
            <div className="flex-1 w-full min-w-0">
              {activeSubTab === "passageiros" && (
                <AdminUserPassengersTab passageiros={data.passageiros || []} />
              )}
              {activeSubTab === "veiculos" && (
                <AdminUserVehiclesTab veiculos={data.veiculos || []} />
              )}
              {activeSubTab === "escolas" && (
                <AdminUserSchoolsTab escolas={data.escolas || []} />
              )}
              {activeSubTab === "solicitacoes" && (
                <AdminUserPendingRequestsTab solicitacoes={data.prePassageiros || []} />
              )}
              {activeSubTab === "contratos" && (
                <AdminUserContractsTab
                  user={data.user}
                  kpis={data.kpis}
                  passageiros={data.passageiros || []}
                  contratos={data.contratos || []}
                />
              )}
              {activeSubTab === "indicacoes" && (
                <AdminUserReferralTab user={data.user} referralSummary={data.referralSummary} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {resetPasswordData?.open && (
        <AdminBaseDialog open={resetPasswordData.open} onOpenChange={() => setResetPasswordData(null)} maxWidth="md">
          <AdminBaseDialog.Header
            title="Senha Redefinida"
            icon={<Check className="w-5 h-5 text-emerald-400" />}
            onClose={() => setResetPasswordData(null)}
          />
          <AdminBaseDialog.Body>
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 animate-in scale-in duration-500">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Senha redefinida com sucesso!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  A nova senha temporária foi gerada com sucesso e pode ser compartilhada com o motorista.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-3.5 max-w-sm mx-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motorista</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{data.user.nome}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ de Login</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{cpfMask(data.user.cpfcnpj)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Senha Temporária</p>
                  <p className="text-sm font-mono font-bold text-amber-400 mt-0.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg inline-block select-all tracking-wider">
                    {resetPasswordData.senha}
                  </p>
                </div>
              </div>
            </div>
          </AdminBaseDialog.Body>
          <AdminBaseDialog.Footer>
            <AdminBaseDialog.Action
              label="Copiar Acesso"
              variant="primary"
              onClick={async () => {
                const cleanedCpf = data.user.cpfcnpj.replace(/\D/g, "");
                let maskedCpf = "";
                if (cleanedCpf.length <= 11) {
                  maskedCpf = `${cleanedCpf.slice(0, 3)}.${cleanedCpf.slice(3, 4)}**.***-${cleanedCpf.slice(9, 11)}`;
                } else {
                  maskedCpf = `${cleanedCpf.slice(0, 2)}.${cleanedCpf.slice(2, 3)}**.***/****-${cleanedCpf.slice(12, 14)}`;
                }
                const text = `*Nova Senha Provisória - Van360!* 🔐\n\nOlá *${data.user.nome}*,\nSua senha foi redefinida pelo administrador do sistema.\n\n*Novos dados de acesso:*\n👤 Documento: ${maskedCpf}\n🔑 Senha temporária: ${resetPasswordData.senha}\n\n*Como acessar?*\nVocê pode entrar baixando nosso aplicativo *Van360* na Google Play Store / Apple App Store ou acessar diretamente pelo navegador no link abaixo:\n🔗 ${import.meta.env.VITE_PUBLIC_APP_DOMAIN}/login`;
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
        onClose={() => setIsPreviewPdfOpen(false)}
        pdfUrl={previewPdfUrl}
        title={`Minuta do Contrato — ${data.user.nome}`}
        fileName={`minuta_contrato_${data.user.nome.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`}
        showDownload={true}
      />

      {/* DIÁLOGO DE ASSINATURA DIGITAL DO MOTORISTA */}
      {data.user.assinatura_digital_url && (
        <AdminBaseDialog
          open={isSignatureModalOpen}
          onOpenChange={setIsSignatureModalOpen}
          description="Assinatura digital cadastrada pelo motorista no aplicativo."
        >
          <AdminBaseDialog.Header
            title={`Assinatura Digital — ${data.user.nome}`}
            onClose={() => setIsSignatureModalOpen(false)}
          />
          <AdminBaseDialog.Body>
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
              <img
                src={data.user.assinatura_digital_url}
                alt="Assinatura Digital"
                className="max-h-48 object-contain filter invert opacity-90"
              />
            </div>
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </div>
  );
}

