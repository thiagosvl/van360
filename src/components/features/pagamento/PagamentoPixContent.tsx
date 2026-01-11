import { ComoFuncionaPixSheet } from "@/components/features/pagamento/ComoFuncionaPixSheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ASSINATURA_COBRANCA_STATUS_PAGO } from "@/constants";
import { useGerarPixParaCobranca } from "@/hooks";
import { fetchProfile } from "@/hooks/business/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notifications/toast";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Copy, HelpCircle, Loader2, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

interface PagamentoPixContentProps {
  cobrancaId: string;
  onPaymentSuccess?: (success?: boolean) => void;
  usuarioId?: string;
  onClose?: (success?: boolean) => void; // Opcional, para quando usado em modal
  nomePlano?: string; // Para exibir no sucesso
  quantidadePassageiros?: number; // Para exibir no sucesso
  onIrParaInicio?: () => void; // Callback para ir para início
  onIrParaAssinatura?: () => void; // Callback para ir para assinatura
  onPaymentVerified?: () => void; // Novo: Callback imediato quando pagamento é confirmado
  context?: "register" | "upgrade"; // Para adaptar textos ao cenário
  initialData?: {
    qrCodePayload: string;
    location: string;
    inter_txid: string;
    cobrancaId: string;
  };
  valor: number;
}

