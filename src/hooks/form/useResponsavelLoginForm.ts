import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import {
  useCheckPhoneMutation,
  useLoginResponsavelMutation,
  useSetupPinMutation
} from "@/hooks/api/useResponsavelAuthApi";
import { phoneMask } from "@/utils/masks";

export const phoneFormSchema = z.object({
  telefone: z.string().min(14, "Por favor, digite um telefone com DDD válido.")
});

export const pinFormSchema = z.object({
  pin: z
    .string()
    .length(4, "O PIN deve ter exatamente 4 dígitos.")
    .regex(/^\d+$/, "O PIN deve conter apenas números.")
});

export type PhoneFormValues = z.infer<typeof phoneFormSchema>;
export type PinFormValues = z.infer<typeof pinFormSchema>;

export function useResponsavelLoginForm() {
  const navigate = useNavigate();
  const { setSession } = useResponsavelAuth();

  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [telefoneClean, setTelefoneClean] = useState("");
  const [telefoneFormatted, setTelefoneFormatted] = useState("");
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [rememberPhone, setRememberPhone] = useState(true);
  const [isRecuperarOpen, setIsRecuperarOpen] = useState(false);

  const checkPhoneMutation = useCheckPhoneMutation();
  const setupPinMutation = useSetupPinMutation();
  const loginMutation = useLoginResponsavelMutation();

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { telefone: "" }
  });

  const pinForm = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: { pin: "" }
  });

  // Carregar telefone salvo no LocalStorage se a opção "Lembrar meu telefone" estiver ativa
  useEffect(() => {
    const savedPhone = localStorage.getItem(STORAGE_KEYS.SAVED_RESPONSAVEL_PHONE);
    if (savedPhone) {
      const masked = phoneMask(savedPhone);
      phoneForm.setValue("telefone", masked);
      setRememberPhone(true);
    }
  }, [phoneForm]);

  const handlePhoneSubmit = async (values: PhoneFormValues) => {
    const clean = values.telefone.replace(/\D/g, "");
    if (clean.length < 10) {
      phoneForm.setError("telefone", { message: "Por favor, digite um telefone com DDD válido." });
      return;
    }

    try {
      const res = await checkPhoneMutation.mutateAsync(clean);

      // Salvar ou remover telefone baseado na escolha do checkbox
      if (rememberPhone) {
        localStorage.setItem(STORAGE_KEYS.SAVED_RESPONSAVEL_PHONE, values.telefone);
      } else {
        localStorage.removeItem(STORAGE_KEYS.SAVED_RESPONSAVEL_PHONE);
      }

      setTelefoneClean(clean);
      setTelefoneFormatted(values.telefone);
      setIsFirstAccess(!res.hasPin);
      setStep("pin");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.message ||
        "Cadastro não encontrado. Entre em contato com o motorista.";
      phoneForm.setError("root", { message: msg });
    }
  };

  const handlePinSubmit = async (values: PinFormValues) => {
    if (isFirstAccess) {
      try {
        const res = await setupPinMutation.mutateAsync({ telefone: telefoneClean, pin: values.pin });
        setSession(res.token, res.passageiros);
        if (res.passageiros.length > 1) {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
        } else {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        pinForm.setError("root", {
          message: errorObj.response?.data?.message || "Erro ao configurar o PIN. Tente novamente."
        });
      }
    } else {
      try {
        const res = await loginMutation.mutateAsync({ telefone: telefoneClean, pin: values.pin });
        setSession(res.token, res.passageiros);
        if (res.passageiros.length > 1) {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.SELECT);
        } else {
          navigate(ROUTES.PRIVATE.RESPONSAVEL.HOME);
        }
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        pinForm.setError("root", {
          message: errorObj.response?.data?.message || "PIN incorreto. Tente novamente."
        });
      }
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    pinForm.reset();
  };

  const isPending =
    checkPhoneMutation.isPending || setupPinMutation.isPending || loginMutation.isPending;

  return {
    step,
    telefoneClean,
    telefoneFormatted,
    isFirstAccess,
    showPin,
    setShowPin,
    rememberPhone,
    setRememberPhone,
    isRecuperarOpen,
    setIsRecuperarOpen,
    phoneForm,
    pinForm,
    handlePhoneSubmit,
    handlePinSubmit,
    handleBackToPhone,
    isPending
  };
}
