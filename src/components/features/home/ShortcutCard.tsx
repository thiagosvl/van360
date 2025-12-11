import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

interface ShortcutCardProps {
  to?: string;
  onClick?: () => void;
  icon: any;
  label: string;
  colorClass?: string;
  bgClass?: string;
}

export const ShortcutCard = ({
  to,
  onClick,
  icon: Icon,
  label,
  colorClass = "text-blue-600",
  bgClass = "bg-blue-50",
}: ShortcutCardProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md h-24 w-full cursor-pointer">
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110",
          bgClass,
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-blue-700">
        {label}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="group">
        {content}
      </div>
    );
  }

  return (
    <NavLink to={to!} className="group">
      {content}
    </NavLink>
  );
};
