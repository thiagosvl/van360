// React
import { useEffect, useMemo, useState } from "react";

// React Router
import { useNavigate } from "react-router-dom";

// Components - Features
import { SelecaoPassageirosDialog } from "@/components/dialogs/SelecaoPassageirosDialog";
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
import { useAssinaturaCobrancas, useGerarPixParaCobranca, usePassageiroContagem } from "@/hooks";
import { usuarioApi } from "@/services";

// Utils
import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { toast } from "@/utils/notifications/toast";

export default function Assinatura() {
  const { setPageTitle } = useLayout();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, plano, isLoading: isProfileLoading, refreshProfile } = useProfile(user?.id);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<{
    id: string;
    valor: string | number;
  } | null>(null);
  const [selecaoPassageirosDialog, setSelecaoPassageirosDialog] = useState<{
    isOpen: boolean;
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId?: string;
  } | null>(null);

  const navigate = useNavigate();
  const gerarPix = useGerarPixParaCobranca();

  // Usar hooks do React Query
  const { data: cobrancasData = [], refetch: refetchCobrancas } = useAssinaturaCobrancas(
    profile?.id ? { usuarioId: profile.id } : undefined,
    { enabled: !!profile?.id }
  );

  const { data: countPassageirosAtivos = { count: 0 }, refetch: refetchPassageirosContagem } = usePassageiroContagem(
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
    // - Completo: sempre ilimitado
    let limitePassageiros = planoData.limite_passageiros;
    
    if (plano.isCompletePlan) {
      // Completo sempre tem passageiros ilimitados
      limitePassageiros = null;
    } else if (plano.isEssentialPlan) {
      // Essencial sempre tem passageiros ilimitados (trial e ativo)
      limitePassageiros = null;
    }
    // Caso contrário, mantém o limite do plano (apenas Gratuito)
    
    return {
      assinatura: assinatura,
      plano: planoData,
      cobrancas: cobrancasData,
      passageirosAtivos: 0, // Será atualizado abaixo
      limitePassageiros,
      franquiaContratada: assinatura.franquia_contratada_cobrancas,
      cobrancasEmUso: 0, // Será atualizado abaixo
    };
  }, [profile, plano, cobrancasData]);

  // Só buscar contagem de cobranças automáticas se for plano Completo
  const { data: countPassageirosEnviarCobrancaAutomatica = { count: 0 }, refetch: refetchCobrancasAutomaticas } = usePassageiroContagem(
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
      cobrancasEmUso: (countPassageirosEnviarCobrancaAutomatica as any)?.count ?? 0,
    };
  }, [data, countPassageirosAtivos, countPassageirosEnviarCobrancaAutomatica]);

  useEffect(() => {
    setPageTitle("Minha Assinatura");
  }, [setPageTitle]);


  const pullToRefreshReload = async () => {
    await Promise.all([
      refetchCobrancas(),
      refetchPassageirosContagem(),
      ...(canUseCobrancaAutomatica(plano) ? [refetchCobrancasAutomaticas()] : []),
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
        usuarioId: profile.id
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
    if (!dataWithCounts?.plano || !plano) return "Tem certeza que deseja cancelar sua assinatura?";

    const planoAtual = dataWithCounts.plano as any;
    const planoNome = planoAtual.parent?.nome ?? planoAtual.nome;

    if (plano.isCompletePlan) {
      return "Ao cancelar, você perderá funcionaliades avançadas, cobranças automáticas e acesso a relatórios detalhados. Você será migrado para o Plano Gratuito ao final do período contratado.";
    } else if (plano.isEssentialPlan) {
      return "Ao cancelar, você perderá passageiros ilimitados, envio de lembretes de cobrança e suporte via WhatsApp. Você será migrado para o Plano Gratuito ao final do período contratado.";
    }

    return `Ao cancelar sua assinatura do ${planoNome}, você perderá direito a funcionalidades e benefícios do plano. Você será migrado para o Plano Gratuito ao final do período contratado.`;
  };

  const handlePaymentSuccess = async () => {
    setPaymentModalOpen(false);
    setSelectedCobranca(null);
    
    // Aguardar um pouco para o backend processar a atualização
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Redirect literal para /assinatura forçando reload completo e atualização do profile
    window.location.href = "/assinatura";
  };

  const handlePagarClick = (cobranca: any) => {
      if (cobranca) {
          setSelectedCobranca(cobranca);
          setPaymentModalOpen(true);
      }
  };

  const handlePrecisaSelecaoManual = (data: {
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId: string;
  }) => {
    setSelecaoPassageirosDialog({
      isOpen: true,
      tipo: data.tipo,
      franquia: data.franquia,
      cobrancaId: data.cobrancaId,
    });
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
                        franquiaContratada: dataWithCounts.franquiaContratada
                    }}
                    cobrancas={dataWithCounts.cobrancas}
                    onPagarClick={handlePagarClick}
                    onCancelClick={handleCancelSubscriptionClick}
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
          usuarioId={profile?.id}
          onPrecisaSelecaoManual={handlePrecisaSelecaoManual}
        />
      )}

      {selecaoPassageirosDialog && profile?.id && (
        <SelecaoPassageirosDialog
          isOpen={selecaoPassageirosDialog.isOpen}
          usuarioId={profile.id}
          tipo={selecaoPassageirosDialog.tipo}
          franquia={selecaoPassageirosDialog.franquia}
          onClose={() => setSelecaoPassageirosDialog(null)}
          onConfirm={async (passageiroIds) => {
            try {
              setRefreshing(true);
              const resultado = await usuarioApi.confirmarSelecaoPassageiros(
                profile.id!,
                { 
                  passageiroIds, 
                  franquia: selecaoPassageirosDialog.franquia,
                  tipo: selecaoPassageirosDialog.tipo,
                }
              );
              
              setSelecaoPassageirosDialog(null);
              
              toast.success("assinatura.sucesso.atualizada", {
                description: `${resultado.ativados} passageiros ativados, ${resultado.desativados} desativados.`,
              });

              // Após seleção, gerar PIX para a cobrança se houver ID
              if (selecaoPassageirosDialog.cobrancaId) {
                const cobrancaEncontrada = dataWithCounts.cobrancas.find(
                  (c: any) => c.id === selecaoPassageirosDialog.cobrancaId
                );
                
                gerarPix.mutate(selecaoPassageirosDialog.cobrancaId, {
                  onSuccess: (pixResult: any) => {
                    if (pixResult.precisaSelecaoManual) {
                      toast.error("assinatura.erro.processar", {
                        description: "Ainda é necessário selecionar passageiros. Tente novamente.",
                      });
                      return;
                    }
                    
                    setSelectedCobranca({
                      id: selecaoPassageirosDialog.cobrancaId!,
                      valor: cobrancaEncontrada?.valor || 0,
                    });
                    setPaymentModalOpen(true);
                  },
                  onError: (error: any) => {
                    toast.error("assinatura.erro.gerarPix", {
                      description: error.response?.data?.error || "Erro ao gerar PIX após seleção.",
                    });
                  },
                });
              } else {
                 await refreshProfile();
                 window.location.reload();
              }
            } catch (error: any) {
              toast.error("assinatura.erro.processar", {
                description: error.response?.data?.error || "Erro ao confirmar seleção.",
              });
            } finally {
              setRefreshing(false);
            }
          }}
        />
      )}
    </>
  );
}
