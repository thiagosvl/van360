import { useNavigate } from "react-router-dom";
import { formatShortName } from "@/utils/formatters/name";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { getShortWeekDayBR } from "@/utils/dateUtils";
import { ROUTES } from "@/constants/routes";
import { Aniversariante } from "@/types/passageiro";

interface PassageiroAniversarianteCardProps {
  passageiro: Aniversariante;
  agrupamento: "van" | "escola";
  mesAtual: number;
}

export function PassageiroAniversarianteCard({
  passageiro,
  agrupamento,
  mesAtual,
}: PassageiroAniversarianteCardProps) {
  const navigate = useNavigate();
  const hoje = new Date();

  const isToday =
    hoje.getDate() === passageiro.dia && hoje.getMonth() + 1 === mesAtual;

  return (
    <div
      onClick={() =>
        navigate(
          ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
            ":passageiro_id",
            passageiro.id
          )
        )
      }
      className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
    >
      <div className="flex flex-col pr-2">
        <span className="font-medium text-slate-800 dark:text-slate-200 text-[13px] truncate leading-tight">
          {formatShortName(passageiro.nome, true)}
        </span>
        <span className="text-[11px] text-slate-500 font-medium leading-tight">
          {agrupamento === "van"
            ? passageiro.escola?.nome || "Sem vínculo"
            : passageiro.veiculo
            ? formatarPlacaExibicao(passageiro.veiculo.placa)
            : "Sem veículo"}
        </span>
      </div>

      <div
        className={`flex items-center justify-center rounded-md px-2 py-1 shrink-0 ${
          isToday
            ? "bg-primary text-white dark:bg-primary shadow-sm"
            : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
        }`}
      >
        {isToday ? (
          <span className="text-[10px] font-bold tracking-wide uppercase">
            Hoje
          </span>
        ) : (
          <span className="text-[11px] font-semibold">
            {getShortWeekDayBR(
              new Date(new Date().getFullYear(), mesAtual - 1, passageiro.dia)
            )}
            , {String(passageiro.dia).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}
