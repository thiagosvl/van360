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
  variant?: "blue" | "rose" | "violet" | "indigo" | "emerald" | "orange" | "amber" | "sky" | "slate";
}

export const ShortcutCard = ({
  icon: Icon,
  activeIcon: ActiveIcon,
  label,
  to,
  onClick,
  className,
  isActive = false,
  variant = "slate",
}: ShortcutCardProps) => {
  const DisplayIcon = isActive && ActiveIcon ? ActiveIcon : Icon;

  const variants = {
    blue: "bg-blue-50 text-blue-600 border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white",
    rose: "bg-rose-50 text-rose-600 border-rose-100/50 group-hover:bg-rose-600 group-hover:text-white",
    violet: "bg-violet-50 text-violet-600 border-violet-100/50 group-hover:bg-violet-600 group-hover:text-white",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white",
    orange: "bg-orange-50 text-orange-600 border-orange-100/50 group-hover:bg-orange-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-600 border-amber-100/50 group-hover:bg-amber-600 group-hover:text-white",
    sky: "bg-sky-50 text-sky-600 border-sky-100/50 group-hover:bg-sky-600 group-hover:text-white",
    slate: "bg-slate-50 text-slate-600 border-slate-100/50 group-hover:bg-[#1a3a5c] group-hover:text-white",
  };

  const activeStyles = "border-emerald-200 bg-emerald-50/30 ring-2 ring-emerald-500/10";

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3.5 max-[320px]:p-2 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-soft-xl hover:-translate-y-1 active:scale-[0.96] h-[104px] max-[320px]:h-[90px] w-full group select-none cursor-pointer overflow-hidden relative",
        isActive ? activeStyles : "hover:border-slate-200",
        className,
      )}
    >
      <div className={cn(
        "h-12 w-12 max-[320px]:h-10 max-[320px]:w-10 rounded-2xl flex items-center justify-center mb-3.5 max-[320px]:mb-2 shrink-0 border transition-all duration-500",
        variants[variant],
        isActive && "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200"
      )}>
        <DisplayIcon className={cn(
          "h-6 w-6 transition-transform duration-500 group-hover:scale-110",
        )} />
      </div>
      <span className={cn(
        "text-[10px] max-[320px]:text-[9px] font-headline font-bold uppercase tracking-wider text-center leading-[1.3] px-1 transition-colors duration-300",
        isActive ? "text-emerald-700" : "text-slate-500 group-hover:text-[#1a3a5c]"
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
