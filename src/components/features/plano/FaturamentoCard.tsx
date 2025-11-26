import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ASSINATURA_COBRANCA_STATUS_CANCELADA,
  ASSINATURA_COBRANCA_STATUS_PAGO,
  ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO,
  PLANO_GRATUITO,
} from "@/constants";
import { formatDateToBR } from "@/utils/formatters";
import { LucideCreditCard } from "lucide-react";
import { useState } from "react";

const formatUserBillingType = (billingType: string) => {
  return billingType === "subscription" ? "Mensalidade" : "Adesão";
};

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
};

const formatMes = (data: string) => {
  const date = new Date(data);
  const mes = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const ano = date.getFullYear();
  return `${mes.charAt(0).toUpperCase() + mes.slice(1)}/${ano}`;
};

const FaturamentoTable = ({ cobrancas, onPagarClick }: any) => (
  <div className="hidden md:block overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plano</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Referência</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cobrancas.map((cobranca) => (
          <TableRow key={cobranca.id}>
            <TableCell className="font-semibold text-gray-700">
              {cobranca.assinatura_usuarios.planos?.parent
                ? cobranca.assinatura_usuarios.planos?.parent.nome
                : cobranca.assinatura_usuarios.planos?.nome}
            </TableCell>
            <TableCell className="font-semibold text-gray-700">
              {formatDateToBR(cobranca.data_vencimento)}
            </TableCell>
            <TableCell>
              {formatCurrency(cobranca.valor_pago || cobranca.valor)}
            </TableCell>
            <TableCell>
              {cobranca.status === ASSINATURA_COBRANCA_STATUS_PAGO ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  Pago
                </Badge>
              ) : cobranca.status === ASSINATURA_COBRANCA_STATUS_CANCELADA ? (
                <Badge
                  variant="destructive"
                  className="bg-gray-100 text-gray-700 border-gray-400"
                >
                  Cancelada
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-700 border-red-400"
                >
                  Pendente
                </Badge>
              )}
            </TableCell>
            <TableCell className="font-semibold text-gray-700">
              {formatUserBillingType(cobranca.billing_type)}
            </TableCell>
            <TableCell>
              {cobranca.status ===
              ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO ? (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onPagarClick(cobranca)}
                >
                  Pagar
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const FaturamentoMobileList = ({ cobrancas, onPagarClick }: any) => (
  <div className="md:hidden space-y-3 pb-3">
    {cobrancas.map((cobranca) => (
      <Card
        key={cobranca.id}
        className={`shadow-sm ${
          cobranca.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO
            ? "border-l-4 border-yellow-500 bg-yellow-50 m-3"
            : "m-3"
        }`}
      >
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="">
              Plano{" "}
              {cobranca.assinatura_usuarios.planos?.parent
                ? cobranca.assinatura_usuarios.planos?.parent.nome
                : cobranca.assinatura_usuarios.planos?.nome}
            </span>
            <span className="text-muted-foreground text-xs">
              Vencimento: {formatDateToBR(cobranca.data_vencimento)}
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(cobranca.valor_pago || cobranca.valor)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            {cobranca.billing_type === "upgrade" && (
              <Badge
                variant="destructive"
                className="bg-gray-100 text-gray-700 border-gray-400"
              >
                {formatUserBillingType(cobranca.billing_type)}
              </Badge>
            )}
            {cobranca.status === ASSINATURA_COBRANCA_STATUS_PAGO ? (
              <Badge
                variant="secondary"
                className="bg-green-100 border-green-400 text-green-700"
              >
                Pago
              </Badge>
            ) : cobranca.status === ASSINATURA_COBRANCA_STATUS_CANCELADA ? (
              <Badge
                variant="destructive"
                className="bg-gray-100 text-gray-700 border-gray-400"
              >
                Cancelada
              </Badge>
            ) : (
              <Badge
                variant="destructive"
                className="bg-red-100 text-red-700 border-red-400"
              >
                Pendente
              </Badge>
            )}
            <span className="mt-3">
              {cobranca.status ===
              ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO ? (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onPagarClick(cobranca)}
                >
                  Pagar
                </Button>
              ) : null}
            </span>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const FaturamentoCard = ({
  cobrancas,
  navigate,
  plano,
  onPaymentSuccess = () => {},
  usuarioId,
  onPrecisaSelecaoManual,
}) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<any>(null);

  const handlePagarClick = (cobranca: any) => {
    setSelectedCobranca(cobranca);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedCobranca(null);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  if (!cobrancas || cobrancas.length === 0) {
    return (
      <>
        <Card className="shadow-lg flex items-center justify-center py-8 border-2 bg-gray-100 border-dashed rounded-lg text-muted-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
              Histórico de Faturamento
            </CardTitle>
            <CardDescription className="">
              <LucideCreditCard className="w-6 h-6 mr-2 inline" />
              <span className="text-sm">
                {plano.slug === PLANO_GRATUITO
                  ? "As cobranças e recibos da sua assinatura serão exibidas aqui, após contratar um plano."
                  : "Nenhuma cobrança registrada neste histórico."}
              </span>
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            Histórico de Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <FaturamentoTable
            cobrancas={cobrancas}
            navigate={navigate}
            onPagarClick={handlePagarClick}
          />
          <FaturamentoMobileList
            cobrancas={cobrancas}
            navigate={navigate}
            onPagarClick={handlePagarClick}
          />
        </CardContent>
      </Card>

      {selectedCobranca && (
        <PagamentoAssinaturaDialog
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedCobranca(null);
          }}
          cobrancaId={selectedCobranca.id}
          valor={Number(selectedCobranca.valor)}
          onPaymentSuccess={handlePaymentSuccess}
          usuarioId={usuarioId}
          onPrecisaSelecaoManual={onPrecisaSelecaoManual}
        />
      )}
    </>
  );
};

export default FaturamentoCard;
