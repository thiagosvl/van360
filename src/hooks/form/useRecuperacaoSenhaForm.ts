import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api/client';
import { sessionManager } from '@/services/sessionManager';
import { toast } from '@/utils/notifications/toast';
import { cpfSchema } from '@/schemas/common';
import { getMessage } from '@/constants/messages';
import { ROUTES } from '@/constants/routes';
import { UserType } from '@/types/enums';

const step1Schema = z.object({
  cpf: cpfSchema,
});

const step2Schema = z.object({
  codigo: z.string().length(6, "O código deve ter 6 dígitos"),
});

const step3Schema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

export function useRecuperacaoSenhaForm(onSuccess: () => void, initialCpf?: string) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);
  const [cpf, setCpf] = useState(initialCpf || "");
  const [telefoneMascarado, setTelefoneMascarado] = useState<string | null>(null);
  const navigate = useNavigate();

  const formStep1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { cpf: initialCpf || "" }
  });

  // Sincronizar CPF inicial quando o diálogo abrir ou o valor no login mudar
  useEffect(() => {
    if (initialCpf) {
      formStep1.setValue("cpf", initialCpf);
      setCpf(initialCpf);
    }
  }, [initialCpf, formStep1]);

  const formStep2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { codigo: "" }
  });

  const formStep3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { password: "" }
  });

  const handleSolicitar = async (data: Step1Data) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/recuperacao/solicitar', { cpf: data.cpf });
      setCpf(data.cpf);
      setTelefoneMascarado(response.data.telefoneMascarado || null);
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "auth.erro.cpfNaoEncontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (data: Step2Data) => {
    if (data.codigo.length < 6) return;
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/recuperacao/validar', {
        cpf,
        codigo: data.codigo
      });
      setRecoveryId(response.data.recoveryId);
      setStep(3);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Código inválido ou expirado.";
      formStep2.setError("codigo", { type: "manual", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResetar = async (data: Step3Data) => {
    if (!recoveryId) return;
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/recuperacao/resetar', {
        recoveryId,
        password: data.password
      });

      const { session } = response.data;

      if (session) {
        // Hydrate Session locally
        await sessionManager.setSession(
          session.access_token,
          session.refresh_token,
          session.user
        );

        const role = session.user?.app_metadata?.role;

        if (role === UserType.ADMIN) {
          navigate(ROUTES.PRIVATE.ADMIN.DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
        }

        onSuccess(); // Fecha o dialog
      } else {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao resetar senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarStep1 = () => {
    setStep(1);
    formStep2.reset({ codigo: "" });
    formStep3.reset({ password: "" });
    setRecoveryId(null);
  };

  const reset = () => {
    setStep(1);
    setLoading(false);
    setRecoveryId(null);
    setTelefoneMascarado(null);
    formStep1.reset({ cpf: initialCpf || "" });
    formStep2.reset({ codigo: "" });
    formStep3.reset({ password: "" });
  };

  return {
    step,
    setStep,
    loading,
    formStep1,
    formStep2,
    formStep3,
    handleSolicitar,
    handleValidar,
    handleResetar,
    handleVoltarStep1,
    cpf,
    telefoneMascarado,
    reset
  };
}
