// React
import { useEffect, useMemo, useState } from "react";

// React Router

// Components - Features
import { AssinaturaDashboard } from "@/components/features/assinatura/dashboard/AssinaturaDashboard";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import { useUsuarioResumo } from "@/hooks/api/useUsuarioResumo";
import { usePlanLimits } from "@/hooks/business/usePlanLimits";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Services
import { useAssinaturaCobrancas } from "@/hooks";

// Utils
import { WhatsappConnect } from "@/components/Whatsapp/WhatsappConnect";
import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { usePermissions } from "@/hooks/business/usePermissions";

export default function Assinatura() {
  const { setPageTitle } = useLayout();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading } = useProfile(user?.id);
  // Hook de permissões
  const { canUseAutomatedCharges: canUseCobrancaAutomatica } = usePermissions();

  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<{
    id: string;
    valor: string | number;
  } | null>(null);

  // ... (lines 61-115)

  // Usar hooks do React Query
  const { data: cobrancasData = [], refetch: refetchCobrancas } =
    useAssinaturaCobrancas(
      profile?.id ? { usuarioId: profile.id } : undefined,
      { enabled: !!profile?.id }
    );

  // New Unified Hook
  const {
    data: systemSummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useUsuarioResumo();

  // Hook de Limites (Simplifica extração de quotas)
  const { limits } = usePlanLimits();

  // Calcular dados derivados primeiro para verificar o plano
  const data = useMemo(() => {
    if (!profile?.assinaturas_usuarios?.[0] || !plano || !systemSummary)
      return null;
    const assinatura = profile.assinaturas_usuarios[0];
    const planoData = assinatura.planos;
    // const usuarioResumo = systemSummary.usuario; // Not needed directly for limits anymore
    // const contadores = systemSummary.contadores; // Not needed directly for limits anymore

    return {
      assinatura: {
        ...assinatura,
        isTrial: plano.isTrial,
      },
      plano: {
        ...planoData,
      },
      cobrancas: cobrancasData as any[],
    };
  }, [profile, plano, cobrancasData, systemSummary]);

  // Atualizar dados com as contagens (Now redundant as 'data' already has them from systemSummary)
  const dataWithCounts = data;

  useEffect(() => {
    setPageTitle("Minha Assinatura");
  }, [setPageTitle]);

  const pullToRefreshReload = async () => {
    await Promise.all([
      refetchCobrancas(),
      ...(canUseCobrancaAutomatica ? [refetchSummary()] : []),
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

  if (isSessionLoading || isProfileLoading || !dataWithCounts || !plano) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen pb-20 space-y-6 bg-gray-50/50">
        <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
          <div className="space-y-6 md:p-6 ">
            {/* Dashboard Unificado */}
            {dataWithCounts && (
              <div className="">
                <AssinaturaDashboard
                  plano={plano}
                  assinatura={dataWithCounts.assinatura}
                  metricas={{
                    passageirosAtivos: limits.passengers.used,
                    limitePassageiros: limits.passengers.limit,
                    cobrancasEmUso: limits.franchise.used,
                    franquiaContratada: limits.franchise.limit,
                  }}
                  cobrancas={dataWithCounts.cobrancas}
                  onPagarClick={handlePagarClick}
                  onRefresh={pullToRefreshReload}
                />

                <div className="mx-1">
                  {plano.isProfissionalPlan && (
                    <>
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 pl-1">
                        Integrações
                      </h2>
                      <WhatsappConnect />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </PullToRefreshWrapper>
        <LoadingOverlay active={refreshing} text="Carregando..." />

        {selectedCobranca && (
          <PagamentoAssinaturaDialog
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setSelectedCobranca(null);
            }}
            cobrancaId={selectedCobranca.id}
            valor={Number(selectedCobranca.valor)}
            onPaymentSuccess={handlePaymentSuccess}
            usuarioId={user?.id}
          />
        )}
      </div>
    </>
  );
}
