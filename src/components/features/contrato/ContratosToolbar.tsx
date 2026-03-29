import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContratoTab } from "@/types/enums";
import { formatContratoStatus } from "@/utils/formatters/contrato";
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
  isDesativado?: boolean;
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
  isDesativado,
}: ContratosToolbarProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        {/* Tabs - Estilo Corretor */}
        <div className="bg-slate-200/50 p-1 rounded-[1.25rem] w-full sm:w-fit overflow-x-auto scrollbar-hide">
          <TabsList className="bg-transparent h-[52px] p-0 gap-1 border-0 w-max sm:w-auto">
            <TabsTrigger
              value={ContratoTab.PENDENTES}
              className={cn(
                "rounded-[1rem] px-5 h-full font-headline font-bold text-[13px] transition-all duration-300",
                "data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              )}
            >
              Pendentes
              {countPendentes !== undefined && (
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                  activeTab === ContratoTab.PENDENTES ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                )}>
                  {countPendentes}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={ContratoTab.ASSINADOS}
              className={cn(
                "rounded-[1rem] px-5 h-full font-headline font-bold text-[13px] transition-all duration-300",
                "data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              )}
            >
              Assinados
              {countAssinados !== undefined && (
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                  activeTab === ContratoTab.ASSINADOS ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
                )}>
                  {countAssinados}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={ContratoTab.SEM_CONTRATO}
              className={cn(
                "rounded-[1rem] px-5 h-full font-headline font-bold text-[13px] transition-all duration-300",
                "data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
              )}
            >
              {formatContratoStatus(ContratoTab.SEM_CONTRATO)}
              {countSemContrato !== undefined && (
                <span className={cn(
                  "ml-2.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold transition-colors",
                  activeTab === ContratoTab.SEM_CONTRATO ? "bg-[#1a3a5c]/5 text-[#1a3a5c]" : "bg-slate-200/80 text-slate-400"
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
            <Search className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              busca ? "text-amber-500" : "text-slate-400 group-focus-within:text-[#1a3a5c]"
            )} />
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
              className={cn(
                "h-12 w-12 bg-white border-none rounded-xl shadow-diff-shadow hover:bg-slate-50 hover:text-[#1a3a5c] transition-all active:scale-95"
              )}
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
