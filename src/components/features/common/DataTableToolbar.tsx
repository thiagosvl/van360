import { Search, Filter, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import React from "react";
import { useIsMobile } from "@/hooks/ui/useIsMobile";

export interface DataTableToolbarProps {
  // Search
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
  
  // Filters
  filterConfig?: {
    title: string;
    description: string;
    hasActiveFilters?: boolean;
    onClear?: () => void; // Applied filters clear
    onApply?: () => void; // Mobile "Apply"
    onClearTemp?: () => void; // Mobile "Clear" (Temp state)
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerIcon?: React.ReactNode;
    triggerLabel?: string;
    showFooter?: boolean;
  };
  filterChildren?: React.ReactNode;

  // Actions
  actions?: React.ReactNode;

  // Layout Context
  searchPosition?: "top" | "bottom";
  className?: string;
  extraContent?: React.ReactNode;
}

export const DataTableToolbar = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  disabled,
  filterConfig,
  filterChildren,
  actions,
  searchPosition = "top",
  className,
  extraContent,
}: DataTableToolbarProps) => {
  const isMobile = useIsMobile();

  const searchElement = onSearchChange && (
    <div className="relative group flex-grow">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search
          className={cn(
            "h-4 w-4 transition-colors",
            searchTerm
              ? "text-amber-500"
              : "text-gray-400 group-focus-within:text-[#1a3a5c]"
          )}
        />
      </div>
      <Input
        type="search"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white border border-gray-100/50 h-12 pl-11 pr-4 rounded-xl shadow-diff-shadow font-medium text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all border-none"
      />
    </div>
  );

  const filterTriggerElement = filterConfig && (
    <Button
       variant="outline"
       className={cn(
         "bg-white border-[#1a3a5c]/10 text-[#1a3a5c] font-black uppercase text-[10px] tracking-widest gap-2 h-12 rounded-xl px-5 shadow-diff-shadow hover:bg-gray-50",
         isMobile ? "flex-1" : ""
       )}
       disabled={disabled}
    >
      {filterConfig.triggerIcon || (
        <>
          {isMobile ? (
            <Filter
              className={cn(
                "h-4 w-4 mr-2",
                filterConfig.hasActiveFilters && "text-amber-500"
              )}
            />
          ) : (
            <ListFilter
              className={cn(
                "h-4 w-4",
                filterConfig.hasActiveFilters && "text-amber-500"
              )}
            />
          )}
        </>
      )}
      {filterConfig.triggerLabel || "Filtros"}
    </Button>
  );

  const showFilterFooter = filterConfig?.showFooter !== false;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {extraContent}

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {searchPosition === "top" && searchElement}

        {/* Buttons logic */}
        <div className={cn("flex flex-1 items-center gap-3", !isMobile && "flex-none")}>
          {filterConfig && (
            <>
              {isMobile ? (
                <Drawer open={filterConfig.isOpen} onOpenChange={filterConfig.onOpenChange}>
                  <DrawerTrigger asChild>{filterTriggerElement}</DrawerTrigger>
                  <DrawerContent className="h-auto max-h-[90vh] rounded-t-[32px] flex flex-col px-0 bg-white border-none shadow-2xl pb-[calc(2rem+var(--safe-area-bottom))]">
                    <DrawerHeader className="text-left mb-2 px-8 pt-6">
                      <DrawerTitle className="font-headline font-black text-[#1a3a5c] text-xl">
                        {filterConfig.title}
                      </DrawerTitle>
                      <DrawerDescription className="text-xs font-medium text-gray-400">
                        {filterConfig.description}
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        {filterChildren}
                      </div>

                      {showFilterFooter && (
                        <div className="pt-10 flex flex-row gap-3">
                          <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl text-slate-400 font-black uppercase tracking-wider text-[10px] hover:bg-slate-50 transition-all active:scale-95"
                            onClick={() => {
                                if (filterConfig.onClearTemp) {
                                    filterConfig.onClearTemp();
                                } else if (filterConfig.onClear) {
                                    filterConfig.onClear();
                                }
                            }}
                          >
                            Limpar
                          </Button>
                          <Button
                            className="flex-1 h-12 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white font-black uppercase tracking-wider text-[10px] shadow-lg shadow-[#1a3a5c]/20 transition-all active:scale-95"
                            onClick={filterConfig.onApply}
                          >
                            Aplicar
                          </Button>
                        </div>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Popover open={filterConfig.isOpen} onOpenChange={filterConfig.onOpenChange} modal={true}>
                  <PopoverTrigger asChild>{filterTriggerElement}</PopoverTrigger>
                  <PopoverContent
                    className="w-[320px] p-6 rounded-2xl shadow-xl border-none ring-1 ring-gray-100"
                    align="end"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-headline font-black text-[#1a3a5c] text-sm uppercase tracking-wider">
                          Filtragem Avançada
                        </h4>
                        {filterConfig.hasActiveFilters && (
                          <button
                            onClick={filterConfig.onClear}
                            className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {filterChildren}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}

          {actions}
        </div>

        {searchPosition === "bottom" && searchElement}
      </div>
    </div>
  );
};
