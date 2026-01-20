import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePassageiroActions } from "@/hooks/ui/usePassageiroActions";
import { Passageiro } from "@/types/passageiro";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { formatPeriodo } from "@/utils/formatters";
import { Bot, Eye } from "lucide-react";
import { memo } from "react";

interface PassageirosListProps {
  passageiros: Passageiro[];
  plano: any;
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleCobrancaAutomatica: (passageiro: Passageiro) => void;
  onToggleClick: (passageiro: Passageiro) => void;
  onDeleteClick: (passageiro: Passageiro) => void;
  onOpenUpgradeDialog?: (passageiroId?: string) => void;
}

// Helpers
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 1)
    .join("")
    .toUpperCase();
};

const RenderAutoBillingIcon = ({ passageiro }: { passageiro: Passageiro }) => {
  if (!passageiro.enviar_cobranca_automatica) return null;
  return (
    <div
      className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center"
      title="Cobrança Automática Ativa"
    >
      <Bot className="h-3.5 w-3.5 text-indigo-600" />
    </div>
  );
};

// Sub-components to isolate hook calls
const PassageiroActionsMenu = memo(function PassageiroActionsMenu({
  passageiro,
  plano,
  onHistorico,
  onEdit,
  onToggleCobrancaAutomatica,
  onToggleClick,
  onDeleteClick,
  onOpenUpgradeDialog,
}: { passageiro: Passageiro } & Omit<PassageirosListProps, "passageiros">) {
  const actions = usePassageiroActions({
    passageiro,
    onHistorico,
    onEdit,
    onToggleCobrancaAutomatica,
    onToggleStatus: onToggleClick,
    onDelete: onDeleteClick,
    onOpenUpgradeDialog,
  });

  return <ActionsDropdown actions={actions} />;
});

const PassageiroMobileCard = memo(function PassageiroMobileCard({
  passageiro,
  index,
  plano,
  onHistorico,
  onEdit,
  onToggleCobrancaAutomatica,
  onToggleClick,
  onDeleteClick,
  onOpenUpgradeDialog,
}: { passageiro: Passageiro; index: number } & Omit<
  PassageirosListProps,
  "passageiros"
>) {
  const actions = usePassageiroActions({
    passageiro,
    onHistorico,
    onEdit,
    onToggleCobrancaAutomatica,
    onToggleStatus: onToggleClick,
    onDelete: onDeleteClick,
    onOpenUpgradeDialog,
  });

  return (
    <MobileActionItem actions={actions as any} showHint={index === 0}>
      <div
        onClick={() => onHistorico(passageiro)}
        className="bg-white p-4 rounded-xl border-b border-gray-100 flex flex-col gap-3 active:bg-gray-50 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-1 relative">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm ${
                passageiro.ativo
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-slate-600"
              }`}
            >
              {getInitials(passageiro.nome)}
            </div>
            <div className="pr-2">
              <p className="font-bold text-gray-900 text-sm">
                {passageiro.nome}
              </p>
              <p className="text-xs font-semibold text-gray-900">
                {passageiro.nome_responsavel}
              </p>
            </div>
          </div>
          <Eye className="h-4 w-4 text-gray-300 absolute right-0 top-1" />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="shrink-0 flex items-center gap-2">
            <StatusBadge status={passageiro.ativo} />
            <RenderAutoBillingIcon passageiro={passageiro} />
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Escola / Período
            </span>
            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
              {passageiro.escola?.nome || "-"} •{" "}
              {formatPeriodo(passageiro.periodo)}
            </p>
          </div>
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
          {...props}
        />
      )}
    >
      <div className="hidden md:block rounded-2xl md:rounded-[28px] border border-gray-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="w-[300px] py-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                Passageiro
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Escola / Período
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Veículo
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Valor
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passageiros.map((passageiro) => (
              <TableRow
                key={passageiro.id}
                onClick={() => props.onHistorico(passageiro)}
                className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
              >
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        passageiro.ativo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-slate-600"
                      }`}
                    >
                      {getInitials(passageiro.nome)}
                    </div>

                    <div className="flex flex-col">
                      <p className="font-bold text-gray-900 text-sm">
                        {passageiro.nome}
                      </p>
                      <p className="text-xs font-semibold text-gray-900">
                        {passageiro.nome_responsavel}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {passageiro.escola?.nome}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {formatPeriodo(passageiro.periodo)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={passageiro.ativo} />
                    <RenderAutoBillingIcon passageiro={passageiro} />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className="font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                  >
                    {passageiro.veiculo
                      ? formatarPlacaExibicao(passageiro.veiculo.placa)
                      : "-"}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-gray-700">
                  {Number(passageiro.valor_cobranca).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell className="text-right py-4 pr-6">
                  <PassageiroActionsMenu passageiro={passageiro} {...props} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
}
