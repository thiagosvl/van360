import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ShortcutCardProps {
  to?: string;
  onClick?: () => void;
  icon: any;
  activeIcon?: any;
  label: string;
  className?: string;
  isActive?: boolean;
}

export const ShortcutCard = ({
  icon: Icon,
  activeIcon: ActiveIcon,
  label,
  to,
  onClick,
  className,
  isActive = false,
}: ShortcutCardProps) => {
  const DisplayIcon = isActive && ActiveIcon ? ActiveIcon : Icon;

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100/50 shadow-diff-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-26 w-full group select-none cursor-pointer overflow-hidden",
        isActive && "border-emerald-100 bg-emerald-50/50 shadow-none",
        className,
      )}
    >
      <div className={cn(
        "h-11 w-11 rounded-2xl flex items-center justify-center mb-2.5 shrink-0 border transition-all duration-300",
        isActive
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-emerald-400"
          : "bg-slate-50 border-slate-100/60 text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:border-[#1a3a5c] group-hover:shadow-lg group-hover:shadow-slate-100"
      )}>
        <DisplayIcon className={cn(
          "h-6 w-6 transition-colors duration-300",
          !isActive && "opacity-80 group-hover:text-white"
        )} />
      </div>
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-[0.15em] text-center leading-tight px-1 transition-colors duration-200",
        isActive ? "text-emerald-600" : "text-[#1a3a5c]/90 group-hover:text-[#1a3a5c]"
      )}>
        {label}
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block w-full">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="block w-full outline-none">
      {content}
    </button>
  );
};
