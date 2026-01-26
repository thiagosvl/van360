import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { AssinaturaDashboard } from "@/components/features/assinatura/dashboard/AssinaturaDashboard";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { WhatsappConnect } from "@/components/Whatsapp/WhatsappConnect";
import { useLayout } from "@/contexts/LayoutContext";
import { useAssinaturaCobrancas } from "@/hooks/api/useAssinaturaCobrancas";
import { usePermissions } from "@/hooks/business/usePermissions";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useEffect, useMemo, useState } from "react";

export default function Assinatura() {
  const { setPageTitle } = useLayout();
  const { 
    profile, 
    plano, 
    isLoading,
    summary: systemSummary,
    refreshProfile: refetchSummary
  } = usePermissions();

  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<{
    id: string;
    valor: string | number;
  } | null>(null);

  const { data: cobrancasData = [], refetch: refetchCobrancas } =
    useAssinaturaCobrancas(
      profile?.id ? { usuarioId: profile.id } : undefined,
      { enabled: !!profile?.id }
    );

  const { limits } = usePlanLimits();

  const data = useMemo(() => {
    const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
    
    if (!assinatura || !plano || !systemSummary)
      return null;

    const planoData = assinatura.planos || plano;

    return {
      assinatura: {
        ...assinatura,
        isTrial: plano.is_trial_ativo,
      },
      plano: {
        ...planoData,
      },
      cobrancas: cobrancasData as any[],
    };
  }, [profile, plano, cobrancasData, systemSummary]);

  useEffect(() => {
    setPageTitle("Minha Assinatura");
  }, [setPageTitle]);

  const pullToRefreshReload = async () => {
    await Promise.all([
      refetchCobrancas(),
      refetchSummary(),
    ]);
  };

  const handlePaymentSuccess = async () => {
    setPaymentModalOpen(false);
    setSelectedCobranca(null);

    pullToRefreshReload();
  };

  const handlePagarClick = (cobranca: any) => {
    if (cobranca) {
      setSelectedCobranca(cobranca);
      setPaymentModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <LoadingOverlay
          active={true}
          text="Carregando dados da conta..."
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="pb-24">
          <AssinaturaDashboard
            plano={plano}
            assinatura={data.assinatura}
            metricas={{
              passageirosAtivos: systemSummary?.contadores?.passageiros?.ativos ?? 0,
              cobrancasEmUso: limits.franchise.used,
              franquiaContratada: limits.franchise.limit,
            }}
            cobrancas={data.cobrancas}
            onPagarClick={handlePagarClick}
            onRefresh={pullToRefreshReload}
            flags={systemSummary?.usuario?.flags}
          />

          <div className="mx-1">
            {plano?.is_profissional && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-3 pl-1">
                  Integrações
                </h2>
                <WhatsappConnect />
              </>
            )}
          </div>
        </div>
      </PullToRefreshWrapper>

      {paymentModalOpen && selectedCobranca && (
        <PagamentoAssinaturaDialog
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedCobranca(null);
          }}
          cobrancaId={selectedCobranca.id}
          valor={Number(selectedCobranca.valor)}
          nomePlano={data.plano?.nome}
          quantidadePassageiros={data.assinatura?.franquia_cobrancas_mes}
          usuarioId={profile?.id}
          onPaymentVerified={handlePaymentSuccess}
          initialData={selectedCobranca as any}
        />
      )}
    </>
  );
}
