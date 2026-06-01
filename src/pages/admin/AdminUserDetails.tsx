import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAdminUserDetails,
  useUpdateUserAdmin,
  useUpdateSubscriptionAdmin,
  useResetPasswordAdmin,
} from "@/hooks/api/adminHooks";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLayout } from "@/contexts/LayoutContext";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionStatus } from "@/types/enums";
import { cpfMask, phoneMask, moneyMask } from "@/utils/masks";
import { isValidCPF, isValidPhoneFormat } from "@/utils/validators";
import { toast } from "@/utils/notifications/toast";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";

const STATUS_OPTIONS = [
  { value: SubscriptionStatus.TRIAL, label: "Período de Teste" },
  { value: SubscriptionStatus.ACTIVE, label: "Ativo (Em dia)" },
  { value: SubscriptionStatus.PAST_DUE, label: "Atrasado (Carência)" },
  { value: SubscriptionStatus.EXPIRED, label: "Bloqueado (Expirado)" },
  { value: SubscriptionStatus.CANCELED, label: "Cancelado" },
];

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
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const resetPassword = useResetPasswordAdmin();
  const [resetPasswordData, setResetPasswordData] = useState<{ open: boolean; senha: string } | null>(null);
  const { data, isLoading } = useAdminUserDetails(id!);
  const updateUser = useUpdateUserAdmin();
  const updateSub = useUpdateSubscriptionAdmin();
  const [activeTab, setActiveTab] = useState<"dados" | "cobrancas">("dados");

  const [userForm, setUserForm] = useState({
    nome: "",
    apelido: "",
    email: "",
    telefone: "",
    cpfcnpj: "",
    ativo: true,
    data_nascimento: "",
  });

  const [subForm, setSubForm] = useState({
    plano_id: "",
    status: "" as string,
    data_vencimento: "",
    trial_ends_at: "",
  });

  useEffect(() => {
    if (data?.user) {
      const u = data.user;
      setUserForm({
        nome: u.nome || "",
        apelido: u.apelido || "",
        email: u.email || "",
        telefone: phoneMask(u.telefone || ""),
        cpfcnpj: cpfMask(u.cpfcnpj || ""),
        ativo: u.ativo ?? true,
        data_nascimento: u.data_nascimento || "",
      });
    }
    if (data?.assinatura) {
      const s = data.assinatura;
      setSubForm({
        plano_id: s.plano_id || "",
        status: s.status || "",
        data_vencimento: toDateInputValue(s.data_vencimento),
        trial_ends_at: toDateInputValue(s.trial_ends_at),
      });
    }
  }, [data]);

  const handleSaveUser = () => {
    if (!id) return;

    const nome = userForm.nome.trim();
    const email = userForm.email.trim();
    const cleanCpf = userForm.cpfcnpj.replace(/\D/g, "");
    const cleanPhone = userForm.telefone.replace(/\D/g, "");

    if (!nome) {
      toast.error("O nome é obrigatório.");
      return;
    }

    if (!email) {
      toast.error("O e-mail é obrigatório.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Formato de e-mail inválido.");
      return;
    }

    if (!cleanCpf) {
      toast.error("O CPF é obrigatório.");
      return;
    }

    if (!isValidCPF(cleanCpf)) {
      toast.error("CPF inválido.");
      return;
    }

    if (!cleanPhone) {
      toast.error("O telefone é obrigatório.");
      return;
    }

    if (!isValidPhoneFormat(cleanPhone)) {
      toast.error("Telefone celular inválido. Deve conter DDD e 9 dígitos.");
      return;
    }

    if (userForm.data_nascimento) {
      const birthDate = new Date(userForm.data_nascimento);
      const today = new Date();
      if (birthDate > today) {
        toast.error("A data de nascimento não pode ser uma data futura.");
        return;
      }
    }

    updateUser.mutate({
      id,
      data: {
        nome,
        apelido: userForm.apelido.trim() || null,
        email,
        telefone: cleanPhone,
        cpfcnpj: cleanCpf,
        ativo: userForm.ativo,
        data_nascimento: userForm.data_nascimento || null,
      },
    });
  };

  const handleResetPassword = () => {
    if (!id || !data?.user) return;
    openConfirmationDialog({
      title: "Resetar Senha",
      description: `Deseja realmente redefinir a senha de ${data.user.nome}? Uma nova senha temporária será gerada e enviada automaticamente por WhatsApp para o número cadastrado.`,
      confirmText: "Sim, Resetar",
      variant: "warning",
      onConfirm: async () => {
        resetPassword.mutate(id, {
          onSuccess: (res: any) => {
            closeConfirmationDialog();
            setResetPasswordData({ open: true, senha: res.senha });
          },
        });
      },
    });
  };

  const handleSaveSub = () => {
    if (!id) return;
    updateSub.mutate({
      id,
      data: {
        plano_id: subForm.plano_id || undefined,
        status: (subForm.status as SubscriptionStatus) || undefined,
        data_vencimento: subForm.data_vencimento
          ? new Date(subForm.data_vencimento + "T23:59:59").toISOString()
          : null,
        trial_ends_at: subForm.trial_ends_at
          ? new Date(subForm.trial_ends_at + "T23:59:59").toISOString()
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
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => navigate("/admin/usuarios")}
        >
          <ArrowLeft className="h-5 w-5 text-[#1a3a5c]" />
        </Button>
        <div className="flex-1 text-left">
          <h1 className="text-2xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
            {data.user.nome}
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            Cadastrado em {formatDate(data.user.created_at)}
            {sub && (
              <SubscriptionStatusBadge status={sub.status} className="ml-3" />
            )}
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("dados")}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === "dados" ? "text-[#1a3a5c]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Dados e Configurações
          {activeTab === "dados" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a5c] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("cobrancas")}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === "cobrancas" ? "text-[#1a3a5c]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Cobranças
          {activeTab === "cobrancas" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a5c] rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "dados" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="border-0 shadow-diff-shadow rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-headline font-black text-[#1a3a5c] uppercase tracking-tight">
                <User className="h-4 w-4" />
                Dados Cadastrais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nome</Label>
                  <Input
                    value={userForm.nome}
                    onChange={(e) => setUserForm(p => ({ ...p, nome: e.target.value }))}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Apelido</Label>
                  <Input
                    value={userForm.apelido}
                    onChange={(e) => setUserForm(p => ({ ...p, apelido: e.target.value }))}
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CPF</Label>
                  <Input
                    value={userForm.cpfcnpj}
                    onChange={(e) => setUserForm(p => ({ ...p, cpfcnpj: cpfMask(e.target.value) }))}
                    inputMode="numeric"
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Telefone</Label>
                  <Input
                    value={userForm.telefone}
                    onChange={(e) => setUserForm(p => ({ ...p, telefone: phoneMask(e.target.value) }))}
                    inputMode="tel"
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">E-mail</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</Label>
                <Input
                  type="date"
                  value={userForm.data_nascimento}
                  onChange={(e) => setUserForm(p => ({ ...p, data_nascimento: e.target.value }))}
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={userForm.ativo}
                    onCheckedChange={(val) => setUserForm(p => ({ ...p, ativo: val }))}
                  />
                  <Label className="text-xs font-bold text-slate-600">
                    {userForm.ativo ? "Conta Ativa" : "Conta Inativa"}
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleSaveUser}
                  disabled={updateUser.isPending}
                  className="w-full h-11 rounded-xl bg-[#1a3a5c] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/20 hover:bg-[#1a3a5c]/95"
                >
                  {updateUser.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Cadastro
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
              </div>
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
                        onValueChange={(val) => setSubForm(p => ({ ...p, status: val }))}
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
                      <Input
                        type="date"
                        value={subForm.data_vencimento}
                        onChange={(e) => setSubForm(p => ({ ...p, data_vencimento: e.target.value }))}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Fim do Trial
                      </Label>
                      <Input
                        type="date"
                        value={subForm.trial_ends_at}
                        onChange={(e) => setSubForm(p => ({ ...p, trial_ends_at: e.target.value }))}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus-visible:ring-0 focus:border-[#1a3a5c]"
                      />
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
      )}

      {activeTab === "cobrancas" && (
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
              <div className="overflow-x-auto">
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
                            {f.metodo_pagamento === "pix"
                              ? "Pix"
                              : f.metodo_pagamento === "credit_card"
                              ? "Cartão"
                              : f.metodo_pagamento?.toUpperCase() || "—"}
                          </td>
                          <td className="py-4 text-xs text-slate-500">
                            {formatDate(f.data_vencimento)}
                          </td>
                          <td className="py-4 text-xs text-slate-500">
                            {f.data_pagamento ? formatDate(f.data_pagamento) : "—"}
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                f.status === "PAID"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : f.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : f.status === "FAILED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {f.status === "PAID"
                                ? "Pago"
                                : f.status === "PENDING"
                                ? "Pendente"
                                : f.status === "FAILED"
                                ? "Falhou"
                                : "Cancelado"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF de Login</p>
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
                const maskedCpf = `${cleanedCpf.slice(0, 3)}.${cleanedCpf.slice(3, 4)}**.***-${cleanedCpf.slice(9, 11)}`;
                const text = `*Nova Senha Provisória - Van360!* 🔐\n\nOlá *${data.user.nome}*,\nSua senha foi redefinida pelo administrador do sistema.\n\n*Novos dados de acesso:*\n👤 CPF: ${maskedCpf}\n🔑 Senha temporária: ${resetPasswordData.senha}\n\n*Como acessar?*\nVocê pode entrar baixando nosso aplicativo *Van360* na Google Play Store / Apple App Store ou acessar diretamente pelo navegador no link abaixo:\n🔗 https://app.van360.com.br/login`;
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

