import { useState, useCallback, useMemo } from "react";
import { useConfiguracoes } from "@/hooks";
import { useMotoristaFinanceiroApi } from "@/hooks/api/useMotoristaFinanceiroApi";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { TipoChavePix } from "@/types/pix";
import { ModoCobrancaEnum } from "@/types/enums";
import { pixKeySchema } from "@/schemas/pix";
import { cpfMask, cnpjMask, phoneMask, evpMask } from "@/utils/masks";
import { formatCurrency } from "@/utils/formatters/currency";
import { toast } from "sonner";

export const WIZARD_MODALIDADE = {
  LEMBRETES: "LEMBRETES",
  AUTOMATICA: "AUTOMATICA",
} as const;

export type WizardModalidade = (typeof WIZARD_MODALIDADE)[keyof typeof WIZARD_MODALIDADE];

export const WIZARD_STEP = {
  PIX: "PIX",
  TAXAS: "TAXAS",
  AVISOS: "AVISOS",
} as const;

export type WizardStep = (typeof WIZARD_STEP)[keyof typeof WIZARD_STEP];

interface UseConfigurarCobrancaWizardViewModelProps {
  modalidade: WizardModalidade;
  aplicar_a_todos?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function useConfigurarCobrancaWizardViewModel({
  modalidade,
  aplicar_a_todos,
  onClose,
  onSuccess,
}: UseConfigurarCobrancaWizardViewModelProps) {
  const { user } = useSession();
  const { profile, refreshProfile } = useProfile(user?.id);
  const { configuracoes, updateConfiguracoes } = useConfiguracoes();
  const { financeiro, updateFinanceiro } = useMotoristaFinanceiroApi();

  const [step, setStep] = useState<WizardStep>(WIZARD_STEP.PIX);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chavePixTouched, setChavePixTouched] = useState(false);

  const initialTipo = (financeiro?.tipo_chave_pix || profile?.tipo_chave_pix || undefined) as TipoChavePix | undefined;
  const initialChave = financeiro?.chave_pix_repasse || profile?.chave_pix || "";

  const [tipoChave, setTipoChave] = useState<TipoChavePix | undefined>(initialTipo);
  const [chavePix, setChavePix] = useState<string>(() => {
    if (!initialTipo || !initialChave) return "";
    if (initialTipo === TipoChavePix.CPF) return cpfMask(initialChave);
    if (initialTipo === TipoChavePix.CNPJ) return cnpjMask(initialChave);
    if (initialTipo === TipoChavePix.TELEFONE) return phoneMask(initialChave);
    if (initialTipo === TipoChavePix.ALEATORIA) return evpMask(initialChave);
    return initialChave;
  });

  const [enviarRecibo, setEnviarRecibo] = useState<boolean>(
    financeiro?.enviar_recibo_automatico ?? true
  );

  const [avisoPrevioAtivo, setAvisoPrevioAtivo] = useState<boolean>(
    configuracoes?.cobranca_aviso_previo_ativo ?? true
  );
  const [diasAvisoPrevio, setDiasAvisoPrevio] = useState<number>(
    configuracoes?.cobranca_dias_aviso_previo ?? configuracoes?.dias_aviso_vencimento_padrao_sistema ?? 2
  );
  const [vencimentoHojeAtivo, setVencimentoHojeAtivo] = useState<boolean>(
    configuracoes?.cobranca_vencimento_hoje_ativo ?? true
  );
  const [atraso3DiasAtivo, setAtraso3DiasAtivo] = useState<boolean>(
    configuracoes?.cobranca_atraso_3_dias_ativo ?? true
  );

  const taxaEfetiva = financeiro?.taxa_efetiva ?? 2.9;
  const taxaFormatada = formatCurrency(taxaEfetiva);

  const totalSteps = modalidade === WIZARD_MODALIDADE.AUTOMATICA ? 3 : 2;

