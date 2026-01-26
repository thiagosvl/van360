import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Search } from "lucide-react";

interface CobrancasToolbarProps {
  onUpgrade: (feature: string, description: string) => void;
  // plano?: any; // unused in current implementation
  buscaAbertas: string;
  setBuscaAbertas: (value: string) => void;
  buscaPagas: string;
  setBuscaPagas: (value: string) => void;
  countAbertas: number;
  countPagas: number;
  canUseAutomatedCharges: boolean;
  activeTab: string;
}

export function CobrancasToolbar({
  onUpgrade,
  buscaAbertas,
  setBuscaAbertas,
  buscaPagas,
  setBuscaPagas,
  countAbertas,
  countPagas,
  canUseAutomatedCharges,
  activeTab
}: CobrancasToolbarProps) {
  
  const showUpgradeButton = !canUseAutomatedCharges;
  const currentSearch = activeTab === "pendentes" ? buscaAbertas : buscaPagas;
  const setCurrentSearch = activeTab === "pendentes" ? setBuscaAbertas : setBuscaPagas;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* 1. Tabs (Left) */}
      <TabsList className="bg-gray-100/80 p-1 rounded-xl h-10 md:h-12 w-full md:w-auto self-start">
        <TabsTrigger
          value="pendentes"
          className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
        >
          Pendentes
          <Badge
            variant="secondary"
            className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
          >
            {countAbertas}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="pagas"
          className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
        >
          Pagas
          <Badge
            variant="secondary"
            className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
          >
            {countPagas}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* 2. Actions (Right - Desktop Only, automated button) */}
      <div className="flex items-center gap-3 w-full md:w-auto">
         {/* Search Bar - Full width on mobile, auto on desktop */}
        <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
            placeholder="Buscar passageiro..."
            className="pl-10 h-10 md:h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm sm:text-base"
            value={currentSearch}
            onChange={(e) => setCurrentSearch(e.target.value)}
            />
        </div>

        {showUpgradeButton && (
            <Button
            variant="outline"
            className="hidden md:flex h-10 md:h-12 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 gap-2 whitespace-nowrap rounded-xl"
            onClick={() =>
                onUpgrade(
                "Cobranças Automáticas",
                "Automatize o envio de cobranças e reduza a inadimplência."
                )
            }
            >
            <Bot className="w-4 h-4" />
            Automatizar
            </Button>
        )}
      </div>
       
       {/* Mobile Automate Button - Below if needed or inline? 
           Original code had it hidden on mobile? 
           "className="hidden md:flex..." 
           I will keep it hidden on mobile to match original requirement unless specified otherwise.
       */}
    </div>
  );
}
