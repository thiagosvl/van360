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
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { memo } from "react";
import { PassageiroActionsMenu } from "./PassageiroActionsMenu";

interface PassageirosListProps {
  passageiros: Passageiro[];
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleClick: (passageiro: Passageiro) => void;
  onDeleteClick: (passageiro: Passageiro) => void;
  onGenerateContract?: (passageiro: Passageiro) => void;
}

const formatShortName = (fullName?: string) => {
  if (!fullName) return "Sem nome";
  const names = fullName.trim().split(/\s+/);
  if (names.length <= 2) return fullName;
  return `${names[0]} ${names[1]}`;
};

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

  const getInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const initial = getInitial(passageiro?.nome);
  
  const shortName = formatShortName(passageiro?.nome);
  const respName = formatShortName(passageiro?.nome_responsavel);

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
                       Responsável: {respName}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
                <p className="font-headline font-bold text-[#1a3a5c] text-[13px] leading-none mb-0.5">
                    {Number(passageiro?.valor_cobranca).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                </p>
                <StatusBadge
                    status={passageiro?.ativo}
                    className={cn(
                        "font-bold text-[8px] h-3.5 px-1 rounded-sm border-none shadow-none uppercase tracking-widest whitespace-nowrap leading-none",
                         passageiro?.ativo ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                    )}
                />
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
       <div className="rounded-xl overflow-hidden bg-white shadow-diff-shadow border-none">
        <Table>
          <TableHeader className="bg-surface-container-low/30">
            <TableRow className="hover:bg-transparent border-b border-surface-container-low">
              <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest w-[350px]">
                Passageiro
              </TableHead>
              <TableHead className="px-6 py-4 text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Veículo
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Valor
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passageiros.map((passageiro) => {
              const shortName = formatShortName(passageiro?.nome);
              const respName = formatShortName(passageiro?.nome_responsavel);
              
              return (
              <TableRow
                key={passageiro.id}
                onClick={() => props.onHistorico(passageiro)}
                className="hover:bg-surface-container-low/20 border-b border-surface-container-low/50 last:border-0 transition-colors cursor-pointer"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                      <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                        {shortName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        Responsável: {respName}
                      </p>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                    <StatusBadge 
                        status={passageiro.ativo} 
                        className="font-bold text-[8px] h-3.5 px-1.5 rounded-sm border-none uppercase tracking-widest"
                    />
                </TableCell>
                <TableCell className="px-6 py-4">
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
            )})}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
}
