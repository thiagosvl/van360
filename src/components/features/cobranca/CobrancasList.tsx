import { AutomaticChargesPrompt } from "@/components/alerts/AutomaticChargesPrompt";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnifiedEmptyState } from "@/components/empty";
import { CobrancaActionsMenu } from "@/components/features/cobranca/CobrancaActionsMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FEATURE_COBRANCA_AUTOMATICA } from "@/constants";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import {
  formatDateToBR,
  formatPaymentType,
  getStatusColor,
} from "@/utils/formatters";
import { BellOff, DollarSign, Wallet } from "lucide-react";
import { Fragment, memo } from "react";

interface CobrancasListProps {
  cobrancas: Cobranca[];
  variant: "pending" | "paid";
  plano: any;
  permissions: any;
  isLoading: boolean;
  busca: string;
  mesFilter: number;
  meses: string[];
  
  // Actions
  onVerCobranca: (cobranca: Cobranca) => void;
  onVerCarteirinha: (passageiroId: string) => void;
  onEditarCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onPagarPix: (cobranca: Cobranca) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onDesfazerPagamento?: (cobranca: Cobranca) => void;
  onActionSuccess: () => void;
  onUpgrade: (feature: string, description?: string) => void;
}

const CobrancaMobileCard = memo(function CobrancaMobileCard({
  cobranca,
  index,
  variant,
  plano,
  permissions,
  onVerCobranca,
  onVerCarteirinha,
  onEditarCobranca,
  onRegistrarPagamento,
  onPagarPix,
  onExcluirCobranca,
  onDesfazerPagamento,
  onActionSuccess,
  onUpgrade,
}: {
  cobranca: Cobranca;
  index: number;
  variant: "pending" | "paid";
} & Omit<CobrancasListProps, "cobrancas" | "isLoading" | "busca" | "mesFilter" | "meses">) {
  
  const isPending = variant === "pending";

  return (
    <Fragment>
      <div className="mb-3">
        {/* Card Content Wrapper */}
         <CardContentWrapper 
            cobranca={cobranca} 
            index={index}
            variant={variant}
            plano={plano}
            permissions={permissions}
            actionsProps={{
                onVerCobranca,
                onVerCarteirinha: () => onVerCarteirinha(cobranca.passageiro_id),
                onEditarCobranca: () => onEditarCobranca(cobranca),
                onRegistrarPagamento: () => onRegistrarPagamento(cobranca),
                onPagarPix: () => onPagarPix(cobranca),
                onExcluirCobranca: () => onExcluirCobranca(cobranca),
                onDesfazerPagamento: onDesfazerPagamento ? () => onDesfazerPagamento(cobranca) : undefined,
                onActionSuccess,
                onUpgrade,
            }}
            onVerCobranca={onVerCobranca}
         />
      </div>
      
      {/* Inline Prompt Mobile (Only for pending tab, after 3rd item) */}
      {isPending && index === 2 && !permissions.canUseAutomatedCharges && (
        <AutomaticChargesPrompt
          variant="inline-mobile"
          onUpgrade={() => onUpgrade(FEATURE_COBRANCA_AUTOMATICA)}
        />
      )}
    </Fragment>
  );
});

