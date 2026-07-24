import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCalculator } from "@/hooks/business/admin/useAdminCalculator";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";
import { CalculatorBaseTab } from "@/components/features/admin/calculator/CalculatorBaseTab";
import { CalculatorAddonTab } from "@/components/features/admin/calculator/CalculatorAddonTab";
import { CalculatorConsolidatedTab } from "@/components/features/admin/calculator/CalculatorConsolidatedTab";
import { motion } from "framer-motion";
import { Calculator, PlusCircle, LineChart, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notifications/toast";

export default function AdminCalculator() {
  const calcHook = useAdminCalculator();
  const { openConfirmationDialog, closeConfirmationDialog, setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Calculadora");
  }, [setPageTitle]);

  return (
    <div className="space-y-6 pb-20 text-slate-100">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => {
                openConfirmationDialog({
                  title: 'Resetar Cenário',
                  description: 'Tem certeza que deseja resetar o cenário para os valores padrões? Esta ação não pode ser desfeita.',
                  confirmText: 'Resetar',
                  variant: 'destructive',
                  onConfirm: () => {
                    calcHook.clearScenario();
                    toast.success('Cenário resetado para os valores padrões.');
                    closeConfirmationDialog();
                  }
                });
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 font-bold"
              onClick={() => {
                openConfirmationDialog({
                  title: 'Salvar Cenário',
                  description: 'Deseja salvar esta simulação? Ela será carregada automaticamente na sua próxima visita.',
                  confirmText: 'Salvar Cenário',
                  onConfirm: () => {
                    calcHook.saveScenario();
                    toast.success('Cenário salvo com sucesso!');
                    closeConfirmationDialog();
                  }
                });
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Cenário
            </Button>
          </div>
        </div>

        <Tabs defaultValue="base" className="w-full space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-[1.25rem] overflow-x-auto scrollbar-none">
            <TabsList className="flex w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0 min-w-max md:min-w-0 md:grid md:grid-cols-3">
              <TabsTrigger
                value="base"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 mr-2 hidden sm:block" />
                Base & Custos
              </TabsTrigger>
              <TabsTrigger
                value="addon"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 mr-2 hidden sm:block" />
                Add-ons
              </TabsTrigger>
              <TabsTrigger
                value="consolidado"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-slate-400 hover:text-white px-4 flex-1 whitespace-nowrap"
              >
                <LineChart className="w-4 h-4 mr-2 hidden sm:block" />
                Visão Investidor
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="base" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorBaseTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>

          <TabsContent value="addon" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorAddonTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>

          <TabsContent value="consolidado" className="m-0 mt-0 border-0 outline-none p-0 focus-visible:ring-0 focus-visible:outline-none transform-gpu will-change-transform">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorConsolidatedTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
