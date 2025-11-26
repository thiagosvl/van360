import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ASSINATURA_COBRANCA_STATUS_PAGO } from "@/constants";
import { toast } from "@/utils/notifications/toast";
import { supabase } from "@/integrations/supabase/client";
import { useGerarPixParaCobranca } from "@/hooks";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Copy, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

interface PagamentoAssinaturaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  valor: number;
  onPaymentSuccess?: () => void;
  usuarioId?: string;
  onPrecisaSelecaoManual?: (data: {
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId: string;
  }) => void;
}

export default function PagamentoAssinaturaDialog({
  isOpen,
  onClose,
  cobrancaId,
  valor,
  onPaymentSuccess,
  usuarioId,
  onPrecisaSelecaoManual,
}: PagamentoAssinaturaDialogProps) {
  const gerarPix = useGerarPixParaCobranca();
  const [dadosPagamento, setDadosPagamento] = useState<{
    qrCodePayload: string;
    location: string;
    inter_txid: string;
    cobrancaId: string;
  } | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const pixGeradoRef = useRef<string | null>(null); // Controla se já gerou PIX para esta cobrança
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const monitorandoRef = useRef(false); // Controla se já está monitorando pagamento
  const handlePaymentSuccessRef = useRef<(() => void) | null>(null);

  // Gerar PIX ao abrir o modal - apenas uma vez por cobrança
  useEffect(() => {
    if (!isOpen || !cobrancaId) {
      // Reset quando modal fecha
      if (!isOpen) {
        pixGeradoRef.current = null;
      }
      return;
    }

    // Se já gerou PIX para esta cobrança, não gerar novamente
    if (pixGeradoRef.current === cobrancaId) {
      return;
    }

    const gerarPixAction = () => {
      setDadosPagamento(null);
      setQrCodeImage(null);

      gerarPix.mutate(cobrancaId, {
        onSuccess: (result: any) => {
          // Verificar se precisa seleção manual ANTES de gerar PIX
          if (result.precisaSelecaoManual && onPrecisaSelecaoManual && usuarioId) {
            // Fechar dialog de pagamento e abrir dialog de seleção
            onClose();
            onPrecisaSelecaoManual({
              tipo: result.tipo || "upgrade",
              franquia: result.franquia || 0,
              cobrancaId: cobrancaId,
            });
            return;
          }

          // Se não precisa seleção manual, continuar com o fluxo normal
          setDadosPagamento(result);
          pixGeradoRef.current = cobrancaId; // Marca que já gerou para esta cobrança

          // Gerar QR Code image
          if (result.qrCodePayload) {
            QRCode.toDataURL(result.qrCodePayload)
              .then(setQrCodeImage)
              .catch(() => {
                setQrCodeImage(null);
              });
          }
        },
        onError: () => {
          onClose();
        },
      });
    };

    gerarPixAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cobrancaId]); // Removido toast e onClose das dependências

  // handlePaymentSuccess usando useCallback e ref para evitar re-criações
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

    onClose();
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  }, [toast, onClose, onPaymentSuccess]);

  useEffect(() => {
    handlePaymentSuccessRef.current = handlePaymentSuccess;
  }, [handlePaymentSuccess]);

  useEffect(() => {
    if (!isOpen || !dadosPagamento?.cobrancaId) {
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

    // Se já está monitorando esta cobrança, não iniciar novamente
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
        // Usar query direta do Supabase - assinaturas_cobrancas não está no tipo Database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("assinaturas_cobrancas")
          .select("status")
          .eq("id", cobrancaIdAtual)
          .maybeSingle();

        if (error) {
          return;
        }

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
        // Erro silencioso - polling continuará tentando
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
        }, 5000); // 5 segundos - intervalo principal quando realtime não funciona
      }

      try {
        // use the same channel/topic pattern as Register.tsx to ensure
        // postgres_changes subscriptions are handled consistently
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            (payload) => {
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
                // Erro silencioso no callback realtime
              }
            }
          );

        const subscribeResult = await channel.subscribe();

        const status = (subscribeResult as { status?: string })?.status;
        const isSubscribed =
          status === "SUBSCRIBED" || status === "ok" || status === "OK";

        if (isSubscribed) {
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
        } else {
          throw new Error(
            `Subscribe não confirmou inscrição. result=${JSON.stringify(
              subscribeResult
            )}`
          );
        }
      } catch (err) {
        // Falha ao inscrever realtime - polling já está ativo como fallback
      }
    };

    // Quick initial check in case the payment already completed
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
  }, [isOpen, dadosPagamento?.cobrancaId]); // handlePaymentSuccess removido das dependências (usamos ref)

  const handleCopyPix = useCallback(async () => {
    if (!dadosPagamento?.qrCodePayload) return;

    try {
      await navigator.clipboard.writeText(dadosPagamento.qrCodePayload);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (err: any) {
      toast.error("assinatura.erro.copiarPix", {
        description: err.message || "Não foi possível copiar o código PIX.",
      });
    }
  }, [dadosPagamento?.qrCodePayload]);

  const handleClose = useCallback(() => {
    // Ao fechar, limpar recursos do realtime
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current).catch(() => {});
      realtimeChannelRef.current = null;
    }
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
    mountedRef.current = false;
    monitorandoRef.current = false;
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="sm:max-w-md max-h-[95vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código PIX para realizar o pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {gerarPix.isPending ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Gerando código PIX...
              </p>
            </div>
          ) : dadosPagamento ? (
            <>
              {/* Valor */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Valor a pagar
                </p>
                <p className="text-3xl font-bold text-primary">
                  {valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex flex-col items-center">
                {qrCodeImage ? (
                  <img
                    src={qrCodeImage}
                    alt="QR Code PIX"
                    className="h-48 w-48 border rounded"
                  />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center bg-gray-100 border rounded text-sm text-gray-500">
                    Gerando QR Code...
                  </div>
                )}

                <p className="text-sm font-medium mt-4 mb-2 text-gray-700">
                  Copie o código PIX:
                </p>

                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="text-xs break-all text-gray-700 select-all">
                      {dadosPagamento.qrCodePayload}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPix}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mensagem de aguardando */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Após o pagamento ser confirmado, sua assinatura será ativada
                automaticamente.
              </p>
            </>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <p>Erro ao carregar dados do pagamento.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
