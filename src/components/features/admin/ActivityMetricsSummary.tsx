import { Users, UserPlus, RotateCcw, Sparkles, ShieldCheck, Infinity as InfinityIcon } from "lucide-react";

export type ActivitySegment = "all" | "novos" | "recorrentes" | "trial" | "assinantes" | "vitalicios";

interface ActivityMetricsSummaryProps {
  total?: number;
  total_novos?: number;
  total_recorrentes?: number;
  total_trial?: number;
  total_ativos?: number;
  total_vitalicios?: number;
  selectedSegment?: ActivitySegment;
  onSelectSegment?: (segment: ActivitySegment) => void;
}

export function ActivityMetricsSummary({
  total,
  total_novos = 0,
  total_recorrentes = 0,
  total_trial = 0,
  total_ativos = 0,
  total_vitalicios = 0,
  selectedSegment = "all",
  onSelectSegment,
}: ActivityMetricsSummaryProps) {
  if (total === undefined) {
    return null;
  }

  const items: Array<{
    id: ActivitySegment;
    label: string;
    sublabel: string;
    count: number;
    icon: typeof Users;
    iconColor: string;
    valueColor?: string;
  }> = [
    {
      id: "all",
      label: "Usuários ativos",
      sublabel: "No período filtrado",
      count: total,
      icon: Users,
      iconColor: "text-primary",
    },
    {
      id: "novos",
      label: "Novos cadastros",
      sublabel: "Criaram conta no período",
      count: total_novos,
      icon: UserPlus,
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      id: "recorrentes",
      label: "Recorrentes",
      sublabel: "Veteranos no período",
      count: total_recorrentes,
      icon: RotateCcw,
      iconColor: "text-purple-400",
    },
    {
      id: "trial",
      label: "Em trial",
      sublabel: "Foco de conversão",
      count: total_trial,
      icon: Sparkles,
      iconColor: "text-sky-400",
      valueColor: "text-sky-400",
    },
    {
      id: "assinantes",
      label: "Assinantes",
      sublabel: "Assinatura ativa",
      count: total_ativos,
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      id: "vitalicios",
      label: "Vitalícios",
      sublabel: "Acesso vitalício",
      count: total_vitalicios,
      icon: InfinityIcon,
      iconColor: "text-purple-400",
      valueColor: "text-purple-400",
    },
  ];

  const handleCardClick = (id: ActivitySegment) => {
    if (!onSelectSegment) return;
    if (selectedSegment === id && id !== "all") {
      onSelectSegment("all");
    } else {
      onSelectSegment(id);
    }
  };

  return (
    <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 pb-2 mb-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:mx-0 md:px-0 md:pb-0 md:mb-6 touch-pan-x">
      {items.map((item) => {
        const Icon = item.icon;
        const isSelected = selectedSegment === item.id;
        const isInteractive = Boolean(onSelectSegment);

        return (
          <div
            key={item.id}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={() => handleCardClick(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(item.id);
              }
            }}
            className={`p-3 rounded-xl text-left space-y-0.5 w-[145px] sm:w-[160px] shrink-0 md:w-auto md:shrink flex flex-col justify-between transition-all select-none ${
              isInteractive ? "cursor-pointer" : ""
            } ${
              isSelected
                ? "bg-primary/10 border-2 border-primary shadow-sm"
                : "bg-card border border-border hover:border-primary/40 hover:bg-secondary/40 shadow-xs"
            }`}
            title={isInteractive ? `Filtrar por ${item.label.toLowerCase()}` : undefined}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground truncate">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${item.iconColor}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isSelected && item.id !== "all" && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
              )}
            </div>

            <div className={`text-xl font-semibold ${item.valueColor || "text-foreground"}`}>
              {item.count}
            </div>

            <p className="text-[11px] text-muted-foreground font-normal truncate">{item.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
}
