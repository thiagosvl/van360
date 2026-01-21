import { DialogClose, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PlanUpgradeHeaderProps {
  title: string;
  headerStyle: string;
}

export function PlanUpgradeHeader({ title }: { title: string }) {
  return (
    <div className="px-5 py-4 text-center relative shrink-0 flex items-center justify-center min-h-[60px] bg-white border-b border-gray-100">
      <DialogClose className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors z-50 p-2 hover:bg-gray-100 rounded-full">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogClose>

      <DialogTitle className="text-lg font-bold text-gray-900 relative z-10 leading-tight">
        {title}
      </DialogTitle>
    </div>
  );
}
