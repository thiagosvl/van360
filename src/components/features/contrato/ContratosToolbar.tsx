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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContratoTab } from "@/types/enums";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search, Settings, Loader2, FileText, CheckCircle2, PauseCircle, UploadCloud } from "lucide-react";
import { memo, useState } from "react";
import { useIsMobile } from "@/hooks/ui/useIsMobile";

interface ContratosToolbarProps {
  busca: string;
  setBusca: (val: string) => void;
  activeTab: ContratoTab;
  countPendentes?: number;
  countSemContrato?: number;
  countAssinados?: number;
  isLoadingKPIs?: boolean;
  onOpenConfig: () => void;
  onOpenPreview: () => void;
  onImportarContrato?: () => void;
  isDesativado?: boolean;
  isContratoConfigurado?: boolean;
  onToggleContratos: (active: boolean) => void | Promise<void>;
  isToggling?: boolean;
  isPreviewLoading?: boolean;
}

export const ContratosToolbar = memo(function ContratosToolbar({
  busca,
  setBusca,
  activeTab,
  countPendentes,
  countSemContrato,
  countAssinados,
  isLoadingKPIs = false,
  onOpenConfig,
  onOpenPreview,
  onImportarContrato,
  isDesativado = false,
  isContratoConfigurado = false,
  onToggleContratos,
  isToggling = false,
  isPreviewLoading = false,
}: ContratosToolbarProps) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
        <div className="bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5] w-full sm:w-fit overflow-x-auto scrollbar-hide no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          <TabsList className="bg-transparent min-h-[38px] sm:min-h-[42px] p-0 gap-1 border-0 w-max sm:w-auto">
            <TabsTrigger
              value={ContratoTab.SEM_CONTRATO}
              className={cn(
                "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
              )}
            >
              {formatContratoStatus(ContratoTab.SEM_CONTRATO)}
              {isLoadingKPIs ? (
                <Skeleton className="ml-2 w-5 h-4 rounded-[12px] bg-[#e5e5e5] shrink-0" />
              ) : countSemContrato !== undefined && (
                <span
                  className={cn(
                    "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                    activeTab === ContratoTab.SEM_CONTRATO
                      ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                      : "text-[#737373]"
                  )}
                >
                  {countSemContrato}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value={ContratoTab.PENDENTES}
              className={cn(
                "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
              )}
            >
              Assinaturas Pendentes
              {isLoadingKPIs ? (
                <Skeleton className="ml-2 w-5 h-4 rounded-[12px] bg-[#e5e5e5] shrink-0" />
              ) : countPendentes !== undefined && (
                <span
                  className={cn(
                    "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                    activeTab === ContratoTab.PENDENTES
                      ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                      : "text-[#737373]"
                  )}
                >
                  {countPendentes}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value={ContratoTab.ASSINADOS}
              className={cn(
                "rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                "data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs",
                "data-[state=inactive]:text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50"
              )}
            >
              Assinados
              {isLoadingKPIs ? (
                <Skeleton className="ml-2 w-5 h-4 rounded-[12px] bg-[#e5e5e5] shrink-0" />
              ) : countAssinados !== undefined && (
                <span
                  className={cn(
                    "ml-2 px-2 py-0.5 rounded-[18px] text-[11px] font-medium transition-colors",
                    activeTab === ContratoTab.ASSINADOS
                      ? "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]"
                      : "text-[#737373]"
                  )}
                >
                  {countAssinados}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-2.5 w-full xl:w-auto">
          <div className="relative group flex-grow xl:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a] group-hover:text-[#0a0a0a]" />
            <Input
              type="search"
              placeholder="Buscar aluno ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={onOpenConfig}
              disabled={isDesativado || isToggling}
              title="Configurar modelo de contrato, cláusulas e assinatura digital"
              className={cn(
                "hidden sm:inline-flex h-10 sm:h-11 px-4 rounded-[18px] bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground font-medium text-sm gap-2 shrink-0 transition-all shadow-xs border border-transparent cursor-pointer",
                isDesativado ? "opacity-50 pointer-events-none" : ""
              )}
            >
              <FileText className="w-4 h-4 text-primary-foreground" />
              <span>Configurar Modelo</span>
            </Button>

            {!isMobile && (
              <DropdownMenu open={openPopover} onOpenChange={setOpenPopover}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    title="Mais opções de contratos"
                    className={cn(
                      "h-10 sm:h-11 w-10 sm:w-11 p-0 bg-white hover:bg-[#f5f5f5] hover:border-[#737373]/50 active:scale-[0.98] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] transition-all shrink-0 cursor-pointer shadow-xs",
                      openPopover ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]" : ""
                    )}
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 text-[#737373] animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 text-[#0a0a0a]" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-2 rounded-[20px] border border-[#e5e5e5] bg-white shadow-lg space-y-1"
                >
                  {onImportarContrato && (
                    <DropdownMenuItem
                      disabled={isDesativado || isToggling}
                      onClick={onImportarContrato}
                      className="flex items-start gap-2.5 p-2.5 rounded-[14px] cursor-pointer text-[#0a0a0a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] data-[highlighted]:bg-[#f5f5f5] transition-colors"
                    >
                      <UploadCloud className="w-4 h-4 text-[#0a0a0a] shrink-0 mt-0.5" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-[#0a0a0a]">Importar Contrato Assinado</span>
                        <span className="text-[11px] text-[#737373] leading-tight">Vincular contrato já assinado</span>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    disabled={!isContratoConfigurado || isPreviewLoading}
                    onClick={onOpenPreview}
                    className="flex items-start gap-2.5 p-2.5 rounded-[14px] cursor-pointer text-[#0a0a0a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] data-[highlighted]:bg-[#f5f5f5] transition-colors"
                  >
                    {isPreviewLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#737373] shrink-0 mt-0.5" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#0a0a0a] shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-[#0a0a0a]">Ver Modelo de Contrato</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={isDesativado || isToggling}
                    onClick={onOpenConfig}
                    className="flex items-start gap-2.5 p-2.5 rounded-[14px] cursor-pointer text-[#0a0a0a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] data-[highlighted]:bg-[#f5f5f5] transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#0a0a0a] shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-[#0a0a0a]">Personalizar Meu Contrato</span>
                      <span className="text-[11px] text-[#737373] leading-tight">Cláusulas, multas e assinatura</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    disabled={isToggling}
                    onClick={() => onToggleContratos(isDesativado)}
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-[14px] cursor-pointer transition-colors",
                      !isDesativado
                        ? "text-[#e7000b] hover:bg-red-50/70 focus:bg-red-50/70 data-[highlighted]:bg-red-50/70"
                        : "text-[#0a0a0a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] data-[highlighted]:bg-[#f5f5f5]"
                    )}
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#737373] shrink-0 mt-0.5" />
                    ) : !isDesativado ? (
                      <PauseCircle className="w-4 h-4 text-[#e7000b] shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#0a0a0a] shrink-0 mt-0.5" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium">
                        {!isDesativado ? "Desativar Uso" : isContratoConfigurado ? "Reativar Uso" : "Ajustar e Começar a Usar"}
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isMobile && (
              <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    title="Mais opções de contratos"
                    className={cn(
                      "h-10 w-10 p-0 bg-white hover:bg-[#f5f5f5] active:scale-[0.98] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] transition-all shrink-0 cursor-pointer shadow-xs",
                      openDrawer ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]" : ""
                    )}
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 text-[#737373] animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 text-[#0a0a0a]" />
                    )}
                  </Button>
                </DrawerTrigger>

                <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]">
                  <DrawerHeader className="text-left mb-2 px-6 pt-5">
                    <DrawerTitle className="font-semibold text-[#0a0a0a] text-lg tracking-tight">
                      Opções de Contrato
                    </DrawerTitle>
                    <DrawerDescription className="text-xs font-normal text-[#737373]">
                      Gerencie as diretrizes e modelos de contratos da sua operação.
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="flex-1 overflow-y-auto px-4 pb-6">
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDrawer(false);
                          onOpenConfig();
                        }}
                        disabled={isDesativado || isToggling}
                        className={cn(
                          "w-full flex items-center gap-3 h-14 px-3.5 rounded-[18px] transition-colors active:scale-[0.98] outline-none text-left cursor-pointer",
                          isDesativado
                            ? "opacity-40 grayscale pointer-events-none text-[#737373]"
                            : "text-[#0a0a0a] hover:bg-[#f5f5f5] active:bg-[#ebebeb]"
                        )}
                      >
                        <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm text-[#0a0a0a] truncate">Personalizar Contrato</span>
                          <span className="text-xs text-[#737373] font-normal truncate">Cláusulas, multas e assinatura digital</span>
                        </div>
                      </button>

                      {onImportarContrato && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDrawer(false);
                            onImportarContrato();
                          }}
                          disabled={isDesativado || isToggling}
                          className={cn(
                            "w-full flex items-center gap-3 h-14 px-3.5 rounded-[18px] transition-colors active:scale-[0.98] outline-none text-left cursor-pointer",
                            isDesativado
                              ? "opacity-40 grayscale pointer-events-none text-[#737373]"
                              : "text-[#0a0a0a] hover:bg-[#f5f5f5] active:bg-[#ebebeb]"
                          )}
                        >
                          <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm text-[#0a0a0a] truncate">Importar Contrato Assinado</span>
                            <span className="text-xs text-[#737373] font-normal truncate">Vincular contrato já assinado</span>
                          </div>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDrawer(false);
                          onOpenPreview();
                        }}
                        disabled={!isContratoConfigurado || isPreviewLoading}
                        className={cn(
                          "w-full flex items-center gap-3 h-14 px-3.5 rounded-[18px] transition-colors active:scale-[0.98] outline-none text-left cursor-pointer",
                          !isContratoConfigurado
                            ? "opacity-40 grayscale pointer-events-none text-[#737373]"
                            : "text-[#0a0a0a] hover:bg-[#f5f5f5] active:bg-[#ebebeb]"
                        )}
                      >
                        <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                          {isPreviewLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#737373]" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm text-[#0a0a0a] truncate">Personalizar Contrato</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onToggleContratos(isDesativado);
                          setOpenDrawer(false);
                        }}
                        disabled={isToggling}
                        className={cn(
                          "w-full flex items-center gap-3 h-14 px-3.5 rounded-[18px] transition-colors active:scale-[0.98] outline-none text-left cursor-pointer",
                          !isDesativado
                            ? "text-[#e7000b] hover:bg-red-50/70 active:bg-red-100/60"
                            : "text-[#0a0a0a] hover:bg-[#f5f5f5] active:bg-[#ebebeb]"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 border",
                          !isDesativado ? "bg-red-50 text-[#e7000b] border-red-200/60" : "bg-[#f5f5f5] text-[#0a0a0a] border-[#e5e5e5]"
                        )}>
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#737373]" />
                          ) : !isDesativado ? (
                            <PauseCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">
                            {!isDesativado ? "Desativar Uso de Contratos" : isContratoConfigurado ? "Reativar Uso de Contratos" : "Ajustar e Começar a Usar"}
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
