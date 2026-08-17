import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

interface PassageirosPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  options?: number[];
  className?: string;
}

export const PassageirosPagination = memo(function PassageirosPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  options = [50, 100, 250, 500],
  className,
}: PassageirosPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || Math.ceil(totalItems / (limit || 50)));

  if (totalItems <= 0 || safeTotalPages <= 1) return null;
  const from = Math.min((currentPage - 1) * limit + 1, totalItems);
  const to = Math.min(currentPage * limit, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-diff-shadow flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium",
        className
      )}
    >
      {/* Informações da página e selector de quantidade */}
      <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
        <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
          Exibindo <strong className="text-[#1a3a5c] font-bold">{from}–{to}</strong> de{" "}
          <strong className="text-[#1a3a5c] font-bold">{totalItems}</strong>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Por página:</span>
          <Select
            value={String(limit)}
            onValueChange={(val) => {
              onLimitChange(Number(val));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs font-bold text-[#1a3a5c] border-slate-200 bg-slate-50/50 rounded-lg focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder={String(limit)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-lg">
              {options.map((opt) => (
                <SelectItem key={opt} value={String(opt)} className="text-xs font-medium cursor-pointer">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navegação de Páginas (Mobile-First Touch Target) */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-[#1a3a5c] hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
          Anterior
        </Button>

        <span className="text-[11px] font-bold text-[#1a3a5c] px-2 py-1 rounded-md bg-slate-100/70">
          {currentPage} / {safeTotalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-3 rounded-lg border-slate-200 text-xs font-bold text-[#1a3a5c] hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
        </Button>
      </div>
    </div>
  );
});
