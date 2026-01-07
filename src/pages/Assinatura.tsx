// React
import { useEffect, useMemo, useState } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Components - Features
import { AssinaturaDashboard } from "@/components/features/assinatura/dashboard/AssinaturaDashboard";

// Components - Navigation
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Services
import {
  useAssinaturaCobrancas,
  useGerarPixParaCobranca,
  usePassageiroContagem,
} from "@/hooks";
import { usuarioApi } from "@/services";

// Utils
import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { toast } from "@/utils/notifications/toast";

export default function Assinatura() {
  const { setPageTitle } = useLayout();
  const { user, loading: isSessionLoading } = useSession();
  const {
    profile,
    plano,
    isLoading: isProfileLoading,
  } = useProfile(user?.id);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<{
    id: string;
    valor: string | number;
  } | null>(null);





  const navigate = useNavigate();
  const gerarPix = useGerarPixParaCobranca();

  // Usar hooks do React Query
  const { data: cobrancasData = [], refetch: refetchCobrancas } =
    useAssinaturaCobrancas(
      profile?.id ? { usuarioId: profile.id } : undefined,
      { enabled: !!profile?.id }
    );

  const {
    data: countPassageirosAtivos = { count: 0 },
    refetch: refetchPassageirosContagem,
  } = usePassageiroContagem(
    profile?.id,
    { ativo: "true" },
    { enabled: !!profile?.id }
  );

  // Calcular dados derivados primeiro para verificar o plano
  const data = useMemo(() => {
    if (!profile?.assinaturas_usuarios?.[0] || !plano) return null;
    const assinatura = profile.assinaturas_usuarios[0];
    const planoData = assinatura.planos;

    // Calcular limitePassageiros usando informações do hook useProfile:
    // - Gratuito: sempre tem limite
    // - Essencial: sempre ilimitado (trial e ativo) - estratégia de lock-in
    // - Profissional: sempre ilimitado
    let limitePassageiros = planoData.limite_passageiros;

    if (plano.isProfissionalPlan) {
      // Profissional sempre tem passageiros ilimitados
      limitePassageiros = null;
    } else if (plano.isEssentialPlan) {
      // Essencial sempre tem passageiros ilimitados (trial e ativo)
      limitePassageiros = null;
    }
    // Caso contrário, mantém o limite do plano (apenas Gratuito)

    return {
      assinatura: {
        ...assinatura,
        isTrial: plano.isTrial,
      },
      plano: planoData,
      cobrancas: cobrancasData as any[], // Explicit cast to any[] to fix 'find' and 'map' errors downstream
      passageirosAtivos: 0, // Será atualizado abaixo
      limitePassageiros,
      franquiaContratada: assinatura.franquia_contratada_cobrancas,
      cobrancasEmUso: 0, // Será atualizado abaixo
    };
  }, [profile, plano, cobrancasData]);

  // Só buscar contagem de cobranças automáticas se for plano Profissional
  const {
    data: countPassageirosEnviarCobrancaAutomatica = { count: 0 },
    refetch: refetchCobrancasAutomaticas,
  } = usePassageiroContagem(
    profile?.id,
    { enviar_cobranca_automatica: "true" },
    { enabled: !!profile?.id && canUseCobrancaAutomatica(plano) }
  );

  // Atualizar dados com as contagens
  const dataWithCounts = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      passageirosAtivos: (countPassageirosAtivos as any)?.count ?? 0,
      cobrancasEmUso:
        (countPassageirosEnviarCobrancaAutomatica as any)?.count ?? 0,
    };
  }, [data, countPassageirosAtivos, countPassageirosEnviarCobrancaAutomatica]);

  useEffect(() => {
    setPageTitle("Minha Assinatura");
  }, [setPageTitle]);

  const pullToRefreshReload = async () => {
    await Promise.all([
      refetchCobrancas(),
      refetchPassageirosContagem(),
      ...(canUseCobrancaAutomatica(plano)
        ? [refetchCobrancasAutomaticas()]
        : []),
    ]);
  };

  const handleAbandonCancelSubscriptionClick = async () => {
    if (!dataWithCounts || !profile?.id) return;

    setRefreshing(true);

    try {
      await usuarioApi.desistirCancelarAssinatura(profile.id);
      window.location.reload();
    } catch (error: any) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelSubscriptionClick = () => {
    // Mostrar dialog de confirmação
    setShowCancelDialog(true);
  };

  const confirmCancelSubscription = async () => {
    if (!dataWithCounts || !profile?.id) return;

    setRefreshing(true);
    setShowCancelDialog(false);

    try {
      await usuarioApi.cancelarAssinatura({
        usuarioId: profile.id,
      });
      window.location.reload();
    } catch (error: any) {
      toast.error("assinatura.erro.cancelar", {
        description: error.message || "Não foi possível cancelar a assinatura.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Gerar mensagem de cancelamento baseada no plano atual
  const getMensagemCancelamento = () => {
    if (!dataWithCounts?.plano || !plano)
      return "Tem certeza que deseja cancelar sua assinatura?";

    const planoAtual = dataWithCounts.plano as any;
    const planoNome = planoAtual.parent?.nome ?? planoAtual.nome;

    if (plano.isProfissionalPlan) {
      return "Ao cancelar, você perderá funcionaliades avançadas, cobranças automáticas e acesso a relatórios detalhados. Você será migrado para o Plano Gratuito ao final do período contratado.";
    } else if (plano.isEssentialPlan) {
      return "Ao cancelar, você perderá passageiros ilimitados, envio de lembretes de cobrança e suporte via WhatsApp. Você será migrado para o Plano Gratuito ao final do período contratado.";
    }

    return `Ao cancelar sua assinatura do ${planoNome}, você perderá direito a funcionalidades e benefícios do plano. Você será migrado para o Plano Gratuito ao final do período contratado.`;
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
              <AssinaturaDashboard
                plano={plano}
                assinatura={dataWithCounts.assinatura}
                metricas={{
                  passageirosAtivos: dataWithCounts.passageirosAtivos,
                  limitePassageiros: dataWithCounts.limitePassageiros,
                  cobrancasEmUso: dataWithCounts.cobrancasEmUso,
                  franquiaContratada: dataWithCounts.franquiaContratada,
                }}
                cobrancas={dataWithCounts.cobrancas}
                onPagarClick={handlePagarClick}
                onCancelClick={handleCancelSubscriptionClick}
                onRefresh={pullToRefreshReload}
              />
            )}
          </div>
        </PullToRefreshWrapper>
        <LoadingOverlay active={refreshing} text="Carregando..." />

        {/* Dialog de Confirmação de Cancelamento */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
              <AlertDialogDescription>
                {getMensagemCancelamento()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelSubscription}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar cancelamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