  const currentStepNumber = (() => {
    if (step === WIZARD_STEP.PIX) return 1;
    if (step === WIZARD_STEP.TAXAS) return 2;
    if (step === WIZARD_STEP.AVISOS) return modalidade === WIZARD_MODALIDADE.AUTOMATICA ? 3 : 2;
    return 1;
  })();

  const handleTipoChaveChange = (novoTipo: TipoChavePix | undefined) => {
    setTipoChave(novoTipo);
    setChavePixTouched(false);
    if (!novoTipo) {
      setChavePix("");
      return;
    }

    if (novoTipo === initialTipo && initialChave) {
      if (novoTipo === TipoChavePix.CPF) setChavePix(cpfMask(initialChave));
      else if (novoTipo === TipoChavePix.CNPJ) setChavePix(cnpjMask(initialChave));
      else if (novoTipo === TipoChavePix.TELEFONE) setChavePix(phoneMask(initialChave));
      else if (novoTipo === TipoChavePix.ALEATORIA) setChavePix(evpMask(initialChave));
      else setChavePix(initialChave);
      return;
    }

    let sugestao = "";
    if (profile) {
      const cleanDoc = profile.cpfcnpj ? profile.cpfcnpj.replace(/\D/g, "") : "";
      if (novoTipo === TipoChavePix.CPF && cleanDoc.length === 11) sugestao = cpfMask(profile.cpfcnpj);
      else if (novoTipo === TipoChavePix.CNPJ && cleanDoc.length === 14) sugestao = cnpjMask(profile.cpfcnpj);
      else if (novoTipo === TipoChavePix.TELEFONE && profile.telefone) sugestao = phoneMask(profile.telefone);
      else if (novoTipo === TipoChavePix.EMAIL && (profile.email || user?.email)) sugestao = profile.email || user?.email || "";
    }
    setChavePix(sugestao);
  };

  const handleChavePixChange = (raw: string) => {
    if (!tipoChave) {
      setChavePix(raw);
      return;
    }
    if (tipoChave === TipoChavePix.CPF) setChavePix(cpfMask(raw));
    else if (tipoChave === TipoChavePix.CNPJ) setChavePix(cnpjMask(raw));
    else if (tipoChave === TipoChavePix.TELEFONE) setChavePix(phoneMask(raw));
    else if (tipoChave === TipoChavePix.ALEATORIA) setChavePix(evpMask(raw));
    else setChavePix(raw);
  };

  const isPixValido = useMemo(() => {
    if (!tipoChave || !chavePix.trim()) return false;
    return pixKeySchema.safeParse({ tipo_chave_pix: tipoChave, chave_pix: chavePix.trim() }).success;
  }, [tipoChave, chavePix]);

  const pixErrorMessage = useMemo(() => {
    if (!tipoChave) return null;

    if (!chavePix.trim()) {
      if (modalidade === WIZARD_MODALIDADE.AUTOMATICA && chavePixTouched) {
        return "Chave Pix é obrigatória para cobrança com baixa automática";
      }
      return null;
    }

    const result = pixKeySchema.safeParse({
      tipo_chave_pix: tipoChave,
      chave_pix: chavePix.trim(),
    });

    if (result.success) return null;

    const rawMessage = result.error.issues[0]?.message || "Chave Pix inválida";

    const clean = chavePix.replace(/\D/g, "");
    const isMaskComplete = (() => {
      if (tipoChave === TipoChavePix.CPF) return clean.length === 11;
      if (tipoChave === TipoChavePix.CNPJ) return clean.length === 14;
      if (tipoChave === TipoChavePix.TELEFONE) return clean.length === 11;
      if (tipoChave === TipoChavePix.ALEATORIA) return chavePix.replace(/[^a-zA-Z0-9]/g, "").length >= 32;
      if (tipoChave === TipoChavePix.EMAIL) return chavePix.includes("@") && chavePix.includes(".");
      return false;
    })();

    if (chavePixTouched || isMaskComplete) {
      return rawMessage;
    }

    return null;
  }, [tipoChave, chavePix, chavePixTouched, modalidade]);

