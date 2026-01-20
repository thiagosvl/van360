import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ReceiptDialog } from "@/components/dialogs/ReceiptDialog";
import { CobrancaActionsMenu } from "@/components/features/cobranca/CobrancaActionsMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useCobrancaActions } from "@/hooks/ui/useCobrancaActions";
import { cn } from "@/lib/utils";
import { Cobranca } from "@/types/cobranca";
import { CobrancaStatus } from "@/types/enums";
import { Passageiro } from "@/types/passageiro";
import {
  formatDateToBR,
  getMesNome,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BellOff,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Eye,
  Plus,
  RotateCcw,
} from "lucide-react";
import { memo, ReactNode, useState } from "react";

interface CarteirinhaCobrancasProps {
  cobrancas: Cobranca[];
  passageiro: Passageiro;
  plano?: {
    slug?: string;
    isEssentialPlan?: boolean;
  } | null;

  yearFilter: string;
  availableYears: string[];
  mostrarTodasCobrancas: boolean;
  onYearChange: (year: string) => void;
  onOpenCobrancaDialog: () => void;
  onNavigateToCobranca: (cobrancaId: string) => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onRegistrarPagamento: (cobranca: Cobranca) => void;
  onPagarPix: (cobranca: Cobranca) => void;
  onEnviarNotificacao: (cobrancaId: string) => void;
  onToggleLembretes: (cobranca: Cobranca) => void;
  onDesfazerPagamento: (cobrancaId: string) => void;
  onExcluirCobranca: (cobranca: Cobranca) => void;
  onToggleMostrarTodas: () => void;
  onToggleClick: (statusAtual: boolean) => void;
  limiteCobrancasMobile?: number;
  onUpgrade: (featureName: string, description: string) => void;
}

const COBRANCAS_LIMIT_DEFAULT = 3;

// Wrapper for Mobile Actions ensuring Hooks compliance
const CobrancaMobileItemWrapper = memo(
  ({
    cobranca,
    children,
    plano,
    onUpgrade,
    onVerCobranca,
    onEditarCobranca,
    onRegistrarPagamento,
    onPagarPix,
    onVerRecibo,
    showHint,
  }: {
    cobranca: Cobranca;
    children: ReactNode;
    plano: any;
    onUpgrade?: (f: string, d: string) => void;
    onVerCobranca: () => void;
    onEditarCobranca: () => void;
    onRegistrarPagamento: () => void;
    onPagarPix: () => void;
    onVerRecibo?: () => void;
    showHint?: boolean;
  }) => {
    const actions = useCobrancaActions({
      cobranca,
      plano,
      onUpgrade,
      onVerCobranca,
      onEditarCobranca,
      onRegistrarPagamento,
      onPagarPix,
      onVerRecibo,
    });

    return (
      <MobileActionItem actions={actions} showHint={showHint}>
        {children}
      </MobileActionItem>
    );
  }
);

