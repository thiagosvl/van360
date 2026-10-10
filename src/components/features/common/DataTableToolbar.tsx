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
          className="h-4 w-4 transition-colors text-[#737373] group-focus-within:text-[#0a0a0a]"
        />
      </div>
      <Input
        type="search"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
        className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
      />
    </div>
  );

  const filterTriggerElement = filterConfig && (
    <Button
       variant="outline"
       className={cn(
         "bg-white border-[#e5e5e5] text-[#0a0a0a] font-medium text-sm gap-1.5 md:gap-2 h-10 sm:h-11 rounded-[18px] px-3.5 shadow-none hover:bg-[#fafafa] shrink-0 cursor-pointer",
         isMobile ? "flex-1" : ""
       )}
       disabled={disabled}
    >
      {filterConfig.triggerIcon || (
        <>
          {isMobile ? (
            <Filter
              className={cn(
                "h-4 w-4 mr-1.5",
                filterConfig.hasActiveFilters && "text-primary"
              )}
            />
          ) : (
            <ListFilter
              className={cn(
                "h-4 w-4",
                filterConfig.hasActiveFilters && "text-primary"
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
    <div className={cn("flex flex-col gap-4", className)}>
      {extraContent}

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {searchPosition === "top" && searchElement}

        {/* Buttons logic */}
        <div className={cn("flex w-full md:w-auto items-center gap-2 md:gap-3")}>
          {filterConfig && (
            <>
              {isMobile ? (
                <Drawer open={filterConfig.isOpen} onOpenChange={filterConfig.onOpenChange}>
                  <DrawerTrigger asChild>{filterTriggerElement}</DrawerTrigger>
                  <DrawerContent className="h-auto max-h-[90vh] rounded-t-[28px] flex flex-col px-0 bg-white border-t border-[#e5e5e5] shadow-lg pb-[calc(2rem+var(--safe-area-bottom))]">
                    <DrawerHeader className="text-left mb-2 px-6 pt-5">
                      <DrawerTitle className="font-semibold text-[#0a0a0a] text-lg tracking-tight">
                        {filterConfig.title}
                      </DrawerTitle>
                      <DrawerDescription className="text-xs font-normal text-[#737373]">
                        {filterConfig.description}
                      </DrawerDescription>
                    </DrawerHeader>
 
                    <div className="flex-1 overflow-y-auto px-6 space-y-4">
                      {filterChildren}
                    </div>
 
                    {showFilterFooter && (
                      <div className="px-6 pt-3 border-t border-[#e5e5e5] bg-white">
                        <div className="flex items-center gap-2.5">
                          <Button
                            variant="ghost"
                            className="flex-1 h-11 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] text-sm font-medium gap-1.5 cursor-pointer"
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
                            className="flex-1 h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-white text-sm font-medium gap-1.5 border-none shadow-xs cursor-pointer"
                            onClick={filterConfig.onApply}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    )}
                  </DrawerContent>
                </Drawer>
              ) : (
                <Popover open={filterConfig.isOpen} onOpenChange={filterConfig.onOpenChange} modal={true}>
                  <PopoverTrigger asChild>{filterTriggerElement}</PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-4 rounded-[20px] border border-[#e5e5e5] bg-white shadow-lg space-y-3.5"
                    align="end"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-[#e5e5e5]">
                        <h4 className="font-semibold text-[#0a0a0a] text-xs">
                          Filtragem Avançada
                        </h4>
                        {filterConfig.hasActiveFilters && (
                          <button
                            onClick={filterConfig.onClear}
                            className="text-[11px] font-medium text-[#737373] hover:text-[#0a0a0a] cursor-pointer"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
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
