import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumBannerProps {
  title?: string;
  description?: string;
  ctaText?: string;
  variant?: "orange" | "indigo" | "red";
  className?: string;
  icon?: React.ElementType;
  onClick?: () => void;
}

export function PremiumBanner({
  title = "Visualize seus resultados completos",
  description = "Libere o acesso aos relatórios financeiros e operacionais detalhados para tomar as melhores decisões.",
  ctaText = "Liberar Acesso Premium",
  variant = "orange",
  className,
  icon: Icon = Crown,
  onClick,
}: PremiumBannerProps) {
  const navigate = useNavigate();

  const styles = {
    orange: {
      wrapper: "bg-gradient-to-r from-amber-50 to-orange-50 border-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      button: "bg-orange-500 hover:bg-orange-600 shadow-orange-200/50",
    },
    indigo: {
      wrapper: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200/50",
    },
    red: {
      wrapper: "bg-gradient-to-r from-red-50 to-rose-50 border-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button: "bg-red-600 hover:bg-red-700 shadow-red-200/50",
    },
  };

  const currentStyle = styles[variant];

  return (
    <div
      className={cn(
        "border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500",
        currentStyle.wrapper,
        className
      )}
    >
      <div className="flex items-center gap-5">
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm",
            currentStyle.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", currentStyle.iconColor)} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <Button
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            navigate("/planos");
          }
        }}
        className={cn(
          "w-full md:w-auto text-white font-bold h-11 px-8 rounded-xl shadow-lg transition-transform hover:scale-105",
          currentStyle.button
        )}
      >
        {ctaText}
      </Button>
    </div>
  );
}
