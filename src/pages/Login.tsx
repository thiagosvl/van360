// React
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { getMessage } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

// Third-party
import { cpfCnpjSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User, Wand2, Smartphone } from "lucide-react";
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

  if (platform === "android-web" || platform === "desktop") {
    return (
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
        <p className="max-[320px]:text-[11px] text-xs font-medium text-slate-500 mb-3 text-center">
          Para uma melhor experiência, baixe o app:
        </p>
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center hover:-translate-y-0.5 transition-transform"
          aria-label="Baixar Van360 na Play Store"
        >
          <img
            src={PLAY_STORE_BADGE_URL}
            alt="Disponível no Google Play"
            className="h-10 object-contain"
          />
        </a>
      </div>
    );
  }

  if (platform === "ios-web") {
    return (
      <div className="mt-8 pt-6 border-t border-slate-100 text-center flex flex-col items-center">
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
    title: "Entrar | Van360"
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
      cpfcnpj: "9395.423.918-38",
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
      <div className="min-h-screen flex flex-col justify-center items-center py-6 px-4 relative overflow-hidden">
        {/* Background suave */}
        <div className="absolute inset-0 bg-[#e8ecf1]" />

        <div className="w-full max-w-[420px] relative z-10">
          <div className="bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-slate-200">

            {import.meta.env.DEV && (
              <div className="absolute right-6 top-6 z-10">
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

            {/* Header / Logo */}
            <div className="flex flex-col items-center mb-8">
              <img
                src="/assets/logo-van360.webp"
                alt="Van360"
                className="h-16 w-auto mb-4 drop-shadow-sm select-none"
              />
              <h1 className="max-[320px]:text-xl text-2xl sm:text-[26px] font-extrabold text-[#1a3a5c] tracking-tight mb-1">
                Acesse sua conta
              </h1>
              <p className="text-[13px] sm:text-sm font-medium text-slate-500 text-center">
                Organize sua van de forma simples.
              </p>
            </div>

            <Form {...formMotorista}>
              <form onSubmit={formMotorista.handleSubmit(handleLoginMotorista)}>
                <div className="space-y-4">
                  {/* CPF Field */}
                  <FormField
                    control={formMotorista.control}
                    name="cpfcnpj"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                Seu CPF ou CNPJ
                              </label>
                              <Input
                                autoFocus
                                {...field}
                                inputMode="numeric"
                                onChange={(e: any) => field.onChange(cpfCnpjMask(e.target.value))}
                                placeholder=""
                                className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs ml-1" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={formMotorista.control}
                    name="senha"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormControl>
                          <div className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]'}`}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                Senha
                              </label>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none tracking-wider placeholder:tracking-normal placeholder:text-slate-300"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-600 transition-colors shrink-0 outline-none"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs ml-1" />
                      </FormItem>
                    )}
                  />
                </div>

                {formMotorista.formState.errors.root && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-sm text-red-600">
                    <span className="mt-0.5">⚠️</span>
                    {formMotorista.formState.errors.root.message}
                  </div>
                )}

                {/* Remember Me */}
                <div className="flex items-center gap-2 mt-5 ml-1">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="bg-white border-slate-300 shadow-sm rounded-[4px] data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] w-[18px] h-[18px]"
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-[13px] font-medium text-slate-600 cursor-pointer select-none"
                  >
                    Lembrar meu CPF / CNPJ
                  </Label>
                </div>

                {/* Submit Button */}
                <div className="pt-2 mt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl text-[16px] font-bold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 transition-all"
                    disabled={loading}
                  >
                    {loading ? getMessage("auth.labels.loginProcessando") : getMessage("auth.labels.login")}
                  </Button>
                </div>

                {/* Links */}
                <div className="flex flex-col items-center gap-2 mt-6">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[14px] text-[#2d5a88] hover:text-[#1a3a5c] hover:underline transition-colors font-medium"
                  >
                    Esqueci minha senha
                  </button>

                  <p className="text-[13px] text-slate-500 mt-1">
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
                      className="text-[#1a3a5c] font-bold hover:underline transition-all"
                    >
                      Cadastre-se
                    </button>
                  </p>
                </div>

                {/* Platform Suggestion */}
                {!isNativeApp() && <LoginPlatformSuggestion />}
              </form>
            </Form>
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
