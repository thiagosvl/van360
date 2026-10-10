import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCalculatorUI } from "@/hooks/ui/admin/useAdminCalculatorUI";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";
import { CalculatorBaseTab } from "@/components/features/admin/calculator/CalculatorBaseTab";
import { CalculatorConsolidatedTab } from "@/components/features/admin/calculator/CalculatorConsolidatedTab";
import { motion } from "framer-motion";
import { Calculator, LineChart, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCalculator() {
  const calcHook = useAdminCalculatorUI();
  const { openConfirmationDialog, closeConfirmationDialog, setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Hub de Inteligência Financeira & Unit Economics");
  }, [setPageTitle]);

  return (
    <div className="space-y-6 pb-20 text-foreground">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hub de inteligência financeira</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Simule a economia unitária por condutor, impacto do WABA, custos de infraestrutura e ponto de equilíbrio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-border bg-background text-foreground hover:bg-secondary text-xs font-medium"
              onClick={() => {
                openConfirmationDialog({
                  title: "Resetar cenário",
                  description: "Tem certeza que deseja resetar o cenário para os valores padrões? Esta ação não pode ser desfeita.",
                  confirmText: "Resetar",
                  variant: "destructive",
                  onConfirm: () => {
                    calcHook.handleResetScenario();
                    closeConfirmationDialog();
                  },
                });
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Resetar
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-xs"
              onClick={() => {
                openConfirmationDialog({
                  title: "Salvar cenário",
                  description: "Deseja salvar esta simulação? Ela será carregada automaticamente na sua próxima visita.",
                  confirmText: "Salvar cenário",
                  onConfirm: () => {
                    calcHook.handleSaveScenario();
                    closeConfirmationDialog();
                  },
                });
              }}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Salvar cenário
            </Button>
          </div>
        </div>

        <Tabs
          value={calcHook.activeTab}
          onValueChange={(val) => calcHook.setActiveTab(val as "simulador" | "dre")}
          className="w-full space-y-6"
        >
          <div className="bg-card border border-border p-1 rounded-xl overflow-x-auto scrollbar-none">
            <TabsList className="flex w-full min-h-[36px] bg-transparent p-0 gap-1 mt-0 min-w-max md:min-w-0 md:grid md:grid-cols-2">
              <TabsTrigger
                value="simulador"
                className="rounded-lg h-full font-medium text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap"
              >
                <Calculator className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                Simulador & custos de infra
              </TabsTrigger>
              <TabsTrigger
                value="dre"
                className="rounded-lg h-full font-medium text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground hover:text-foreground px-4 flex-1 whitespace-nowrap"
              >
                <LineChart className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
                DRE & projeções (12 meses)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="simulador"
            className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform"
          >
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorBaseTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="dre"
            className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform"
          >
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorConsolidatedTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
