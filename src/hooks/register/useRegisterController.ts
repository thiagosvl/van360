import { ROUTES } from "@/constants/routes";
import { RegisterFormData, registerSchema } from "@/schemas/registerSchema";
import { usuarioApi } from "@/services";
import { sessionManager } from "@/services/sessionManager";
import { detectPlatform, isMobilePlatform, isNativeApp } from "@/utils/detectPlatform";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

export interface DuplicateError {
  field: "email" | "cpfcnpj" | "telefone" | "generic";
  message: string;
}

export function useRegisterController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      localStorage.setItem("van360_referral_code", refParam);
    }
  }, [searchParams]);

  const [duplicateError, setDuplicateError] = useState<DuplicateError | null>(null);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      cpfcnpj: "",
      razao_social: "",
      email: "",
      telefone: "",
      senha: "",
      termos_aceitos: false as unknown as true,
      data_nascimento: "",
    },
  });

  const handleFillMagic = () => {
    form.reset({
      ...form.getValues(),
      cpfcnpj: "90.835.525/0001-30",
      razao_social: "THIAGO BARROS SOLUCOES",
      nome: "Thiago Barros",
      telefone: "(11) 95118-6951",
      email: "thiago-svl@hotmail.com",
      data_nascimento: "30/06/1997",
      senha: "Ogaiht+1",
      termos_aceitos: true,
    });
  };

  const handleFinalRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setDuplicateError(null);
      const referralCode = localStorage.getItem("van360_referral_code") || undefined;
      const result = await usuarioApi.registrar({
        ...data,
        cpfcnpj: data.cpfcnpj?.replace(/\D/g, ""),
        telefone: data.telefone?.replace(/\D/g, ""),
        indicador_id: referralCode,
      });
      if (result?.error) throw new Error(result.error);

      localStorage.removeItem("van360_referral_code");

      // --- FLUXO DE PÓS-CADASTRO ---

      // Disparar evento de conversão para o Google Tag Manager / Ads
      // Apenas em Produção e Apenas no Web (para não sujar métricas com o app nativo)
      const isNative = typeof isNativeApp === 'function' ? isNativeApp() : false;

      if (typeof window !== "undefined" && import.meta.env.PROD && !isNative) {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: "generate_lead",
        });
      }
      const sessionUser = result.session.user || result.user;


      // Define a flag de recém-cadastrado para disparar os confetes na Home
      sessionStorage.setItem("van360_just_registered", "true");

      // Loga direto em todas as plataformas
      const { error } = await sessionManager.setSession(
        result.session.access_token,
        result.session.refresh_token,
        sessionUser
      );
      
      if (!error) {
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
      } else {
        toast.error("auth.erro.login", {
          description: "Cadastro concluído, mas falha no login automático.",
        });
        navigate(ROUTES.PUBLIC.LOGIN);
      }
    } catch (err: any) {
      const respData = err.response?.data;
      const errorMsg = (respData?.error || err.message || "").toLowerCase();

      // Detectar erro de duplicidade
      const isDuplicateEmail =
        respData?.field === "email" ||
        (errorMsg.includes("email") && (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate") || errorMsg.includes("já")));
      const isDuplicateCpf =
        respData?.field === "cpfcnpj" ||
        (errorMsg.includes("cpf") && (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate") || errorMsg.includes("já")));
      const isDuplicatePhone =
        respData?.field === "telefone" ||
        (errorMsg.includes("telefone") && (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate") || errorMsg.includes("já")));

      if (isDuplicateEmail) {
        form.setError("email", { message: "Este email já está em uso." });
        setDuplicateError({
          field: "email",
          message: "Este email já está cadastrado.",
        });
        return;
      }

      if (isDuplicateCpf) {
        form.setError("cpfcnpj", { message: "Este CPF/CNPJ já está em uso." });
        setDuplicateError({
          field: "cpfcnpj",
          message: "Este CPF/CNPJ já está cadastrado.",
        });
        return;
      }

      if (isDuplicatePhone) {
        form.setError("telefone", { message: "Este telefone já está em uso." });
        setDuplicateError({
          field: "telefone",
          message: "Este telefone já está cadastrado.",
        });
        return;
      }

      // Fallback: checar se é erro genérico de duplicidade
      if (errorMsg.includes("cadastrad") || errorMsg.includes("exist") || errorMsg.includes("duplicate")) {
        setDuplicateError({
          field: "generic",
          message: "Este cadastro já existe no sistema.",
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
    const fields: (keyof RegisterFormData)[] = ["nome", "cpfcnpj", "razao_social", "email", "telefone", "senha", "termos_aceitos", "data_nascimento"];
    const ok = await form.trigger(fields as any);
    if (!ok) {
      toast.error("validacao.formularioComErros");
      return false;
    }

    await handleFinalRegister(form.getValues());
    return true;
  };

  const clearDuplicateError = () => setDuplicateError(null);

  return {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
    duplicateError,
    clearDuplicateError,
  };
}
