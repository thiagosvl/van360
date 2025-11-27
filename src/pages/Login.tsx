// React
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate } from "react-router-dom";

// Third-party
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
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
  FormLabel,
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
import { isValidCPF } from "@/utils/validators";

export default function Login() {
  // Permitir indexação da página de login
  useSEO({
    noindex: false,
    title: "Login - Van360 | Acesse sua conta",
    description: "Acesse sua conta Van360. Faça login para gerenciar seu transporte escolar.",
  });
  const [tab, setTab] = useState("motorista");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const appDomain = import.meta.env.VITE_PUBLIC_APP_DOMAIN;

  const formMotoristaSchema = z.object({
    cpfcnpj: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCPF(val), "CPF inválido"),
    senha: z.string().min(1, "Senha obrigatória"),
  });

  const formResponsavelSchema = z.object({
    cpf_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .refine((val) => isValidCPF(val), "CPF inválido"),
    email_responsavel: z
      .string()
      .min(1, "Campo obrigatório")
      .email("E-mail inválido"),
  });

  const formMotorista = useForm<z.infer<typeof formMotoristaSchema>>({
    resolver: zodResolver(formMotoristaSchema),
    defaultValues: {
      cpfcnpj: "395.423.918-38",
      senha: "Ogaiht+1",
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
        description: "Digite o CPF cadastrado para receber o link de redefinição em seu e-mail.",
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
        description: "Tente novamente em alguns minutos ou entre em contato com o suporte.",
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
        .select("email, role")
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

      const { error: signInError } = await supabase.auth.signInWithPassword({
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

      const role = (usuarioData.role as string | undefined) || undefined;
      if (role) {
        localStorage.setItem("app_role", role);
      }
      clearLoginStorageResponsavel();
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8">
        <div className="w-full max-w-md mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            className="h-20 w-auto mb-4 select-none drop-shadow-sm"
          />
          <p className="text-gray-500 text-center text-sm font-medium">
            Gestão inteligente para transporte escolar
          </p>
        </div>

        {tab === "motorista" && (
          <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
            <CardContent className="p-8 sm:p-10 bg-white/80 backdrop-blur-sm">
              <Form {...formMotorista}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Bem-vindo de volta!
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Acesse sua conta para gerenciar suas rotas
                  </p>
                </div>

                <form
                  onSubmit={formMotorista.handleSubmit(handleLoginMotorista)}
                  className="space-y-5"
                >
                  <FormField
                    control={formMotorista.control}
                    name="cpfcnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          CPF
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                              {...field}
                              autoFocus
                              placeholder="000.000.000-00"
                              autoComplete="username"
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                              onChange={(e) =>
                                field.onChange(cpfMask(e.target.value))
                              }
                            />
                          </div>
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
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              autoComplete="current-password"
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                            />
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
                      className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all" 
                      disabled={loading}
                    >
                      {loading ? "Acessando..." : "Entrar"}
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
                    >
                      Esqueci minha senha
                    </button>
                    
                    <div className="w-full border-t border-gray-100 my-2"></div>

                    <p className="text-sm text-gray-600">
                      Ainda não tem conta?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                        className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all"
                      >
                        Criar conta grátis
                      </button>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {tab === "responsavel" && (
          <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
            <CardContent className="p-8 sm:p-10 bg-white/80 backdrop-blur-sm">
              <Form {...formResponsavel}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Área do Responsável
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Acompanhe o transporte do seu filho
                  </p>
                </div>

                <form
                  onSubmit={formResponsavel.handleSubmit(
                    handleLoginResponsavel
                  )}
                  className="space-y-5"
                >
                  <FormField
                    control={formResponsavel.control}
                    name="cpf_responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          CPF
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="000.000.000-00"
                              maxLength={14}
                              value={cpfMask(field.value || "")}
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                              onChange={(e) =>
                                field.onChange(cpfMask(e.target.value))
                              }
                            />
                          </div>
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
                        <FormLabel className="text-gray-700 font-medium ml-1">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
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
