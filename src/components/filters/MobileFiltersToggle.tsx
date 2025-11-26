import { Button } from "@/components/ui/button";
import { Filter, FilterX } from "lucide-react";

interface MobileFiltersToggleProps {
  showFilters: boolean;
  onToggle: () => void;
  className?: string;
}

export function MobileFiltersToggle({
  showFilters,
  onToggle,
  className,
}: MobileFiltersToggleProps) {
  return (
    <Button
      variant="outline"
      onClick={onToggle}
      className={`md:hidden ${className || ""}`}
      title={showFilters ? "Esconder Filtros" : "Mostrar Filtros"}
    >
      {showFilters ? (
        <FilterX className="h-4 w-4 text-blue-600 border-primary" />
      ) : (
        <Filter className="h-4 w-4" />
      )}
      <span className={`${showFilters ? "text-primary" : ""}`}>Filtros</span>
    </Button>
  );
}

