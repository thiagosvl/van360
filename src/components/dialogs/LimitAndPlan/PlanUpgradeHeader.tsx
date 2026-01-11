import { DialogClose, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface PlanUpgradeHeaderProps {
  title: string;
  headerStyle: string;
}

export function PlanUpgradeHeader({ title, headerStyle }: PlanUpgradeHeaderProps) {
  return (
    <div
      className={cn(
        "px-5 py-4 text-center relative overflow-hidden transition-colors duration-300 shrink-0 flex items-center justify-center min-h-[60px]",
        headerStyle
      )}
    >
      <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-50 p-2 hover:bg-white/10 rounded-full">
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </DialogClose>

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      <DialogTitle className="text-xl max-w-[200px] font-bold text-white relative z-10 leading-tight">
        {title}
      </DialogTitle>
    </div>
  );
}
