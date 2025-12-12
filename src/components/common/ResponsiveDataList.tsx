import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveDataListProps<T> {
  data: T[];
  isLoading?: boolean;
  loadingSkeleton?: ReactNode;
  emptyState?: ReactNode;
  
  /**
   * O conteúdo para Desktop (geralmente uma <Table>).
   * Será automaticamente ocultado em dispositivos móveis via CSS.
   */
  children?: ReactNode;

  /**
   * Função para renderizar cada item na visão Mobile (Card).
   * Será automaticamente ocultado em Desktop via CSS.
   */
  mobileItemRenderer: (item: T, index: number) => ReactNode;

  /**
   * Classes para o container da lista mobile (opcional).
   * Útil para space-y-3 ou grid.
   */
  mobileContainerClassName?: string;
}

export function ResponsiveDataList<T>({
  data,
  isLoading = false,
  loadingSkeleton,
  emptyState,
  children,
  mobileItemRenderer,
  mobileContainerClassName = "space-y-4",
}: ResponsiveDataListProps<T>) {
  // 1. Loading State
  if (isLoading) {
    if (loadingSkeleton) return <>{loadingSkeleton}</>;
    
    // Default Skeleton se nenhum for fornecido
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    if (emptyState) return <>{emptyState}</>;
    // Se não tiver empty state, não renderiza nada (ou poderia ter um default)
    return null;
  }

  // 3. Data View (Desktop Table + Mobile List)
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        {children}
      </div>

      {/* Mobile View */}
      <div className={cn("md:hidden", mobileContainerClassName)}>
        {data.map((item, index) => mobileItemRenderer(item, index))}
      </div>
    </>
  );
}
