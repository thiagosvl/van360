import { isPlanoPagoNoAto } from "@/components/features/register";
import {
    PLANO_ESSENCIAL,
    PLANO_GRATUITO,
    PLANO_PROFISSIONAL,
} from "@/constants";
import { ROUTES } from "@/constants/routes";
import { useCalcularPrecoPreview, usePlanos } from "@/hooks";
import { RegisterFormData, registerSchema } from "@/schemas/registerSchema";
import { usuarioApi } from "@/services";
import { sessionManager } from "@/services/sessionManager";
import { Plano, SubPlano } from "@/types/plano";
import { getQuantidadeMinimaPersonalizada } from "@/utils/domain/plano/planoStructureUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

export function useRegisterController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Dialogs
  const [pagamentoDialog, setPagamentoDialog] = useState<{
    isOpen: boolean;
    cobrancaId: string;
    valor: number;
    initialData?: {
      qrCodePayload: string;
      location: string;
      inter_txid: string;
      cobrancaId: string;
    };
  } | null>(null);
  
  const [pagamentoSucessoDialog, setPagamentoSucessoDialog] = useState<{
    isOpen: boolean;
    nomePlano?: string;
    quantidadePassageiros?: number;
  }>({ isOpen: false });

  // Refs de controle
  const prevStepRef = useRef<number>(currentStep);
  const quantidadeCalculandoRef = useRef<number | null>(null);
  const planoIdCalculandoRef = useRef<string | null>(null);
  
  const lastProfissionalStateRef = useRef<{
    subPlanoId?: string;
    quantidadePersonalizada?: string;
    precoPreview?: { preco: number; valorPorCobranca: number } | null;
  } | null>(null);

  // Queries
  const { data: planosData, isLoading: loadingPlanos } = usePlanos(
    { ativo: "true" },
    {
      onError: () => {
        toast.error("plano.erro.carregar", {
          description: "Não foi possível buscar os planos disponíveis.",
        });
      },
    }
  );

  const planosDataTyped: { bases: Plano[]; sub: SubPlano[] } = (planosData as
    | { bases: Plano[]; sub: SubPlano[] }
    | undefined) ?? { bases: [], sub: [] };

  const calcularPrecoPreview = useCalcularPrecoPreview();

  // Local State
  const [quantidadePersonalizada, setQuantidadePersonalizada] = useState<string>("");
  const [precoCalculadoPreview, setPrecoCalculadoPreview] = useState<{
    preco: number;
    valorPorCobranca: number;
  } | null>(null);
  const [isCalculandoPreco, setIsCalculandoPreco] = useState(false);

  // Form
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      apelido: "",
      cpfcnpj: "",
      email: "",
      telefone: "",
      senha: "",
      plano_id: "",
      sub_plano_id: undefined,
      quantidade_personalizada: undefined,
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
    toast.success("Campos preenchidos com dados de teste!");
  };

  const selectedPlanoId = form.watch("plano_id");
  const selectedSubPlanoId = form.watch("sub_plano_id");

  const selectedPlano = planosDataTyped.bases.find(
    (p) => p.id === selectedPlanoId
  );
  const selectedSubPlano = planosDataTyped.sub.find(
    (s) => s.id === selectedSubPlanoId
  );

  // Computed Check
  const requiresPayment = selectedPlano
    ? selectedPlano.slug === PLANO_PROFISSIONAL && selectedSubPlano
      ? isPlanoPagoNoAto(selectedPlano, selectedSubPlano)
      : selectedPlano.slug === PLANO_PROFISSIONAL &&
        form.getValues("quantidade_personalizada")
      ? isPlanoPagoNoAto(selectedPlano)
      : isPlanoPagoNoAto(selectedPlano)
    : false;

  // --- Effects ---

  // Scroll on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Reset refs on step back
  useEffect(() => {
    if (currentStep < prevStepRef.current) {
      if (currentStep === 1) {
        quantidadeCalculandoRef.current = null;
        planoIdCalculandoRef.current = null;
      }
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // URL Params handling
  useEffect(() => {
    if (!loadingPlanos && planosDataTyped.bases.length > 0 && !selectedPlanoId) {
      const planoParam = searchParams.get("plano");
      if (planoParam) {
        const planoEncontrado = planosDataTyped.bases.find(p => p.slug === planoParam);
        if (planoEncontrado) {
          form.setValue("plano_id", planoEncontrado.id, { shouldValidate: true });
          if (planoParam === PLANO_GRATUITO || planoParam === PLANO_ESSENCIAL) {
            setCurrentStep(2);
          }
        }
      }
    }
  }, [loadingPlanos, planosDataTyped.bases, searchParams, selectedPlanoId, form]);

  // Auto-select Profissional logic
  useEffect(() => {
    if (
      !loadingPlanos &&
      planosDataTyped.bases.length > 0 &&
      !selectedPlanoId &&
      currentStep === 1 &&
      !searchParams.get("plano")
    ) {
      const planoProfissional = planosDataTyped.bases.find(
        (p) => p.slug === PLANO_PROFISSIONAL
      );
      if (planoProfissional) {
        form.setValue("plano_id", planoProfissional.id, { shouldValidate: false });
      }
    }

    if (
      selectedPlano?.slug === PLANO_PROFISSIONAL &&
      planosDataTyped.sub.length > 0 &&
      currentStep === 1
    ) {
      // 1. Restore state
      if (lastProfissionalStateRef.current) {
        const { subPlanoId, quantidadePersonalizada: qtdPers, precoPreview } = lastProfissionalStateRef.current;
        if (!selectedSubPlanoId && !form.getValues("quantidade_personalizada") && !quantidadePersonalizada) {
          if (subPlanoId) {
            form.setValue("sub_plano_id", subPlanoId, { shouldValidate: false });
          } else if (qtdPers) {
            setQuantidadePersonalizada(qtdPers);
            form.setValue("quantidade_personalizada", parseInt(qtdPers), { shouldValidate: true });
            if (precoPreview) {
              setPrecoCalculadoPreview(precoPreview);
            }
          }
          return;
        }
      }

      // 2. Default to smallest sub-plan
      if (
        !selectedSubPlanoId &&
        !form.getValues("quantidade_personalizada") &&
        !quantidadePersonalizada
      ) {
        const subPlanosProfissional = planosDataTyped.sub.filter(
          (s) => String(s.parent_id) === String(selectedPlano.id)
        );

        if (subPlanosProfissional.length > 0) {
          const menorSubPlano = subPlanosProfissional.reduce((menor, atual) => {
            return atual.franquia_cobrancas_mes < menor.franquia_cobrancas_mes
              ? atual
              : menor;
          });

          if (menorSubPlano) {
            setTimeout(() => {
              form.setValue("sub_plano_id", menorSubPlano.id, {
                shouldValidate: false,
              });
              lastProfissionalStateRef.current = { subPlanoId: menorSubPlano.id };
            }, 0);
          }
        }
      }
    }
  }, [
    loadingPlanos,
    planosDataTyped.bases,
    planosDataTyped.sub,
    selectedPlanoId,
    selectedPlano?.slug,
    currentStep,
    form,
    searchParams,
    selectedSubPlanoId,
    quantidadePersonalizada
  ]);

  // Price Calculation Logic
  const getQuantidadeMinima = () => {
    return getQuantidadeMinimaPersonalizada(
      planosDataTyped.bases,
      planosDataTyped.sub
    );
  };

  useEffect(() => {
    if (
      !quantidadePersonalizada ||
      selectedPlano?.slug !== PLANO_PROFISSIONAL ||
      planosDataTyped.sub.length === 0
    ) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      form.setValue("quantidade_personalizada", undefined);
      quantidadeCalculandoRef.current = null;
      planoIdCalculandoRef.current = null;
      return;
    }

    const quantidade = parseInt(quantidadePersonalizada);
    if (isNaN(quantidade) || quantidade <= 0) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      form.setValue("quantidade_personalizada", undefined);
      quantidadeCalculandoRef.current = null;
      planoIdCalculandoRef.current = null;
      return;
    }

    const quantidadeMinima = getQuantidadeMinima();
    if (!quantidadeMinima || quantidade < quantidadeMinima) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      form.setValue("quantidade_personalizada", undefined);
      quantidadeCalculandoRef.current = null;
      planoIdCalculandoRef.current = null;
      return;
    }

    // Optimization: check cache ref
    if (
      lastProfissionalStateRef.current &&
      lastProfissionalStateRef.current.quantidadePersonalizada === String(quantidade) &&
      lastProfissionalStateRef.current.precoPreview !== undefined
    ) {
      setPrecoCalculadoPreview(lastProfissionalStateRef.current.precoPreview);
      setIsCalculandoPreco(false);
      quantidadeCalculandoRef.current = quantidade;
      planoIdCalculandoRef.current = selectedPlano.id;
      return;
    }

    // Debounce
    setPrecoCalculadoPreview(null);
    setIsCalculandoPreco(true);
    const quantidadeAtual = quantidade;
    const planoIdAtual = selectedPlano.id;
    quantidadeCalculandoRef.current = quantidadeAtual;
    planoIdCalculandoRef.current = planoIdAtual;

    const timeoutId = setTimeout(() => {
      if (
        quantidadeCalculandoRef.current !== quantidadeAtual ||
        planoIdCalculandoRef.current !== planoIdAtual
      ) {
        setIsCalculandoPreco(false);
        return;
      }

      calcularPrecoPreview.mutate(quantidadeAtual, {
        onSuccess: (resultado) => {
          const aindaEhRelevante =
            quantidadeCalculandoRef.current === quantidadeAtual &&
            planoIdCalculandoRef.current === planoIdAtual &&
            quantidadePersonalizada === String(quantidadeAtual);

          if (!aindaEhRelevante) {
            setIsCalculandoPreco(false);
            return;
          }

          if (resultado) {
            setPrecoCalculadoPreview({
              preco: resultado.preco,
              valorPorCobranca: resultado.valorPorCobranca,
            });
            form.setValue("quantidade_personalizada", quantidadeAtual);
            form.setValue("sub_plano_id", undefined);
            
            if (selectedPlano?.slug === PLANO_PROFISSIONAL) {
              lastProfissionalStateRef.current = {
                quantidadePersonalizada: String(quantidadeAtual),
                precoPreview: {
                  preco: resultado.preco,
                  valorPorCobranca: resultado.valorPorCobranca,
                }
              };
            }
          } else {
            setPrecoCalculadoPreview(null);
            form.setValue("quantidade_personalizada", undefined);
          }
          setIsCalculandoPreco(false);
        },
        onError: (error: any) => {
          const aindaEhRelevante =
            quantidadeCalculandoRef.current === quantidadeAtual &&
            planoIdCalculandoRef.current === planoIdAtual &&
            form.getValues("plano_id") === planoIdAtual &&
            !form.getValues("sub_plano_id") &&
            quantidadePersonalizada === String(quantidadeAtual);

          if (!aindaEhRelevante) {
            setIsCalculandoPreco(false);
            return;
          }

          toast.error("sistema.erro.calcularPreco", {
            description: error.message || "Não foi possível calcular o preço.",
          });
          setPrecoCalculadoPreview(null);
          form.setValue("quantidade_personalizada", undefined);
          setIsCalculandoPreco(false);
        },
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsCalculandoPreco(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantidadePersonalizada, selectedPlano, planosDataTyped.sub]);

  // --- Handlers ---

  const handleSelectSubPlano = (subPlanoId: string | undefined) => {
    if (subPlanoId) {
      const planoProfissional = planosDataTyped.bases.find(
        (p) => p.slug === PLANO_PROFISSIONAL
      );
      if (planoProfissional) {
        form.setValue("plano_id", planoProfissional.id, { shouldValidate: true });
        form.setValue("sub_plano_id", subPlanoId, { shouldValidate: true });
        form.setValue("quantidade_personalizada", undefined);
        setQuantidadePersonalizada("");
        setPrecoCalculadoPreview(null);
        quantidadeCalculandoRef.current = null;
        planoIdCalculandoRef.current = null;
        lastProfissionalStateRef.current = { subPlanoId };
      }
    } else {
      form.setValue("sub_plano_id", undefined);
    }
  };

  const handleQuantidadePersonalizadaConfirm = () => {
    const quantidade = parseInt(quantidadePersonalizada);
    const quantidadeMinima = getQuantidadeMinima();

    if (isNaN(quantidade) || !quantidadeMinima || quantidade < quantidadeMinima) {
      toast.error("validacao.campoObrigatorio", {
        description: quantidadeMinima
          ? `A quantidade mínima é ${quantidadeMinima} cobranças.`
          : "Não foi possível determinar a quantidade mínima.",
      });
      return;
    }

    if (precoCalculadoPreview === null) {
      toast.error("erro.operacao", {
        description: "Não foi possível calcular o preço. Tente novamente.",
      });
      return;
    }

    form.setValue("quantidade_personalizada", quantidade, { shouldValidate: true });
    form.setValue("sub_plano_id", undefined);
    
    if (selectedPlano?.slug === PLANO_PROFISSIONAL) {
      form.setValue("plano_id", selectedPlano.id, { shouldValidate: true });
      lastProfissionalStateRef.current = { 
        quantidadePersonalizada,
        precoPreview: precoCalculadoPreview
      };
    }
  };

  const handleFinalRegister = async (data: RegisterFormData) => {
    if (!selectedPlano) return;
    try {
      let result;
      if (selectedPlano.slug === PLANO_GRATUITO) {
        result = await usuarioApi.registrarPlanoGratuito({
          ...data,
          plano_id: selectedPlano.id,
          sub_plano_id: selectedSubPlanoId,
        });
      } else if (selectedPlano.slug === PLANO_ESSENCIAL) {
        result = await usuarioApi.registrarPlanoEssencial({
          ...data,
          plano_id: selectedPlano.id,
          sub_plano_id: selectedSubPlanoId,
        });
      } else {
        // Para Profissional ou outros capturados no handleNextStep
        throw new Error("Este plano requer ativação via pagamento. Por favor, siga o fluxo de pagamento.");
      }

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
      } else {
        // Garantir propagação da sessão
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
      }
    } catch (err: any) {
      toast.error("cadastro.erro.criar", {
        description: err.response?.data?.error || err.message || "Ocorreu um problema.",
      });
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const ok = await form.trigger("plano_id");
      if (!ok) return false;

      if (selectedPlano?.slug === PLANO_PROFISSIONAL) {
        const temSubPlano = !!selectedSubPlanoId;
        const temQuantidadePersonalizada =
          !!form.getValues("quantidade_personalizada") &&
          precoCalculadoPreview !== null;

        if (!temSubPlano && !temQuantidadePersonalizada) {
          return false;
        }
      }
      setCurrentStep(2);
      return true;
    }

    if (currentStep === 2) {
      const fields: (keyof RegisterFormData)[] = [
        "nome", "apelido", "cpfcnpj", "email", "telefone", "senha",
      ];
      const ok = await form.trigger(fields as any);
      if (!ok) return false;

      if (selectedPlano?.slug === PLANO_PROFISSIONAL && requiresPayment) {
        try {
          setLoading(true);
          const formValues = form.getValues();
          const result = await usuarioApi.registrarPlanoProfissional({
            ...formValues,
            plano_id: selectedPlano.id,
            sub_plano_id: formValues.quantidade_personalizada ? undefined : selectedSubPlanoId,
            quantidade_personalizada: formValues.quantidade_personalizada,
          });

          if (result?.error) throw new Error(result.error);

          // Suporte para nova estrutura (aninhada em pix) e antiga (plana)
          const pixData = (result as any).pix || result;
          const qrCode = pixData.qrCodePayload;
          const location = pixData.qrCodeUrl || pixData.location;

          if (qrCode && (result as any).cobrancaId) {
            setPagamentoDialog({
              isOpen: true,
              cobrancaId: String((result as any).cobrancaId),
              valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
              initialData: {
                qrCodePayload: qrCode,
                location: location,
                inter_txid: result.inter_txid,
                cobrancaId: String(result.cobrancaId)
              }
            });
            if ((result as any).session) {
              (window as any).__registerSession = (result as any).session;
            }
          } else {
            console.error("Resultado de registro profissional incompleto:", result);
            toast.error("cadastro.erro.criar", {
              description: "Não foi possível gerar os dados para pagamento. Por favor, tente novamente ou entre em contato com o suporte.",
            });
          }
          return true;
        } catch (err: any) {
          toast.error("cadastro.erro.criar", {
            description: err.response?.data?.error || "Não foi possível gerar o pagamento.",
          });
          return false;
        } finally {
          setLoading(false);
        }
      }

      try {
        setLoading(true);
        await handleFinalRegister(form.getValues());
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        setLoading(false);
      }
    }
    return true;
  };

  const handlePaymentSuccess = async () => {
    const sessionToSet = (window as any).__registerSession;
    if (!sessionToSet) {
      navigate(ROUTES.PUBLIC.LOGIN);
      return;
    }

    const { error } = await sessionManager.setSession(
      sessionToSet.access_token,
      sessionToSet.refresh_token,
      sessionToSet.user
    );

    if (error) {
      toast.info("cadastro.info.pagamentoConfirmado");
      navigate(ROUTES.PUBLIC.LOGIN);
    } else {
       // Aguardar propagação da sessão
       await new Promise(resolve => setTimeout(resolve, 500));
       
       const planoNome = selectedPlano?.nome || "seu plano";
      const quantidadeInfo = selectedSubPlano
        ? selectedSubPlano.franquia_cobrancas_mes
        : form.getValues("quantidade_personalizada");

      setPagamentoSucessoDialog({
        isOpen: true,
        nomePlano: planoNome,
        quantidadePassageiros: Number(quantidadeInfo) || 0,
      });
      delete (window as any).__registerSession;
    }
  };

  return {
    form,
    loading,
    currentStep,
    setCurrentStep,
    planosDataTyped,
    loadingPlanos,
    selectedPlano,
    selectedPlanoId,
    selectedSubPlano,
    selectedSubPlanoId,
    quantidadePersonalizada,
    setQuantidadePersonalizada,
    isCalculandoPreco: isCalculandoPreco || calcularPrecoPreview.isPending,
    precoCalculadoPreview,
    pagamentoDialog,
    setPagamentoDialog,
    pagamentoSucessoDialog,
    setPagamentoSucessoDialog,
    handleNextStep,
    handleSelectSubPlano,
    handleQuantidadePersonalizadaConfirm,
    handlePaymentSuccess,
    handleFillMagic,
    getQuantidadeMinima,
    requiresPayment,
  };
}
