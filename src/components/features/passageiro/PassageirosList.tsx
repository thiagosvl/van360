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
  formatarTelefoneExibicao,
  formatShortName,
} from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { formatPeriodo } from "@/utils/formatters/periodo";
import { ChevronRight, User } from "lucide-react";
import { memo } from "react";
import { PassageiroActionsMenu } from "./PassageiroActionsMenu";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useAppPreferences } from "@/hooks";

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
  const { formatoNomeResponsavel, exibirTelefoneListaAlunos } = useAppPreferences();
  const shortName = formatShortName(passageiro?.nome, true);
  const respName = formatNomeResponsavelExibicao(passageiro?.responsavel_principal?.nome, formatoNomeResponsavel);
  const respTelefone = passageiro?.responsavel_principal?.telefone;
  const schoolName = passageiro.escola?.nome;

  return (
    <div
      onClick={() => onHistorico(passageiro)}
      className={cn(
        "bg-white p-3.5 sm:p-4 rounded-[20px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center gap-3.5 active:scale-[0.99] transition-all duration-150 relative cursor-pointer",
        !passageiro.ativo && "opacity-60 bg-[#fafafa]/80"
      )}
    >
      <div className={cn(
        "h-9 w-9 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center shrink-0 transition-opacity",
        passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373] opacity-60"
      )}>
        <User className="w-4 h-4" />
      </div>

      <div className="flex-grow min-w-0 pr-6">
        <p className={cn(
          "font-semibold text-sm leading-tight truncate",
          passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
        )}>
          {shortName}
        </p>
        <div className="flex flex-col gap-0.5 mt-1 min-w-0">
          <p className="text-xs text-[#737373] truncate">
            {respName}
          </p>
          {exibirTelefoneListaAlunos && (
            <p className="text-[11px] text-[#737373] truncate">
              {formatarTelefoneExibicao(respTelefone)}
            </p>
          )}
          {schoolName && (
            <p className="text-[11px] text-[#737373] truncate">
              {schoolName}
            </p>
          )}
          {(passageiro.periodo || passageiro.turma || passageiro.sala) && (
            <p className="text-[11px] text-[#737373] flex items-center gap-1">
              {passageiro.periodo && <span>{formatPeriodo(passageiro.periodo)}</span>}
              {passageiro.periodo && passageiro.turma && <span className="text-[8px] text-[#737373] opacity-40">•</span>}
              {passageiro.turma && <span>{passageiro.turma}</span>}
              {(passageiro.periodo || passageiro.turma) && passageiro.sala && <span className="text-[8px] text-[#737373] opacity-40">•</span>}
              {passageiro.sala && <span>Sala {passageiro.sala}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 text-[#737373]">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
});

export function PassageirosList({
  passageiros,
  ...props
}: PassageirosListProps) {
  const { can } = usePermissions();
  const { formatoNomeResponsavel, exibirTelefoneListaAlunos } = useAppPreferences();
  const canViewFinancials = can("financeiro.visualizar") || can("cobrancas.gerenciar") || can("passageiros.cobranca_visualizar");

  return (
    <ResponsiveDataList
      data={passageiros}
      mobileContainerClassName="space-y-2.5 sm:space-y-3"
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
      <div className="rounded-[20px] sm:rounded-[24px] overflow-hidden bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <Table>
          <TableHeader className="bg-[#fafafa]">
            <TableRow className="hover:bg-transparent border-b border-[#e5e5e5]">
              <TableHead className="px-6 py-3.5 text-left text-xs font-medium text-[#737373] uppercase tracking-wider w-[320px]">
                Nome
              </TableHead>
              <TableHead className="px-6 py-3.5 text-center text-xs font-medium text-[#737373] uppercase tracking-wider">
                Status
              </TableHead>
              {canViewFinancials && (
                <TableHead className="px-6 py-3.5 text-right text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Valor
                </TableHead>
              )}
              <TableHead className="px-6 py-3.5 text-left text-xs font-medium text-[#737373] uppercase tracking-wider w-[260px]">
                Escola
              </TableHead>
              <TableHead className="px-6 py-3.5 text-left text-xs font-medium text-[#737373] uppercase tracking-wider w-[140px]">
                Veículo
              </TableHead>
              <TableHead className="px-6 py-3.5 text-right text-xs font-medium text-[#737373] uppercase tracking-wider">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passageiros.map((passageiro) => {
              const shortName = formatShortName(passageiro?.nome, true);
              const respName = formatNomeResponsavelExibicao(passageiro?.responsavel_principal?.nome, formatoNomeResponsavel);

              return (
                <TableRow
                  key={passageiro.id}
                  onClick={() => props.onHistorico(passageiro)}
                  className={cn(
                    "border-b border-[#e5e5e5] last:border-0 transition-colors cursor-pointer",
                    passageiro.ativo
                      ? "hover:bg-[#fafafa]/80"
                      : "opacity-60 hover:opacity-90 bg-[#fafafa]/40"
                  )}
                >
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center shrink-0 transition-opacity",
                        passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373] opacity-60"
                      )}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className={cn(
                          "font-semibold text-sm truncate",
                          passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
                        )}>
                          {shortName}
                        </p>
                        <p className={cn(
                          "text-xs text-[#737373] truncate",
                          formatoNomeResponsavel === "completo" && "max-w-[200px]"
                        )}>
                          {respName}
                        </p>
                        {exibirTelefoneListaAlunos && (
                          <p className={cn(
                            "text-[11px] text-[#737373] truncate",
                            formatoNomeResponsavel === "completo" && "max-w-[200px]"
                          )}>
                            {formatarTelefoneExibicao(passageiro.responsavel_principal?.telefone)}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-center">
                    <StatusBadge status={passageiro.ativo} />
                  </TableCell>
                  {canViewFinancials && (
                    <TableCell className="px-6 py-3.5 text-right">
                      <span className={cn(
                        "font-semibold text-sm",
                        passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
                      )}>
                        {Number(passageiro.valor_cobranca).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-3.5 text-left">
                    <div className="flex flex-col items-start gap-0.5">
                      <span
                        className={cn(
                          "text-sm font-medium max-w-[240px] block truncate",
                          passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
                        )}
                        title={passageiro.escola?.nome}
                      >
                        {passageiro.escola?.nome || "—"}
                      </span>
                      {(passageiro.periodo || passageiro.turma || passageiro.sala) && (
                        <p className="text-xs text-[#737373] flex items-center gap-1">
                          {passageiro.periodo && <span>{formatPeriodo(passageiro.periodo)}</span>}
                          {passageiro.periodo && passageiro.turma && <span className="text-[8px] text-[#737373] opacity-40">•</span>}
                          {passageiro.turma && <span>{passageiro.turma}</span>}
                          {(passageiro.periodo || passageiro.turma) && passageiro.sala && <span className="text-[8px] text-[#737373] opacity-40">•</span>}
                          {passageiro.sala && <span>Sala {passageiro.sala}</span>}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    {passageiro.veiculo ? (
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-sm font-medium",
                          passageiro.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
                        )}>
                          {formatarPlacaExibicao(passageiro.veiculo.placa)}
                        </span>
                        <span className="text-xs text-[#737373] truncate max-w-[130px]">
                          {passageiro.veiculo.modelo}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#737373]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
}
