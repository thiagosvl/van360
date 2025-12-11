
import { DateNavigation } from "@/components/common/DateNavigation";
import { UpgradeStickyFooter } from "@/components/common/UpgradeStickyFooter";
import { ContextualUpsellDialog } from "@/components/dialogs/ContextualUpsellDialog";
import { RelatoriosEntradas } from "@/components/features/relatorios/RelatoriosEntradas";
import { RelatoriosOperacional } from "@/components/features/relatorios/RelatoriosOperacional";
import { RelatoriosSaidas } from "@/components/features/relatorios/RelatoriosSaidas";
import { RelatoriosVisaoGeral } from "@/components/features/relatorios/RelatoriosVisaoGeral";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANO_ESSENCIAL } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCobrancas,
  useEscolas,
  useGastos,
  usePassageiros,
  useVeiculos,
} from "@/hooks";
import { useAccessControl } from "@/hooks/business/useAccessControl";
import { useRelatoriosCalculations } from "@/hooks/business/useRelatoriosCalculations";
import { useSession } from "@/hooks/business/useSession";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Relatorios() {
  const navigate = useNavigate();
  const { setPageTitle, openPlanosDialog } = useLayout();
  const { user } = useSession();
  
  // Use Access Control Hook
  const { profile, plano: profilePlano, permissions, limits } = useAccessControl();

  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  // Access Logic
  const hasAccess = permissions.canViewRelatorios;
  const isFreePlan = permissions.isFreePlan;

  // Buscar dados reais - APENAS se tiver acesso
  const shouldFetchData = hasAccess && !!profile?.id;
  // Passageiros sempre busca para exibir o health bar corretamente
  const shouldFetchPassageiros = !!profile?.id;

  const { data: cobrancasData } = useCobrancas(
    {
      usuarioId: profile?.id,
      mes,
      ano,
    },
    { enabled: shouldFetchData }
  );

  const { data: gastosData = [] } = useGastos(
    {
      usuarioId: profile?.id,
      mes,
      ano,
    },
    { enabled: shouldFetchData }
  );

  const { data: passageirosData } = usePassageiros(
    { usuarioId: profile?.id },
    { enabled: shouldFetchPassageiros }
  );

  const { data: escolasData } = useEscolas(profile?.id, {
    enabled: shouldFetchData,
  });

  const { data: veiculosData } = useVeiculos(profile?.id, {
    enabled: shouldFetchData,
  });

  // Calcular dados reais
  const dados = useRelatoriosCalculations({
    hasAccess,
    cobrancasData,
    gastosData,
    passageirosData,
    escolasData,
    veiculosData,
    profilePlano,
    profile,
  });

  useEffect(() => {
    setPageTitle("Relatórios");
  }, [setPageTitle]);

  const handleNavigate = (newMes: number, newAno: number) => {
    setMes(newMes);
    setAno(newAno);
  };

  if (!profilePlano) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="relative min-h-screen pb-20 space-y-6 bg-gray-50/50">
      {/* Premium Banner (Top of Page) */}


      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DateNavigation
          mes={mes}
          ano={ano}
          onNavigate={handleNavigate}
          disabled={!hasAccess}
        />
      </div>

      {/* Desktop Alert Banner for No Access */}
      {!hasAccess && (
        <div className="hidden md:flex bg-amber-50 border border-amber-200 rounded-xl p-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full text-amber-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Você sabe o lucro exato da sua van?
              </p>
              <p className="text-xs text-amber-700">
                Libere o acesso agora e veja seus números reais de faturamento e
                despesas.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsUpgradeDialogOpen(true)}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-none"
          >
            Ver meu Lucro Real
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="visao-geral" className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 md:h-12 inline-flex w-auto min-w-full md:min-w-0">
              <TabsTrigger
                value="visao-geral"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="entradas"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Entradas
              </TabsTrigger>
              <TabsTrigger
                value="saidas"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Saídas
              </TabsTrigger>
              <TabsTrigger
                value="operacional"
                className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none whitespace-nowrap"
              >
                Operacional
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Aba 1: Visão Geral */}
        <TabsContent value="visao-geral">
          <RelatoriosVisaoGeral
            dados={dados.visaoGeral}
            hasAccess={hasAccess}
          />
        </TabsContent>

        {/* Aba 2: Entradas */}
        <TabsContent value="entradas">
          <RelatoriosEntradas
            dados={dados.entradas}
            hasAccess={hasAccess}
          />
        </TabsContent>

        {/* Aba 3: Saídas */}
        <TabsContent value="saidas">
          <RelatoriosSaidas dados={dados.saidas} hasAccess={hasAccess} />
        </TabsContent>

        {/* Aba 4: Operacional */}
        <TabsContent value="operacional">
          <RelatoriosOperacional
            dados={dados.operacional}
            automacao={dados.automacao}
            hasAccess={hasAccess}
            isFreePlan={isFreePlan}
            limits={limits}
            isCompletePlan={!!profilePlano?.isCompletePlan}
          />
        </TabsContent>
      </Tabs>
      {/* Mobile Sticky Footer for No Access */}
      <UpgradeStickyFooter
        visible={!hasAccess}
        title="Você sabe o lucro exato da sua van?"
        description="Veja seus números reais."
        buttonText="Ver meu Lucro Real"
        onAction={() => setIsUpgradeDialogOpen(true)}
      />
      
      <ContextualUpsellDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        feature="relatorios"
        targetPlan={PLANO_ESSENCIAL}
        onViewAllPlans={() => {
            setIsUpgradeDialogOpen(false);
            openPlanosDialog();
        }}
        onSuccess={() => {
            // Recarregar permissões e dados
            window.location.reload(); 
        }}
      />
    </div>
  );
}