export const CarteirinhaCobrancas = ({
  cobrancas,
  passageiro,
  plano,
  yearFilter,
  availableYears,
  mostrarTodasCobrancas,
  onYearChange,
  onOpenCobrancaDialog,
  onNavigateToCobranca,
  onEditCobranca,
  onRegistrarPagamento,
  onPagarPix,
  onToggleMostrarTodas,
  onToggleClick,
  limiteCobrancasMobile = COBRANCAS_LIMIT_DEFAULT,
  onUpgrade,
}: CarteirinhaCobrancasProps) => {
  const cobrancasMobile = mostrarTodasCobrancas
    ? cobrancas
    : cobrancas.slice(0, limiteCobrancasMobile);

  // Verificar se o plano gera cobranças automaticamente (Back-office rule)
  // Agora usamos a flag correta do backend
  const { canUseAutomatedCharges: geraCobrancasAutomaticas } = usePermissions();

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg ring-1 ring-black/5 bg-white">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div
            className={cn(
              "flex justify-between",
              availableYears.length > 1
                ? "flex-col items-start gap-3 md:flex-row md:items-center"
                : "items-center"
            )}
          >
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-gray-900">
                Cobranças
              </CardTitle>
            </div>
            <div
              className={cn(
                "flex items-center gap-2",
                availableYears.length > 1 ? "w-full md:w-auto" : ""
              )}
            >
              <div
                className={`${
                  availableYears.length <= 1 ? "hidden" : "inline"
                }`}
              >
                <Select value={yearFilter} onValueChange={onYearChange}>
                  <SelectTrigger className="w-[90px] h-9 text-sm bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((ano) => (
                      <SelectItem key={ano} value={ano}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className={cn(
                  "h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
                  availableYears.length > 1 ? "flex-1 md:flex-none" : ""
                )}
                onClick={onOpenCobrancaDialog}
                title={"Registrar cobrança manualmente"}
              >
                <Plus className="w-4 h-4" />
                <span>Registrar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {cobrancas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              {!passageiro.ativo ? (
                <>
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Passageiro desativado
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto mb-6">
                    Não é possível gerar cobranças para passageiros desativados.
                    Para voltar a registrar cobranças, reative o cadastro do
                    passageiro.
                  </p>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onToggleClick(passageiro.ativo)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reativar Passageiro
                  </Button>
                </>
              ) : (
                <>
                  {/* Passageiro Ativo */}
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma cobrança encontrada
                  </h3>
                  {geraCobrancasAutomaticas ? (
                    <>
                      <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto mb-6">
                        A cobrança do próximo mês será gerada automaticamente.
                        Você também pode registrar cobranças manualmente.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto mb-6">
                        Não há registros de cobranças para o ano de {yearFilter}
                        . Você pode registrar cobranças manualmente.
                      </p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={onOpenCobrancaDialog}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Cobrança
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Mobile View - Timeline Style Ajustado */}
              <div className="md:hidden">
                <div className="relative pl-11 pr-4 py-6">
                  {" "}
                  {/* Aumentado de pl-9 para pl-11 para mais respiro */}
                  {/* Linha vertical ajustada para o novo espaçamento */}
                  <div className="absolute left-[29px] top-8 bottom-8 w-px bg-gray-200" />
                  <AnimatePresence>
                    {cobrancasMobile.map((cobranca, index) => {
                      const statusColor = getStatusColor(
                        cobranca?.status,
                        cobranca?.data_vencimento
                      );
                      const isPago =
                        cobranca?.status === CobrancaStatus.PAGO;
                      const statusText = getStatusText(
                        cobranca?.status,
                        cobranca?.data_vencimento
                      );

                      // Lógica de cores e ícones (mantida)
                      let circleBgColor = "bg-yellow-100";
                      let circleBorderColor = "border-yellow-400";
                      let circleIcon = (
                        <Clock className="w-3.5 h-3.5 text-yellow-600" />
                      );

                      if (isPago) {
                        circleBgColor = "bg-green-100";
                        circleBorderColor = "border-green-400";
                        circleIcon = (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        );
                      } else if (statusText === "Em atraso") {
                        circleBgColor = "bg-red-100";
                        circleBorderColor = "border-red-400";
                        circleIcon = (
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                        );
                      }

                      return (
                        <motion.div
                          key={cobranca?.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative pl-3 mb-6 last:mb-0"
                        >
                          {/* Círculo da timeline ajustado centralizado na linha */}
                          <div
                            className={cn(
                              "absolute -left-[29px] top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 bg-white shadow-sm",
                              circleBgColor,
                              circleBorderColor
                            )}
                          >
                            {circleIcon}
                          </div>

                          <CobrancaMobileItemWrapper
                            cobranca={cobranca}
                            plano={plano}
                            onUpgrade={onUpgrade}
                            onVerCobranca={() =>
                              onNavigateToCobranca(cobranca?.id)
                            }
                            onEditarCobranca={() => onEditCobranca(cobranca)}
                            onRegistrarPagamento={() =>
                              onRegistrarPagamento(cobranca)
                            }
                            onPagarPix={() => onPagarPix(cobranca)}
                            showHint={index === 0}
                          >
                            <div
                              className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all p-4 cursor-pointer"
                              onClick={() => onNavigateToCobranca(cobranca?.id)}
                            >
                              {/* Cabeçalho: Mês e Data */}
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="text-base font-bold text-gray-900">
                                    {getMesNome(cobranca?.mes)}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {cobranca?.status ===
                                    CobrancaStatus.PAGO ? (
                                      <>
                                        Paga em{" "}
                                        {formatDateToBR(
                                          cobranca?.data_pagamento
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        Vence em{" "}
                                        {formatDateToBR(
                                          cobranca?.data_vencimento
                                        )}
                                      </>
                                    )}
                                  </p>
                                </div>
                                <Eye className="h-4 w-4 text-gray-300 absolute right-4 top-3" />
                              </div>

                              {/* CORPO: Valor e Status lado a lado */}
                              <div className="flex justify-between items-end mb-1">
                                <div>
                                  <span className="text-[11px] tracking-wider uppercase text-gray-500 font-medium">
                                    Valor
                                  </span>
                                  <p className="font-semibold text-gray-900 leading-none mt-0.5 text-md">
                                    {Number(cobranca?.valor).toLocaleString(
                                      "pt-BR",
                                      {
                                        style: "currency",
                                        currency: "BRL",
                                      }
                                    )}
                                  </p>
                                </div>

                                <div className="pb-0.5">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "font-medium px-2.5 py-1 text-xs rounded-md whitespace-nowrap shadow-sm",
                                      statusColor
                                    )}
                                  >
                                    {statusText}
                                  </Badge>
                                </div>
                              </div>

                              {/* Alerta de Lembretes (Estilo Full-width Warning) */}
                              {cobranca?.desativar_lembretes && !isPago && (
                                <div className="mt-4 -mx-4 -mb-4 px-4 py-2.5 bg-orange-50 border-t border-orange-100 rounded-b-xl flex items-center gap-2">
                                  <BellOff className="w-4 h-4 text-orange-700" />
                                  <span className="text-xs font-medium text-orange-700">
                                    Envio de notificações desativado
                                  </span>
                                </div>
                              )}
                            </div>
                          </CobrancaMobileItemWrapper>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {cobrancas.length > limiteCobrancasMobile && (
                  <div className="px-4 pb-6">
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-primary text-sm font-medium"
                      onClick={onToggleMostrarTodas}
                    >
                      {mostrarTodasCobrancas ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Recolher histórico
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          Ver histórico completo ({cobrancas.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Mês/Vencimento</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cobrancas.map((cobranca, index) => {
                      const statusColor = getStatusColor(
                        cobranca?.status,
                        cobranca?.data_vencimento
                      );
                      const isPago =
                        cobranca?.status === CobrancaStatus.PAGO;

                      return (
                        <motion.tr
                          key={cobranca?.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => onNavigateToCobranca(cobranca?.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 capitalize">
                                {getMesNome(cobranca?.mes)}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                Vence em{" "}
                                {formatDateToBR(cobranca?.data_vencimento)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {Number(cobranca?.valor).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={cn("font-medium", statusColor)}
                              >
                                {getStatusText(
                                  cobranca?.status,
                                  cobranca?.data_vencimento
                                )}
                              </Badge>
                              {cobranca?.desativar_lembretes && !isPago && (
                                <span title="Envio de notificações desativado">
                                  <BellOff className="w-3.5 h-3.5 text-orange-700" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className="px-6 py-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CobrancaActionsMenu
                              cobranca={cobranca}
                              plano={plano}
                              onVerCobranca={() =>
                                onNavigateToCobranca(cobranca?.id)
                              }
                              onEditarCobranca={() => onEditCobranca(cobranca)}
                              onRegistrarPagamento={() =>
                                onRegistrarPagamento(cobranca)
                              }
                              onPagarPix={() => onPagarPix(cobranca)}
                              onUpgrade={(feature) =>
                                onUpgrade(feature, "Upgrade via Menu de Ações")
                              }
                              onVerRecibo={() =>
                                cobranca?.recibo_url &&
                                setReceiptUrl(cobranca?.recibo_url)
                              }
                            />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ReceiptDialog
        url={receiptUrl}
        open={!!receiptUrl}
        onOpenChange={(open) => !open && setReceiptUrl(null)}
      />
    </motion.div>
  );
};
