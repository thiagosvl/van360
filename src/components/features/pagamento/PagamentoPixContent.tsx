import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { ASSINATURA_COBRANCA_STATUS_PAGO } from "@/constants";
import { useGerarPixParaCobranca } from "@/hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notifications/toast";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  Smartphone
} from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

interface PagamentoPixContentProps {
  cobrancaId: string;
  onPaymentSuccess?: () => void;
  usuarioId?: string;
  onPrecisaSelecaoManual?: (data: {
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId: string;
  }) => void;
  onClose?: () => void; // Opcional, para quando usado em modal
  nomePlano?: string; // Para exibir no sucesso
  quantidadeAlunos?: number; // Para exibir no sucesso
  onIrParaInicio?: () => void; // Callback para ir para início
  onIrParaAssinatura?: () => void; // Callback para ir para assinatura
  context?: "register" | "upgrade"; // Para adaptar textos ao cenário
}

export default function PagamentoPixContent({
  cobrancaId,
  onPaymentSuccess,
  usuarioId,
  onPrecisaSelecaoManual,
  onClose,
  nomePlano,
  quantidadeAlunos,
  onIrParaInicio,
  onIrParaAssinatura,
  context,
}: PagamentoPixContentProps) {
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

    // Só consideramos timeout depois que o PIX foi efetivamente gerado
    if (!dadosPagamento?.qrCodePayload) return;

    if (timeLeft <= 0 && !paymentConfirmed) {
      onClose();
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
      setDadosPagamento(null);
      setQrCodeImage(null);

      gerarPix.mutate(cobrancaId, {
        onSuccess: (result: any) => {
          if (result.precisaSelecaoManual && onPrecisaSelecaoManual && usuarioId) {
            if (onClose) onClose();
            onPrecisaSelecaoManual({
              tipo: result.tipo || "upgrade",
              franquia: result.franquia || 0,
              cobrancaId: cobrancaId,
            });
            return;
          }

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
  }, [cobrancaId]);

  // handlePaymentSuccess
  const handlePaymentSuccess = useCallback(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
      realtimeChannelRef.current = null;
    }

    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }

    monitorandoRef.current = false;

    // Exibir tela de sucesso dentro do mesmo dialog
    setPaymentConfirmed(true);

    // Iniciar contagem regressiva antes de disparar o callback (login/redirect)
    if (!redirectSeconds) {
      setRedirectSeconds(5);
      const interval = setInterval(() => {
        setRedirectSeconds((prev) => {
          if (prev === null) return prev;
          if (prev <= 1) {
            clearInterval(interval);
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [onPaymentSuccess, redirectSeconds]);

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
      if (!pollerRef.current && monitorandoRef.current) {
        pollerRef.current = setInterval(() => {
          if (!mountedRef.current || !monitorandoRef.current) {
            if (pollerRef.current) {
              clearInterval(pollerRef.current);
              pollerRef.current = null;
            }
            return;
          }
          checkPaymentStatus();
        }, 5000);
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
          if (pollerRef.current) {
            clearInterval(pollerRef.current);
            pollerRef.current = null;
          }
          if (monitorandoRef.current) {
            pollerRef.current = setInterval(() => {
              if (!mountedRef.current || !monitorandoRef.current) {
                if (pollerRef.current) {
                  clearInterval(pollerRef.current);
                  pollerRef.current = null;
                }
                return;
              }
              checkPaymentStatus();
            }, 30000);
          }
        }
      } catch (err) {
        // Falha no realtime
      }
    };

    checkPaymentStatus();
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
      toast.success("Código PIX copiado!");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err: any) {
      toast.error("Erro ao copiar", {
        description: "Não foi possível copiar o código PIX.",
      });
    }
  }, [dadosPagamento?.qrCodePayload]);

  // Se pagamento confirmado, exibir tela de sucesso
  if (paymentConfirmed) {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <div className="bg-emerald-50 rounded-2xl p-8 text-center w-full">
          <div className="mx-auto bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">
            Pagamento confirmado!
          </h2>
          <p className="text-emerald-700 text-sm mb-2">
            {nomePlano
              ? `Seu plano ${nomePlano} foi ativado com sucesso.`
              : "Seu plano foi ativado com sucesso."}
          </p>
          {redirectSeconds !== null && redirectSeconds > 0 && (
            <p className="text-emerald-600 text-xs mb-6">
              Você será redirecionado em{" "}
              <span className="font-semibold">{redirectSeconds}s</span>...
            </p>
          )}
          
          {quantidadeAlunos !== undefined && quantidadeAlunos > 0 && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-emerald-200">
              <p className="text-sm font-medium text-emerald-900">
                {quantidadeAlunos}{" "}
                {quantidadeAlunos === 1
                  ? "passageiro agora tem"
                  : "passageiros agora têm"}{" "}
                cobrança automática.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Cenário de cadastro: foco em começar a usar */}
            {context === "register" && onIrParaInicio && (
              <Button
                onClick={() => {
                  onIrParaInicio();
                  if (onClose) onClose();
                }}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
              >
                Começar a usar agora
              </Button>
            )}
            {context === "register" && onIrParaAssinatura && (
              <Button
                onClick={() => {
                  onIrParaAssinatura();
                  if (onClose) onClose();
                }}
                variant="ghost"
                className="w-full h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
              >
                Ver detalhes da minha assinatura
              </Button>
            )}

            {/* Cenário de upgrade: foco em revisar assinatura */}
            {context === "upgrade" && onIrParaAssinatura && (
              <Button
                onClick={() => {
                  onIrParaAssinatura();
                  if (onClose) onClose();
                }}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
              >
                Ver minha assinatura
              </Button>
            )}
            {context === "upgrade" && onIrParaInicio && (
              <Button
                onClick={() => {
                  onIrParaInicio();
                  if (onClose) onClose();
                }}
                variant="ghost"
                className="w-full h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
              >
                Ir para tela inicial
              </Button>
            )}

            {/* Fallback genérico */}
            {!context && onIrParaAssinatura && (
              <Button
                onClick={() => {
                  onIrParaAssinatura();
                  if (onClose) onClose();
                }}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
              >
                Ver minha assinatura
              </Button>
            )}
            {!context && !onIrParaAssinatura && onIrParaInicio && (
              <Button
                onClick={() => {
                  onIrParaInicio();
                  if (onClose) onClose();
                }}
                variant="ghost"
                className="w-full h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
              >
                Ir para tela inicial
              </Button>
            )}

            {!onIrParaAssinatura && !onIrParaInicio && onClose && (
              <Button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {gerarPix.isPending ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-gray-500 font-medium">Gerando código PIX...</p>
        </div>
      ) : dadosPagamento ? (
        <>
          {/* Ilustração e Status */}
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-blue-600" />
              <div className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
            Pedido aguardando pagamento
          </h2>

          <p className="text-gray-500 text-center text-sm mb-6 max-w-xs">
            Copie o código abaixo e utilize o Pix Copia e Cola no aplicativo
            que você vai fazer o pagamento:
          </p>

          {/* Código PIX */}
          <div className="w-full bg-gray-50 border border-gray-200 border-dashed rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
            <code className="text-xs text-gray-600 font-mono truncate flex-1">
              {dadosPagamento.qrCodePayload}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopyPix}
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {isCopied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Timer */}
          <div className="w-full mb-6">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-sm text-gray-500">
                O tempo para você pagar acaba em:
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatTime(timeLeft)}
            </div>
            <Progress
              value={progressValue}
              className="h-1.5 bg-gray-100"
              indicatorClassName="bg-blue-600"
            />
          </div>

          {/* Como funciona */}
          <Collapsible
            open={isInstructionsOpen}
            onOpenChange={setIsInstructionsOpen}
            className="w-full mb-6"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium"
              >
                Como funciona
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isInstructionsOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4 text-sm text-gray-600 animate-in slide-in-from-top-2">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-[1.5rem]">1º</span>
                <p>Copie o código que foi gerado acima.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-[1.5rem]">2º</span>
                <p>Abra o aplicativo do seu banco e escolha a opção <strong>Pix Copia e Cola</strong>.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-[1.5rem]">3º</span>
                <p>Cole o código, confirme o valor e faça o pagamento. Ele será confirmado na hora :)</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* QR Code (Requisito do usuário) */}
          {qrCodeImage && (
            <div className="flex flex-col items-center mb-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
              <span className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">Ou escaneie o QR Code</span>
              <img
                src={qrCodeImage}
                alt="QR Code PIX"
                className="w-32 h-32"
              />
            </div>
          )}

          {/* Botão Principal Fixo */}
          <div className="w-full sticky bottom-0 bg-white pt-2 pb-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-100"
              onClick={handleCopyPix}
            >
              {isCopied ? "Código Copiado!" : "Copiar código PIX"}
            </Button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                {context === "register"
                  ? "Revisar cadastro antes de pagar"
                  : "Rever plano antes de pagar"}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Erro ao gerar pagamento.</p>
          <Button variant="outline" onClick={() => onClose && onClose()}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