  const handleDiasStep = (delta: number) => {
    setDiasAvisoPrevio((prev) => Math.max(1, Math.min(5, prev + delta)));
  };

  const handleBack = () => {
    if (step === WIZARD_STEP.AVISOS) {
      setStep(modalidade === WIZARD_MODALIDADE.AUTOMATICA ? WIZARD_STEP.TAXAS : WIZARD_STEP.PIX);
    } else if (step === WIZARD_STEP.TAXAS) {
      setStep(WIZARD_STEP.PIX);
    }
  };

  const handleSkipPix = () => {
    setTipoChave(undefined);
    setChavePix("");
    setChavePixTouched(false);
    setStep(WIZARD_STEP.AVISOS);
  };

  const handleNext = async () => {
    if (step === WIZARD_STEP.PIX) {
      setChavePixTouched(true);
      if (!isPixValido) {
        toast.error(
          modalidade === WIZARD_MODALIDADE.AUTOMATICA
            ? "Informe uma chave Pix válida para habilitar a cobrança com baixa automática."
            : "Informe uma chave Pix válida ou clique em 'Não usar Pix'."
        );
        return;
      }
      setStep(modalidade === WIZARD_MODALIDADE.AUTOMATICA ? WIZARD_STEP.TAXAS : WIZARD_STEP.AVISOS);
      return;
    }

    if (step === WIZARD_STEP.TAXAS) {
      setStep(WIZARD_STEP.AVISOS);
      return;
    }

    if (step === WIZARD_STEP.AVISOS) {
      setIsSubmitting(true);
      try {
        const payloadChave = tipoChave && chavePix.trim() ? chavePix.trim() : null;
        const payloadTipo = tipoChave && chavePix.trim() ? tipoChave : null;

        await Promise.all([
          updateConfiguracoes({
            cobranca_aviso_previo_ativo: avisoPrevioAtivo,
            cobranca_dias_aviso_previo: diasAvisoPrevio,
            cobranca_vencimento_hoje_ativo: vencimentoHojeAtivo,
            cobranca_atraso_3_dias_ativo: atraso3DiasAtivo,
          }),
          updateFinanceiro({
            modo_cobranca: modalidade === WIZARD_MODALIDADE.AUTOMATICA ? ModoCobrancaEnum.AUTOMATICA : ModoCobrancaEnum.LEMBRETES,
            chave_pix_repasse: payloadChave,
            tipo_chave_pix: payloadTipo,
            enviar_recibo_automatico: modalidade === WIZARD_MODALIDADE.AUTOMATICA ? enviarRecibo : true,
            aplicar_a_todos,
          }),
        ]);

        safeCloseDialog(onClose);
        if (onSuccess) onSuccess();

        toast.success(
          modalidade === WIZARD_MODALIDADE.AUTOMATICA
            ? "Cobrança & Baixa Automática ativada com sucesso!"
            : "Lembretes de cobrança ativados com sucesso!"
        );
      } catch {
        toast.error("Ocorreu um erro ao salvar as configurações.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    step,
    modalidade,
    totalSteps,
    currentStepNumber,
    isSubmitting,
    tipoChave,
    chavePix,
    enviarRecibo,
    avisoPrevioAtivo,
    diasAvisoPrevio,
    vencimentoHojeAtivo,
    atraso3DiasAtivo,
    taxaFormatada,
    taxaEfetiva,
    isPixValido,
    pixErrorMessage,
    setChavePixTouched,
    handleTipoChaveChange,
    handleChavePixChange,
    setEnviarRecibo,
    setAvisoPrevioAtivo,
    setVencimentoHojeAtivo,
    setAtraso3DiasAtivo,
    handleDiasStep,
    handleBack,
    handleSkipPix,
    handleNext,
  };
}