function CardContentWrapper({ 
    cobranca, 
    index,
    variant,
    plano, 
    permissions,
    actionsProps,
    onVerCobranca
}: any) {
    const actions = useCobrancaActions({
      cobranca,
      plano,
      ...actionsProps
    });

    return (
        <MobileActionItem actions={actions} showHint={index === 0}>
             <div
                onClick={() => onVerCobranca(cobranca)}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100"
              >
                {/* Header: Avatar + Name + Value */}
                <div className="flex justify-between items-start mb-1 relative">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm",
                        getStatusColor(cobranca?.status, cobranca?.data_vencimento)
                      )}
                    >
                      {cobranca?.passageiro.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {cobranca?.passageiro.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cobranca?.passageiro.nome_responsavel || "Não inf."}{" "}
                        •{" "}
                        <span className="text-sm font-bold text-gray-900 tracking-tight">
                          {Number(cobranca?.valor).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer depending on variant */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  {variant === "pending" ? (
                      <>
                        <div className="flex items-center gap-2">
                            <StatusBadge
                            status={cobranca?.status}
                            dataVencimento={cobranca?.data_vencimento}
                            className="font-semibold h-6 shadow-none"
                            />
                            {cobranca?.desativar_lembretes && (
                            <BellOff className="w-3 h-3 text-orange-700" />
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            VENCIMENTO
                            </span>
                            <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                            {cobranca?.data_vencimento
                                ? formatDateToBR(cobranca?.data_vencimento)
                                : "-"}
                            </p>
                        </div>
                      </>
                  ) : (
                      <>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            FORMA DE PAGAMENTO
                          </span>
                          <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                            {formatPaymentType(cobranca?.tipo_pagamento)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            PAGO EM
                          </span>
                          <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                            {cobranca?.data_pagamento
                              ? formatDateToBR(cobranca?.data_pagamento)
                              : "-"}
                          </p>
                        </div>
                      </>
                  )}
                </div>
              </div>
        </MobileActionItem>
    )
}

export function CobrancasList({
  cobrancas,
  variant,
  isLoading,
  busca,
  mesFilter,
  meses,
  ...props
}: CobrancasListProps) {
  
  // Empty State Logic
  const getEmptyState = () => {
    if (busca !== "") {
        return (
            <UnifiedEmptyState
            icon={Wallet}
            title="Nenhum resultado"
            description="Nenhuma cobrança encontrada com este filtro de busca."
            />
        );
    }

    if (variant === "pending") {
         return (
             <UnifiedEmptyState
               icon={Wallet}
               title="Nenhuma cobrança pendente"
               description={`Não há cobranças pendentes para ${meses[mesFilter - 1]}.`}
             />
         );
    } else {
        return (
            <UnifiedEmptyState
            icon={DollarSign}
            title="Nenhum pagamento"
            description={`Não há pagamentos registrados em ${meses[mesFilter - 1]}.`}
            />
        );
    }
  };

  return (
    <ResponsiveDataList
      data={cobrancas}
      isLoading={isLoading}
      // loadingSkeleton={<ListSkeleton />} // Need to import or pass
      emptyState={getEmptyState()}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(cobranca, index) => (
        <CobrancaMobileCard
          key={cobranca.id}
          cobranca={cobranca}
          index={index}
          variant={variant}
          {...props}
        />
      )}
    >
      <div className="rounded-2xl md:rounded-[28px] border border-gray-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Passageiro
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Valor
              </TableHead>
              
              {variant === "pending" ? (
                  <>
                    <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Vencimento
                    </TableHead>
                     <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Status
                    </TableHead>
                  </>
              ) : (
                  <>
                     <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Data Pagamento
                    </TableHead>
                     <TableHead className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Forma de Pagamento
                    </TableHead>
                  </>
              )}
              
              <TableHead className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cobrancas.map((cobranca) => (
              <TableRow
                key={cobranca.id}
                onClick={() => props.onVerCobranca(cobranca)}
                className="hover:bg-gray-50/80 border-b border-gray-50 last:border-0 transition-colors cursor-pointer group"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm",
                        getStatusColor(cobranca?.status, cobranca?.data_vencimento)
                      )}
                    >
                      {cobranca?.passageiro.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {cobranca?.passageiro.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cobranca?.passageiro.nome_responsavel ||
                          "Responsável não inf."}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <span className="font-bold text-gray-900 text-sm">
                    {Number(cobranca?.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </TableCell>
                
                {variant === "pending" ? (
                    <>
                        <TableCell className="px-6 py-4">
                            <span className="text-sm text-gray-600 font-medium">
                                {formatDateToBR(cobranca?.data_vencimento)}
                            </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <StatusBadge
                                status={cobranca?.status}
                                dataVencimento={cobranca?.data_vencimento}
                                className="font-semibold shadow-none"
                                />
                                {cobranca?.desativar_lembretes &&
                                cobranca?.status !== CobrancaStatus.PAGO && (
                                    <span title="Envio de notificações desativado">
                                    <BellOff className="w-3.5 h-3.5 text-orange-700" />
                                    </span>
                                )}
                            </div>
                        </TableCell>
                    </>
                ) : (
                    <>
                        <TableCell className="px-6 py-4">
                            <span className="text-sm text-gray-600 font-medium">
                            {cobranca?.data_pagamento
                                ? formatDateToBR(cobranca?.data_pagamento)
                                : "-"}
                            </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex flex-col">
                            <span className="text-sm text-gray-700 font-medium">
                                {formatPaymentType(cobranca?.tipo_pagamento)}
                            </span>
                            {cobranca?.pagamento_manual && (
                                <span className="text-[10px] text-gray-400">
                                Pagamento Registrado Manualmente
                                </span>
                            )}
                            </div>
                        </TableCell>
                    </>
                )}

                <TableCell className="px-6 py-4 text-right">
                  <CobrancaActionsMenu
                    cobranca={cobranca}
                    plano={props.plano}
                    onVerCarteirinha={() => props.onVerCarteirinha(cobranca.passageiro_id)}
                    onVerCobranca={() => props.onVerCobranca(cobranca)}
                    onEditarCobranca={() => props.onEditarCobranca(cobranca)}
                    onRegistrarPagamento={() => props.onRegistrarPagamento(cobranca)}
                    onPagarPix={() => props.onPagarPix(cobranca)}
                    onActionSuccess={props.onActionSuccess}
                    onUpgrade={props.onUpgrade}
                    onExcluirCobranca={() => props.onExcluirCobranca(cobranca)}
                    onDesfazerPagamento={props.onDesfazerPagamento ? () => props.onDesfazerPagamento(cobranca) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
}
