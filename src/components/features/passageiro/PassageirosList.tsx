import { MobileActionItem } from "@/components/common/MobileActionItem";
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
import { Passageiro } from "@/types/passageiro";
import {
  formatarPlacaExibicao,
} from "@/utils/domain/veiculo/placaUtils";
import { PassageiroPeriodo } from "@/types/enums";
import {
  formatFirstName,
  formatShortName,
  getInitials,
} from "@/utils/formatters";
import { memo } from "react";
import { PassageiroActionsMenu } from "./PassageiroActionsMenu";

const getPeriodoColor = (periodo?: PassageiroPeriodo) => {
  return "bg-gray-50/50 text-gray-400 border-gray-100/80";
};

const getPeriodoSuffix = (periodo?: PassageiroPeriodo) => {
  const labels: Record<string, string> = {
    [PassageiroPeriodo.MANHA]: "Manhã",
    [PassageiroPeriodo.TARDE]: "Tarde",
    [PassageiroPeriodo.NOITE]: "Noite",
    [PassageiroPeriodo.INTEGRAL]: "Integral",
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
}


const PassageiroMobileCard = memo(function PassageiroMobileCard({
  passageiro,
  index,
  onHistorico,
  onEdit,
  onToggleClick,
  onDeleteClick,
  onGenerateContract,
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
  });

  const initial = getInitials(passageiro?.nome);

  const shortName = formatShortName(passageiro?.nome);
  const respName = formatFirstName(passageiro?.nome_responsavel);

  return (
    <MobileActionItem actions={actions as any} className="bg-transparent">
      <div
        onClick={() => onHistorico(passageiro)}
        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className="flex-shrink-0 w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center">
          <span className="text-white font-headline font-bold text-sm leading-none">
            {initial}
          </span>
        </div>

        <div className="flex-grow min-w-0 pr-10">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm truncate leading-tight">
            {shortName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 font-medium truncate opacity-60">
              {respName}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
          <div className="flex">
            <span
              className={cn(
                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                getPeriodoColor(passageiro.periodo)
              )}
            >
              {getPeriodoSuffix(passageiro.periodo)}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium truncate opacity-60 text-right max-w-[140px]">
            {passageiro.escola?.nome || "Escola N/I"}
          </p>
        </div>
      </div>
    </MobileActionItem>
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
              const shortName = formatShortName(passageiro?.nome);
              const respName = formatFirstName(passageiro?.nome_responsavel);

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
                      <p className="text-[10px] text-gray-400 font-medium tracking-wider">
                        {respName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <StatusBadge
                      status={passageiro.ativo}
                      className={cn(
                        "font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none shadow-none uppercase tracking-widest inline-flex items-center",
                        passageiro.ativo ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
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
                            getPeriodoColor(passageiro.periodo)
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
                      {...props}
                      onToggleStatus={props.onToggleClick}
                      onDelete={props.onDeleteClick}
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
