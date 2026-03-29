import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContratoTab } from "@/types/enums";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { Eye, Search, Settings, Loader2, FileText, CheckCircle2, PauseCircle } from "lucide-react";
import { memo, useState } from "react";
import { useIsMobile } from "@/hooks/ui/useIsMobile";

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
  onToggleContratos: (active: boolean) => void | Promise<void>;
  isToggling?: boolean;
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
  isDesativado = false,
  onToggleContratos,
  isToggling = false,
}: ContratosToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const isMobile = useIsMobile();

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
              type="search"
              placeholder="Buscar por passageiro ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all border-none"
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

            {!isMobile ? (
              <Popover open={openPopover} onOpenChange={setOpenPopover} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-12 w-12 bg-white border border-slate-100 shadow-sm transition-all active:scale-95 group hover:bg-slate-50 relative",
                      openPopover ? "ring-2 ring-[#1a3a5c] ring-offset-2" : ""
                    )}
                    title="Configurações e Ações"
                  >
                    {isToggling ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : (
                      <Settings className={cn(
                        "w-5 h-5 transition-colors",
                        isDesativado ? "text-slate-400 group-hover:text-[#1a3a5c]" : "text-[#1a3a5c]"
                      )} />
                    )}
                    {isDesativado && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[320px] p-6 rounded-2xl shadow-xl border-none ring-1 ring-gray-100"
                  align="end"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-headline font-black text-[#1a3a5c] text-sm uppercase tracking-wider">Opções de Contrato</h4>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setOpenPopover(false);
                          onOpenConfig();
                        }}
                        disabled={isDesativado || isToggling}
                        className={cn(
                          "w-full flex items-center justify-start gap-3 h-14 px-4 rounded-2xl transition-all active:scale-[0.98] outline-none",
                          isDesativado
                            ? "opacity-40 grayscale pointer-events-none text-slate-400"
                            : "text-[#1a3a5c] hover:bg-slate-50 active:bg-slate-50"
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors bg-slate-50 text-slate-500">
                          <div className="h-5 w-5 flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                            <FileText />
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                          <span className="font-bold text-sm tracking-tight truncate">Configurar Contrato</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onToggleContratos(isDesativado);
                          setOpenPopover(false);
                        }}
                        disabled={isToggling}
                        className={cn(
                          "w-full flex items-center justify-start gap-3 h-14 px-4 rounded-2xl transition-all active:scale-[0.98] outline-none",
                          !isDesativado
                            ? "text-red-600 bg-red-50/10 hover:bg-red-50/30 active:bg-red-50/50"
                            : "text-[#1a3a5c] active:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          !isDesativado ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                        )}>
                          <div className="h-5 w-5 flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                            {isToggling ? (
                              <Loader2 className="animate-spin" />
                            ) : !isDesativado ? (
                              <PauseCircle />
                            ) : (
                              <CheckCircle2 />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                          <span className="font-bold text-sm tracking-tight truncate">
                            {!isDesativado ? "Desativar Contratos" : "Ativar Contratos"}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-12 w-12 bg-white border border-slate-100 shadow-sm transition-all active:scale-95 group hover:bg-slate-50 relative",
                      openDrawer ? "ring-2 ring-[#1a3a5c] ring-offset-2" : ""
                    )}
                    title="Configurações e Ações"
                  >
                    {isToggling ? (
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    ) : (
                      <Settings className={cn(
                        "w-5 h-5 transition-colors",
                        isDesativado ? "text-slate-400 group-hover:text-[#1a3a5c]" : "text-[#1a3a5c]"
                      )} />
                    )}
                    {isDesativado && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}
                  </Button>
                </DrawerTrigger>

                <DrawerContent className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl pb-8">
                  <DrawerHeader className="text-left mb-2 px-8 pt-6">
                    <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">
                      Opções de Contrato
                    </DrawerTitle>
                    <DrawerDescription className="text-xs font-medium text-gray-400">
                      Gerencie o comportamento global da geração de contratos da sua van.
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="flex-1 overflow-y-auto px-4 pb-10 mt-2">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setOpenDrawer(false);
                          onOpenConfig();
                        }}
                        disabled={isDesativado || isToggling}
                        className={cn(
                          "w-full flex items-center justify-start gap-3 h-14 px-4 rounded-2xl transition-all active:scale-[0.98] outline-none",
                          isDesativado
                            ? "opacity-40 grayscale pointer-events-none text-slate-400"
                            : "text-[#1a3a5c] active:bg-slate-50"
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors bg-slate-50 text-slate-500">
                          <div className="h-5 w-5 flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                            <FileText />
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                          <span className="font-bold text-sm tracking-tight truncate">Configurar Contrato</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onToggleContratos(isDesativado);
                          setOpenDrawer(false);
                        }}
                        disabled={isToggling}
                        className={cn(
                          "w-full flex items-center justify-start gap-3 h-14 px-4 rounded-2xl transition-all active:scale-[0.98] outline-none",
                          !isDesativado
                            ? "text-red-600 bg-red-50/10 active:bg-red-50/50"
                            : "text-[#1a3a5c] active:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          !isDesativado ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"
                        )}>
                          <div className="h-5 w-5 flex items-center justify-center [&_svg]:h-5 [&_svg]:w-5">
                            {isToggling ? (
                              <Loader2 className="animate-spin" />
                            ) : !isDesativado ? (
                              <PauseCircle />
                            ) : (
                              <CheckCircle2 />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                          <span className="font-bold text-sm tracking-tight truncate">
                            {!isDesativado ? "Desativar Uso de Contratos" : "Ativar Uso de Contratos"}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
