import { useNavigate } from "react-router-dom";
import { formatShortName } from "@/utils/formatters/name";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Aniversariante } from "@/types/passageiro";

interface PassageirosSemDataListProps {
  passageiros: Omit<Aniversariante, "dia">[];
}

export function PassageirosSemDataList({ passageiros }: PassageirosSemDataListProps) {
  const navigate = useNavigate();

  if (!passageiros || passageiros.length === 0) return null;

  return (
    <div className="flex flex-col w-full">
      {passageiros.map((p, idx) => {
        const isLast = idx === passageiros.length - 1;
        return (
          <div
            key={p.id}
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", p.id))}
            className={`flex items-center justify-between py-3 px-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${
              !isLast ? "border-b border-slate-100 dark:border-zinc-800" : ""
            }`}
          >
            <div className="flex flex-col overflow-hidden pr-2">
              <span className="font-medium text-[#1a3a5c] dark:text-slate-200 text-[14px] truncate leading-tight">
                {formatShortName(p.nome, true)}
              </span>
              <span className="text-[12px] text-slate-500 font-medium truncate leading-tight mt-0.5">
                {p.veiculo ? formatarPlacaExibicao(p.veiculo.placa) : (p.escola?.nome || "Sem vínculo")}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
