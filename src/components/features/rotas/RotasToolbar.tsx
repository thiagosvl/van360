import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RotasToolbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function RotasToolbar({}: RotasToolbarProps = {}) {
  return (
    <div className="bg-slate-200/50 p-1 rounded-[1.25rem]">
      <TabsList className="grid grid-cols-2 w-full min-h-[40px] bg-transparent p-0 gap-1 mt-0">
        <TabsTrigger
          value="minhas-rotas"
          className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
        >
          Minhas Rotas
        </TabsTrigger>
        <TabsTrigger
          value="historico"
          className="rounded-[1rem] h-full font-headline font-bold text-[13px] transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-[#16314f] data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500/80 hover:text-[#1a3a5c]"
        >
          Histórico
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
