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
      className="flex items-center justify-between py-2.5 sm:p-3 sm:rounded-xl border-b sm:border border-slate-50 sm:border-slate-100/80 bg-white hover:bg-slate-50 cursor-pointer transition-all group sm:shadow-[0_1px_2px_rgba(0,0,0,0.01)] last:border-b-0 sm:last:border-b"
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
        className={`flex items-center justify-center rounded-full px-2.5 py-1 shrink-0 ${
          isToday
            ? "bg-[#1a3a5c] text-white shadow-sm"
            : "bg-slate-100 text-slate-700"
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
