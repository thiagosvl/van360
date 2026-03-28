import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CobrancaTab } from "@/types/enums";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { memo } from "react";
import { cn } from "@/lib/utils";

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
  countAReceber,
  countRecebidos,
  activeTab,
}: CobrancasToolbarProps) {
  
  const isPending = activeTab === CobrancaTab.ARECEBER;
  const busca = isPending ? buscaAReceber : buscaRecebidos;
  const setBusca = isPending ? setBuscaAReceber : setBuscaRecebidos;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
        <TabsList className="grid grid-cols-2 w-full h-[52px] bg-transparent p-0 gap-1 mt-0">
          <TabsTrigger
            value={CobrancaTab.ARECEBER}
            className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80"
          >
            A Receber
            <span className={cn(
              "ml-2 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors",
              activeTab === CobrancaTab.ARECEBER ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
            )}>
              {countAReceber || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value={CobrancaTab.RECEBIDOS}
            className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80"
          >
            Recebidos
            <span className={cn(
              "ml-2 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-colors",
              activeTab === CobrancaTab.RECEBIDOS ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
            )}>
              {countRecebidos || 0}
            </span>
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
