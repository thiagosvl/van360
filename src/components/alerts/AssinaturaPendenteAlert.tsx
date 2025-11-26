import BaseAlert, { getAlertStyles, AlertVariant } from "@/components/alerts/BaseAlert";
import { Button } from "@/components/ui/button";
import { ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO } from "@/constants";
import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { useAssinaturaCobrancas } from "@/hooks";
import { toast } from "@/utils/notifications/toast";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, AlertTriangle, Clock, Loader2, Receipt } from "lucide-react";

interface AssinaturaPendenteAlertProps {
  assinaturaId: string;
  userId: string;
  isTrial?: boolean;
  isValidTrial?: boolean;
  isTrialExpirado?: boolean;
  isPendentePagamento?: boolean;
  diasRestantes?: number | null;
  plano?: any;
  profile?: any;
}

export default function AssinaturaPendenteAlert({
  assinaturaId,
  userId,
  isTrial = false,
  isValidTrial = false,
  isTrialExpirado = false,
  isPendentePagamento = false,
  diasRestantes = null,
  plano,
  profile,
}: AssinaturaPendenteAlertProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldFetchCobrancas, setShouldFetchCobrancas] = useState(false);
  const [cobrancaData, setCobrancaData] = useState<{
    id: string;
    valor: number;
  } | null>(null);

  // Usar hook para buscar cobranças quando necessário
  const { data: cobrancas = [], isLoading: isLoadingCobranca, refetch: refetchCobrancas } = useAssinaturaCobrancas(
    shouldFetchCobrancas ? { usuarioId: userId, assinaturaUsuarioId: assinaturaId } : undefined,
    { enabled: shouldFetchCobrancas }
  );

  // Determinar o tipo de alerta e mensagens baseado no status
  const alertConfig = useMemo(() => {
    if (isValidTrial && diasRestantes !== null) {
      // Trial válido (dentro do período) - mensagem persuasiva
      return {
        type: "trial-ativo",
        icon: Clock,
        variant: "warning" as AlertVariant,
        title: diasRestantes === 0
          ? "Último dia do seu período de teste!"
          : `Você ainda tem ${diasRestantes} ${diasRestantes === 1 ? "dia" : "dias"} de teste`,
        description: diasRestantes === 0
          ? "Complete o pagamento hoje para não perder o acesso às funcionalidades do seu plano."
          : `Complete o pagamento antes do término do período de teste para continuar aproveitando todos os benefícios sem interrupções.`,
        highlight: diasRestantes === 0
          ? "⏰ Não perca tempo! Garanta sua assinatura agora"
          : "💡 Garanta a continuidade do seu plano sem interrupções",
        buttonText: "Realizar Pagamento",
        buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
      };
    } else if (isTrialExpirado) {
      // Trial expirado - aviso urgente
      return {
        type: "trial-expirado",
        icon: AlertTriangle,
        variant: "danger" as AlertVariant,
        title: "Período de teste expirado",
        description: "Seu período de teste terminou. Complete o pagamento para continuar utilizando todas as funcionalidades do seu plano.",
        highlight: "⚠️ Você perdeu o acesso. Assine agora para retomar",
        buttonText: "Assinar Agora",
        buttonClass: "bg-red-600 hover:bg-red-700 text-white",
      };
    } else if (isPendentePagamento) {
      // Pendente pagamento - aviso de renovação
      return {
        type: "pendente-pagamento",
        icon: Receipt,
        variant: "warning" as AlertVariant,
        title: "Renovação da sua assinatura",
        description: "Para continuar aproveitando todos os benefícios do seu plano, complete o pagamento da sua assinatura.",
        highlight: "⚠️ Seu acesso está suspenso. Complete o pagamento para retomar",
        buttonText: "Realizar Pagamento",
        buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
      };
    } else {
      // Fallback (não deveria acontecer, mas por segurança)
      return {
        type: "default",
        icon: Receipt,
        variant: "neutral" as AlertVariant,
        title: "Ação necessária",
        description: "Complete o pagamento para continuar utilizando o sistema.",
        highlight: "",
        buttonText: "Realizar Pagamento",
        buttonClass: "bg-primary text-white",
      };
    }
  }, [isValidTrial, isTrialExpirado, isPendentePagamento, diasRestantes]);

  const IconComponent = alertConfig.icon;
  const variantStyles = getAlertStyles(alertConfig.variant);

  // Processar cobranças quando forem carregadas
  useEffect(() => {
    if (!shouldFetchCobrancas || isLoadingCobranca || cobrancas.length === 0) return;

    // Filtrar cobrança subscription pendente e pegar a última
    const cobrancaSubscription = cobrancas
      ?.filter(
        (c: any) =>
          c.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO &&
          c.billing_type === "subscription"
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )?.[0];

    if (!cobrancaSubscription) {
      toast.error("cobranca.erro.naoEncontrada", {
        description: "cobranca.erro.naoEncontradaDescricao",
      });
      setShouldFetchCobrancas(false);
      return;
    }

    setCobrancaData({
      id: cobrancaSubscription.id,
      valor: Number(cobrancaSubscription.valor),
    });
    setIsModalOpen(true);
    setShouldFetchCobrancas(false);
  }, [cobrancas, isLoadingCobranca, shouldFetchCobrancas]);

  const handleAbrirModal = useCallback(() => {
    setShouldFetchCobrancas(true);
    refetchCobrancas();
  }, [refetchCobrancas]);

  const handlePaymentSuccess = useCallback(() => {
    window.location.reload();
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCobrancaData(null);
  }, []);

  return (
    <>
      {/* Mobile - Compact Version */}
      <BaseAlert
        variant={alertConfig.variant}
        className="block sm:hidden mb-4"
        border
        icon={IconComponent}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <IconComponent className={cn("w-6 h-6", variantStyles.icon)} />
          <div>
            <div className={cn("font-bold text-lg", variantStyles.icon)}>
              {alertConfig.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {alertConfig.description}
            </div>
          </div>
          <Button
            size="sm"
            className={cn("w-full", alertConfig.buttonClass)}
            onClick={handleAbrirModal}
            disabled={isLoadingCobranca}
          >
            {isLoadingCobranca ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                {alertConfig.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </BaseAlert>

      {/* Desktop - Full Version */}
      <BaseAlert
        variant={alertConfig.variant}
        className="hidden sm:block mb-4"
        icon={IconComponent}
        border
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <IconComponent className={cn("w-8 h-8 flex-shrink-0 mt-1", variantStyles.icon)} />
            <div>
              <h3 className={cn("text-lg font-bold mb-1", variantStyles.icon)}>
                {alertConfig.title}
              </h3>
              <p className="text-sm text-gray-700 mb-2">{alertConfig.description}</p>
              {alertConfig.highlight && (
                <p className={cn("text-xs font-semibold mb-2", variantStyles.highlight)}>
                  {alertConfig.highlight}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleAbrirModal}
            disabled={isLoadingCobranca}
            className={cn("whitespace-nowrap flex-shrink-0", alertConfig.buttonClass)}
          >
            {isLoadingCobranca ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                {alertConfig.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </BaseAlert>

      {cobrancaData && isModalOpen && (
        <PagamentoAssinaturaDialog
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          cobrancaId={cobrancaData.id}
          valor={cobrancaData.valor}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
