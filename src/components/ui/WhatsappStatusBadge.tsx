import { WhatsappStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface WhatsappStatusBadgeProps {
  status?: WhatsappStatus | string;
  className?: string;
}

export function WhatsappStatusBadge({ status, className }: WhatsappStatusBadgeProps) {
  if (!status) return null;

  const isConnected = status === WhatsappStatus.CONNECTED || status === WhatsappStatus.OPEN;
  const isConnecting = status === WhatsappStatus.CONNECTING;
  
  let label = "OFF";
  let bgClass = "bg-red-100 text-red-700";
  let dotClass = "bg-red-500";

  if (isConnected) {
    label = "ON";
    bgClass = "bg-emerald-100 text-emerald-700";
    dotClass = "bg-emerald-500 animate-pulse";
  } else if (isConnecting) {
    label = "CONECTANDO";
    bgClass = "bg-amber-100 text-amber-700";
    dotClass = "bg-amber-500";
  }

  return (
    <div 
      className={cn(
        "text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider", 
        bgClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      WPP {label}
    </div>
  );
}
