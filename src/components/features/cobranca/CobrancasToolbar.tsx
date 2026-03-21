import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

interface CobrancasToolbarProps {
  buscaAReceber: string;
  setBuscaAReceber: (value: string) => void;
  buscaRecebidos: string;
  setBuscaRecebidos: (value: string) => void;
  countAReceber: number;
  countRecebidos: number;
  activeTab: string;
}

export function CobrancasToolbar({
  buscaAReceber,
  setBuscaAReceber,
  buscaRecebidos,
  setBuscaRecebidos,
  countAReceber,
  countRecebidos,
  activeTab
}: CobrancasToolbarProps) {
  
  const currentSearch = activeTab === "areceber" ? buscaAReceber : buscaRecebidos;
  const setCurrentSearch = activeTab === "areceber" ? setBuscaAReceber : setBuscaRecebidos;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      {/* 1. Tabs (Left) */}
      <TabsList className="bg-gray-100/80 p-1 rounded-xl h-10 md:h-12 w-full md:w-auto self-start">
        <TabsTrigger
          value="areceber"
          className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
        >
          A receber
          <Badge
            variant="secondary"
            className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
          >
            {countAReceber}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="recebidos"
          className="rounded-lg h-8 md:h-10 px-4 md:px-6 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 transition-all flex-1 md:flex-none"
        >
          Recebidos
          <Badge
            variant="secondary"
            className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200 text-[10px] md:text-xs"
          >
            {countRecebidos}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* 2. Actions (Right) */}
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
      </div>
    </div>
  );
}
