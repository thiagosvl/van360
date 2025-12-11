import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Passageiro } from "@/types/passageiro";
import { canUseCobrancaAutomatica } from "@/utils/domain/plano/accessRules";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { formatPeriodo } from "@/utils/formatters";
import {
  Bot,
  BotOff,
  CreditCard,
  MoreVertical,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2
} from "lucide-react";

interface PassageirosListProps {
  passageiros: Passageiro[];
  plano: any;
  onHistorico: (passageiro: Passageiro) => void;
  onEdit: (passageiro: Passageiro) => void;
  onToggleCobrancaAutomatica: (passageiro: Passageiro) => void;
  onToggleClick: (passageiro: Passageiro) => void;
  onSetDeleteDialog: (passageiroId: string) => void;
  onOpenUpgradeDialog?: (passageiroId?: string) => void;
}

export function PassageirosList({
  passageiros,
  plano,
  onHistorico,
  onEdit,
  onToggleCobrancaAutomatica,
  onToggleClick,
  onSetDeleteDialog,
  onOpenUpgradeDialog,
}: PassageirosListProps) {
  const hasCobrancaAutomaticaAccess = canUseCobrancaAutomatica(plano as any);

  const handleCobrancaAutomaticaClick = (passageiro: Passageiro) => {
    if (hasCobrancaAutomaticaAccess) {
      // Usuário tem permissão: executa a ação normal
      onToggleCobrancaAutomatica(passageiro);
    } else {
      // Usuário não tem permissão: abre dialog de upgrade
      onOpenUpgradeDialog?.(passageiro.id);
    }
  };
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 1)
      .join("")
      .toUpperCase();
  };

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 font-medium"
      >
        Ativo
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium"
      >
        Inativo
      </Badge>
    );
  };

  const renderAutoBillingIcon = (passageiro: Passageiro) => {
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

  const ActionsDropdown = ({ passageiro }: { passageiro: Passageiro }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-gray-600"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onHistorico(passageiro);
          }}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Ver Carteirinha
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(passageiro);
          }}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </DropdownMenuItem>
        {/* Botão de Cobrança Automática - Sempre visível */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleCobrancaAutomaticaClick(passageiro);
          }}
        >
          {passageiro.enviar_cobranca_automatica ? (
            <>
              <BotOff className="w-4 h-4 mr-2" />
              Pausar Cobrança Automática
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 mr-2" />
              Ativar Cobrança Automática
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onToggleClick(passageiro);
          }}
        >
          {passageiro.ativo ? (
            <>
              <ToggleLeft className="w-4 h-4 mr-2" />
              Desativar
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4 mr-2" />
              Reativar
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onSetDeleteDialog(passageiro.id);
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Desktop Table */}
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
                onClick={() => onHistorico(passageiro)}
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
                      <p className="text-xs font-semibold text-gray-500">
                        {passageiro.nome_responsavel}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {passageiro.escolas?.nome}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {formatPeriodo(passageiro.periodo)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(passageiro.ativo)}
                    {renderAutoBillingIcon(passageiro)}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className="font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                  >
                    {passageiro.veiculos
                      ? formatarPlacaExibicao(passageiro.veiculos.placa)
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
                  <ActionsDropdown passageiro={passageiro} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {passageiros.map((passageiro) => (
          <div
            key={passageiro.id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100"
            onClick={() => onHistorico(passageiro)}
          >
            {/* Linha 1: Avatar + Nome + Ações */}
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
                <div className="pr-6">
                  <p className="font-bold text-gray-900 text-sm">
                    {passageiro.nome}
                  </p>
                  <p className="text-xs font-semibold text-gray-900">
                    {passageiro.nome_responsavel}
                  </p>
                </div>
              </div>

              {/* Botão de Ações no Topo Direito */}
              <div className="-mt-1 -mr-2" onClick={(e) => e.stopPropagation()}>
                <ActionsDropdown passageiro={passageiro} />
              </div>
            </div>

            {/* Linha 2: Detalhes Secundários + Status */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <div className="shrink-0 flex items-center gap-2">
                {getStatusBadge(passageiro.ativo)}
                {renderAutoBillingIcon(passageiro)}
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Escola / Período
                </span>
                <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  {passageiro.escolas?.nome} •{" "}
                  {formatPeriodo(passageiro.periodo)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
