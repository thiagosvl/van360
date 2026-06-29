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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-black text-[#1a3a5c] tracking-tight uppercase">
              Calculadora
            </h1>
            <p className="text-sm font-semibold text-slate-400">
              Simulações de cenários para o Van360
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              className="text-slate-600"
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
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
        </motion.div>

        <Tabs defaultValue="base" className="w-full space-y-6">
          <div className="bg-slate-200/50 p-1 rounded-[1.25rem] overflow-x-auto scrollbar-none">
            <TabsList className="flex w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0 min-w-max md:min-w-0 md:grid md:grid-cols-3">
              <TabsTrigger
                value="base"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 mr-2 hidden sm:block" />
                Base & Custos
              </TabsTrigger>
              <TabsTrigger
                value="addon"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 mr-2 hidden sm:block" />
                Add-ons
              </TabsTrigger>
              <TabsTrigger
                value="consolidado"
                className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c] px-4 flex-1 whitespace-nowrap"
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
