import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePassageiroActions } from "@/hooks/ui/usePassageiroActions";
import { cn } from "@/lib/utils";
import { PassageiroPeriodo } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import {
  formatFirstName,
  formatShortName,
  getInitials,
} from "@/utils/formatters";
import { formatPeriodo } from "@/utils/formatters/periodo";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { PassageiroActionsMenu } from "./PassageiroActionsMenu";

const getPeriodoSuffix = (periodo?: PassageiroPeriodo) => {
  const labels: Record<string, string> = {
    [PassageiroPeriodo.MANHA]: formatPeriodo(PassageiroPeriodo.MANHA),
    [PassageiroPeriodo.TARDE]: formatPeriodo(PassageiroPeriodo.TARDE),
    [PassageiroPeriodo.NOITE]: formatPeriodo(PassageiroPeriodo.NOITE),
    [PassageiroPeriodo.INTEGRAL]: formatPeriodo(PassageiroPeriodo.INTEGRAL),
  };
  return labels[periodo || ""] || "N/I";
};

interface PassageirosListProps {
  passageiros: Passageiro[];
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleClick: (passageiro: Passageiro) => void;
  onDeleteClick: (passageiro: Passageiro) => void;
  onGenerateContract?: (passageiro: Passageiro) => void;
  onSubstituirContrato?: (passageiro: Passageiro) => void;
  onExcluirContrato?: (passageiro: Passageiro) => void;
  usarContratos?: boolean;
}

const PassageiroMobileCard = memo(function PassageiroMobileCard({
  passageiro,
  onHistorico,
  onEdit,
  onToggleClick,
  onDeleteClick,
  onGenerateContract,
  onSubstituirContrato,
  onExcluirContrato,
  usarContratos,
}: { passageiro: Passageiro; index: number } & Omit<
  PassageirosListProps,
  "passageiros"
>) {
  const actions = usePassageiroActions({
    passageiro,
    onHistorico,
    onEdit,
    onToggleStatus: onToggleClick,
    onDelete: onDeleteClick as any,
    onGenerateContract,
    onSubstituirContrato,
    onExcluirContrato,
    usarContratos,
  });

  const initial = getInitials(passageiro?.nome);

  const shortName = formatShortName(passageiro?.nome, true);
  const respName = formatFirstName(passageiro?.nome_responsavel);
  const schoolName = passageiro.escola?.nome || "Não informada";

  return (
    <div
      onClick={() => onHistorico(passageiro)}
      className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50 relative px-4"
    >
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
        passageiro.ativo ? "bg-[#1a3a5c]" : "bg-slate-400"
      )}>
        <span className="text-white font-headline font-bold text-sm leading-none">
          {initial}
        </span>
      </div>

      <div className="flex-grow min-w-0 pr-6">
        <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-tight">
          {shortName}
        </p>
        <div className="flex items-center gap-1 mt-0.5 min-w-0">
          <p className="text-[10px] text-gray-500 font-medium opacity-60 flex-shrink-0">
            {respName}
          </p>
          <span className="text-[8px] text-gray-400 opacity-40">•</span>
          <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
            {schoolName}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 text-slate-300">
        <ChevronRight className="h-5 w-5" />
      </div>
    </div>
  );
});

export function PassageirosList({
  passageiros,
  ...props
}: PassageirosListProps) {
  return (
    <ResponsiveDataList
      data={passageiros}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(passageiro, index) => (
        <PassageiroMobileCard
          key={passageiro.id}
          passageiro={passageiro}
          index={index}
          onDeleteClick={props.onDeleteClick}
          {...props}
        />
      )}
    >
      <div className="rounded-[28px] overflow-hidden bg-white shadow-diff-shadow border-none">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100/80">
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] w-[350px]">
                Passageiro
              </TableHead>
              <TableHead className="px-8 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Status
              </TableHead>
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Escola / Turno
              </TableHead>
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Veículo
              </TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Valor
              </TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passageiros.map((passageiro) => {
              const shortName = formatShortName(passageiro?.nome, true);
              const respName = formatFirstName(passageiro?.nome_responsavel);
              const schoolName = passageiro.escola?.nome || "Não informada";

              return (
                <TableRow
                  key={passageiro.id}
                  onClick={() => props.onHistorico(passageiro)}
                  className="hover:bg-surface-container-low/20 border-b border-surface-container-low/50 last:border-0 transition-colors cursor-pointer"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col">
                      <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                        {shortName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider truncate flex items-center gap-1.5">
                        {respName}
                        <span className="text-[8px] text-gray-300">•</span>
                        {schoolName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <StatusBadge
                      status={passageiro.ativo}
                      className={cn(
                        "font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none shadow-none uppercase tracking-widest inline-flex items-center",
                        passageiro.ativo ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                      )}
                    />
                  </TableCell>
                  <TableCell className="px-8 py-5 text-left">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                        {passageiro.escola?.nome || "Não informada"}
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm",
                            "bg-gray-50/50 text-gray-400 border-gray-100/80"
                          )}
                        >
                          {getPeriodoSuffix(passageiro.periodo)}
                        </span>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    {passageiro.veiculo ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1a3a5c]">
                          {formatarPlacaExibicao(passageiro.veiculo.placa)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase truncate w-32">
                          {(passageiro.veiculo as any).modelo}
                        </span>
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-headline font-bold text-[#1a3a5c] text-sm">
                      {Number(passageiro.valor_cobranca).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <PassageiroActionsMenu
                      passageiro={passageiro}
                      onHistorico={props.onHistorico}
                      onEdit={props.onEdit}
                      onToggleStatus={props.onToggleClick}
                      onDelete={props.onDeleteClick}
                      onGenerateContract={props.onGenerateContract}
                      onSubstituirContrato={props.onSubstituirContrato}
                      onExcluirContrato={props.onExcluirContrato}
                      usarContratos={props.usarContratos}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
}
