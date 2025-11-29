// React
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Third-party
import { zodResolver } from "@hookform/resolvers/zod";

// Schemas
import { RegisterFormData, registerSchema } from "@/schemas/registerSchema";

// Components - Features
import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { isPlanoPagoNoAto } from "@/components/features/register";
import { TermosUsoDialog } from "@/components/features/register/TermosUsoDialog";

// Components - Features - Register (Lazy Loaded)
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
const PlanoCardSelection = lazy(() =>
  import("@/components/features/register").then((mod) => ({
    default: mod.PlanoCardSelection,
  }))
);

// Components - UI
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Services
import { useCalcularPrecoPreview, usePlanos } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { usuarioApi } from "@/services";

// Utils
import { toast } from "@/utils/notifications/toast";

// Constants
import {
  PLANO_COMPLETO,
  PLANO_ESSENCIAL,
  PLANO_GRATUITO
} from "@/constants";

// Types
import { Plano, SubPlano } from "@/types/plano";

// Components - UI
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { useSEO } from "@/hooks/useSEO";
import { getQuantidadeMinimaPersonalizada } from "@/utils/domain/plano/planoStructureUtils";
import { FileText, Loader2 } from "lucide-react";

export default function Register() {
  // Permitir indexação da página de cadastro
  useSEO({
    noindex: false,
    title: "Cadastro - Van360 | Crie sua conta grátis",
    description: "Cadastre-se no Van360 e comece a gerenciar seu transporte escolar. Planos gratuitos e pagos disponíveis. Sem fidelidade.",
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [pagamentoDialog, setPagamentoDialog] = useState<{
    isOpen: boolean;
    cobrancaId: string;
    valor: number;
  } | null>(null);
  const [pagamentoSucessoDialog, setPagamentoSucessoDialog] = useState<{
    isOpen: boolean;
    nomePlano?: string;
    quantidadeAlunos?: number;
  }>({ isOpen: false });
  const prevStepRef = useRef<number>(currentStep);
  // Ref para rastrear a quantidade sendo calculada (evita race condition)
  const quantidadeCalculandoRef = useRef<number | null>(null);
  const planoIdCalculandoRef = useRef<string | null>(null);
  
  // Ref para persistir o estado do plano Completo (sub-plano ou quantidade personalizada)
  const lastCompletoStateRef = useRef<{
    subPlanoId?: string;
    quantidadePersonalizada?: string;
    precoPreview?: { preco: number; valorPorCobranca: number } | null;
  } | null>(null);

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
  const [searchParams] = useSearchParams();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "Thiago",
      apelido: "Tio Thiago",
      cpfcnpj: "395.423.918-38",
      email: "thiago@van360.com.br",
      telefone: "(11) 99999-9999",
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

  // Sempre exibir 2 steps
  const steps = ["Plano", "Cadastro"];
  const finalStep = 2;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, form]);

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

  // Processar parâmetros da URL (Landing Page Integration)
  useEffect(() => {
    if (!loadingPlanos && planosDataTyped.bases.length > 0 && !selectedPlanoId) {
      const planoParam = searchParams.get("plano");
      
      if (planoParam) {
        const planoEncontrado = planosDataTyped.bases.find(p => p.slug === planoParam);
        
        if (planoEncontrado) {
          form.setValue("plano_id", planoEncontrado.id, { shouldValidate: true });
          
          // Se for Gratuito ou Essencial, ir direto para o passo 2
          if (planoParam === PLANO_GRATUITO || planoParam === PLANO_ESSENCIAL) {
            setCurrentStep(2);
          }
          // Se for Completo, manter no passo 1 (será tratado pelo useEffect de auto-seleção abaixo)
        }
      }
    }
  }, [loadingPlanos, planosDataTyped.bases, searchParams, selectedPlanoId, form]);

  // Seleção automática do plano Completo e Restauração de Estado
  useEffect(() => {
    // Se não houver plano selecionado (e não veio da URL com outro plano), selecionar Completo
    if (
      !loadingPlanos &&
      planosDataTyped.bases.length > 0 &&
      !selectedPlanoId &&
      currentStep === 1 &&
      !searchParams.get("plano")
    ) {
      const planoCompleto = planosDataTyped.bases.find(
        (p) => p.slug === PLANO_COMPLETO
      );
      if (planoCompleto) {
        form.setValue("plano_id", planoCompleto.id, { shouldValidate: false });
      }
    }

    // Lógica específica para quando o plano Completo está selecionado
    if (
      selectedPlano?.slug === PLANO_COMPLETO &&
      planosDataTyped.sub.length > 0 &&
      currentStep === 1
    ) {
      // 1. Tentar restaurar estado anterior (se houver)
      if (lastCompletoStateRef.current) {
        const { subPlanoId, quantidadePersonalizada: qtdPers, precoPreview } = lastCompletoStateRef.current;
        // Só restaurar se não houver nada selecionado atualmente
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
          return; // Estado restaurado, não precisa fazer mais nada
        }
      }

      // 2. Se não restaurou e não tem nada selecionado, selecionar o menor sub-plano (Default)
      if (
        !selectedSubPlanoId &&
        !form.getValues("quantidade_personalizada") &&
        !quantidadePersonalizada
      ) {
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
            setTimeout(() => {
              form.setValue("sub_plano_id", menorSubPlano.id, {
                shouldValidate: false,
              });
              // Salvar este estado inicial como o "último estado" também
              lastCompletoStateRef.current = { subPlanoId: menorSubPlano.id };
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
    // Dependências adicionais para a lógica de restauração
    selectedSubPlanoId,
    quantidadePersonalizada
  ]);

  // Handler para quando o pagamento for confirmado
  const handlePaymentSuccess = async () => {
    const sessionToSet = (window as any).__registerSession;

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
      // Mostrar dialog de sucesso
      const planoNome = selectedPlano?.nome || "seu plano";
      const quantidadeInfo = selectedSubPlano
        ? selectedSubPlano.franquia_cobrancas_mes
        : form.getValues("quantidade_personalizada")
        ? form.getValues("quantidade_personalizada")
        : undefined;

      setPagamentoSucessoDialog({
        isOpen: true,
        nomePlano: planoNome,
        quantidadeAlunos: quantidadeInfo,
      });

      // Limpar session temporária
      delete (window as any).__registerSession;
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
        
        // Persistir estado
        lastCompletoStateRef.current = { subPlanoId };
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
      
      // Persistir estado
      lastCompletoStateRef.current = { 
        quantidadePersonalizada,
        precoPreview: precoCalculadoPreview
      };
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

    // OTIMIZAÇÃO: Verificar se já temos esse preço calculado no ref de persistência
    if (
      lastCompletoStateRef.current &&
      lastCompletoStateRef.current.quantidadePersonalizada === String(quantidade) &&
      lastCompletoStateRef.current.precoPreview !== undefined
    ) {
      setPrecoCalculadoPreview(lastCompletoStateRef.current.precoPreview);
      setIsCalculandoPreco(false);
      quantidadeCalculandoRef.current = quantidade;
      planoIdCalculandoRef.current = selectedPlano.id;
      return;
    }

    // Debounce: aguardar 500ms antes de buscar
    setPrecoCalculadoPreview(null); // Limpar preço anterior para forçar loader
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
          const aindaEhRelevante =
            quantidadeCalculandoRef.current === quantidadeAtual &&
            planoIdCalculandoRef.current === planoIdAtual &&
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
            
            // Atualizar persistência se estivermos no plano completo
            if (selectedPlano?.slug === PLANO_COMPLETO) {
              lastCompletoStateRef.current = {
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

      // Se é Completo e requer pagamento, criar conta e abrir dialog de pagamento
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

          // Se tem cobrança, abrir dialog de pagamento
          if (result.qrCodePayload && (result as any).cobrancaId) {
            setPagamentoDialog({
              isOpen: true,
              cobrancaId: String((result as any).cobrancaId),
              valor: Number((result as any).preco_aplicado || (result as any).valor || 0),
            });
            // Salvar session para usar após pagamento
            if ((result as any).session) {
              // Armazenar temporariamente para usar após pagamento
              (window as any).__registerSession = (result as any).session;
            }
          } else {
            // Sem pagamento necessário, finalizar diretamente
            await handleFinalRegister(formValues);
          }
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

      // Se não requer pagamento (Gratuito ou Essencial Trial), finalizar cadastro diretamente
      await handleFinalRegister(form.getValues());
      return true;
    }

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
            <Form {...form}>
              {!loadingPlanos && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {planosDataTyped.bases.map((plano) => (
                    <Suspense
                      key={plano.id}
                      fallback={<Skeleton className="h-96 w-full" />}
                    >
                      <PlanoCardSelection
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
                          await handleNextStep();
                        }}
                        onSelect={(id) => {
                          const planoSelecionado = planosDataTyped.bases.find(
                            (p) => p.id === id
                          );
                          if (planoSelecionado) {
                            form.setValue("plano_id", id, {
                              shouldValidate: true,
                            });
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
            </Form>
          </section>
        );

      case 2:
        return (
          <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-0">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="h-9.5 w-9.5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-[0.92rem] font-semibold text-blue-900">Você escolheu: {selectedPlano?.nome}</h4>
                  <p className="text-sm mt-1 sm:mt-0 text-blue-700">
                    {selectedPlano?.descricao_curta}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setCurrentStep(1);
                  // Não resetar o formulário completo, apenas limpar erros
                  form.clearErrors();
                }}
                className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-100 w-full sm:w-auto mt-2 sm:mt-0"
              >
                Alterar
              </Button>
            </div>

            <Form {...form}>
              <form className="space-y-8">
                <CadastroForm form={form} />
                
                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      selectedPlano?.slug === PLANO_GRATUITO 
                        ? "Criar minha conta grátis"
                        : selectedPlano?.slug === PLANO_COMPLETO  ? "Continuar para pagamento" : "Criar minha conta"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* Header Simples e Elegante */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {currentStep === 1 && "Escolha o plano ideal"}
            {currentStep === 2 && "Crie sua conta"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentStep === 1 && "Comece grátis ou potencialize sua gestão com automação."}
            {currentStep === 2 && "Preencha seus dados para acessar o sistema."}
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Barra de Progresso */}
          <div className="relative h-1.5 bg-gray-100 w-full">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-out rounded-r-full"
              style={{ width: `${(currentStep / finalStep) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            {/* Indicador Textual */}
            <div className="flex items-center justify-between mb-8 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <span>Passo {currentStep} de {finalStep}</span>
              <span>
                {currentStep === 1 && "Plano"}
                {currentStep === 2 && "Cadastro"}
              </span>
            </div>

            {loadingPlanos ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-gray-500">Carregando planos...</p>
              </div>
            ) : (
              renderStep()
            )}
          </div>
        </div>
        
        {/* Footer / Depoimento (Opcional) */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Van360. Todos os direitos reservados.
          </p>
      </div>
      
      {/* Dialogs */}
      <TermosUsoDialog />
      
      {/* Dialog de Pagamento PIX */}
      {pagamentoDialog && pagamentoDialog.cobrancaId && (
        <PagamentoAssinaturaDialog
          isOpen={pagamentoDialog.isOpen}
          onClose={() => {
            setPagamentoDialog(null);
          }}
          cobrancaId={String(pagamentoDialog.cobrancaId)}
          valor={Number(pagamentoDialog.valor || 0)}
          onPaymentSuccess={handlePaymentSuccess}
          usuarioId={undefined}
          nomePlano={selectedPlano?.nome}
          quantidadeAlunos={
            selectedSubPlano
              ? selectedSubPlano.franquia_cobrancas_mes
              : form.getValues("quantidade_personalizada")
              ? form.getValues("quantidade_personalizada")
              : undefined
          }
          context="register"
          onIrParaInicio={() => {
            setPagamentoDialog(null);
            navigate("/inicio");
          }}
          onIrParaAssinatura={() => {
            setPagamentoDialog(null);
            navigate("/assinatura");
          }}
        />
      )}
    </div>
    </div>
  );
}
