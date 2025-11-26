import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PLANO_COMPLETO, PLANO_ESSENCIAL } from "@/constants";
import { useAssinaturaCobranca } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "@/utils/notifications/toast";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
import { Plano, SubPlano } from "@/types/plano";

interface PagamentoPixProps {
  dadosPagamento: {
    qrCodePayload: string;
    cobrancaId?: string;
    preco_aplicado?: number;
    franquia_contratada_cobrancas?: number;
  } | null;
  titulo?: string;
  mensagemAposPagamento?: string;
  planos?: Plano[];
  subPlanos?: SubPlano[];
  selectedPlanoId?: string | null;
  selectedSubPlanoId?: string | null;
  quantidadePersonalizada?: number | null;
}

export function PagamentoPix({
  dadosPagamento,
  titulo = "Conclua o pagamento para ativar seu plano",
  planos = [],
  subPlanos = [],
  selectedPlanoId,
  selectedSubPlanoId,
  quantidadePersonalizada,
}: PagamentoPixProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false); // Estado para ocultar/mostrar código bruto
  const [valorCobranca, setValorCobranca] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos em segundos
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Usar hook para buscar valor da cobrança se não tiver preco_aplicado
  const { data: cobranca } = useAssinaturaCobranca(
    dadosPagamento?.cobrancaId && !dadosPagamento?.preco_aplicado
      ? dadosPagamento.cobrancaId
      : undefined,
    { enabled: !!dadosPagamento?.cobrancaId && !dadosPagamento?.preco_aplicado }
  );

  useEffect(() => {
    if (cobranca && (cobranca as any)?.valor) {
      setValorCobranca(Number((cobranca as any).valor));
    } else {
      setValorCobranca(null);
    }
  }, [cobranca]);

  const handleCopyPix = useCallback(async () => {
    if (!dadosPagamento?.qrCodePayload) return;

    try {
      await navigator.clipboard.writeText(dadosPagamento.qrCodePayload);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 500);
    } catch (err: any) {
      toast.error("assinatura.erro.copiarPix", {
        description: err.message || "Não foi possível copiar o código PIX.",
      });
    }
  }, [dadosPagamento?.qrCodePayload]);

  useEffect(() => {
    if (dadosPagamento?.qrCodePayload) {
      QRCode.toDataURL(dadosPagamento.qrCodePayload)
        .then(setQrCodeImage)
        .catch(() => setQrCodeImage(null));
    }
  }, [dadosPagamento?.qrCodePayload]);

  // Timer regressivo de 10 minutos
  useEffect(() => {
    if (!dadosPagamento?.qrCodePayload) {
      setTimeRemaining(600);
      return;
    }

    setTimeRemaining(600);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [dadosPagamento?.qrCodePayload]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!dadosPagamento)
    return (
      <div className="text-center text-gray-600">
        Gerando informações de pagamento...
      </div>
    );

  const { qrCodePayload, preco_aplicado, franquia_contratada_cobrancas } =
    dadosPagamento;

  // Buscar dados do plano selecionado
  const planoSelecionado = selectedPlanoId
    ? planos.find((p) => p.id === selectedPlanoId)
    : null;
  const subPlanoSelecionado = selectedSubPlanoId
    ? subPlanos.find((s) => s.id === selectedSubPlanoId)
    : null;

  // Determinar nome do plano
  const quantidadePersonalizadaAtiva =
    quantidadePersonalizada && quantidadePersonalizada > 0
      ? quantidadePersonalizada
      : undefined;

  const nomePlano = planoSelecionado?.nome;

  // Determinar preço: priorizar sub-plano selecionado ou quantidade personalizada
  // Se não tiver, usar preco_aplicado ou valor da cobrança
  let precoFinal: number | null = null;

  if (planoSelecionado?.slug === PLANO_COMPLETO) {
    // Se tem sub-plano selecionado, SEMPRE usar o preço do sub-plano (prioridade máxima)
    if (subPlanoSelecionado) {
      precoFinal =
        subPlanoSelecionado.promocao_ativa &&
        subPlanoSelecionado.preco_promocional
          ? subPlanoSelecionado.preco_promocional
          : subPlanoSelecionado.preco;
    } else if (quantidadePersonalizadaAtiva) {
      // Se tem quantidade personalizada, usar preco_aplicado ou valorCobranca
      // Se não tiver, usar 0 como fallback (não deveria acontecer)
      precoFinal =
        (preco_aplicado && preco_aplicado > 0) ||
        (valorCobranca && valorCobranca > 0)
          ? preco_aplicado || valorCobranca || 0
          : 0;
    } else {
      // Fallback: menor preço dos sub-planos
      const subPlanosCompleto = subPlanos.filter(
        (s) => s.parent_id === planoSelecionado.id
      );
      if (subPlanosCompleto.length > 0) {
        precoFinal = Math.min(
          ...subPlanosCompleto.map((s) =>
            s.promocao_ativa && s.preco_promocional
              ? s.preco_promocional
              : s.preco
          )
        );
      } else {
        precoFinal = 0;
      }
    }
  } else {
    // Para outros planos, usar preco_aplicado, valorCobranca ou preço do plano
    if (preco_aplicado && preco_aplicado > 0) {
      precoFinal = preco_aplicado;
    } else if (valorCobranca && valorCobranca > 0) {
      precoFinal = valorCobranca;
    } else {
      precoFinal =
        planoSelecionado?.promocao_ativa && planoSelecionado.preco_promocional
          ? planoSelecionado.preco_promocional
          : planoSelecionado?.preco || 0;
    }
  }
  // Determinar informação de cobranças automáticas
  const infoCobrancas =
    planoSelecionado?.slug === PLANO_COMPLETO
      ? franquia_contratada_cobrancas ||
        quantidadePersonalizadaAtiva ||
        subPlanoSelecionado?.franquia_cobrancas_mes ||
        "Seu plano não oferece"
      : planoSelecionado?.slug === PLANO_ESSENCIAL
      ? franquia_contratada_cobrancas || "Seu plano não oferece"
      : "Seu plano não oferece";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Card Único - Dividido Internamente */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Coluna Esquerda: Resumo do Pedido */}
          <div className="bg-gray-50/50 p-4 md:p-8">
            {/* Mobile: Resumo Super Compacto - Barra Fina */}
            <div className="md:hidden -mx-4 -mt-4">
              <div className="bg-gray-50 px-3 py-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="detalhes" className="border-none">
                    <AccordionTrigger className="py-1 px-0 hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Total: {formatCurrency(precoFinal)}/mês
                        </span>
                        <span className="text-xs text-gray-400">Ver detalhes</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 pb-2 px-0">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Plano:</span>
                          <span className="font-semibold text-gray-900">{nomePlano}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Cobranças automáticas:</span>
                          <span className="font-semibold text-gray-900">
                            {typeof infoCobrancas === "number"
                              ? `${infoCobrancas}/mês`
                              : infoCobrancas}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Desktop: Resumo Completo */}
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumo do Pedido</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-semibold text-gray-900">{nomePlano}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cobranças automáticas:</span>
                  <span className="font-semibold text-gray-900">
                    {typeof infoCobrancas === "number"
                      ? `${infoCobrancas}/mês`
                      : infoCobrancas}
                  </span>
                </div>
                <Separator />
                {/* Destaque do Total */}
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(precoFinal)}/mês
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Zona de Pagamento */}
          <div className="bg-white p-4 md:p-8 flex flex-col min-h-0">
            {qrCodePayload && (
              <div className="flex flex-col items-center justify-center flex-grow space-y-3 md:space-y-6">
                {/* QR Code - Borda sutil, fundo branco limpo */}
                <div className="border border-gray-100 p-2 md:p-4 rounded-lg bg-white">
                  {qrCodeImage ? (
                    <img
                      src={qrCodeImage}
                      alt="QR Code PIX"
                      className="h-36 w-36 md:h-48 md:w-48"
                    />
                  ) : (
                    <div className="h-36 w-36 md:h-48 md:w-48 flex items-center justify-center bg-gray-50 text-xs md:text-sm text-gray-500">
                      Gerando QR Code...
                    </div>
                  )}
                </div>

                {/* Botão Copiar - Largura total */}
                <Button
                  onClick={handleCopyPix}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm md:text-base py-2.5 md:py-3"
                  size="lg"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Copiar código PIX
                    </>
                  )}
                </Button>

                {/* Link para revelar código - Hierarquia menor */}
                <button
                  type="button"
                  onClick={() => setShowRawCode(!showRawCode)}
                  className="text-xs md:text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
                >
                  {showRawCode
                    ? "Ocultar código completo"
                    : "Não conseguiu copiar? Clique aqui para ver o código completo."}
                </button>

                {/* Código bruto (oculto por padrão) - Transição suave */}
                <div
                  className={cn(
                    "w-full overflow-hidden transition-all duration-300 ease-in-out",
                    showRawCode 
                      ? "max-h-96 opacity-100 mt-2" 
                      : "max-h-0 opacity-0"
                  )}
                >
                  {showRawCode && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 text-center">
                        Código PIX completo:
                      </p>
                      <div className="bg-gray-50 p-3 rounded border border-gray-100">
                        <p className="text-xs break-all select-all text-gray-700 font-mono">
                          {qrCodePayload}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instruções - Hierarquia visual decrescente */}
                <div className="w-full space-y-1.5 text-xs md:text-sm text-gray-400">
                  <p className="font-medium text-gray-600">Siga estes passos:</p>
                  <ol className="list-decimal list-inside space-y-0.5 ml-2 text-gray-500">
                    <li>Clique em <strong className="text-gray-600">"Copiar código PIX"</strong> acima.</li>
                    <li>Abra o aplicativo do seu banco.</li>
                    <li>Escolha a opção <strong className="text-gray-600">"Pix Copia e Cola"</strong>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Feedback de Espera Ativa */}
            <div className="mt-4 md:mt-6 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600">
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-blue-600" />
                <span className="font-medium">
                  Aguardando confirmação do pagamento...
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Assim que você pagar, esta tela atualizará automaticamente em poucos segundos.
              </p>
              <p className="text-xs text-gray-400">
                O que acontece depois: Seu plano será ativado automaticamente e você receberá um e-mail de confirmação.
              </p>
            </div>

            {/* Timer discreto no rodapé */}
            {timeRemaining > 0 && (
              <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  Tempo restante: <span className="font-mono font-medium text-gray-500">{formatTime(timeRemaining)}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
