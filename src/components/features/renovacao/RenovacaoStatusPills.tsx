import { RenovacaoKPIs } from "@/types/renovacao";
import { RenovacaoStatus } from "@/types/enums";
import { cn } from "@/lib/utils";
import { PhoneOff } from "lucide-react";

interface RenovacaoStatusPillsProps {
  kpis: RenovacaoKPIs;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
  semTelefoneCount?: number;
}

export const ALL_STATUS_FILTER = "all";
export const SEM_TELEFONE_FILTER = "sem_telefone";

interface PillItem {
  id: string;
  label: string;
  count: number;
  activeColor: string;
  badgeColor: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function RenovacaoStatusPills({
  kpis,
  activeStatus,
  onSelectStatus,
  semTelefoneCount = 0,
}: RenovacaoStatusPillsProps) {
  const { contadores } = kpis;

  const pills: PillItem[] = [
    {
      id: ALL_STATUS_FILTER,
      label: "Aptos para Renovação",
      count: contadores.total_ativos - semTelefoneCount,
      activeColor: "bg-[#1a3a5c] text-white border-[#1a3a5c]",
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      id: RenovacaoStatus.CONFIRMADO,
      label: "Confirmados",
      count: contadores.confirmados,
      activeColor: "bg-emerald-600 text-white border-emerald-600",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: RenovacaoStatus.PENDENTE,
      label: "Pendentes",
      count: contadores.pendentes,
      activeColor: "bg-amber-500 text-white border-amber-500",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: RenovacaoStatus.RECUSADO,
      label: "Saídas",
      count: contadores.saidas,
      activeColor: "bg-rose-600 text-white border-rose-600",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    ...(semTelefoneCount > 0
      ? [
          {
            id: SEM_TELEFONE_FILTER,
            label: "Sem Telefone",
            count: semTelefoneCount,
            activeColor: "bg-orange-600 text-white border-orange-600",
            badgeColor: "bg-orange-100 text-orange-800",
            icon: PhoneOff,
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {pills.map((pill) => {
        const isSelected = activeStatus === pill.id;
        const Icon = pill.icon;

        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => onSelectStatus(pill.id)}
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border shadow-2xs cursor-pointer",
              isSelected
                ? pill.activeColor
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{pill.label}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                isSelected ? "bg-white/20 text-white" : pill.badgeColor
              )}
            >
              {pill.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
