import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Search, Settings } from "lucide-react";
import { memo } from "react";

interface ContratosToolbarProps {
  busca: string;
  setBusca: (val: string) => void;
  activeTab: string;
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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs - Estilo mobile scrollable */}
        <div className="overflow-x-auto pb-1 -mb-1 scrollbar-hide">
          <TabsList className="bg-gray-100/80 p-1 rounded-xl w-fit flex-nowrap border-0">
            <TabsTrigger
              value="pendentes"
              className="rounded-lg px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
            >
              Pendentes
              {countPendentes !== undefined && (
                <span className="ml-2 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">
                  {countPendentes}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="assinados"
              className="rounded-lg px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all"
            >
              Assinados
              {countAssinados !== undefined && (
                <span className="ml-2 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">
                  {countAssinados}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sem_contrato"
              className="rounded-lg px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
            >
              Sem Contrato
              {countSemContrato !== undefined && (
                <span className="ml-2 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">
                  {countSemContrato}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>



        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Busca */}
          <div className="relative w-full md:w-72 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por passageiro ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl h-11 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 bg-white border-gray-200 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors"
              onClick={onOpenPreview}
              title="Visualizar Modelo"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 bg-white border-gray-200 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors"
              onClick={onOpenConfig}
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
