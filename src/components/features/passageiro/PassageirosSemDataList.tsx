import { useNavigate } from "react-router-dom";
import { formatShortName } from "@/utils/formatters/name";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { ChevronRight, User } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { Aniversariante } from "@/types/passageiro";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/business/usePermissions";

interface PassageirosSemDataListProps {
  passageiros: Omit<Aniversariante, "dia">[];
}

export function PassageirosSemDataList({ passageiros }: PassageirosSemDataListProps) {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canEditPassageiro = can("passageiros.gerenciar") || can("passageiros.visualizar");

  if (!passageiros || passageiros.length === 0) return null;

  return (
    <div className="flex flex-col w-full">
      {passageiros.map((p, idx) => {
        const isLast = idx === passageiros.length - 1;
        return (
          <div
            key={p.id}
            onClick={() => {
              if (canEditPassageiro) {
                navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", p.id));
              }
            }}
            className={cn(
              "flex items-center justify-between py-2.5 px-4 transition-colors",
              p.ativo === false
                ? "opacity-60 hover:opacity-90 bg-[#fafafa]/40"
                : "hover:bg-[#fafafa]",
              !isLast && "border-b border-[#e5e5e5]",
              canEditPassageiro ? "cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={cn(
                "w-8 h-8 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center shrink-0 transition-opacity",
                p.ativo === false ? "text-[#737373] opacity-60" : "text-[#0a0a0a]"
              )}>
                <User className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col overflow-hidden pr-2">
                <span className={cn(
                  "font-semibold text-xs sm:text-[13px] truncate leading-tight",
                  p.ativo === false ? "text-[#737373]" : "text-[#0a0a0a]"
                )}>
                  {formatShortName(p.nome, true)}
                </span>
                <span className="text-[11px] text-[#737373] font-normal truncate leading-tight mt-0.5">
                  {p.veiculo ? formatarPlacaExibicao(p.veiculo.placa) : (p.escola?.nome || "Sem vínculo")}
                </span>
              </div>
            </div>
            {canEditPassageiro && <ChevronRight className="w-4 h-4 text-[#737373] shrink-0 ml-2" />}
          </div>
        );
      })}
    </div>
  );
}
