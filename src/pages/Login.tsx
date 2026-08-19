import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getMessage } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { cpfCnpjSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  ArrowLeft,
  Bus,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  User,
  Users,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { useSEO } from "@/hooks/useSEO";
import { useAnalyticsInjector } from "@/hooks/business/useAnalyticsInjector";

import { UserType } from "@/types/enums";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import {
  detectPlatform,
  isDevEnv,
  isNativeApp,
  PLAY_STORE_BADGE_URL,
  PLAY_STORE_URL,
} from "@/utils/detectPlatform";
import { cpfCnpjMask } from "@/utils/masks";

import { RecuperarSenhaDialog } from "@/components/features/auth/RecuperarSenhaDialog";
import { ResponsavelLoginForm } from "@/components/features/auth/ResponsavelLoginForm";

type AuthProfile = "motorista" | "responsavel" | null;

function LoginPlatformSuggestion() {
  const platform = detectPlatform();

  if (isNativeApp()) return null;

  if (platform === "android-web" || platform === "desktop") {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col items-center">
        <p className="max-[320px]:text-[11px] text-xs font-medium text-slate-500 mb-2 text-center">
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
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </a>
      </div>
    );
  }

  if (platform === "ios-web") {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200/80 text-center flex flex-col items-center">
        <p className="text-[13px] text-[#1a3a5c] font-bold mb-1 flex items-center justify-center gap-1.5">
          <Smartphone className="w-4 h-4" /> Funciona no iPhone
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
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
  });
  useAnalyticsInjector({ gtm: true, clarity: true });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialProfile = (): AuthProfile => {
    const tipo = searchParams.get("tipo");
    if (tipo === "motorista" || tipo === "responsavel") {
      return tipo;
    }
    return null;
  };

  const [selectedProfile, setSelectedProfile] = useState<AuthProfile>(getInitialProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSelectProfile = (profile: "motorista" | "responsavel") => {
    setSelectedProfile(profile);
    setSearchParams({ tipo: profile }, { replace: true });
  };

  const handleBackToProfileSelection = () => {
    setSelectedProfile(null);
    setSearchParams({}, { replace: true });
  };

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
    const savedCpf = localStorage.getItem("van360_saved_cpf");
    if (savedCpf) {
      formMotorista.setValue("cpfcnpj", savedCpf);
      setRememberMe(true);
    }
  }, [formMotorista]);

  const handleLoginMotorista = async (data: z.infer<typeof formMotoristaSchema>) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");

      const { data: authResult } = await apiClient.post("/auth/login", {
        identifier: cpfcnpjDigits,
        password: data.senha,
      });

      if (!authResult || !authResult.access_token) {
        formMotorista.setError("cpfcnpj", {
          type: "manual",
          message: "Credenciais inválidas.",
        });
        setLoading(false);
        return;
      }

      clearAppSession();

      const { error: sessionError } = await sessionManager.setSession(
        authResult.access_token,
        authResult.refresh_token,
        authResult.user
      );

      if (sessionError) throw sessionError;

      const role = authResult.user?.app_metadata?.role as string | undefined;

      const {
        data: { session },
      } = await sessionManager.getSession();

      if (!session) {
        throw new Error("Sessão não foi estabelecida corretamente.");
      }

      if (rememberMe) {
        localStorage.setItem("van360_saved_cpf", data.cpfcnpj);
      } else {
        localStorage.removeItem("van360_saved_cpf");
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (role === UserType.ADMIN) {
        navigate(ROUTES.PRIVATE.ADMIN.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.userMessage || error.message || "Erro ao fazer login.";

      if (
        msg.includes("inválidas") ||
        msg.includes("incorreta") ||
        msg.includes("credentials")
      ) {
        formMotorista.setError("senha", {
          type: "manual",
          message: "Senha inválida",
        });
      } else if (
        msg.toLowerCase().includes("usuário não encontrado") ||
        msg.includes("not found")
      ) {
        formMotorista.setError("cpfcnpj", {
          type: "manual",
          message: "CPF não encontrado",
        });
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
        <div className="absolute inset-0 bg-[#e8ecf1]" />

        <div className="w-full max-w-[430px] relative z-10">
          <div className="bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-9 border border-slate-200">
            {isDevEnv() && (
              <div className="absolute right-6 top-6 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded-full transition-all"
                  onClick={handleFillMagic}
                  title="Preencher com dados de teste"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* SELEÇÃO INICIAL DE PERFIL */}
            {selectedProfile === null ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <img
                  src="/assets/logo-van360.webp"
                  alt="Van360"
                  className="h-16 w-auto mb-4 drop-shadow-sm select-none"
                />

                <div className="text-center mb-6">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a3a5c] tracking-tight mb-1">
                    Quem está acessando?
                  </h1>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-500">
                    Selecione o seu perfil para entrar no app
                  </p>
                </div>

                <div className="w-full space-y-3">
                  {/* Opção 1: Motorista / Equipe */}
                  <button
                    type="button"
                    onClick={() => handleSelectProfile("motorista")}
                    className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#1a3a5c] active:scale-[0.98] shadow-sm hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#1a3a5c]/10 text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[14px] sm:text-base text-slate-800 group-hover:text-[#1a3a5c] transition-colors block leading-tight">
                          Motorista ou Equipe
                        </span>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-1">
                          Gerenciar rotas, alunos e financeiro
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 group-hover:bg-[#1a3a5c]/10 flex items-center justify-center shrink-0 transition-colors ml-1">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1a3a5c] transition-colors" />
                    </div>
                  </button>

                  {/* Opção 2: Pai / Responsável */}
                  <button
                    type="button"
                    onClick={() => handleSelectProfile("responsavel")}
                    className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-amber-500 active:scale-[0.98] shadow-sm hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[14px] sm:text-base text-slate-800 group-hover:text-amber-800 transition-colors block leading-tight">
                          Pai ou Responsável
                        </span>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-1">
                          Acompanhar a van e carteirinha do aluno
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors ml-1">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </button>
                </div>

                {!isNativeApp() && <LoginPlatformSuggestion />}
              </div>
            ) : (
              /* FORMULÁRIO DO PERFIL ESCOLHIDO */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Header de Navegação / Voltar */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={handleBackToProfileSelection}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1a3a5c] transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Trocar perfil</span>
                  </button>

                  <span
                    className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${selectedProfile === "motorista"
                        ? "bg-[#1a3a5c]/10 text-[#1a3a5c]"
                        : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {selectedProfile === "motorista" ? "Motorista / Equipe" : "Responsável"}
                  </span>
                </div>

                {/* Header do Formulário */}
                <div className="flex flex-col items-center mb-5 text-center">
                  <img
                    src="/assets/logo-van360.webp"
                    alt="Van360"
                    className="h-12 w-auto mb-3 drop-shadow-sm select-none"
                  />
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a3a5c] tracking-tight mb-1">
                    {selectedProfile === "motorista"
                      ? "Acesso do Motorista"
                      : "Acesso do Responsável"}
                  </h1>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-500">
                    {selectedProfile === "motorista"
                      ? "Gerencie rotas, alunos e financeiro."
                      : "Acompanhe a van e a carteirinha do aluno."}
                  </p>
                </div>

                {selectedProfile === "responsavel" ? (
                  <ResponsavelLoginForm />
                ) : (
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
                                <div
                                  className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error
                                      ? "border-red-500 ring-2 ring-red-500/20"
                                      : "border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]"
                                    }`}
                                >
                                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mr-3 shrink-0">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 truncate select-none">
                                      CPF ou CNPJ do motorista
                                    </label>
                                    <Input
                                      autoFocus
                                      {...field}
                                      inputMode="numeric"
                                      onChange={(e) =>
                                        field.onChange(cpfCnpjMask(e.target.value))
                                      }
                                      placeholder="000.000.000-00"
                                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-300"
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
                                <div
                                  className={`flex items-center border rounded-2xl p-2 bg-white shadow-sm transition-all ${fieldState.error
                                      ? "border-red-500 ring-2 ring-red-500/20"
                                      : "border-slate-200 focus-within:ring-2 focus-within:ring-[#1a3a5c]/20 focus-within:border-[#1a3a5c]"
                                    }`}
                                >
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
                                    {showPassword ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
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
                          onCheckedChange={(checked) =>
                            setRememberMe(Boolean(checked))
                          }
                          className="bg-white border-slate-300 shadow-sm rounded-[4px] data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c] w-[18px] h-[18px] cursor-pointer"
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
                          className="w-full h-14 rounded-2xl text-[16px] font-bold bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white shadow-lg shadow-[#1a3a5c]/20 transition-all cursor-pointer"
                          disabled={loading}
                        >
                          {loading
                            ? getMessage("auth.labels.loginProcessando")
                            : getMessage("auth.labels.login")}
                        </Button>
                      </div>

                      {/* Links */}
                      <div className="flex flex-col items-center gap-2.5 mt-6">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-[14px] text-[#2d5a88] hover:text-[#1a3a5c] hover:underline transition-colors font-medium cursor-pointer"
                        >
                          Esqueci minha senha
                        </button>

                        <p className="text-[13px] text-slate-500 mt-1 text-center">
                          Não tem uma conta?{" "}
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
                            className="text-[#2d5a88] font-bold underline underline-offset-2 hover:text-[#1a3a5c] transition-colors cursor-pointer"
                          >
                            Cadastre sua van
                          </button>
                        </p>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Sugestão de App */}
                {!isNativeApp() && <LoginPlatformSuggestion />}
              </div>
            )}
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