export default function PagamentoPixContent({
  cobrancaId,
  onPaymentSuccess,
  usuarioId,
  onClose,
  nomePlano,
  quantidadePassageiros,
  onIrParaInicio,
  onIrParaAssinatura,
  onPaymentVerified,
  context,
  initialData,
  valor,
}: PagamentoPixContentProps) {
  const queryClient = useQueryClient();
  const gerarPix = useGerarPixParaCobranca();
  const [dadosPagamento, setDadosPagamento] = useState<{
    qrCodePayload: string;
    location: string;
    inter_txid: string;
    cobrancaId: string;
  } | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null);

  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const pixGeradoRef = useRef<string | null>(null);
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const monitorandoRef = useRef(false);
  const handlePaymentSuccessRef = useRef<(() => void) | null>(null);

  // Formatar tempo MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calcular progresso da barra (inverso)
  const progressValue = (timeLeft / 600) * 100;

  // Timer effect
  useEffect(() => {
    if (dadosPagamento) {
      setTimeLeft(600); // Resetar para 10 min
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dadosPagamento]);

  // Quando o tempo expira e o pagamento ainda não foi confirmado, fechar o diálogo
  useEffect(() => {
    if (!onClose) return;

    // Se não tem dados de pagamento, não faz sentido verificar timeout
    if (!dadosPagamento) return;

    if (timeLeft === 0 && !paymentConfirmed) {
      setTimeout(() => {
        if (onClose) onClose(false);
      }, 0);
    }
  }, [timeLeft, paymentConfirmed, onClose, dadosPagamento]);

  // Gerar PIX ao montar ou mudar cobrança
  useEffect(() => {
    if (!cobrancaId) {
      pixGeradoRef.current = null;
      return;
    }

    if (pixGeradoRef.current === cobrancaId) {
      return;
    }

    const gerarPixAction = () => {
      // Se já temos dados iniciais (ex: vindos de upgradePlano), usamos direto
      if (initialData && initialData.cobrancaId === cobrancaId) {
        setDadosPagamento(initialData);
        pixGeradoRef.current = cobrancaId;

        if (initialData.qrCodePayload) {
          QRCode.toDataURL(initialData.qrCodePayload)
            .then(setQrCodeImage)
            .catch(() => setQrCodeImage(null));
        }
        return;
      }

      setDadosPagamento(null);
      setQrCodeImage(null);

      gerarPix.mutate(cobrancaId, {
        onSuccess: (result: any) => {

          setDadosPagamento(result);
          pixGeradoRef.current = cobrancaId;

          if (result.qrCodePayload) {
            QRCode.toDataURL(result.qrCodePayload)
              .then(setQrCodeImage)
              .catch(() => {
                setQrCodeImage(null);
              });
          }
        },
        onError: () => {
          if (onClose) onClose();
        },
      });
    };

    gerarPixAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobrancaId, initialData]);

  // State para controlar a tela intermediária de "Processando liberação"
  const [isProcessing, setIsProcessing] = useState(false);

  const hasFetchedRef = useRef(false);

  // handlePaymentSuccess
  const handlePaymentSuccess = useCallback(async () => {
    // Prevent double execution
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
      realtimeChannelRef.current = null;
    }

    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }

    monitorandoRef.current = false;

    // 3. Aguardar propagação inicial no banco (1500ms)
    // Mantemos esse delay mínimo de segurança para todos os casos (propagação de transação)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 4. "Polling Infinito Seguro" (Apenas para Upgrade Interno)
    let sucesso = false;

    // No cadastro, o login subsequente fará o fetch limpo. No upgrade, precisamos garantir update local.
    if (context !== "register") {
      let tentativa = 0;
      const MAX_TENTATIVAS = 60;

      while (tentativa < MAX_TENTATIVAS && !sucesso) {
        try {
          // Força busca dos dados frescos usando a query correta (com usuarioId se disponível)
          // Se não tiver usuarioId (ex: registro), o fetchProfile falha, mas isso não deve acontecer no upgrade

          let profileData = null;

          if (usuarioId) {
            profileData = await queryClient.fetchQuery({
              queryKey: ["profile", usuarioId],
              queryFn: () => fetchProfile(usuarioId),
              staleTime: 0,
            });
          } else {
            // Fallback para profile da sessão atual (kev)
            profileData = await queryClient.fetchQuery({
              queryKey: ["profile"],
              staleTime: 0,
            });
          }

          // Também invalida plano para garantir
          await queryClient.invalidateQueries({ queryKey: ["plano"] });

          // Validação: Assinatura ativa encontrada
          if (profileData) {
            sucesso = true;
            // Atualiza cache
            if (usuarioId) {
              queryClient.setQueryData(["profile", usuarioId], profileData);
            }
          } else {
            // Polling Híbrido: A primeira já esperou 1.5s. Se falhar, tenta repetidamente rápido (200ms).
            const delay = 200;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (err) {
          // Erro (ex: missing queryFn se não passar), espera 1s
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        tentativa++;
      }
    } else {
      // No registro, assumimos sucesso imediatamente após o delay de segurança
      sucesso = true;
    }

    // 5. Finalização: Sai do modo processando e mostra tela de Sucesso
    setIsProcessing(false);
    setPaymentConfirmed(true);

    // Feedback visual apropriado
    if (!sucesso && context !== "register") {
      toast.warning(
        "Pagamento recebido, mas a liberação está demorando. Ela ocorrerá automaticamente em instantes.",
        { duration: 6000 }
      );
    } else {
      // Sucesso "silencioso" no toast pois a tela já mudará para Sucesso
    }

    // Só avisa o pai (liberando clicks) quando tudo estiver pronto
    if (onPaymentVerified) {
      onPaymentVerified();
    }

    // Iniciar contagem regressiva para redirect (só agora que a tela de sucesso vai aparecer)
    if (!redirectSeconds) {
      setRedirectSeconds(10);
      const interval = setInterval(() => {
        setRedirectSeconds((prev) => {
          if (prev === null) return prev;
          if (prev <= 1) {
            clearInterval(interval);
            if (onPaymentSuccessRef.current) {
              setTimeout(() => onPaymentSuccessRef.current?.(true), 0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [redirectSeconds, onPaymentVerified, queryClient, context]);

  // Manter ref atualizada do callback de sucesso para evitar stale closure no timer
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess;
  }, [onPaymentSuccess]);

  useEffect(() => {
    handlePaymentSuccessRef.current = handlePaymentSuccess;
  }, [handlePaymentSuccess]);

  // Monitoramento de pagamento (Realtime + Polling)
  useEffect(() => {
    if (!dadosPagamento?.cobrancaId) {
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
        realtimeChannelRef.current = null;
      }
      monitorandoRef.current = false;
      return;
    }

    // Safety check: if payment already confirmed, ensure we stop polling
    if (paymentConfirmed || hasFetchedRef.current) {
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
      return;
    }

    if (monitorandoRef.current) {
      return;
    }

    mountedRef.current = true;
    monitorandoRef.current = true;
    const cobrancaIdAtual = dadosPagamento.cobrancaId;

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
      realtimeChannelRef.current = null;
    }

    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }

    const checkPaymentStatus = async () => {
      if (!mountedRef.current || !monitorandoRef.current) return;

      try {
        const { data, error } = await (supabase as any)
          .from("assinaturas_cobrancas")
          .select("status")
          .eq("id", cobrancaIdAtual)
          .maybeSingle();

        if (error) return;

        if (data?.status === ASSINATURA_COBRANCA_STATUS_PAGO) {
          if (
            mountedRef.current &&
            monitorandoRef.current &&
            handlePaymentSuccessRef.current
          ) {
            handlePaymentSuccessRef.current();
          }
        }
      } catch (err) {
        // Erro silencioso
      }
    };

    const setupRealtime = async () => {
      // Polling de Backup: "Plano B"
      // 1. Só começa após 10 segundos (dá tempo do usuário abrir o app do banco)
      // 2. Roda a cada 6 segundos (não precisa ser agressivo, o Realtime é o principal)
      if (!pollerRef.current && monitorandoRef.current) {
        setTimeout(() => {
          // Verifica se ainda precisa (pode ter pago nesse meio tempo)
          if (
            !mountedRef.current ||
            !monitorandoRef.current ||
            paymentConfirmed
          )
            return;

          // Execução imediata pós-delay (no segundo 10)
          checkPaymentStatus();

          pollerRef.current = setInterval(() => {
            // Safety Checks rigorosos
            if (
              !mountedRef.current ||
              !monitorandoRef.current ||
              paymentConfirmed ||
              hasFetchedRef.current
            ) {
              if (pollerRef.current) {
                clearInterval(pollerRef.current);
                pollerRef.current = null;
              }
              return;
            }
            checkPaymentStatus();
          }, 6000); // 6 segundos (Backup)
        }, 10000); // 10 segundos de delay inicial
      }

      try {
        const channel = (supabase as any)
          .channel(`pagamento-${cobrancaIdAtual}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "assinaturas_cobrancas",
              filter: `id=eq.${cobrancaIdAtual}`,
            },
            (payload: any) => {
              try {
                if (payload?.new?.status === ASSINATURA_COBRANCA_STATUS_PAGO) {
                  // Se pagou via Realtime, paramos tudo
                  if (pollerRef.current) {
                    clearInterval(pollerRef.current);
                    pollerRef.current = null;
                  }

                  if (
                    mountedRef.current &&
                    monitorandoRef.current &&
                    handlePaymentSuccessRef.current
                  ) {
                    handlePaymentSuccessRef.current();
                  }
                }
              } catch (cbErr) {
                // Erro silencioso
              }
            }
          );

        const subscribeResult = await channel.subscribe();
        const status = (subscribeResult as { status?: string })?.status;

        if (status === "SUBSCRIBED" || status === "ok" || status === "OK") {
          realtimeChannelRef.current = channel;
        }
      } catch (err) {
        // Falha no realtime, o poller assumirá após o delay.
      }
    };

    setupRealtime();

    return () => {
      mountedRef.current = false;
      monitorandoRef.current = false;
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
        realtimeChannelRef.current = null;
      }
    };
  }, [dadosPagamento?.cobrancaId]);

  const handleCopyPix = useCallback(async () => {
    if (!dadosPagamento?.qrCodePayload) return;

    try {
      await navigator.clipboard.writeText(dadosPagamento.qrCodePayload);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (err: any) {
      toast.error("Erro ao copiar", {
        description: "Não foi possível copiar o código PIX.",
      });
    }
  }, [dadosPagamento?.qrCodePayload]);

  // Se estiver processando (Pagamento OK, buscando dados), mostra tela de loading rica
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto py-8 flex-1 justify-center">
        <div className="bg-emerald-50 rounded-full p-4 mb-4 relative">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
          Validando Pagamento...
        </h2>
        <p className="text-gray-500 text-center text-sm px-6">
          Recebemos seu PIX! Estamos finalizando a configuração da sua
          assinatura. Isso leva apenas alguns segundos.
        </p>
      </div>
    );
  }

  // Se pagamento confirmado e DADOS JÁ SINCRONIZADOS, exibir tela de sucesso
  if (paymentConfirmed) {
    return (
      <div className="flex flex-col h-full w-full bg-emerald-50/50">
        {/* ÁREA ROLÁVEL: Mensagem de Sucesso */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center pt-10 sm:pt-16">
          <div className="w-full max-w-sm flex flex-col items-center py-4">
            <div className="mx-auto bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-extrabold text-emerald-900 mb-3 tracking-tight">
              Pagamento confirmado!
            </h2>

            <p className="text-emerald-700 text-base font-medium mb-1">
              {nomePlano
                ? `Seu plano ${nomePlano} foi ativado.`
                : "Seu plano foi ativado com sucesso."}
            </p>

            {redirectSeconds !== null && redirectSeconds > 0 && (
              <p className="text-emerald-600 text-xs mb-8">
                Você será redirecionado em{" "}
                <span className="font-bold">{redirectSeconds}s</span>...
              </p>
            )}

            {quantidadePassageiros !== undefined &&
              quantidadePassageiros > 0 && (
                <div className="w-full p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm mb-6">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                    Franquia Atualizada
                  </p>
                  <p className="text-sm font-bold text-emerald-900 leading-snug">
                    Você agora pode ativar a Cobrança Automática para até{" "}
                    <span className="text-emerald-600">
                      {quantidadePassageiros} passageiros
                    </span>
                    .
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* RODAPÉ FIXO: Ações de Sucesso */}
        <div className="shrink-0 p-4 border-t border-emerald-100 bg-white/80 backdrop-blur-sm space-y-3">
          {/* Cenário de cadastro: foco em começar a usar */}
          {context === "register" && onIrParaInicio && (
            <Button
              onClick={() => {
                onIrParaInicio();
                if (onPaymentSuccess) setTimeout(onPaymentSuccess, 0);
                else if (onClose) setTimeout(onClose, 0);
              }}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/10"
            >
              Começar a usar agora
            </Button>
          )}

          {context === "register" && onIrParaAssinatura && (
            <Button
              onClick={() => {
                onIrParaAssinatura();
                if (onPaymentSuccess) setTimeout(onPaymentSuccess, 0);
                else if (onClose) setTimeout(onClose, 0);
              }}
              variant="ghost"
              className="w-full h-10 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
            >
              Ver detalhes da minha assinatura
            </Button>
          )}

          {/* Cenário de upgrade: foco em revisar assinatura */}
          {context === "upgrade" && onIrParaAssinatura && (
            <Button
              onClick={() => {
                onIrParaAssinatura();
                if (onPaymentSuccess) setTimeout(onPaymentSuccess, 0);
                else if (onClose) setTimeout(onClose, 0);
              }}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/10"
            >
              Ver minha assinatura
            </Button>
          )}

          {context === "upgrade" && onIrParaInicio && (
            <Button
              onClick={() => {
                onIrParaInicio();
                if (onPaymentSuccess) setTimeout(onPaymentSuccess, 0);
                else if (onClose) setTimeout(onClose, 0);
              }}
              variant="ghost"
              className="w-full h-10 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
            >
              Ir para tela inicial
            </Button>
          )}

          {/* Fallback genérico */}
          {!context && onIrParaAssinatura && (
            <Button
              onClick={() => {
                onIrParaAssinatura();
                if (onPaymentSuccess) setTimeout(onPaymentSuccess, 0);
                else if (onClose) setTimeout(onClose, 0);
              }}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/10"
            >
              Ver minha assinatura
            </Button>
          )}

          {!context && !onIrParaAssinatura && onIrParaInicio && (
            <Button
              onClick={() => {
                onIrParaInicio();
                if (onPaymentSuccess) setTimeout(onPaymentSuccess, 0);
                else if (onClose) setTimeout(onClose, 0);
              }}
              variant="ghost"
              className="w-full h-10 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
            >
              Ir para tela inicial
            </Button>
          )}

          {/* Botão Fechar Simples */}
          {!onIrParaAssinatura && !onIrParaInicio && (
            <Button
              onClick={() => {
                if (onPaymentSuccess)
                  setTimeout(() => onPaymentSuccess(true), 0);
                else if (onClose)
                  setTimeout(() => onClose(paymentConfirmed), 0);
              }}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Fechar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {gerarPix.isPending ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 flex-1">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-gray-500 font-medium">Gerando código PIX...</p>
        </div>
      ) : dadosPagamento ? (
        <>
          {/* ÁREA ROLÁVEL: Conteúdo principal */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start pt-10 sm:pt-16">
            {/* Ilustração e Status (Ultra Reduzido) */}
            <div className="relative mb-2 shrink-0">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Smartphone className="w-10 h-10 text-blue-600" />
                <div className="absolute -top-1 -right-2 bg-white rounded-full p-1 shadow-sm">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              </div>
            </div>

            {/* Valor da Cobrança (Minimalista) */}
            <div className="flex flex-col items-center mb-4 shrink-0">
              <div className="bg-blue-50/30 px-3 py-1 rounded-lg border border-blue-100/30">
                <span className="text-xl font-bold text-blue-900 tracking-tight">
                  R${" "}
                  {Number(valor).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-center text-xs mb-2 max-w-[200px] shrink-0 font-medium leading-tight">
              Copie o código abaixo e pague no app do seu banco:
            </p>

            {/* Código PIX */}
            <div className="w-full border-2 mt-1 border-gray-100 border-dashed rounded-xl px-4 py-1 mb-6 flex items-center justify-between gap-3 overflow-hidden shrink-0 bg-gray-50/50">
              <div className="flex-1 min-w-0">
                <code className="text-xs text-gray-500 font-mono truncate block">
                  {dadosPagamento.qrCodePayload}
                </code>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyPix}
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
              >
                {isCopied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* QR Code */}
            {qrCodeImage && (
              <div className="flex flex-col items-center mb-4 bg-white shrink-0">
                <span className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider font-bold">
                  Ou escaneie o código
                </span>
                <div className="p-1 border border-gray-100 rounded-2xl shadow-sm">
                  <img
                    src={qrCodeImage}
                    alt="QR Code PIX"
                    className="w-40 h-40"
                  />
                </div>
              </div>
            )}

            {/* Timer */}
            <div className="w-full mb-6 shrink-0 px-2">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  Expira em:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Progress
                value={progressValue}
                className="h-1 bg-gray-100"
                indicatorClassName="bg-blue-600"
              />
            </div>
          </div>

          <ComoFuncionaPixSheet
            open={isInstructionsOpen}
            onOpenChange={setIsInstructionsOpen}
          />

          {/* RODAPÉ FIXO: Ações */}
          <div className="shrink-0 p-4 border-t bg-white/80 backdrop-blur-sm space-y-3">
            <Button
              variant="ghost"
              onClick={() => setIsInstructionsOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold h-10 rounded-xl"
            >
              <HelpCircle className="w-4 h-4" />
              Como fazer o pagamento?
            </Button>

            <Button
              className={`w-full hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/10 ${
                isCopied ? "opacity-75 cursor-not-allowed" : "bg-blue-600"
              }`}
              onClick={handleCopyPix}
            >
              {isCopied ? "Código Copiado!" : "Copiar código PIX"}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">Erro ao gerar pagamento.</p>
          <Button variant="outline" onClick={() => onClose && onClose()}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
