import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Mail, Calendar, Key, RefreshCw, Copy, Check, Eye, EyeOff, Loader2, Wand2
} from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/forms";
import { cpfCnpjSchema, dateSchema, emailSchema, phoneSchema } from "@/schemas/common";
import { cpfCnpjMask as maskCpf, dateMask as maskDate } from "@/utils/masks";
import { useCreateUserAdmin } from "@/hooks/api/adminHooks";
import { toast } from "@/utils/notifications/toast";

interface AdminCreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void;
}

const createUserSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(120),
  email: emailSchema,
  telefone: phoneSchema,
  cpfcnpj: cpfCnpjSchema,
  data_nascimento: dateSchema(true, false),
  senha: z.string().min(6, "A senha temporária deve ter pelo menos 6 caracteres"),
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

type FormData = z.infer<typeof createUserSchema>;

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pwd = "Van@";
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export default function AdminCreateUserDialog({ isOpen, onClose, onSuccess }: AdminCreateUserDialogProps) {
  const createUserAdmin = useCreateUserAdmin();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; email: string; cpf: string; nome: string; senha: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpfcnpj: "",
      razao_social: "",
      data_nascimento: "",
      senha: generateTempPassword(),
    },
  });

  const handleRegeneratePassword = () => {
    form.setValue("senha", generateTempPassword());
  };

  const handleCopyAccess = async () => {
    if (!successData) return;
    const cleanedCpf = successData.cpf.replace(/\D/g, "");
    let maskedCpf = "";
    if (cleanedCpf.length <= 11) {
      maskedCpf = `${cleanedCpf.slice(0, 3)}.${cleanedCpf.slice(3, 4)}**.***-${cleanedCpf.slice(9, 11)}`;
    } else {
      maskedCpf = `${cleanedCpf.slice(0, 2)}.${cleanedCpf.slice(2, 3)}**.***/****-${cleanedCpf.slice(12, 14)}`;
    }
    const text = `*Seu acesso ao Van360!* 🚀\n\nOlá *${successData.nome}*, sua conta de motorista foi cadastrada no sistema.\n\n*Seus dados de acesso:*\n👤 Documento: ${maskedCpf}\n🔑 Senha temporária: ${successData.senha} (Recomendamos alterá-la no app)\n\n*Como acessar?*\nVocê pode entrar baixando nosso aplicativo *Van360* na Google Play Store / Apple App Store ou acessar diretamente pelo navegador no link abaixo:\n🔗 ${import.meta.env.VITE_PUBLIC_APP_DOMAIN}/login`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Dados copiados para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Falha ao copiar dados.");
    }
  };

  const onSubmit = async (data: FormData) => {
    createUserAdmin.mutate(
      {
        nome: data.nome,
        razao_social: data.razao_social || undefined,
        email: data.email,
        telefone: data.telefone,
        cpfcnpj: data.cpfcnpj.replace(/\D/g, ""),
        data_nascimento: data.data_nascimento || null,
        senha: data.senha,
      },
      {
        onSuccess: (res: any) => {
          setSuccessData({
            id: res.id,
            email: data.email,
            cpf: data.cpfcnpj,
            nome: data.nome,
            senha: data.senha,
          });
        },
        onError: (err: any) => {
          const respData = err.response?.data;
          const errorMsg = (respData?.error || err.message || "").toLowerCase();

          if (respData?.field === "email" || errorMsg.includes("email")) {
            form.setError("email", { message: "Este e-mail já está cadastrado." });
          } else if (respData?.field === "cpfcnpj" || errorMsg.includes("cpf") || errorMsg.includes("cnpj")) {
            form.setError("cpfcnpj", { message: "Este CPF/CNPJ já está cadastrado." });
          } else {
            toast.error("Erro ao cadastrar motorista.");
          }
        },
      }
    );
  };

  const handleSuccessRedirect = () => {
    if (successData && onSuccess) {
      onSuccess(successData.id);
    }
    onClose();
  };

  if (successData) {
    return (
      <BaseDialog open={isOpen} onOpenChange={handleSuccessRedirect}>
        <BaseDialog.Header
          title="Cadastro Concluído"
          icon={<Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-0.5" />}
          onClose={handleSuccessRedirect}
        />
        <BaseDialog.Body>
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-in scale-in duration-500">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Motorista cadastrado com sucesso!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                As credenciais de acesso provisórias do motorista foram geradas e devem ser compartilhadas com ele.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3.5 max-w-sm mx-auto">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motorista</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{successData.nome}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF/CNPJ de Login</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{successData.cpf}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha Temporária</p>
                <p className="text-sm font-mono font-bold text-[#1a3a5c] mt-0.5 bg-[#1a3a5c]/5 px-2.5 py-1.5 rounded-lg inline-block select-all tracking-wider">
                  {successData.senha}
                </p>
              </div>
            </div>
          </div>
        </BaseDialog.Body>
        <BaseDialog.Footer>
          <button
            onClick={handleCopyAccess}
            disabled={copied}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                Dados Copiados
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Acesso
              </>
            )}
          </button>
          <button
            onClick={handleSuccessRedirect}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1a3a5c]/15 flex items-center justify-center transition-all"
          >
            Ver Detalhes
          </button>
        </BaseDialog.Footer>
      </BaseDialog>
    );
  }

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} maxWidth="lg">
      <BaseDialog.Header
        title="Novo Motorista"
        icon={<User className="w-5 h-5" />}
        onClose={onClose}
        leftAction={import.meta.env.DEV && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm border border-slate-100"
            onClick={() => {
              form.setValue("nome", "Thiago Barros Abilio");
              form.setValue("email", "thiago-svl@hotmail.com");
              form.setValue("telefone", "(11) 95118-6951");
              form.setValue("cpfcnpj", "395.423.918-38");
              form.setValue("data_nascimento", "30/06/1997");
              form.setValue("senha", "Ogaiht+1");
            }}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />
      <BaseDialog.Body>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-1">
            {(() => {
              const cpfcnpjValue = form.watch("cpfcnpj") || "";
              const isCnpj = cpfcnpjValue.replace(/\D/g, "").length > 11;
              return (
                <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpfcnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      CPF ou CNPJ <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          {...field}
                          maxLength={18}
                          onChange={(e) => field.onChange(maskCpf(e.target.value))}
                          placeholder="CPF ou CNPJ"
                          className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      E-mail <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="motorista@email.com"
                          {...field}
                          className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="razao_social"
              render={({ field, fieldState, formState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Razão Social {isCnpj && <span className="text-red-600">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Razão social do motorista"
                        {...field}
                        value={field.value || ""}
                        className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                        aria-invalid={!!fieldState.error || (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                    <p className="text-[0.8rem] font-medium text-red-500 mt-1.5 ml-1">Razão social é obrigatória para CNPJ</p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Nome Completo <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Nome completo do motorista"
                        {...field}
                        className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <PhoneInput
                    field={field}
                    label="WhatsApp"
                    labelClassName="text-slate-700 font-semibold ml-1"
                    placeholder="(00) 00000-0000"
                    required
                    inputClassName="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Data de Nascimento <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          {...field}
                          inputMode="numeric"
                          maxLength={10}
                          onChange={(e) => field.onChange(maskDate(e.target.value))}
                          placeholder="dd/mm/aaaa"
                          className="pl-11 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Senha Temporária <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pl-11 pr-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        title="Gerar nova senha"
                        className="w-11 h-11 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                </>
              );
            })()}
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={createUserAdmin.isPending}
        />
        <BaseDialog.Action
          label="Cadastrar"
          onClick={form.handleSubmit(onSubmit)}
          isLoading={createUserAdmin.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
