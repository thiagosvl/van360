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
  variant?: "blue" | "rose" | "violet" | "indigo" | "emerald" | "orange" | "amber" | "sky" | "slate" | "white";
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

  const iconBgVariants = {
    blue: "bg-[#e0efff]",
    rose: "bg-[#fce7f3]",
    violet: "bg-[#f3e8ff]",
    indigo: "bg-[#e0e7ff]",
    emerald: "bg-[#dcfce7]",
    orange: "bg-[#ffedd5]",
    amber: "bg-[#fef3c7]",
    sky: "bg-[#ccfbf1]",
    slate: "bg-[#f3f4f6]",
    white: "bg-white",
  };

  const activeStyles = "ring-2 ring-slate-800 ring-offset-1";

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2.5 rounded-[18px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97] h-[100px] max-[320px]:h-[90px] w-full group select-none cursor-pointer",
        isActive && activeStyles,
        className,
      )}
    >
      <div className={cn(
        "h-[40px] w-[40px] rounded-full flex items-center justify-center mb-2.5 shrink-0 transition-all duration-300 border-[1.5px] border-slate-800",
        isActive ? "bg-slate-800 text-white" : cn(iconBgVariants[variant], "text-slate-800 group-hover:scale-105")
      )}>
        <DisplayIcon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <span className={cn(
        "text-[12px] max-[320px]:text-[11px] font-semibold text-slate-800 leading-[1.1] text-center px-0.5",
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
