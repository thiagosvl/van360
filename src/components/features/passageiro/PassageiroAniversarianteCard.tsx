import { useNavigate } from "react-router-dom";
import { formatShortName } from "@/utils/formatters/name";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { getShortWeekDayBR } from "@/utils/dateUtils";
import { ROUTES } from "@/constants/routes";
import { Aniversariante } from "@/types/passageiro";
import { User, Cake } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/business/usePermissions";

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
  const { can } = usePermissions();
  const canEditPassageiro = can("passageiros.gerenciar") || can("passageiros.visualizar");
  const hoje = new Date();

  const isToday =
    hoje.getDate() === passageiro.dia && hoje.getMonth() + 1 === mesAtual;

  const handleClick = () => {
    if (canEditPassageiro) {
      navigate(
        ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(
          ":passageiro_id",
          passageiro.id
        )
      );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between p-3 rounded-[16px] border border-[#e5e5e5] bg-white transition-all active:scale-[0.99] shadow-2xs gap-3",
        passageiro.ativo === false
          ? "opacity-60 hover:opacity-90 bg-[#fafafa]/80"
          : "hover:bg-[#fafafa] hover:border-[#737373]",
        canEditPassageiro ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors",
            passageiro.ativo === false && "opacity-60 text-[#737373]",
            isToday
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-[#f5f5f5] border-[#e5e5e5] text-[#737373]"
          )}
        >
          {isToday ? (
            <Cake className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
          ) : (
            <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <span className={cn(
            "font-semibold text-xs sm:text-[13px] truncate leading-tight",
            passageiro.ativo === false ? "text-[#737373]" : "text-[#0a0a0a]"
          )}>
            {formatShortName(passageiro.nome, true)}
          </span>
          <span className="text-[11px] text-[#737373] font-normal truncate leading-tight mt-0.5">
            {agrupamento === "van"
              ? passageiro.escola?.nome || "Sem vínculo"
              : passageiro.veiculo
              ? formatarPlacaExibicao(passageiro.veiculo.placa)
              : "Sem veículo"}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "inline-flex items-center justify-center rounded-[18px] px-2.5 py-1 shrink-0 text-[11px] font-semibold tracking-tight transition-all",
          isToday
            ? "bg-primary text-primary-foreground shadow-xs gap-1"
            : "bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] font-medium"
        )}
      >
        {isToday ? (
          <>
            <Cake className="w-3 h-3 text-white" />
            <span>Hoje!</span>
          </>
        ) : (
          <span>
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
