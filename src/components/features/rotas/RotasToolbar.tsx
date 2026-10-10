import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface RotasToolbarProps {
  activeTab?: string;
  countMinhasRotas?: number;
  countHistorico?: number;
}

export function RotasToolbar({
  activeTab,
  countMinhasRotas,
  countHistorico,
}: RotasToolbarProps = {}) {
  return (
    <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full sm:w-fit overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x shrink-0">
      <TabsList className="bg-transparent min-h-[38px] sm:min-h-[42px] p-0 gap-1 border-0 w-full sm:w-auto grid grid-cols-2 sm:flex">
        <TabsTrigger
          value="minhas-rotas"
          className={cn(
            "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
            "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
            "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
          )}
        >
          Minhas Rotas
          {countMinhasRotas !== undefined && (
            <span
              className={cn(
                "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                activeTab === "minhas-rotas"
                  ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                  : "text-[#737373]"
              )}
            >
              {countMinhasRotas}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="historico"
          className={cn(
            "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
            "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
            "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
          )}
        >
          Histórico
          {countHistorico !== undefined && (
            <span
              className={cn(
                "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                activeTab === "historico"
                  ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                  : "text-[#737373]"
              )}
            >
              {countHistorico}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
