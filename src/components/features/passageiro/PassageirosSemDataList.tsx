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
            className={`flex items-center justify-between py-2 px-2 hover:bg-orange-100/50 dark:hover:bg-orange-900/30 cursor-pointer transition-colors ${
              !isLast ? "border-b border-orange-200/40 dark:border-orange-900/40" : ""
            }`}
          >
            <div className="flex flex-col overflow-hidden pr-2">
              <span className="font-medium text-orange-950 dark:text-orange-200 text-[13px] truncate leading-tight">
                {formatShortName(p.nome, true)}
              </span>
              <span className="text-[11px] text-orange-700/80 dark:text-orange-400/80 font-medium truncate leading-tight">
                {p.veiculo ? formatarPlacaExibicao(p.veiculo.placa) : (p.escola?.nome || "Sem vínculo")}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-400/60 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
