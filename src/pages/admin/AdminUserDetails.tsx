import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "lucide-react";
import { AdminUserPassengersTab } from "@/components/features/admin/user-details/AdminUserPassengersTab";
import { AdminUserVehiclesTab } from "@/components/features/admin/user-details/AdminUserVehiclesTab";
import { AdminUserSchoolsTab } from "@/components/features/admin/user-details/AdminUserSchoolsTab";
import { AdminUserPendingRequestsTab } from "@/components/features/admin/user-details/AdminUserPendingRequestsTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayout } from "@/contexts/LayoutContext";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionStatus, CheckoutPaymentMethod, AtividadeAcao, AtividadeEntidadeTipo } from "@/types/enums";
import { cpfCnpjMask as cpfMask, phoneMask, moneyMask } from "@/utils/masks";
import { toast } from "sonner";
import { SubscriptionStatusBadge, SUBSCRIPTION_STATUS_DETAILS } from "@/components/ui/SubscriptionStatusBadge";
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

const ADMIN_USER_TABS = ["passageiros", "veiculos", "escolas", "solicitacoes", "dados", "cobrancas", "logs"] as const;
type AdminUserTab = (typeof ADMIN_USER_TABS)[number];

export default function AdminUserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openConfirmationDialog, closeConfirmationDialog, setPageTitle } = useLayout();
  const resetPassword = useResetPasswordAdmin();
  const deleteUser = useDeleteUserAdmin();
  const [resetPasswordData, setResetPasswordData] = useState<{ open: boolean; senha: string } | null>(null);
  const { data, isLoading } = useAdminUserDetails(id!);
  const updateUser = useUpdateUserAdmin();
  const updateSub = useUpdateSubscriptionAdmin();

  useEffect(() => {
    if (data?.user?.nome) {
      setPageTitle(data.user.nome);
    } else {
      setPageTitle("Detalhes do Usuário");
    }
  }, [setPageTitle, data?.user?.nome]);

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get("tab") as AdminUserTab;
    if (tabParam && ADMIN_USER_TABS.includes(tabParam)) return tabParam;
    return "passageiros" as AdminUserTab;
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", value);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const [logsPage, setLogsPage] = useState(1);
  const [limitStr, setLimitStr] = useState("25");
  const [selectedLog, setSelectedLog] = useState<AdminUserLogItem | null>(null);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-32">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-400 mb-4" />
        <p className="font-bold text-slate-500">Usuário não encontrado.</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  const sub = data.assinatura;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(ROUTES.PRIVATE.ADMIN.USERS)}
          className="rounded-xl h-10 w-10 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 text-left flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">
            Cadastrado em {formatDate(data.user.created_at)}
          </span>
          {sub && (
            <SubscriptionStatusBadge status={sub.status} dataVencimento={sub.data_vencimento} />
          )}
        </div>
      </div>

      {/* KPIs do Motorista */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => handleTabChange("passageiros")}
          className="border border-emerald-500/40 shadow-lg shadow-emerald-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                PASSAGEIROS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {data.kpis?.passageirosCount ?? 0}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Passageiros cadastrados
              </p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange("veiculos")}
          className="border border-blue-500/40 shadow-lg shadow-blue-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                VEÍCULOS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {data.kpis?.veiculosCount ?? 0}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Veículos na frota
              </p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Bus className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange("escolas")}
          className="border border-purple-500/40 shadow-lg shadow-purple-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden cursor-pointer hover:border-purple-400 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ESCOLAS
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {data.kpis?.escolasCount ?? 0}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Escolas atendidas
              </p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card
          onClick={() => handleTabChange("solicitacoes")}
          className="border border-amber-500/40 shadow-lg shadow-amber-500/10 rounded-2xl bg-[#131b2e] p-5 relative overflow-hidden cursor-pointer hover:border-amber-400 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                SOLICITAÇÕES PENDENTES
              </span>
              <p className="text-3xl font-headline font-black text-white tracking-tight">
                {data.kpis?.solicitacoesPendentesCount ?? 0}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                Aprovações pendentes
              </p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-6"
      >
        <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-[1.25rem] overflow-x-auto scrollbar-none">
          <TabsList className="flex w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0 min-w-max md:min-w-0 md:grid md:grid-cols-7">
            <TabsTrigger
              value="passageiros"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Passageiros
            </TabsTrigger>
            <TabsTrigger
              value="veiculos"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Veículos
            </TabsTrigger>
            <TabsTrigger
              value="escolas"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Escolas
            </TabsTrigger>
            <TabsTrigger
              value="solicitacoes"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Solicitações
            </TabsTrigger>
            <TabsTrigger
              value="dados"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Dados e Configurações
            </TabsTrigger>
            <TabsTrigger
              value="cobrancas"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Cobranças
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-3 flex-1 whitespace-nowrap"
            >
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="passageiros" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <AdminUserPassengersTab passageiros={data.passageiros || []} />
        </TabsContent>

        <TabsContent value="veiculos" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <AdminUserVehiclesTab veiculos={data.veiculos || []} />
        </TabsContent>

        <TabsContent value="escolas" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <AdminUserSchoolsTab escolas={data.escolas || []} />
        </TabsContent>

        <TabsContent value="solicitacoes" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0">
          <AdminUserPendingRequestsTab solicitacoes={data.prePassageiros || []} />
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
                                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                  inputClassName="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                      className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
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
                                <Label className="text-xs font-bold text-slate-600">
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
                        className="w-full h-11 rounded-xl bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
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
                        className="w-full h-11 rounded-xl border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold uppercase tracking-wider transition-all"
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
                        className="w-full h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold uppercase tracking-wider transition-all"
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

            <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                  <ShieldCheck className="h-4 w-4" />
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
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:ring-0">
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
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:ring-0">
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
                            className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                          />
                          {subForm.data_vencimento && subForm.status !== SubscriptionStatus.TRIAL && (
                            <div
                              className="absolute right-12 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex bg-slate-50"
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
                            className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] disabled:opacity-50 disabled:cursor-not-allowed pr-12"
                          />
                          {subForm.trial_ends_at && subForm.status === SubscriptionStatus.TRIAL && (
                            <div
                              className="absolute right-12 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex bg-slate-50"
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
                          className="h-7 px-2.5 text-[10px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-[#1a3a5c] hover:text-white transition-all shadow-sm"
                        >
                          {shortcut.label}
                        </Button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-5 pb-2">
                      <h4 className="text-xs font-black text-[#1a3a5c] uppercase tracking-widest flex items-center gap-2">
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] pr-10"
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] pr-10"
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] pr-10"
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] pr-10"
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
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c] pr-12"
                            />
                            {subForm.data_fim_promocao && (
                              <div
                                className="absolute right-12 top-3 text-slate-400 hover:text-slate-600 cursor-pointer z-10 flex bg-slate-50"
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
                      className="w-full h-11 rounded-xl bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
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
          <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden animate-in fade-in duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                <CreditCard className="h-4 w-4" />
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
                        <tr className="border-b border-slate-100">
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
                            <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 text-xs font-semibold text-slate-600">
                                {formatDate(f.created_at)}
                              </td>
                              <td className="py-4 text-xs text-slate-500 font-medium">
                                {f.planos?.nome || "—"}
                              </td>
                              <td className="py-4 text-xs font-bold text-[#1a3a5c]">
                                {moneyMask(f.valor)}
                              </td>
                              <td className="py-4 text-xs text-slate-500">
                                {f.metodo_pagamento ? (PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento?.toUpperCase()) : "—"}
                              </td>
                              <td className="py-4 text-xs text-slate-500">
                                {formatDate(f.data_vencimento)}
                              </td>
                              <td className="py-4 text-xs text-slate-500">
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
                        <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              {formatDate(f.created_at)}
                            </span>
                            <InvoiceStatusBadge status={f.status} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-700">{f.planos?.nome || "—"}</p>
                              <p className="text-[10px] text-slate-400">
                                {f.metodo_pagamento ? (PAYMENT_METHOD_LABELS[f.metodo_pagamento as CheckoutPaymentMethod] || f.metodo_pagamento?.toUpperCase()) : "—"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-[#1a3a5c]">{moneyMask(f.valor)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                            <div>
                              <span className="font-semibold text-slate-400 block uppercase tracking-wider">Vencimento</span>
                              <span className="font-bold text-slate-600">{formatDate(f.data_vencimento)}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-slate-400 block uppercase tracking-wider">Pagamento</span>
                              <span className="font-bold text-slate-600">
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
          <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden animate-in fade-in duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                  <Terminal className="h-4 w-4" />
                  Histórico de Atividades
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileFiltersOpen(p => !p)}
                    className={`md:hidden h-8 rounded-xl px-2 flex items-center gap-1.5 ${isMobileFiltersOpen ? 'bg-[#1a3a5c]/10 text-[#1a3a5c]' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setLogsPage(1); refetchLogs(); }}
                    disabled={isFetchingLogs}
                    className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-3 flex items-center gap-1.5"
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
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fim</Label>
                  <Input
                    type="date"
                    value={logsFilter.dataFim}
                    onChange={(e) => { setLogsPage(1); setLogsFilter(p => ({ ...p, dataFim: e.target.value })) }}
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</Label>
                  <Select value={logsFilter.acao} onValueChange={(val) => { setLogsPage(1); setLogsFilter(p => ({ ...p, acao: val })) }}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-0">
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
                    <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] focus-visible:ring-0">
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

              {isFetchingLogs ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1a3a5c]" />
                </div>
              ) : !logsData || logsData.data.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Terminal className="h-12 w-12 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-400">Nenhum log de atividade encontrado.</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto mt-12">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Data e Hora</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ação</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Entidade</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">IP</th>
                          <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Dados</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logsData.data.map((log) => {
                          const dateFormatted = new Date(log.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          });

                          const actionLabel = log.acao.replace(/_/g, " ").toLowerCase();

                          return (
                            <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 text-xs font-semibold text-slate-600">
                                {dateFormatted}
                              </td>
                              <td className="py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50">
                                  {actionLabel}
                                </span>
                              </td>
                              <td className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                                {log.entidade_tipo}
                              </td>
                              <td className="py-4">
                                <div className="text-xs font-medium text-slate-600 max-w-[360px] whitespace-normal break-words" title={log.descricao}>
                                  {log.descricao}
                                </div>
                              </td>
                              <td className="py-4 hidden md:table-cell">
                                <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono text-slate-500">
                                  {log.ip_address || "—"}
                                </code>
                              </td>
                              <td className="py-4 text-right">
                                {log.meta && Object.keys(log.meta).length > 0 ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-2 flex items-center gap-1.5 ml-auto"
                                    onClick={() => setSelectedLog(log)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Inspecionar</span>
                                  </Button>
                                ) : (
                                  <span className="text-xs text-slate-400 pr-4">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-4 mb-4">
                    {logsData.data.map((log) => {
                      const dateFormatted = new Date(log.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });

                      const actionLabel = log.acao.replace(/_/g, " ").toLowerCase();

                      return (
                        <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              {dateFormatted}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/50">
                              {actionLabel}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-500 uppercase tracking-wide">
                                {log.entidade_tipo}
                              </span>
                              {log.ip_address && (
                                <code className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 font-mono text-slate-500">
                                  {log.ip_address}
                                </code>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed break-words break-all">
                              {log.descricao}
                            </p>
                          </div>

                          {log.meta && Object.keys(log.meta).length > 0 && (
                            <div className="pt-2 border-t border-slate-100 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-xl text-[#1a3a5c] hover:bg-[#1a3a5c]/10 px-3 flex items-center gap-1.5"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Inspecionar</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {logsData.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-100 gap-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Página {logsData.page} de {Math.max(1, Math.ceil(logsData.total / logsData.limit))} ({logsData.total} logs)
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-semibold text-slate-400">Exibir:</Label>
                          <Select value={limitStr} onValueChange={(val) => { setLimitStr(val); setLogsPage(1); }}>
                            <SelectTrigger className="h-8 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-0 w-[70px]">
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
                            variant="outline"
                            size="sm"
                            disabled={logsPage <= 1}
                            onClick={() => setLogsPage(p => p - 1)}
                            className="rounded-xl border-slate-200"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={logsPage >= Math.ceil(logsData.total / logsData.limit)}
                            onClick={() => setLogsPage(p => p + 1)}
                            className="rounded-xl border-slate-200"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedLog && (
        <BaseDialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <BaseDialog.Header
            title="Metadados da Atividade"
            icon={<Terminal className="w-5 h-5 text-[#1a3a5c] bg-[#1a3a5c]/5 rounded-full p-0.5" />}
            onClose={() => setSelectedLog(null)}
          />
          <BaseDialog.Body>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ação</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 uppercase">{selectedLog.acao.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entidade ID</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5 break-all" title={selectedLog.entidade_id}>
                    {selectedLog.entidade_id}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dados Completos (JSON)</p>
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs overflow-x-auto font-mono max-h-[320px] scrollbar-thin select-all">
                  {JSON.stringify(selectedLog.meta, null, 2)}
                </pre>
              </div>
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(JSON.stringify(selectedLog.meta, null, 2));
                toast.success("Metadados copiados para a área de transferência!");
              }}
              className="w-full h-11 rounded-xl bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/15 hover:bg-[#1a3a5c]/95"
            >
              Copiar JSON
            </Button>
          </BaseDialog.Footer>
        </BaseDialog>
      )}

      {resetPasswordData?.open && (
        <BaseDialog open={resetPasswordData.open} onOpenChange={() => setResetPasswordData(null)}>
          <BaseDialog.Header
            title="Senha Redefinida"
            icon={<Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" />}
            onClose={() => setResetPasswordData(null)}
          />
          <BaseDialog.Body>
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-in scale-in duration-500">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">Senha redefinida com sucesso!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  A nova senha temporária foi enviada para o WhatsApp do motorista e pode ser copiada abaixo.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3 max-w-sm mx-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motorista</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{data.user.nome}</p>
                </div>
                <div className="mt-3.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ de Login</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{cpfMask(data.user.cpfcnpj)}</p>
                </div>
                <div className="mt-3.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nova Senha Temporária</p>
                  <p className="text-sm font-mono font-bold text-[#1a3a5c] mt-0.5 bg-[#1a3a5c]/5 px-2.5 py-1.5 rounded-lg inline-block select-all tracking-wider">
                    {resetPasswordData.senha}
                  </p>
                </div>
              </div>
            </div>
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <Button
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
              className="w-full h-11 rounded-xl bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/15 hover:bg-[#1a3a5c]/95"
            >
              Copiar Acesso
            </Button>
          </BaseDialog.Footer>
        </BaseDialog>
      )}
    </div>
  );
}

