
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { Bot, Search } from "lucide-react";

interface CobrancasFiltersProps {
  onUpgrade: (feature: string, description: string) => void;
  plano?: any;
  buscaAbertas: string;
  setBuscaAbertas: (value: string) => void;
  buscaPagas: string;
  setBuscaPagas: (value: string) => void;
  countAbertas: number;
  countPagas: number;
}

export function CobrancasFilters({
  onUpgrade,
  plano,
  buscaAbertas,
  setBuscaAbertas,
  buscaPagas,
  setBuscaPagas,
  countAbertas,
  countPagas,
}: CobrancasFiltersProps) {
    const isPlanLimited = plano?.slug && [PLANO_GRATUITO, PLANO_ESSENCIAL].includes(plano.slug);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
      {/* Segmented Control */}
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

      {/* Botão Automatizar (Desktop) */}
      {isPlanLimited && (
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex h-10 md:h-12 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 gap-2"
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

      {/* Search Bar */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar passageiro..."
          className="pl-10 h-10 md:h-11 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm sm:text-base"
          value={buscaAbertas}
          onChange={(e) => {
            setBuscaAbertas(e.target.value);
            setBuscaPagas(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
