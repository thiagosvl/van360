// React
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate } from "react-router-dom";

// Third-party
import { cpfSchema, emailSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { z } from "zod";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Services
import { supabase } from "@/integrations/supabase/client";
import { responsavelService } from "@/services/responsavelService";

// Utils
import { useSEO } from "@/hooks/useSEO";
import { clearLoginStorageMotorista } from "@/utils/domain/motorista/motoristaUtils";
import { clearLoginStorageResponsavel } from "@/utils/domain/responsavel/responsavelUtils";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";

// Internal Components
const CustomInput = ({ icon: Icon, label, ...props }: any) => {
  return (
    <div className="group relative flex items-center w-full h-14 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
      <div className="mr-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col w-full h-full justify-center">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </label>
        <Input
          {...props}
          className="h-auto p-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 text-sm font-medium text-gray-900"
        />
      </div>
    </div>
  );
};

export default function Login() {
  // Permitir indexação da página de login
  useSEO({
    noindex: false,
    title: "Login - Van360 | Acesse sua conta",
    description:
      "Acesse sua conta Van360. Faça login para gerenciar seu transporte escolar.",
  });
  const [tab, setTab] = useState("motorista");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const formMotoristaSchema = z.object({
    cpfcnpj: cpfSchema,
    senha: z.string().min(1, "Senha obrigatória"),
  });

  const formResponsavelSchema = z.object({
    cpf_responsavel: cpfSchema,
    email_responsavel: emailSchema.min(1, "Campo obrigatório"),
  });

  const formMotorista = useForm<z.infer<typeof formMotoristaSchema>>({
    resolver: zodResolver(formMotoristaSchema),
    defaultValues: {
      cpfcnpj: "",
      senha: "",
    },
  });

  const formResponsavel = useForm<z.infer<typeof formResponsavelSchema>>({
    resolver: zodResolver(formResponsavelSchema),
    defaultValues: {
      cpf_responsavel: "",
      email_responsavel: "",
    },
  });

  const handleForgotPassword = useCallback(async () => {
    const cpfDigits = formMotorista.getValues("cpfcnpj")?.replace(/\D/g, "");
    if (!cpfDigits) {
      toast.info("auth.info.informeCpf", {
        description:
          "Digite o CPF cadastrado para receber o link de redefinição em seu e-mail.",
      });
      return;
    }

    try {
      setRefreshing(true);

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("email")
        .eq("cpfcnpj", cpfDigits)
        .single();

      if (error || !usuario?.email) {
        toast.error("auth.erro.cpfNaoEncontrado", {
          description: "auth.erro.cpfNaoEncontradoDescricao",
        });
        return;
      }

      const maskedEmail = (() => {
        const [user, domain] = usuario.email.split("@");
        const maskedUser =
          user.length <= 3
            ? user[0] + "*".repeat(user.length - 1)
            : user.slice(0, 3) + "*".repeat(user.length - 3);
        const domainParts = domain.split(".");
        const maskedDomain =
          domainParts[0].slice(0, 3) +
          "*".repeat(Math.max(0, domainParts[0].length - 3));
        return `${maskedUser}@${maskedDomain}.${domainParts
          .slice(1)
          .join(".")}`;
      })();

      const redirectUrl = `${
        import.meta.env.VITE_PUBLIC_APP_DOMAIN
      }/nova-senha`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        usuario.email,
        { redirectTo: redirectUrl }
      );

      if (resetError) throw resetError;

      toast.success("auth.sucesso.emailEnviado", {
        description: `Enviamos o link para ${maskedEmail}. Verifique sua caixa de entrada e o spam. O link é válido por tempo limitado.`,
      });
    } catch (err: any) {
      toast.error("auth.erro.emailNaoEncontrado", {
        description:
          "Tente novamente em alguns minutos ou entre em contato com o suporte.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [formMotorista]);

  const handleLoginMotorista = async (data: any) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("email")
        .eq("cpfcnpj", cpfcnpjDigits)
        .single();

      if (usuarioError || !usuario) {
        formMotorista.setError("cpfcnpj", {
          type: "manual",
          message: "CPF não encontrado",
        });
        setLoading(false);
        return;
      }

      const usuarioData = usuario;

      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: usuarioData.email,
          password: data.senha,
        });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          formMotorista.setError("senha", {
            type: "manual",
            message: "Senha incorreta",
          });
        } else {
          formMotorista.setError("root", {
            type: "manual",
            message: "Erro inesperado: " + signInError.message,
          });
        }
        setLoading(false);
        return;
      }

      // Role extraction from Auth Metadata (Strict V3)
      const role = authData.session?.user?.app_metadata?.role as
        | string
        | undefined;

      if (role) {
        localStorage.setItem("app_role", role);
      }
      clearLoginStorageResponsavel();
      // Garantir que a sessão está ativa e propagada antes de navegar
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Sessão não foi estabelecida corretamente.");
      }

      // Pequeno delay para garantir que os listeners de auth (useSession nos Gates) capturem a mudança
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/inicio", { replace: true });
      }
    } catch (error: any) {
      toast.error("auth.erro.login", {
        description: error.message || "Erro ao fazer login. Tente novamente.",
      });
      formMotorista.setError("root", {
        type: "manual",
        message: "Erro inesperado",
      });
      setLoading(false);
    }
  };

  const handleLoginResponsavel = async (
    data: z.infer<typeof formResponsavelSchema>
  ) => {
    const cpf = data.cpf_responsavel.replace(/\D/g, "");
    const email = data.email_responsavel.trim();

    setLoading(true);
    try {
      const passageiros = await responsavelService.loginPorCpfEmail(cpf, email);
      if (!passageiros || passageiros.length === 0) {
        toast.error("auth.erro.login", {
          description: "Nenhum passageiro foi encontrado.",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("responsavel_cpf", cpf);
      localStorage.setItem("responsavel_email", email);
      localStorage.setItem("responsavel_is_logged", "true");

      clearLoginStorageMotorista();

      if (passageiros.length === 1) {
        const p = passageiros[0];
        localStorage.setItem("responsavel_id", p.id);
        localStorage.setItem("responsavel_usuario_id", p.usuario_id);
        navigate("/responsavel/carteirinha");
      } else {
        navigate("/responsavel/selecionar", { state: { passageiros } });
      }
    } catch {
      toast.error("auth.erro.login", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#60a5fa] to-[#dbeafe] p-4">
        {tab === "motorista" && (
          <Card className="w-full max-w-[400px] shadow-2xl shadow-blue-900/10 border-0 rounded-[32px] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
            <CardContent className="p-6">
              <Form {...formMotorista}>
                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src="/assets/logo-van360.png"
                      alt="Van360"
                      className="h-16 w-auto select-none drop-shadow-sm"
                    />
                  </div>

                  <p className="text-slate-600 text-[10px] font-medium">
                    Gestão inteligente para transporte escolar
                  </p>
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-0">
                    Bem-vindo de volta!
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Insira seus dados para continuar
                  </p>
                </div>

                <form
                  onSubmit={formMotorista.handleSubmit(handleLoginMotorista)}
                  className="space-y-4"
                >
                  <FormField
                    control={formMotorista.control}
                    name="cpfcnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomInput
                            icon={User}
                            label="CPF"
                            placeholder="000.000.000-00"
                            autoComplete="username"
                            {...field}
                            onChange={(e: any) =>
                              field.onChange(cpfMask(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formMotorista.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <div className="group relative flex items-center w-full h-14 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                              <div className="mr-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <Lock className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col w-full h-full justify-center">
                                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
                                  Senha
                                </label>
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  autoComplete="current-password"
                                  className="h-auto p-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 text-sm font-medium text-gray-900 pr-8"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                                tabIndex={-1}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {formMotorista.formState.errors.root && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2 text-sm text-red-600 animate-in slide-in-from-top-2">
                      <span className="mt-0.5">⚠️</span>
                      {formMotorista.formState.errors.root.message}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-full text-[15px] font-semibold bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all"
                      disabled={loading}
                    >
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-6 mt-6">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium"
                    >
                      Esqueci minha senha
                    </button>

                    <p className="text-sm text-slate-500">
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                        className="text-blue-500 font-semibold hover:text-blue-600 hover:underline transition-all"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {tab === "responsavel" && (
          <Card className="w-full max-w-[400px] shadow-2xl shadow-blue-900/10 border-0 rounded-[32px] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
            <CardContent className="p-8">
              <Form {...formResponsavel}>
                <div className="text-center mb-8">
                  <h1 className="text-xl font-bold text-slate-900 mb-2">
                    Área do Responsável
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Acompanhe o transporte do seu filho
                  </p>
                </div>

                <form
                  onSubmit={formResponsavel.handleSubmit(
                    handleLoginResponsavel
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={formResponsavel.control}
                    name="cpf_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomInput
                            icon={User}
                            label="CPF"
                            placeholder="000.000.000-00"
                            maxLength={14}
                            {...field}
                            value={cpfMask(field.value || "")}
                            onChange={(e: any) =>
                              field.onChange(cpfMask(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formResponsavel.control}
                    name="email_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CustomInput
                            icon={Mail}
                            label="Email"
                            placeholder="seu@email.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 rounded-full text-[15px] font-semibold bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all"
                    >
                      {loading ? "Acessando..." : "Acessar Carteirinha"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
