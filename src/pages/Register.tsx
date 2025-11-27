// React
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate } from "react-router-dom";

// Third-party
import { zodResolver } from "@hookform/resolvers/zod";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { z } from "zod";

// Components - Features
import { PagamentoPix } from "@/components/features/pagamento/PagamentoPix";
import { isPlanoPagoNoAto } from "@/components/features/register";
import { TermosUsoDialog } from "@/components/features/register/TermosUsoDialog";

// Components - Features - Register (Lazy Loaded)
const StepIndicator = lazy(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.StepIndicator,
  }))
);
const CadastroForm = lazy(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.CadastroForm,
  }))
);
const PlanSummary = lazy(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.PlanSummary,
  }))
);
const PlanoCard = lazy(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.PlanoCard,
  }))
);

// Components - UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Services
import { useCalcularPrecoPreview, usePlanos } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { usuarioApi } from "@/services";

// Utils
import { cn } from "@/lib/utils";
import { toast } from "@/utils/notifications/toast";
import { isValidCPF } from "@/utils/validators";

// Constants
import {
  ASSINATURA_COBRANCA_STATUS_PAGO,
  PLANO_COMPLETO,
  PLANO_GRATUITO,
} from "@/constants";

// Types
import { Plano, SubPlano } from "@/types/plano";

