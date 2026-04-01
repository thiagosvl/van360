// React
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { getMessage } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

// Third-party
import { cpfSchema, emailSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, Wand2 } from "lucide-react";
import { z } from "zod";

// Components - UI
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Services
import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";

// Utils
import { useSEO } from "@/hooks/useSEO";
import { UserType } from "@/types/enums";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import {
  detectPlatform,
  isNativeApp,
  PLAY_STORE_URL,
  QR_CODE_PLACEHOLDER,
} from "@/utils/detectPlatform";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { RecuperarSenhaDialog } from "@/components/features/auth/RecuperarSenhaDialog";

// Internal Components

function LoginPlatformSuggestion() {
  const platform = detectPlatform();

  // if (platform === "android-web") {
  //   return (
  //     <div className="mt-6 pt-4 border-t border-slate-100 text-center">
  //       <p className="text-xs text-slate-500 mb-2">
  //         Você também pode acessar pelo app!
  //       </p>
  //       <a
  //         href={PLAY_STORE_URL}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
  //       >
  //         Baixar na Play Store
  //       </a>
  //     </div>
  //   );
  // }

  // if (platform === "desktop") {
  //   return (
  //     <div className="mt-6 pt-4 border-t border-slate-100 text-center">
  //       <p className="text-xs text-slate-500 mb-3">
  //         Para a melhor experiência, baixe o app:
  //       </p>
  //       <img
  //         src={QR_CODE_PLACEHOLDER}
  //         alt="QR Code para baixar Van360 na Play Store"
  //         className="w-[120px] h-[120px] mx-auto rounded-lg shadow-sm mb-2"
  //         loading="lazy"
  //       />
  //       <p className="text-[10px] text-slate-400">
  //         Disponível para Android. App iOS em breve.
  //       </p>
  //     </div>
  //   );
  // }

  // if (platform === "ios-web") {
  //   return (
  //     <div className="mt-6 pt-4 border-t border-slate-100 text-center">
  //       <p className="text-xs text-slate-400">
  //         App iOS em desenvolvimento. Use o navegador por enquanto.
  //       </p>
  //     </div>
  //   );
  // }

  return null;
}

