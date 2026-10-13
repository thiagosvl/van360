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
    },
    {
      id: RenovacaoStatus.CONFIRMADO,
      label: "Confirmados",
      count: contadores.confirmados,
    },
    {
      id: RenovacaoStatus.PENDENTE,
      label: "Pendentes",
      count: contadores.pendentes,
    },
    {
      id: RenovacaoStatus.RECUSADO,
      label: "Saídas",
      count: contadores.saidas,
    },
    ...(semTelefoneCount > 0
      ? [
          {
            id: SEM_TELEFONE_FILTER,
            label: "Sem Telefone",
            count: semTelefoneCount,
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
              "flex flex-shrink-0 items-center gap-2 rounded-[18px] px-3.5 h-9 text-xs font-medium transition-all border shadow-none cursor-pointer",
              isSelected
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                : "bg-white text-[#737373] hover:text-[#0a0a0a] border-[#e5e5e5] hover:bg-[#fafafa]"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{pill.label}</span>
            <span
              className={cn(
                "rounded-[18px] px-2 py-0.5 text-[11px] font-medium leading-none",
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]"
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
