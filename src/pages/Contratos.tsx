import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { CheckCircle2, FileText, Send, UserX } from 'lucide-react';
import {
  useEffect,
  useState
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { KPICard } from '@/components/common/KPICard';
import { PullToRefreshWrapper } from '@/components/navigation/PullToRefreshWrapper';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { ContratosList } from '@/components/features/contrato/ContratosList';
import { ContratosToolbar } from '@/components/features/contrato/ContratosToolbar';

import { ROUTES } from '@/constants/routes';
import { useLayout } from '@/contexts/LayoutContext';
import {
  useContratos,
  useContratosKPIs,
  useCreateContrato,
  useDeleteContrato,
  useDownloadContrato,
  usePreviewContrato,
  useReenviarContrato,
  useSubstituirContrato,
} from '@/hooks/api/useContratos';

import { usePermissions } from '@/hooks/business/usePermissions';
import { openBrowserLink } from '@/utils/browser';

const Contratos = () => {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openContractSetupDialog } = useLayout();
  const { profile } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleOpenContractSetup = () => {
    openContractSetupDialog({
        forceOpen: true,
        onSuccess: (usarContratos) => {
            if (usarContratos) {
                refetchKPIs();
                refetchContratos();
            }
        }
    });
  };

  // Filtros e Abas
  const activeTab = searchParams.get('tab') || 'pendentes';
  const [busca, setBusca] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(busca), 500);
    return () => clearTimeout(handler);
  }, [busca]);

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  // Queries e Mutations
  const { data: kpis, isLoading: isLoadingKPIs, refetch: refetchKPIs } = useContratosKPIs({
      enabled: !!profile?.config_contrato?.usar_contratos
  });
  const { data: contratosRes, isLoading: isLoadingContratos, refetch: refetchContratos } = useContratos(
    { tab: activeTab, search: debouncedSearch },
    { enabled: !!profile?.config_contrato?.usar_contratos }
  );

  const deleteMutation = useDeleteContrato();
  const downloadMutation = useDownloadContrato();
  const reenviarMutation = useReenviarContrato();
  const substituirMutation = useSubstituirContrato();
  const createMutation = useCreateContrato();
  const previewMutation = usePreviewContrato();

  const isActionLoading = 
    deleteMutation.isPending || 
    downloadMutation.isPending || 
    reenviarMutation.isPending || 
    substituirMutation.isPending ||
    createMutation.isPending ||
    previewMutation.isPending;

  const isGlobalLoading = isLoadingKPIs || isLoadingContratos || isActionLoading;

  // Handlers
  useEffect(() => {
    setPageTitle('Contratos');
  }, [setPageTitle]);

  const onRefresh = async () => {
    await Promise.all([refetchKPIs(), refetchContratos()]);
  };

  const handleVerPassageiro = (id: string) => {
    navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(':passageiro_id', id));
  };

  const handleCopiarLink = (token: string) => {
    const url = `${window.location.origin}/assinar/${token}`;
    navigator.clipboard.writeText(url);
  };

  const handleVisualizarLink = (token: string) => {
    openBrowserLink(`${window.location.origin}/assinar/${token}`);
  };

  const handleVisualizarFinal = (url: string) => {
    openBrowserLink(url);
  };

  const handleExcluir = (id: string) => {
    openConfirmationDialog({
      title: 'Excluir Contrato?',
      description: 'Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      variant: 'destructive',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
        closeConfirmationDialog();
      }
    });
  };

  const handleSubstituir = (id: string) => {
    openConfirmationDialog({
      title: 'Substituir Contrato?',
      description: 'O contrato atual será marcado como substituído e um novo será gerado com os dados atuais do passageiro. Deseja continuar?',
      confirmText: 'Continuar',
      onConfirm: async () => {
        await substituirMutation.mutateAsync(id);
        closeConfirmationDialog();
      }
    });
  };

  const handleGerarContrato = (passageiroId: string) => {
    openConfirmationDialog({
      title: 'Gerar Contrato?',
      description: 'Deseja gerar um novo contrato para este passageiro agora?',
      confirmText: 'Gerar',
      onConfirm: async () => {
        await createMutation.mutateAsync({ passageiroId });
        closeConfirmationDialog();
      }
    });
  };

  const actions = {
    onVerPassageiro: handleVerPassageiro,
    onCopiarLink: handleCopiarLink,
    onBaixarPDF: (id: string) => downloadMutation.mutate(id),
    onReenviarNotificacao: (id: string) => reenviarMutation.mutate(id),
    onExcluir: handleExcluir,
    onSubstituir: handleSubstituir,
    onGerarContrato: handleGerarContrato,
    onVisualizarLink: handleVisualizarLink,
    onVisualizarFinal: handleVisualizarFinal,
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={onRefresh}>
        <div className="space-y-6">
          {/* Feature Disabled State */}
          {!profile?.config_contrato?.usar_contratos && (
              <UnifiedEmptyState
                icon={FileText}
                title="Contratos Desativados"
                description={
                  <div className="space-y-1">
                    <p>A funcionalidade de contratos está desativada nas suas configurações.</p>
                    <p>Ative agora mesmo para gerar contratos e coletar assinaturas digitais.</p>
                  </div>
                }
                action={{
                  label: "Ativar Contratos",
                  onClick: () => handleOpenContractSetup(),
                  icon: CheckCircle2
                }}
                className="mt-8 border-dashed border-gray-300 bg-gray-50/50"
              />
          )}

          {/* Active State */}
          {profile?.config_contrato?.usar_contratos && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <KPICard
                  title="Pendentes"
                  value={kpis?.pendentes ?? 0}
                  icon={Send}
                  bgClass="bg-blue-50"
                  colorClass="text-blue-600"
                  countVisible={false}
                  format="number"
                />
                <KPICard
                  title="Assinados"
                  value={kpis?.assinados ?? 0}
                  icon={CheckCircle2}
                  bgClass="bg-green-50"
                  colorClass="text-green-600"
                  countVisible={false}
                  format="number"
                />
                <KPICard
                  title="Sem Contrato"
                  value={kpis?.semContrato ?? 0}
                  icon={UserX}
                  bgClass="bg-orange-50"
                  colorClass="text-orange-600"
                  countVisible={false}
                  format="number"
                  className="col-span-2 md:col-span-1"
                />
              </div>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <ContratosToolbar 
                  busca={busca}
                  setBusca={setBusca}
                  activeTab={activeTab}
                  countPendentes={kpis?.pendentes}
                  countAssinados={kpis?.assinados}
                  countSemContrato={kpis?.semContrato}
                  onOpenConfig={handleOpenContractSetup}
                  onOpenPreview={() => previewMutation.mutate({})}
                />

                <TabsContent value="pendentes" className="mt-0">
                  <ContratosList 
                    data={contratosRes?.data || []} 
                    isLoading={isLoadingContratos} 
                    activeTab="pendentes"
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>

                <TabsContent value="assinados" className="mt-0">
                  <ContratosList 
                    data={contratosRes?.data || []} 
                    isLoading={isLoadingContratos} 
                    activeTab="assinados"
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>

                <TabsContent value="sem_contrato" className="mt-0">
                  <ContratosList 
                    data={contratosRes?.data || []} 
                    isLoading={isLoadingContratos} 
                    activeTab="sem_contrato"
                    busca={debouncedSearch}
                    {...actions}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isGlobalLoading} text={isActionLoading ? "Processando..." : "Carregando..."} />
    </>
  );
};

export default Contratos;