// Components - UI
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { getQuantidadeMinimaPersonalizada } from "@/utils/domain/plano/planoUtils";
import { Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const registerSchema = z.object({
  plano_id: z.string().min(1, "Selecione um plano para continuar"),
  sub_plano_id: z.string().optional(),
  quantidade_personalizada: z.number().optional(),
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  cpfcnpj: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => isValidCPF(val), "CPF inválido"),
  email: z.string().min(1, "Campo obrigatório").email("E-mail inválido"),
  telefone: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => val.replace(/\D/g, "").length === 11, "Telefone inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  // Permitir indexação da página de cadastro
  useSEO({
    noindex: false,
    title: "Cadastro - Van360 | Crie sua conta grátis",
    description: "Cadastre-se no Van360 e comece a gerenciar seu transporte escolar. Planos gratuitos e pagos disponíveis. Sem fidelidade.",
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dadosPagamento, setDadosPagamento] = useState<any>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const prevStepRef = useRef<number>(currentStep);
  // Ref para rastrear a quantidade sendo calculada (evita race condition)
  const quantidadeCalculandoRef = useRef<number | null>(null);
  const planoIdCalculandoRef = useRef<string | null>(null);
  // Usar hook do React Query para buscar planos
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
  const [quantidadePersonalizada, setQuantidadePersonalizada] =
    useState<string>("");
  const [precoCalculadoPreview, setPrecoCalculadoPreview] = useState<{
    preco: number;
    valorPorCobranca: number;
  } | null>(null);
  const [isCalculandoPreco, setIsCalculandoPreco] = useState(false);
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "Thiago Barros Abilio",
      apelido: "Tio Grátis",
      cpfcnpj: "395.423.918-38",
      email: "thiago-svl@hotmail.com",
      telefone: "(11) 95118-6951",
      senha: "Ogaiht+1",
      plano_id: "",
      sub_plano_id: undefined,
      quantidade_personalizada: undefined,
    },
  });

  const selectedPlanoId = form.watch("plano_id");
  const selectedSubPlanoId = form.watch("sub_plano_id");

  const selectedPlano = planosDataTyped.bases.find(
    (p) => p.id === selectedPlanoId
  );
  const selectedSubPlano = planosDataTyped.sub.find(
    (s) => s.id === selectedSubPlanoId
  );

  // Para o plano Completo, verificar se o sub-plano selecionado requer pagamento
  const requiresPayment = selectedPlano
    ? selectedPlano.slug === PLANO_COMPLETO && selectedSubPlano
      ? isPlanoPagoNoAto(selectedPlano, selectedSubPlano)
      : selectedPlano.slug === PLANO_COMPLETO &&
        form.getValues("quantidade_personalizada")
      ? isPlanoPagoNoAto(selectedPlano)
      : isPlanoPagoNoAto(selectedPlano)
    : false;

  // Sempre exibir 3 steps, mas riscar o pagamento se não for necessário
  const steps = ["Plano", "Cadastro", "Pagamento"];
  const showPaymentStep =
    selectedPlano?.slug === PLANO_COMPLETO && requiresPayment;

  // finalStep: Completo com pagamento = 3, Completo sem pagamento ou outros = 2
  const finalStep = showPaymentStep ? 3 : 2;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, dadosPagamento, form]);

  useEffect(() => {
    if (currentStep < prevStepRef.current) {
      if (currentStep === 1) {
        // Apenas limpar refs quando voltar para o step 1
        quantidadeCalculandoRef.current = null;
        planoIdCalculandoRef.current = null;
      }
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Seleção automática do plano Completo ao entrar na tela (se nenhum plano estiver selecionado)
  useEffect(() => {
    if (
      !loadingPlanos &&
      planosDataTyped.bases.length > 0 &&
      !selectedPlanoId &&
      currentStep === 1
    ) {
      const planoCompleto = planosDataTyped.bases.find(
        (p) => p.slug === PLANO_COMPLETO
      );
      if (planoCompleto && planosDataTyped.sub.length > 0) {
        form.setValue("plano_id", planoCompleto.id, {
          shouldValidate: false,
        });

        // Selecionar o menor sub-plano imediatamente
        const subPlanosCompleto = planosDataTyped.sub.filter(
          (s) => String(s.parent_id) === String(planoCompleto.id)
        );

        if (subPlanosCompleto.length > 0) {
          const menorSubPlano = subPlanosCompleto.reduce((menor, atual) => {
            return atual.franquia_cobrancas_mes < menor.franquia_cobrancas_mes
              ? atual
              : menor;
          });

          if (menorSubPlano) {
            // Usar setTimeout para garantir que o plano_id foi atualizado primeiro
            setTimeout(() => {
              form.setValue("sub_plano_id", menorSubPlano.id, {
                shouldValidate: false,
              });
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
    currentStep,
    form,
  ]);

  // Seleção automática do menor sub-plano quando o plano Completo é selecionado
  // Mas apenas se não houver quantidade personalizada sendo digitada ou slider expandido
  useEffect(() => {
    // Adicionar um pequeno delay para evitar conflito quando o slider é expandido
    const timeoutId = setTimeout(() => {
      if (
        selectedPlano?.slug === PLANO_COMPLETO &&
        planosDataTyped.sub.length > 0 &&
        !selectedSubPlanoId &&
        !form.getValues("quantidade_personalizada") &&
        !quantidadePersonalizada && // Verificar também o estado local para evitar seleção quando slider está expandido
        currentStep === 1 // Apenas no step de seleção de plano
      ) {
        // Encontrar o menor sub-plano (menor franquia)
        const subPlanosCompleto = planosDataTyped.sub.filter(
          (s) => String(s.parent_id) === String(selectedPlano.id)
        );

        if (subPlanosCompleto.length > 0) {
          const menorSubPlano = subPlanosCompleto.reduce((menor, atual) => {
            return atual.franquia_cobrancas_mes < menor.franquia_cobrancas_mes
              ? atual
              : menor;
          });

          if (menorSubPlano) {
            form.setValue("sub_plano_id", menorSubPlano.id, {
              shouldValidate: false,
            });
          }
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    selectedPlano?.id,
    selectedPlano?.slug,
    planosDataTyped.sub,
    selectedSubPlanoId,
    quantidadePersonalizada,
    currentStep,
    form,
  ]);

  useEffect(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
      realtimeChannelRef.current = null;
    }

    // only listen during payment step when we have a cobrancaId (agora step 3, não 4)
    if (currentStep !== 3 || !dadosPagamento?.cobrancaId) return;

    let mounted = true;
    let poller: ReturnType<typeof setInterval> | null = null;

    const checkPaymentStatus = async () => {
      try {
        // Usar a API ao invés de consulta direta ao Supabase
        // A tabela pode ser uma view ou ter nome diferente
        const { data, error } = await supabase
          .from("cobrancas")
          .select("status")
          .eq("id", dadosPagamento.cobrancaId)
          .maybeSingle();

        if (error) {
          return;
        }

        if (data?.status === ASSINATURA_COBRANCA_STATUS_PAGO) {
          if (mounted) handlePostPaymentSuccess(dadosPagamento.session);
        }
      } catch (err) {
        // Erro silencioso - polling continuará tentando
      }
    };

    const setupRealtime = async () => {
      if (!poller) {
        poller = setInterval(() => {
          if (!mounted) return;
          checkPaymentStatus();
        }, 5000);
      }

      try {
        const channel = supabase.channel("public:assinaturas_cobrancas").on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "assinaturas_cobrancas",
            filter: `id=eq.${dadosPagamento.cobrancaId}`,
          },
          (payload) => {
            try {
              if (payload?.new?.status === ASSINATURA_COBRANCA_STATUS_PAGO) {
                if (mounted) handlePostPaymentSuccess(dadosPagamento.session);
              }
            } catch (cbErr) {
              // Erro silencioso no callback realtime
            }
          }
        );

        const subscribeResult = await channel.subscribe();

        const isSubscribed =
          (subscribeResult &&
            (subscribeResult as any).status === "SUBSCRIBED") ||
          (subscribeResult && (subscribeResult as any).status === "ok") ||
          (subscribeResult && (subscribeResult as any).status === "OK");

        if (isSubscribed) {
          realtimeChannelRef.current = channel;
          if (poller) {
            clearInterval(poller);
            poller = null;
          }
          poller = setInterval(() => {
            if (!mounted) return;
            checkPaymentStatus();
          }, 30000);
        } else {
          throw new Error("Subscribe não retornou confirmação de inscrição.");
        }
      } catch (err) {
        // Se realtime falhar, o polling já está ativo com intervalo de 5s (definido acima)
        // Não precisamos fazer nada aqui, o polling já está rodando
      }
    };

    // quick initial check in case the payment already completed
    checkPaymentStatus();
    setupRealtime();

    return () => {
      mounted = false;
      if (poller) {
        clearInterval(poller);
        poller = null;
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
        realtimeChannelRef.current = null;
      }
    };
  }, [currentStep, dadosPagamento]);

  const handlePostPaymentSuccess = async (session?: any) => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const sessionToSet = session || dadosPagamento?.session;

    if (!sessionToSet) {
      const { email } = form.getValues();
      toast.error("auth.erro.login", {
        description: `Login automático falhou. Faça login manual com o email: ${email}`,
      });
      navigate("/login");
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: sessionToSet.access_token,
      refresh_token: sessionToSet.refresh_token,
    });

    if (error) {
      toast.info("cadastro.info.pagamentoConfirmado", {
        description: "cadastro.info.pagamentoConfirmadoDescricao",
      });
    } else {
      // Mostrar toast de sucesso antes do redirect
      const planoNome = selectedPlano?.nome || "seu plano";
      const quantidadeInfo = selectedSubPlano
        ? `${selectedSubPlano.franquia_cobrancas_mes} passageiros`
        : form.getValues("quantidade_personalizada")
        ? `${form.getValues("quantidade_personalizada")} passageiros`
        : "";

      toast.success("Pagamento confirmado!", {
        description: `Seu plano ${planoNome} foi ativado com sucesso.${
          quantidadeInfo ? ` ${quantidadeInfo} terão cobrança automática.` : ""
        }`,
      });

      // Aguardar um pouco para o usuário ver o toast antes do redirect
      setTimeout(() => {
        navigate("/inicio");
      }, 2000);
    }
  };

  const handleSelectSubPlano = (subPlanoId: string | undefined) => {
    if (subPlanoId) {
      // Encontrar o plano Completo
      const planoCompleto = planosDataTyped.bases.find(
        (p) => p.slug === PLANO_COMPLETO
      );

      if (planoCompleto) {
        // Sempre selecionar o plano Completo quando um sub-plano é selecionado
        form.setValue("plano_id", planoCompleto.id, { shouldValidate: true });
        form.setValue("sub_plano_id", subPlanoId, { shouldValidate: true });
        form.setValue("quantidade_personalizada", undefined);
        setQuantidadePersonalizada("");
        setPrecoCalculadoPreview(null);
        // Limpar refs para cancelar qualquer cálculo em andamento
        quantidadeCalculandoRef.current = null;
        planoIdCalculandoRef.current = null;
      }
    } else {
      // Limpar seleção
      form.setValue("sub_plano_id", undefined);
    }
  };

  const handleQuantidadePersonalizadaConfirm = () => {
    const quantidade = parseInt(quantidadePersonalizada);
    const quantidadeMinima = getQuantidadeMinima();

    if (
      isNaN(quantidade) ||
      !quantidadeMinima ||
      quantidade < quantidadeMinima
    ) {
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

    form.setValue("quantidade_personalizada", quantidade, {
      shouldValidate: true,
    });
    form.setValue("sub_plano_id", undefined);
    // Selecionar o plano Completo automaticamente
    if (selectedPlano?.slug === PLANO_COMPLETO) {
      form.setValue("plano_id", selectedPlano.id, { shouldValidate: true });
    }
  };

  // Usar utilitários compartilhados
  const getQuantidadeMinima = () => {
    return getQuantidadeMinimaPersonalizada(
      planosDataTyped.bases,
      planosDataTyped.sub
    );
  };

  useEffect(() => {
    if (
      !quantidadePersonalizada ||
      selectedPlano?.slug !== PLANO_COMPLETO ||
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

    // Verificar quantidade mínima
    const quantidadeMinima = getQuantidadeMinima();
    if (!quantidadeMinima || quantidade < quantidadeMinima) {
      setPrecoCalculadoPreview(null);
      setIsCalculandoPreco(false);
      form.setValue("quantidade_personalizada", undefined);
      quantidadeCalculandoRef.current = null;
      planoIdCalculandoRef.current = null;
      return;
    }

    // Debounce: aguardar 500ms antes de buscar
    setIsCalculandoPreco(true);
    const quantidadeAtual = quantidade;
    const planoIdAtual = selectedPlano.id;
    quantidadeCalculandoRef.current = quantidadeAtual;
    planoIdCalculandoRef.current = planoIdAtual;

    const timeoutId = setTimeout(() => {
      // Verificar novamente se ainda é a mesma quantidade e plano antes de fazer a requisição
      if (
        quantidadeCalculandoRef.current !== quantidadeAtual ||
        planoIdCalculandoRef.current !== planoIdAtual
      ) {
        setIsCalculandoPreco(false);
        return;
      }

      calcularPrecoPreview.mutate(quantidadeAtual, {
        onSuccess: (resultado) => {
          // Verificar se ainda estamos calculando a mesma quantidade e no mesmo plano
          // e se não há sub-plano selecionado (ou seja, ainda estamos no modo personalizado)
          const aindaEhRelevante =
            quantidadeCalculandoRef.current === quantidadeAtual &&
            planoIdCalculandoRef.current === planoIdAtual &&
            form.getValues("plano_id") === planoIdAtual &&
            !form.getValues("sub_plano_id") &&
            quantidadePersonalizada === String(quantidadeAtual);

          if (!aindaEhRelevante) {
            // Resultado não é mais relevante, ignorar
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
          } else {
            setPrecoCalculadoPreview(null);
            form.setValue("quantidade_personalizada", undefined);
          }
          setIsCalculandoPreco(false);
        },
        onError: (error: any) => {
          // Verificar se ainda é relevante antes de mostrar erro
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
      // Não limpar os refs aqui, pois a requisição pode ainda estar em andamento
      // Os refs serão limpos quando o useEffect rodar novamente ou quando o usuário mudar de plano
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantidadePersonalizada, selectedPlano, planosDataTyped.sub]);

  const onFormError = (errors: any) => {
    if (errors.plano_id) setCurrentStep(1);
    toast.error("validacao.formularioComErros", {
      description: "Verifique os campos em vermelho.",
    });
    setLoading(false);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const ok = await form.trigger("plano_id");
      if (!ok) return false;

      // Se for Completo, verificar se há uma seleção válida
      // A validação com toast já é feita no botão "Escolher Plano" do card
      if (selectedPlano?.slug === PLANO_COMPLETO) {
        // Verificar se tem sub_plano_id ou quantidade_personalizada com preço calculado
        const temSubPlano = !!selectedSubPlanoId;
        const temQuantidadePersonalizada =
          !!form.getValues("quantidade_personalizada") &&
          precoCalculadoPreview !== null;

        if (!temSubPlano && !temQuantidadePersonalizada) {
          // Não mostrar toast aqui, pois já é mostrado no botão do card
          return false; // Não avançar, precisa selecionar uma opção
        }
      }

      // Avançar para o step 2 (formulário)
      setCurrentStep(2);
      return true;
    }

    if (currentStep === 2) {
      const fields: (keyof RegisterFormData)[] = [
        "nome",
        "apelido",
        "cpfcnpj",
        "email",
        "telefone",
        "senha",
      ];
      const ok = await form.trigger(fields as any);
      if (!ok) return false;

      // Se é Completo e requer pagamento, avançar para step 3 (pagamento)
      if (selectedPlano?.slug === PLANO_COMPLETO && requiresPayment) {
        try {
          setLoading(true);

          const formValues = form.getValues();
          const result = await usuarioApi.registrarPlanoCompleto({
            ...formValues,
            plano_id: selectedPlano.id,
            sub_plano_id: formValues.quantidade_personalizada
              ? undefined
              : selectedSubPlanoId,
            quantidade_personalizada: formValues.quantidade_personalizada,
          });

          if (result?.error) throw new Error(result.error);

          setDadosPagamento(result);
          setCurrentStep(3); // Avançar para step 3 (pagamento), não 4
          return true;
        } catch (err: any) {
          toast.error("cadastro.erro.criar", {
            description:
              err.response?.data?.error ||
              "Não foi possível gerar o pagamento.",
          });
          return false;
        } finally {
          setLoading(false);
        }
      }

      // Se não requer pagamento, o formulário será submetido via handleFinalRegister
      return true;
    }

    // Step 3 é apenas para pagamento (não deve chegar aqui via handleNextStep)
    return true;
  };

  const handleFinalRegister = async (data: RegisterFormData) => {
    if (!selectedPlano) return;

    try {
      setLoading(true);

      let result;
      if (selectedPlano.slug === PLANO_GRATUITO) {
        result = await usuarioApi.registrarPlanoGratuito({
          ...data,
          plano_id: selectedPlano.id,
          sub_plano_id: selectedSubPlanoId,
        });
      } else {
        result = await usuarioApi.registrarPlanoEssencial({
          ...data,
          plano_id: selectedPlano.id,
          sub_plano_id: selectedSubPlanoId,
        });
      }

      if (result?.error) throw new Error(result.error);

      const { error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (error) {
        toast.error("auth.erro.login", {
          description:
            "Cadastro realizado, mas não foi possível fazer login automático.",
        });
      } else {
        navigate("/inicio");
      }
    } catch (err: any) {
      toast.error("cadastro.erro.criar", {
        description:
          err.response?.data?.error ||
          err.message ||
          "Ocorreu um problema ao finalizar o cadastro.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <section className="space-y-3 sm:space-y-4 md:space-y-5">
            {!loadingPlanos && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planosDataTyped.bases.map((plano) => (
                  <Suspense
                    key={plano.id}
                    fallback={<Skeleton className="h-96 w-full" />}
                  >
                    <PlanoCard
                      plano={plano}
                      subPlanos={planosDataTyped.sub.filter(
                        (s) => String(s.parent_id) === String(plano.id)
                      )}
                      isSelected={selectedPlanoId === plano.id}
                      selectedSubPlanoId={selectedSubPlanoId}
                      quantidadePersonalizada={quantidadePersonalizada}
                      onSubPlanoSelect={handleSelectSubPlano}
                      onQuantidadePersonalizadaChange={
                        setQuantidadePersonalizada
                      }
                      precoCalculadoPreview={
                        precoCalculadoPreview?.preco ?? null
                      }
                      valorPorCobranca={
                        precoCalculadoPreview?.valorPorCobranca ?? null
                      }
                      isCalculandoPreco={
                        isCalculandoPreco || calcularPrecoPreview.isPending
                      }
                      getQuantidadeMinima={getQuantidadeMinima}
                      onQuantidadePersonalizadaConfirm={
                        handleQuantidadePersonalizadaConfirm
                      }
                      onAvancarStep={async () => {
                        // Avançar para o próximo step quando clicar no botão "Escolher Plano"
                        await handleNextStep();
                      }}
                      autoAdvanceOnSubPlanoSelect={false}
                      onSelect={(id) => {
                        const planoSelecionado = planosDataTyped.bases.find(
                          (p) => p.id === id
                        );

                        // Se trocar de plano, limpar seleções anteriores
                        if (selectedPlanoId && selectedPlanoId !== id) {
                          form.setValue("sub_plano_id", undefined);
                          form.setValue("quantidade_personalizada", undefined);
                          setQuantidadePersonalizada("");
                          setPrecoCalculadoPreview(null);
                          // Limpar refs para cancelar qualquer cálculo em andamento
                          quantidadeCalculandoRef.current = null;
                          planoIdCalculandoRef.current = null;
                        }

                        // Se for Completo, apenas selecionar o plano (não abre modal)
                        // A seleção de sub-plano será feita via radios
                        if (planoSelecionado?.slug === PLANO_COMPLETO) {
                          form.setValue("plano_id", id);
                        } else {
                          // Para outros planos, selecionar normalmente
                          form.setValue("plano_id", id);
                          form.setValue("sub_plano_id", undefined);
                          form.setValue("quantidade_personalizada", undefined);
                          setQuantidadePersonalizada("");
                          setPrecoCalculadoPreview(null);
                          // Limpar refs para cancelar qualquer cálculo em andamento
                          quantidadeCalculandoRef.current = null;
                          planoIdCalculandoRef.current = null;
                        }
                      }}
                    />
                  </Suspense>
                ))}
              </div>
            )}

            <FormField
              control={form.control}
              name="plano_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="hidden" className="hidden" />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>
        );

      case 2:
        return (
          <section className="space-y-6 rounded-lg">
            {selectedPlano && (
              <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                <PlanSummary
                  plano={selectedPlano}
                  subPlano={selectedSubPlano}
                  quantidadePersonalizada={form.watch(
                    "quantidade_personalizada"
                  )}
                  precoPersonalizado={precoCalculadoPreview?.preco || undefined}
                />
              </Suspense>
            )}
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <CadastroForm form={form as any} />
            </Suspense>
          </section>
        );

      case 3:
        // Step 3 é apenas pagamento (Completo com pagamento no ato)
        return (
          <PagamentoPix
            dadosPagamento={dadosPagamento}
            titulo=""
            planos={planosDataTyped.bases}
            subPlanos={planosDataTyped.sub}
            selectedPlanoId={selectedPlanoId}
            selectedSubPlanoId={selectedSubPlanoId}
            quantidadePersonalizada={
              form.watch("quantidade_personalizada") || undefined
            }
          />
        );

      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (currentStep === 1) return "Avançar";
    if (currentStep === 2) {
      // Se é Completo e requer pagamento, avançar para pagamento
      if (selectedPlano?.slug === PLANO_COMPLETO && requiresPayment) {
        return "Avançar";
      }
      // Caso contrário, confirmar cadastro
      return "Confirmar";
    }
    // Step 3 é pagamento (não tem botão, mostra loader)
    return "Avançar";
  };

  const handleStepAction = async () => {
    if (loading) return;
    form.clearErrors();
    setLoading(true);

    const isLastStepCadastro =
      currentStep === finalStep && selectedPlano?.slug !== PLANO_COMPLETO;

    if (isLastStepCadastro) {
      await form.handleSubmit(handleFinalRegister, onFormError)();
    } else {
      const success = await handleNextStep();

      if (success === false) {
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  };

  if (loadingPlanos) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100",
        // REDUZIDO: padding vertical geral (era py-6 sm:py-10)
        "items-center justify-start py-4 sm:py-8 pb-20"
      )}
    >
      {/* Wrapper principal - Aumentado max-width para dar mais ar */}
      <div className="w-full max-w-5xl mx-auto flex flex-col px-3 sm:px-6">
        {/* HEADER UNIFICADO - Reduzido margens verticais */}
        <div className="w-full flex flex-col items-center mb-4 sm:mb-6">
          <img
            src="/assets/logo-van360.png"
            alt="Van360"
            // REDUZIDO: tamanho do logo e margem inferior
            className="h-8 sm:h-10 w-auto mb-3"
          />

          <h1 className="text-xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            {currentStep === 1 && "Escolha Seu Plano"}
            {currentStep === 2 && "Dados do Cadastro"}
            {currentStep === 3 && "Pagamento e Confirmação"}
          </h1>

          <div className="w-full max-w-md mt-1">
            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
              <StepIndicator
                currentStep={currentStep}
                steps={steps}
                requiresPayment={showPaymentStep}
              />
            </Suspense>
          </div>
        </div>

        {/* CONTAINER DE CONTEÚDO */}
        <Card
          className={cn(
            "w-full mx-auto",
            currentStep === 1
              ? "bg-transparent border-none shadow-none"
              : "bg-white shadow-xl rounded-xl border-gray-200 overflow-hidden"
          )}
        >
          <CardContent
            className={cn(
              "p-0",
              // REDUZIDO: padding interno no mobile para ganhar espaço lateral
              currentStep === 1 ? "" : "p-4 sm:p-8"
            )}
          >
            <div data-plano-slug={selectedPlano?.slug || ""}>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStepAction();
                  }}
                  className="space-y-6"
                >
                  {/* Renderiza o step atual */}
                  {renderStep()}

                  {/* Termos de Uso (apenas no step 2) */}
                  {currentStep === 2 && <TermosUsoDialog />}

                  {/* Botões de Avançar e Voltar */}
                  <div className="flex justify-between gap-3 px-3 pt-4 pb-2">
                    {currentStep !== 1 && (
                      <Button
                        type="button"
                        variant={currentStep === 3 ? "ghost" : "outline"}
                        onClick={() => {
                          // Antes de voltar, resetar seleções e selecionar o Completo
                          form.setValue("sub_plano_id", undefined);
                          form.setValue("quantidade_personalizada", undefined);
                          setQuantidadePersonalizada("");
                          setPrecoCalculadoPreview(null);
                          quantidadeCalculandoRef.current = null;
                          planoIdCalculandoRef.current = null;

                          // Selecionar o plano Completo e o menor sub-plano
                          const planoCompleto = planosDataTyped.bases.find(
                            (p) => p.slug === PLANO_COMPLETO
                          );
                          if (planoCompleto && planosDataTyped.sub.length > 0) {
                            form.setValue("plano_id", planoCompleto.id, {
                              shouldValidate: false,
                            });

                            // Selecionar o menor sub-plano imediatamente
                            const subPlanosCompleto =
                              planosDataTyped.sub.filter(
                                (s) =>
                                  String(s.parent_id) ===
                                  String(planoCompleto.id)
                              );

                            if (subPlanosCompleto.length > 0) {
                              const menorSubPlano = subPlanosCompleto.reduce(
                                (menor, atual) => {
                                  return atual.franquia_cobrancas_mes <
                                    menor.franquia_cobrancas_mes
                                    ? atual
                                    : menor;
                                }
                              );

                              if (menorSubPlano) {
                                form.setValue(
                                  "sub_plano_id",
                                  menorSubPlano.id,
                                  {
                                    shouldValidate: false,
                                  }
                                );
                              }
                            }
                          }

                          // Agora sim, mudar o step
                          const newStep = Math.max(1, currentStep - 1);
                          setCurrentStep(newStep);
                        }}
                        disabled={
                          loadingPlanos ||
                          loading ||
                          calcularPrecoPreview.isPending
                        }
                      >
                        Voltar
                      </Button>
                    )}
                    {currentStep !== 3 && currentStep !== 1 ? (
                      <Button
                        type="submit"
                        className="bg-primary font-semibold text-base shadow-md hover:shadow-lg transition-all"
                        disabled={
                          loadingPlanos ||
                          (currentStep === 1 && !selectedPlano) ||
                          (currentStep === 1 &&
                            selectedPlano?.slug === PLANO_COMPLETO &&
                            !selectedSubPlanoId &&
                            (!form.getValues("quantidade_personalizada") ||
                              precoCalculadoPreview === null))
                        }
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Aguarde...
                          </>
                        ) : (
                          <>{getButtonText()}</>
                        )}
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
