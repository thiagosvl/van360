import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContratoTab } from "@/types/enums";
import { Eye, Search, Settings } from "lucide-react";
import { memo } from "react";

interface ContratosToolbarProps {
  busca: string;
  setBusca: (val: string) => void;
  activeTab: ContratoTab;
  countPendentes?: number;
  countAssinados?: number;
  countSemContrato?: number;
  onOpenConfig: () => void;
  onOpenPreview: () => void;
}

export const ContratosToolbar = memo(function ContratosToolbar({
  busca,
  setBusca,
  activeTab,
  countPendentes,
  countAssinados,
  countSemContrato,
  onOpenConfig,
  onOpenPreview,
}: ContratosToolbarProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        {/* Tabs - Estilo Corretor */}
        <div className="bg-slate-100/50 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
          <TabsList className="bg-transparent h-11 p-0 gap-1 border-0 w-max sm:w-auto">
            <TabsTrigger
              value={ContratoTab.PENDENTES}
              className={cn(
                "rounded-xl px-5 h-full font-headline font-bold text-sm transition-all duration-300",
                "data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-md",
                "data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c]"
              )}
            >
              Pendentes
              {countPendentes !== undefined && (
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold",
                  activeTab === ContratoTab.PENDENTES ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {countPendentes}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={ContratoTab.ASSINADOS}
              className={cn(
                "rounded-xl px-5 h-full font-headline font-bold text-sm transition-all duration-300",
                "data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-md",
                "data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c]"
              )}
            >
              Assinados
              {countAssinados !== undefined && (
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold",
                  activeTab === ContratoTab.ASSINADOS ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {countAssinados}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={ContratoTab.SEM_CONTRATO}
              className={cn(
                "rounded-xl px-5 h-full font-headline font-bold text-sm transition-all duration-300",
                "data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-md",
                "data-[state=inactive]:text-slate-400 hover:text-[#1a3a5c]"
              )}
            >
              Sem Contrato
              {countSemContrato !== undefined && (
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold",
                  activeTab === ContratoTab.SEM_CONTRATO ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {countSemContrato}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          {/* Busca */}
          <div className="relative group flex-grow xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1a3a5c] transition-colors" />
            <Input
              placeholder="Buscar por passageiro ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-11 pr-4 bg-white border-none shadow-diff-shadow h-12 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-400 transition-all focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/10"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 bg-white border-none rounded-xl shadow-diff-shadow hover:bg-slate-50 hover:text-[#1a3a5c] transition-all active:scale-95"
              onClick={onOpenPreview}
              title="Visualizar Modelo"
            >
              <Eye className="w-5 h-5 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 bg-white border-none rounded-xl shadow-diff-shadow hover:bg-slate-50 hover:text-[#1a3a5c] transition-all active:scale-95"
              onClick={onOpenConfig}
              title="Configurações"
            >
              <Settings className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