export default function Login() {
  // Permitir indexação da página de login
  useSEO({
    title: "Entrar | Van360 — Você dirige. A gente organiza.",
    description: "Acesse sua conta Van360 e gerencie passageiros, mensalidades, contratos e recibos da sua van escolar.",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

  const handleFillMagic = () => {
    formMotorista.reset({
      cpfcnpj: "395.423.918-38",
      senha: "Ogaiht+1",
    });
  };

  const formResponsavel = useForm<z.infer<typeof formResponsavelSchema>>({
    resolver: zodResolver(formResponsavelSchema),
    defaultValues: {
      cpf_responsavel: "",
      email_responsavel: "",
    },
  });

  const handleForgotPassword = useCallback(() => {
    setForgotPasswordOpen(true);
  }, []);

  useEffect(() => {
    sessionManager.signOut();

    // Carregar CPF salvo se existir
    const savedCpf = localStorage.getItem("van360_saved_cpf");
    if (savedCpf) {
      formMotorista.setValue("cpfcnpj", savedCpf);
      setRememberMe(true);
    }
  }, [formMotorista]);

  const handleLoginMotorista = async (data: any) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");

      const { data: authResult } = await apiClient.post("/auth/login", {
        identifier: cpfcnpjDigits,
        password: data.senha
      });

      if (!authResult || !authResult.access_token) {
        formMotorista.setError("cpfcnpj", {
          type: "manual",
          message: "Credenciais inválidas."
        });
        setLoading(false);
        return;
      }

      if (!authResult || !authResult.access_token) {
        throw new Error("Falha ao obter sessão do servidor.");
      }

      clearAppSession();

      // Hydrate Session locally so checks work
      const { error: sessionError } = await sessionManager.setSession(
        authResult.access_token,
        authResult.refresh_token,
        authResult.user
      );

      if (sessionError) throw sessionError;

      const role = authResult.user?.app_metadata?.role as string | undefined;

      // Validação final de sessão
      const { data: { session } } = await sessionManager.getSession();

      if (!session) {
        throw new Error("Sessão não foi estabelecida corretamente.");
      }

      // Lógica de Lembrar CPF
      if (rememberMe) {
        localStorage.setItem("van360_saved_cpf", data.cpfcnpj);
      } else {
        localStorage.removeItem("van360_saved_cpf");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (role === UserType.ADMIN) {
        navigate(ROUTES.PRIVATE.ADMIN.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.userMessage || error.message || "Erro ao fazer login.";

      if (msg.includes("inválidas") || msg.includes("incorreta") || msg.includes("credentials")) {
        formMotorista.setError("senha", { type: "manual", message: "Senha inválida" });
      } else if (msg.toLowerCase().includes("usuário não encontrado") || msg.includes("not found")) {
        formMotorista.setError("cpfcnpj", { type: "manual", message: "CPF não encontrado" });
      } else {
        // toast.error("auth.erro.login", {
        //   description: msg,
        // });
        formMotorista.setError("root", {
          type: "manual",
          message: msg,
        });
      }
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
      // Use backend endpoint
      const { data: passageiros } = await apiClient.post("/auth/login/responsavel", {
        cpf,
        email
      });

      if (!passageiros || passageiros.length === 0) {
        toast.error("auth.erro.login", {
          description: "auth.erro.nenhumPassageiroEncontrado",
        });
        setLoading(false);
        return;
      }

      clearAppSession();

      localStorage.setItem("responsavel_cpf", cpf);
      localStorage.setItem("responsavel_email", email);
      localStorage.setItem("responsavel_is_logged", "true");


      if (passageiros.length === 1) {
        const p = passageiros[0];
        localStorage.setItem("responsavel_id", p.id);
        localStorage.setItem("responsavel_usuario_id", p.usuario_id);
        navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
      } else {
        navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT, { state: { passageiros } });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("auth.erro.login", {
        description: err.userMessage || "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 py-4 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-3xl w-full mx-auto space-y-8">

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

            {/* Progress Bar */}
            <div className="relative h-1.5 bg-gray-100 w-full font-bold">
              <div
                className="absolute top-0 left-0 h-full bg-[#1a3a5c] transition-all duration-500 ease-out rounded-r-full"
                style={{ width: `100%` }}
              />
            </div>

            {/* Header */}
            <div className="text-center p-6 pb-0 relative">
              {import.meta.env.DEV && (
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-full transition-all"
                    onClick={handleFillMagic}
                    title="Preencher com dados de teste"
                  >
                    <Wand2 className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <div>
                {/* Logo Section */}
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/assets/logo-van360.png"
                      alt="Van360"
                      className="h-12 w-auto select-none drop-shadow-sm"
                    />
                  </div>
                </div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-4xl text-[#1a3a5c] drop-shadow-sm">
                  Entrar no Van360
                </h1>
              </div>
            </div>

            <div className="p-6">
              <Form {...formMotorista}>

                <form
                  onSubmit={formMotorista.handleSubmit(handleLoginMotorista)}
                  className="space-y-4"
                >
                  <FormField
                    control={formMotorista.control}
                    name="cpfcnpj"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium ml-1">
                          Seu CPF
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              {...field}
                              onChange={(e: any) => field.onChange(cpfMask(e.target.value))}
                              placeholder="000.000.000-00"
                              autoComplete="username"
                              className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                              aria-invalid={!!fieldState.error}
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
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium ml-1">
                          Senha
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/10 transition-all text-base"
                              aria-invalid={!!fieldState.error}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 opacity-60" />
                              ) : (
                                <Eye className="h-5 w-5 opacity-60" />
                              )}
                            </button>
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

                  <div className="flex items-center gap-2 pt-1 pb-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-200 rounded-md data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c]"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-xs font-medium text-slate-500 cursor-pointer select-none"
                    >
                      Lembrar meu CPF
                    </Label>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl text-[15px] font-semibold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-md transition-all"
                      disabled={loading}
                    >
                      {loading ? getMessage("auth.labels.loginProcessando") : getMessage("auth.labels.login")}
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-6 mt-6">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#1a3a5c] hover:underline transition-colors font-medium mt-6"
                    >
                      Esqueci minha senha
                    </button>

                    <p className="text-sm text-slate-500">
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
                        className="text-[#1a3a5c] font-semibold hover:underline transition-all"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </div>

                  {/* Sugestão de app por dispositivo (somente web) */}
                  {!isNativeApp() && <LoginPlatformSuggestion />}
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <RecuperarSenhaDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        initialCpf={formMotorista.getValues("cpfcnpj")}
      />
    </>
  );
}
