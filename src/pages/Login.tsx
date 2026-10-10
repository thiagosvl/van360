import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { getMessage } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { apiClient } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { useSEO } from "@/hooks/useSEO";

import { subscriptionApi } from "@/services/api/subscription.api";
import { UserType } from "@/types/enums";
import { SubscriptionUtils } from "@/utils/subscription.utils";
import { clearAppSession } from "@/utils/domain/motorista/motoristaUtils";
import {
  APP_STORE_BADGE_URL,
  APP_STORE_URL,
  getAppPlatformEligibility,
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
  if (isNativeApp()) return null;

  const { isEligibleAndroid, isEligibleIos, hasEligibleApp } = getAppPlatformEligibility();

  if (!hasEligibleApp) return null;

  return (
    <div className="mt-6 pt-5 border-t border-[#e5e5e5] flex flex-col items-center">
      <p className="max-[320px]:text-[11px] text-xs font-medium text-[#737373] mb-2 text-center">
        Para uma melhor experiência, baixe o app:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {isEligibleAndroid && (
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
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </a>
        )}
        {isEligibleIos && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:-translate-y-0.5 transition-transform"
            aria-label="Baixar Van360 na App Store"
          >
            <img
              src={APP_STORE_BADGE_URL}
              alt="Baixar na App Store"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </a>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  useSEO({
    title: "Entrar | Van360",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isFromSplash = Boolean((location.state as { fromSplash?: boolean })?.fromSplash) || isNativeApp();

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
    if (isFromSplash) {
      if (selectedProfile === "motorista") {
        navigate(`${ROUTES.PUBLIC.SPLASH}?tipo=motorista`, { state: { step: "motorista" } });
      } else {
        navigate(ROUTES.PUBLIC.SPLASH);
      }
    } else {
      setSelectedProfile(null);
      setSearchParams({}, { replace: true });
    }
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
    const savedCpf = localStorage.getItem(STORAGE_KEYS.SAVED_CPF);
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
        localStorage.setItem(STORAGE_KEYS.SAVED_CPF, data.cpfcnpj);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SAVED_CPF);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (role === UserType.ADMIN) {
        navigate(ROUTES.PRIVATE.ADMIN.DASHBOARD, { replace: true });
      } else {
        try {
          const sub = await subscriptionApi.getSubscription();

          if (SubscriptionUtils.isBlocked(sub)) {
            navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION, { replace: true });
            return;
          }
        } catch {
        }
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
      }
    } catch (error) {
      console.error(error);
      const err = error as { userMessage?: string; message?: string };
      const msg = err.userMessage || err.message || "Erro ao fazer login.";

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
      <div className="min-h-screen flex flex-col justify-center items-center py-6 px-4 relative overflow-hidden bg-[#f5f5f5]">
        <div className="w-full max-w-[430px] relative z-10">
          <div className="bg-white rounded-[24px] shadow-sm p-6 sm:p-9 border border-[#e5e5e5] relative">
            {isDevEnv() && (
              <div className="absolute right-5 top-5 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-full transition-all"
                  onClick={handleFillMagic}
                  title="Preencher com dados de teste"
                >
                  <Wand2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            {selectedProfile === null ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <img
                  src="/assets/logo-van360.webp"
                  alt="Van360"
                  className="h-16 w-auto mb-4 drop-shadow-xs select-none"
                />

                <div className="text-center mb-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight mb-1">
                    Quem está acessando?
                  </h1>
                  <p className="text-xs sm:text-[13px] font-medium text-[#737373]">
                    Selecione uma opção para continuar
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSelectProfile("motorista")}
                    className="w-full text-left p-3.5 sm:p-4 rounded-[18px] bg-white border border-[#e5e5e5] hover:border-[#2563eb] hover:bg-[#f8faff] active:scale-[0.98] shadow-xs hover:shadow-sm transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                      <div className="w-11 h-11 rounded-[14px] bg-[#eff6ff] text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[14px] sm:text-base text-[#0a0a0a] group-hover:text-[#2563eb] transition-colors block leading-tight">
                          Motorista ou Equipe
                        </span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#f5f5f5] group-hover:bg-[#eff6ff] flex items-center justify-center shrink-0 transition-colors ml-1">
                      <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#2563eb] transition-colors" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectProfile("responsavel")}
                    className="w-full text-left p-3.5 sm:p-4 rounded-[18px] bg-white border border-[#e5e5e5] hover:border-amber-500 hover:bg-[#fffbeb] active:scale-[0.98] shadow-xs hover:shadow-sm transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1 flex-1">
                      <div className="w-11 h-11 rounded-[14px] bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[14px] sm:text-base text-[#0a0a0a] group-hover:text-amber-800 transition-colors block leading-tight">
                          Responsável
                        </span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#f5f5f5] group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors ml-1">
                      <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-amber-600 transition-colors" />
                    </div>
                  </button>
                </div>

                {!isNativeApp() && <LoginPlatformSuggestion />}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e5e5e5]">
                  <button
                    type="button"
                    onClick={handleBackToProfileSelection}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#0a0a0a] transition-colors p-1.5 -ml-1 rounded-[12px] hover:bg-[#f5f5f5] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Trocar perfil</span>
                  </button>
                </div>

                <div className="flex flex-col items-center mb-5 text-center">
                  <img
                    src="/assets/logo-van360.webp"
                    alt="Van360"
                    className="h-12 w-auto mb-3 drop-shadow-xs select-none"
                  />
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight mb-1">
                    {selectedProfile === "motorista"
                      ? "Motorista ou Equipe"
                      : "Responsável"}
                  </h1>
                </div>

                {selectedProfile === "responsavel" ? (
                  <ResponsavelLoginForm />
                ) : (
                  <Form {...formMotorista}>
                    <form onSubmit={formMotorista.handleSubmit(handleLoginMotorista)}>
                      <div className="space-y-4">
                        <FormField
                          control={formMotorista.control}
                          name="cpfcnpj"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                                CPF ou CNPJ
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                  <Input
                                    autoFocus
                                    {...field}
                                    inputMode="numeric"
                                    placeholder="Digite seu CPF ou CNPJ"
                                    onChange={(e) =>
                                      field.onChange(cpfCnpjMask(e.target.value))
                                    }
                                    className={`pl-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                      fieldState.error
                                        ? "border-[#e7000b] focus:border-[#e7000b]"
                                        : "border-[#e5e5e5] focus:border-[#2563eb]"
                                    }`}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formMotorista.control}
                          name="senha"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-[#0a0a0a]">
                                Senha
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Digite sua senha"
                                    className={`pl-10 pr-10 h-11 rounded-[18px] bg-[#f5f5f5] border transition-all text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus-visible:ring-0 focus:bg-white ${
                                      fieldState.error
                                        ? "border-[#e7000b] focus:border-[#e7000b]"
                                        : "border-[#e5e5e5] focus:border-[#2563eb]"
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors p-1 cursor-pointer"
                                    tabIndex={-1}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs ml-1 text-[#e7000b]" />
                            </FormItem>
                          )}
                        />
                      </div>

                      {formMotorista.formState.errors.root && (
                        <div className="mt-4 p-3 rounded-[14px] bg-red-50 border border-red-200 flex items-start gap-2 text-sm text-[#e7000b]">
                          <span className="mt-0.5">⚠️</span>
                          {formMotorista.formState.errors.root.message}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-5 ml-1">
                        <Checkbox
                          id="rememberMe"
                          checked={rememberMe}
                          onCheckedChange={(checked) =>
                            setRememberMe(Boolean(checked))
                          }
                          className="bg-white border-[#e5e5e5] shadow-2xs rounded-[6px] data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb] w-[18px] h-[18px] cursor-pointer"
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-[13px] font-medium text-[#737373] cursor-pointer select-none"
                        >
                          Lembrar meu CPF / CNPJ
                        </Label>
                      </div>

                      <div className="pt-2 mt-4">
                        <Button
                          type="submit"
                          className="w-full h-12 rounded-[18px] text-[15px] font-bold bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                          disabled={loading}
                        >
                          {loading
                            ? getMessage("auth.labels.loginProcessando")
                            : getMessage("auth.labels.login")}
                        </Button>
                      </div>

                      <div className="flex flex-col items-center gap-2.5 mt-6">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline transition-colors font-medium cursor-pointer"
                        >
                          Esqueci minha senha
                        </button>

                        <p className="text-[13px] text-[#737373] mt-1 text-center">
                          Não tem uma conta?{" "}
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.PUBLIC.REGISTER)}
                            className="text-[#2563eb] font-bold underline underline-offset-2 hover:text-[#1d4ed8] transition-colors cursor-pointer"
                          >
                            Cadastre sua van
                          </button>
                        </p>
                      </div>
                    </form>
                  </Form>
                )}

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
