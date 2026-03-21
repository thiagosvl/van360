import { ROUTES } from "@/constants/routes";
import { RegisterFormData, registerSchema } from "@/schemas/registerSchema";
import { usuarioApi } from "@/services";
import { sessionManager } from "@/services/sessionManager";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useRegisterController() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      apelido: "",
      cpfcnpj: "",
      email: "",
      telefone: "",
      senha: "",
    },
  });

  const handleFillMagic = () => {
    form.reset({
      ...form.getValues(),
      nome: "Thiago Barros",
      apelido: "Tio Thiago",
      cpfcnpj: "395.423.918-38",
      email: "thiago-svl@hotmail.com",
      telefone: "(11) 95118-6951",
      senha: "Ogaiht+1",
    });
  };

  const handleFinalRegister = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const result = await usuarioApi.registrar(data);
      if (result?.error) throw new Error(result.error);

      const { error } = await sessionManager.setSession(
        result.session.access_token,
        result.session.refresh_token,
        result.session.user || result.user
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
    } catch (err: any) {
      const respData = err.response?.data;
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
    const fields: (keyof RegisterFormData)[] = ["nome", "apelido", "cpfcnpj", "email", "telefone", "senha"];
    const ok = await form.trigger(fields as any);
    if (!ok) return false;

    await handleFinalRegister(form.getValues());
    return true;
  };

  return {
    form,
    loading,
    handleNextStep,
    handleFillMagic,
  };
}
