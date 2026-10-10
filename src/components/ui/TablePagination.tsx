import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  options?: number[];
  className?: string;
}

export const TablePagination = memo(function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  options = [20, 50, 100],
  className,
}: TablePaginationProps) {
  const safeLimit = limit > 0 ? limit : 20;
  const safeTotalPages = Math.max(1, totalPages || Math.ceil(totalItems / safeLimit));

  if (totalItems <= 0 || (safeTotalPages <= 1 && totalItems <= safeLimit && safeLimit <= options[0])) {
    return null;
  }

  const from = Math.min((currentPage - 1) * safeLimit + 1, totalItems);
  const to = Math.min(currentPage * safeLimit, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < safeTotalPages;

  return (
    <div
      className={cn(
        "bg-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-4 border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737373] font-normal select-none",
        className
      )}
    >
      <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 flex-wrap sm:flex-nowrap">
        <span className="text-[11px] sm:text-xs text-[#737373] whitespace-nowrap">
          Exibindo <strong className="text-[#0a0a0a] font-semibold">{from}–{to}</strong> de{" "}
          <strong className="text-[#0a0a0a] font-semibold">{totalItems}</strong>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] sm:text-xs text-[#737373] whitespace-nowrap">
            Por página:
          </span>
          <div className="relative inline-flex items-center">
            <select
              value={String(safeLimit)}
              onChange={(e) => {
                onLimitChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 pl-2.5 pr-7 text-xs font-semibold text-[#0a0a0a] bg-[#fafafa] hover:bg-white hover:border-[#737373]/60 focus:bg-white border border-[#e5e5e5] rounded-[12px] appearance-none cursor-pointer transition-colors focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]"
            >
              {options.map((opt) => (
                <option key={opt} value={String(opt)}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#737373] absolute right-2 pointer-events-none shrink-0" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-3 rounded-[18px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-xs font-medium text-[#0a0a0a] active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
          Anterior
        </Button>

        <span className="text-[11px] font-medium text-[#0a0a0a] px-2.5 py-1 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5]/50 whitespace-nowrap">
          {currentPage} / {safeTotalPages}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-3 rounded-[18px] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-xs font-medium text-[#0a0a0a] active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
        >
          Próxima
          <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
        </Button>
      </div>
    </div>
  );
});
