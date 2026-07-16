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
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import {
  formatFirstName,
  formatShortName,
  getInitials,
} from "@/utils/formatters";
import { formatPeriodo } from "@/utils/formatters/periodo";
import { ChevronRight, User } from "lucide-react";
import { memo } from "react";
import { PassageiroActionsMenu } from "./PassageiroActionsMenu";



interface PassageirosListProps {
  passageiros: Passageiro[];
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleClick: (passageiro: Passageiro) => void;
  onDeleteClick: (passageiro: Passageiro) => void;
  onEnviarWhatsApp?: (passageiro: Passageiro) => void;
  usarContratos?: boolean;
}

const PassageiroMobileCard = memo(function PassageiroMobileCard({
  passageiro,
  onHistorico,
}: { passageiro: Passageiro; index: number } & Omit<
  PassageirosListProps,
  "passageiros"
>) {

  const initial = getInitials(passageiro?.nome);

  const shortName = formatShortName(passageiro?.nome, true);
  const schoolName = passageiro.escola?.nome;

  return (
    <div
      onClick={() => onHistorico(passageiro)}
      className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50 relative px-4"
    >
      <div className={cn(
        "rounded-full bg-white p-[2px] shadow-sm shrink-0 flex items-center justify-center transition-all",
        !passageiro.ativo && "opacity-80"
      )}>
        <div className={cn(
          "rounded-full border flex items-center justify-center transition-colors",
          passageiro.ativo ? "border-[#1a3a5c]" : "border-slate-300"
        )}>
          <div className={cn(
            "h-8 w-8 rounded-full border-[2px] border-white flex items-center justify-center transition-colors",
            "bg-slate-200"
          )}>
            <User className={cn(
              "w-4 h-4 fill-current transition-colors",
              passageiro.ativo ? "text-[#1a3a5c]/80" : "text-slate-400"
            )} />
          </div>
        </div>
      </div>

      <div className="flex-grow min-w-0 pr-6">
        <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-tight">
          {shortName}
        </p>
        <div className="flex flex-col gap-0.5 mt-0.5 min-w-0">
          <p className="text-[10px] text-gray-500 font-medium line-clamp-1 opacity-60">
            {schoolName || "Sem vínculo"}
          </p>
          {(passageiro.periodo || passageiro.turma) && (
            <p className="text-[10px] text-gray-500 font-medium opacity-60 flex items-center gap-1">
              {passageiro.periodo && <span>{formatPeriodo(passageiro.periodo)}</span>}
              {passageiro.periodo && passageiro.turma && <span className="text-[8px] text-gray-400 opacity-40">•</span>}
              {passageiro.turma && <span>{passageiro.turma}</span>}
            </p>
          )}
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
                Nome
              </TableHead>
              <TableHead className="px-8 py-5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Status
              </TableHead>
              <TableHead className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Valor
              </TableHead>
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Escola
              </TableHead>
              <TableHead className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Veículo
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

              return (
                <TableRow
                  key={passageiro.id}
                  onClick={() => props.onHistorico(passageiro)}
                  className="hover:bg-surface-container-low/20 border-b border-surface-container-low/50 last:border-0 transition-colors cursor-pointer"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-full bg-white p-[2px] shadow-sm shrink-0 flex items-center justify-center transition-all",
                        !passageiro.ativo && "opacity-80"
                      )}>
                        <div className={cn(
                          "rounded-full border flex items-center justify-center transition-colors",
                          passageiro.ativo ? "border-[#1a3a5c]" : "border-slate-300"
                        )}>
                          <div className={cn(
                            "h-8 w-8 rounded-full border-[2px] border-white flex items-center justify-center transition-colors",
                            "bg-slate-200"
                          )}>
                            <User className={cn(
                              "w-4 h-4 fill-current transition-colors",
                              passageiro.ativo ? "text-[#1a3a5c]/80" : "text-slate-400"
                            )} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-headline font-bold text-[#1a3a5c] text-sm">
                          {shortName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wider truncate flex items-center gap-1.5">
                          {respName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <StatusBadge status={passageiro.ativo} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-headline font-bold text-[#1a3a5c] text-sm">
                      {Number(passageiro.valor_cobranca).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-left">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className="text-sm text-slate-600 max-w-[180px] block truncate"
                        title={passageiro.escola?.nome || "Sem vínculo"}
                      >
                        {passageiro.escola?.nome || "Sem vínculo"}
                      </span>
                      {(passageiro.periodo || passageiro.turma) && (
                        <p className="text-[10px] text-gray-500 font-medium opacity-60 flex items-center gap-1">
                          {passageiro.periodo && <span>{formatPeriodo(passageiro.periodo)}</span>}
                          {passageiro.periodo && passageiro.turma && <span className="text-[8px] text-gray-400 opacity-40">•</span>}
                          {passageiro.turma && <span>{passageiro.turma}</span>}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    {passageiro.veiculo ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-600">
                          {formatarPlacaExibicao(passageiro.veiculo.placa)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase truncate w-32">
                          {(passageiro.veiculo as any).modelo}
                        </span>
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <PassageiroActionsMenu
                      passageiro={passageiro}
                      onHistorico={props.onHistorico}
                      onEdit={props.onEdit}
                      onToggleStatus={props.onToggleClick}
                      onDelete={props.onDeleteClick}
                      onEnviarWhatsApp={props.onEnviarWhatsApp}
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
