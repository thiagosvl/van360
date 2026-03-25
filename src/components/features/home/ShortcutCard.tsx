import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ShortcutCardProps {
  to?: string;
  onClick?: () => void;
  icon: any;
  label: string;
  className?: string;
}

export const ShortcutCard = ({
  icon: Icon,
  label,
  to,
  onClick,
  className,
}: ShortcutCardProps) => {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100/30 shadow-diff-shadow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-26 w-full group select-none cursor-pointer",
        className,
      )}
    >
      <div className="h-11 w-11 rounded-[1.2rem] bg-slate-50/80 flex items-center justify-center mb-2.5 shrink-0 border border-slate-100/50 transition-all duration-300 group-hover:bg-[#1a3a5c] group-hover:border-[#1a3a5c] group-hover:shadow-lg group-hover:shadow-slate-100">
        <Icon className="h-5 w-5 text-[#1a3a5c] transition-colors duration-300 group-hover:text-white" />
      </div>
      <span className="text-[9px] font-bold text-slate-400 group-hover:text-[#1a3a5c] uppercase tracking-[0.15em] text-center leading-tight px-1 transition-colors duration-200">
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
