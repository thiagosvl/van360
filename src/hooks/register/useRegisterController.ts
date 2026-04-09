import { ROUTES } from "@/constants/routes";
import { RegisterFormData, registerSchema } from "@/schemas/registerSchema";
import { usuarioApi } from "@/services";
import { sessionManager } from "@/services/sessionManager";
import { isMobilePlatform, isNativeApp } from "@/utils/detectPlatform";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export interface PostRegisterData {
  cpf: string;
  accessToken: string;
  refreshToken: string;
  user: any;
}

export interface DuplicateError {
  field: "email" | "cpfcnpj" | "generic";
  message: string;
}

export function useRegisterController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [postRegisterData, setPostRegisterData] = useState<PostRegisterData | null>(null);

  /* [TEMPORÁRIO] Usando isMobilePlatform para exibir boas-vindas no mobile browser também */
  const [showNativeWelcome, setShowNativeWelcome] = useState(
    () => isMobilePlatform() && sessionStorage.getItem("van360_showing_welcome") === "true"
  );
  /* [PADRÃO] No futuro, voltar para:
  const [showNativeWelcome, setShowNativeWelcome] = useState(
    () => isNativeApp() && sessionStorage.getItem("van360_showing_welcome") === "true"
  );
  */
  const [duplicateError, setDuplicateError] = useState<DuplicateError | null>(null);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      cpfcnpj: "",
      email: "",
      telefone: "",
      senha: "",
      termos_aceitos: false as unknown as true,
    },
  });

  const handleFillMagic = () => {
    form.reset({
      ...form.getValues(),
      nome: "Thiago Barros",
      cpfcnpj: "395.423.918-38",
      email: "thiago-svl@hotmail.com",
      telefone: "(11) 95118-6951",
      senha: "Ogaiht+1",
      termos_aceitos: true
    });
  };

  const handleFinalRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const result = await usuarioApi.registrar(data);
      if (result?.error) throw new Error(result.error);

      // --- FLUXO DE PÓS-CADASTRO ---

      const sessionUser = result.session.user || result.user;
      const isMobile = isMobilePlatform();

      /* 
         [TEMPORÁRIO] Cenário mobile (App OU Nav Mobile) redireciona para Splash Screen.
         Desktop faz Log-in direto.
         Objetivo: No futuro, separar isNativeApp() de isMobilePlatform().
      */

      // Mobile (Nativo ou Browser Mobile): setar sessão + mostrar boas-vindas
      if (isMobile) {
        sessionStorage.setItem("van360_showing_welcome", "true");
        setShowNativeWelcome(true);

        const { error } = await sessionManager.setSession(
          result.session.access_token,
          result.session.refresh_token,
          sessionUser
        );

        if (error) {
          sessionStorage.removeItem("van360_showing_welcome");
          setShowNativeWelcome(false);
          toast.error("auth.erro.login", {
            description: "Cadastro realizado, mas não foi possível fazer login automático.",
          });
          navigate(ROUTES.PUBLIC.LOGIN);
        }
        return;
      }

      // Desktop: Login direto
      const { error } = await sessionManager.setSession(
        result.session.access_token,
        result.session.refresh_token,
        sessionUser
      );

      if (error) {
        toast.error("auth.erro.login", {
          description: "Cadastro realizado, mas não foi possível fazer login automático.",
        });
        navigate(ROUTES.PUBLIC.LOGIN);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
      }

      /* 
      // [LEGADO/PADRÃO] Comentado para quando voltarmos a usar a PostRegisterScreen para web
      if (isNativeApp()) {
         ... lógica nativa igual à de cima ...
         return;
      }

      // Web Padrão: mostra tela de download/cont em browser (NÃO faz login auto)
      setPostRegisterData({
        cpf: data.cpfcnpj,
        accessToken: result.session.access_token,
        refreshToken: result.session.refresh_token,
        user: result.session.user || result.user,
      });
      */
    } catch (err: any) {
      const respData = err.response?.data;
      const errorMsg = (respData?.error || err.message || "").toLowerCase();

      // Detectar erro de duplicidade
      const isDuplicateEmail =
        respData?.field === "email" ||
        errorMsg.includes("email") && (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate") || errorMsg.includes("já"));
      const isDuplicateCpf =
        respData?.field === "cpfcnpj" ||
        (errorMsg.includes("cpf") && (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate") || errorMsg.includes("já")));

      if (isDuplicateEmail) {
        setDuplicateError({
          field: "email",
          message: "Este email já está cadastrado.",
        });
        return;
      }

      if (isDuplicateCpf) {
        setDuplicateError({
          field: "cpfcnpj",
          message: "Este CPF já está cadastrado.",
        });
        return;
      }

      // Fallback: checar se é erro genérico de duplicidade
      if (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate")) {
        setDuplicateError({
          field: "generic",
          message: "Email ou CPF já cadastrado.",
        });
        return;
      }

      // Erro não relacionado a duplicidade
      if (respData?.field) {
        form.setError(respData.field as any, { message: respData.error });
      }
      toast.error("cadastro.erro.criar", {
        description: respData?.error || err.message || "Ocorreu um problema ao criar seu usuário.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    const fields: (keyof RegisterFormData)[] = ["nome", "cpfcnpj", "email", "telefone", "senha", "termos_aceitos"];
    const ok = await form.trigger(fields as any);
    if (!ok) return false;

    await handleFinalRegister(form.getValues());
    return true;
  };

  const handleContinueInBrowser = async () => {
    if (!postRegisterData) return;

    const { error } = await sessionManager.setSession(
      postRegisterData.accessToken,
      postRegisterData.refreshToken,
      postRegisterData.user
    );

    if (error) {
      toast.error("auth.erro.login", {
        description: "Não foi possível fazer login. Tente novamente.",
      });
      navigate(ROUTES.PUBLIC.LOGIN);
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
    }
  };

  const clearDuplicateError = () => setDuplicateError(null);

  return {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
    postRegisterData,
    handleContinueInBrowser,
    showNativeWelcome,
    duplicateError,
    clearDuplicateError,
  };
}

