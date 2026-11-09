import { memo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LoadMoreButtonProps {
  hasMore: boolean;
  isLoading?: boolean;
  onLoadMore: () => void;
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export const LoadMoreButton = memo(function LoadMoreButton({
  hasMore,
  isLoading = false,
  onLoadMore,
  label = "Carregar mais",
  loadingLabel = "Carregando...",
  className,
}: LoadMoreButtonProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={cn("pt-3 pb-2 flex justify-center", className)}>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={onLoadMore}
        className="h-10 px-5 rounded-[18px] text-xs font-medium text-[#0a0a0a] border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#0a0a0a]" />}
        <span>{isLoading ? loadingLabel : label}</span>
      </Button>
    </div>
  );
});
