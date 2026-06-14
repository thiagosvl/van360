import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCalculator } from "@/hooks/business/admin/useAdminCalculator";
import { CalculatorBaseTab } from "@/components/features/admin/calculator/CalculatorBaseTab";
import { CalculatorAddonTab } from "@/components/features/admin/calculator/CalculatorAddonTab";
import { CalculatorConsolidatedTab } from "@/components/features/admin/calculator/CalculatorConsolidatedTab";
import { motion } from "framer-motion";
import { Calculator, PlusCircle, LineChart, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notifications/toast";

export default function AdminCalculator() {
  const calcHook = useAdminCalculator();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Painel Executivo</h1>
            <p className="text-slate-500 mt-1.5 text-sm md:text-base max-w-xl">
              Modelagem financeira inteligente. Simule o crescimento do Van360 manipulando variáveis de mercado em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/60 hover:bg-white text-slate-600 border-slate-200"
              onClick={() => {
                calcHook.clearScenario();
                toast.success('Cenário resetado para os valores padrões.');
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
              onClick={() => {
                calcHook.saveScenario();
                toast.success('Cenário salvo!', { description: 'Sua simulação foi salva no navegador e será carregada na próxima visita.' });
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Cenário
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="base" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3 md:w-auto md:inline-grid bg-white/60 backdrop-blur-md border border-slate-200/50 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="base" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Calculator className="w-4 h-4 mr-2 hidden sm:block" />
              Base & Custos
            </TabsTrigger>
            <TabsTrigger value="addon" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <PlusCircle className="w-4 h-4 mr-2 hidden sm:block" />
              Add-ons
            </TabsTrigger>
            <TabsTrigger value="consolidado" className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <LineChart className="w-4 h-4 mr-2 hidden sm:block" />
              Visão Investidor
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="base" className="m-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorBaseTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="addon" className="m-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorAddonTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="consolidado" className="m-0 focus-visible:outline-none">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <CalculatorConsolidatedTab calcHook={calcHook} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
