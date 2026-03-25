import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CobrancaTab } from "@/types/enums";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { memo } from "react";

interface CobrancasToolbarProps {
  buscaAReceber: string;
  setBuscaAReceber: (busca: string) => void;
  buscaRecebidos: string;
  setBuscaRecebidos: (busca: string) => void;
  countAReceber: number;
  countRecebidos: number;
  activeTab: CobrancaTab;
}

export const CobrancasToolbar = memo(function CobrancasToolbar({
  buscaAReceber,
  setBuscaAReceber,
  buscaRecebidos,
  setBuscaRecebidos,
  activeTab,
}: CobrancasToolbarProps) {
  
  const isPending = activeTab === CobrancaTab.ARECEBER;
  const busca = isPending ? buscaAReceber : buscaRecebidos;
  const setBusca = isPending ? setBuscaAReceber : setBuscaRecebidos;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gray-100/40 p-1 rounded-2xl">
        <TabsList className="grid grid-cols-2 w-full h-11 bg-transparent p-0 gap-1 mt-0">
          <TabsTrigger
            value={CobrancaTab.ARECEBER}
            className="rounded-xl h-full font-headline font-bold text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400"
          >
            A Receber
          </TabsTrigger>
          <TabsTrigger
            value={CobrancaTab.RECEBIDOS}
            className="rounded-xl h-full font-headline font-bold text-sm text-[#1a3a5c] transition-all duration-300 data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400"
          >
            Recebidos
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#1a3a5c] transition-colors" />
        </div>
        <Input
          type="search"
          placeholder="Buscar passageiro ou responsável..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all"
        />
      </div>
    </div>
  );
});
