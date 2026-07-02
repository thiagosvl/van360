// React
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { getMessage } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

// Third-party
import { cpfCnpjSchema, emailSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, Wand2, Smartphone } from "lucide-react";
import { z } from "zod";

// Components - UI
import { Button } from "@/components/ui/button";
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
import { detectPlatform, isNativeApp, PLAY_STORE_URL, PLAY_STORE_BADGE_URL } from "@/utils/detectPlatform";
import { cpfCnpjMask } from "@/utils/masks";
import { RecuperarSenhaDialog } from "@/components/features/auth/RecuperarSenhaDialog";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";

// Internal Components

function LoginPlatformSuggestion() {
  const platform = detectPlatform();

  if (isNativeApp()) return null;

  if (platform === "android-web") {
    return (
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center">
        <p className="text-[13px] font-medium text-slate-500 mb-3 text-center">
          Para uma melhor experiência, baixe o app:
        </p>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:-translate-y-0.5 transition-transform drop-shadow-sm"
          aria-label="Baixar Van360 na Play Store"
        >
          <img
            src={PLAY_STORE_BADGE_URL}
            alt="Disponível no Google Play"
            className="h-14 object-contain"
          />
        </a>
      </div>
    );
  }

  if (platform === "desktop") {
    return (
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center">
        <p className="text-[13px] font-medium text-slate-500 mb-3 text-center">
          Para uma melhor experiência, baixe o app:
        </p>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:-translate-y-0.5 transition-transform drop-shadow-sm mb-2"
          aria-label="Baixar Van360 na Play Store"
        >
          <img
            src={PLAY_STORE_BADGE_URL}
            alt="Disponível no Google Play"
            className="h-12 object-contain"
          />
        </a>
        <p className="text-[11px] font-medium text-slate-400">
          Disponível para Android. Funciona no iPhone pelo navegador.
        </p>
      </div>
    );
  }

  if (platform === "ios-web") {
    return (
      <div className="mt-6 pt-6 border-t border-slate-100 text-center bg-blue-50/50 rounded-xl p-4">
        <p className="text-[13px] text-[#1a3a5c] font-bold mb-1 flex items-center justify-center gap-1.5">
          <Smartphone className="w-4 h-4" /> Funciona no iPhone
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Acesse perfeitamente pelo navegador enquanto o app é preparado.
        </p>
      </div>
    );
  }

  return null;
}

export default function Login() {
  useSEO({
    title: "Entrar | Van360",
    description: "Acesse sua conta Van360 e faça a gestão completa da sua van escolar.",
  });
  useAnalyticsInjector({ gtm: true, clarity: true });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const formMotoristaSchema = z.object({
    cpfcnpj: cpfCnpjSchema,
    senha: z.string().min(1, "Senha obrigatória"),
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


  return (
    <>
      <div className="min-h-screen bg-slate-50 py-4 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-8">

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
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a3a5c] drop-shadow-sm">
                    Acesse sua conta
                  </h1>
                  <p className="text-slate-500 text-sm sm:text-base font-medium text-center px-4">
                    Organize sua van de forma simples.
                  </p>
                </div>
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
                          Seu CPF ou CNPJ
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              {...field}
                              inputMode="numeric"
                              onChange={(e: any) => field.onChange(cpfCnpjMask(e.target.value))}
                              placeholder="CPF ou CNPJ"
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
                      Lembrar meu CPF / CNPJ
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
