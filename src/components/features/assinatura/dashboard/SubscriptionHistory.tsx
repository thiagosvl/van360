import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@/components/ui/table";
import { ASSINATURA_COBRANCA_STATUS_CANCELADA, ASSINATURA_COBRANCA_STATUS_PAGO, ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO } from "@/constants";
import { formatPaymentType } from "@/utils/formatters/cobranca";
import { Calendar, Download, Printer, Receipt } from "lucide-react";

interface SubscriptionHistoryProps {
  cobrancas: any[];
  onPagarClick: (cobranca: any) => void;
}

const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  // Adiciona o timezone offset para garantir que a data não volte um dia
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  
  // Capitalize first letter
  const month = adjustedDate.toLocaleDateString("pt-BR", { month: "long" });
  const year = adjustedDate.toLocaleDateString("pt-BR", { year: "numeric" });
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
};

export function SubscriptionHistory({ cobrancas, onPagarClick }: SubscriptionHistoryProps) {
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case ASSINATURA_COBRANCA_STATUS_PAGO:
        return { 
            badge: <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Pago</Badge>,
        };
      case ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO:
        return { 
            badge: <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Pendente</Badge>,
        };
      case ASSINATURA_COBRANCA_STATUS_CANCELADA:
        return { 
            badge: <Badge className="text-gray-500 bg-transparent hover:bg-transparent">Cancelada</Badge>,
        };
      default:
        return { 
            badge: <Badge variant="outline" className="text-gray-500">{status}</Badge>,
        };
    }
  };

  const sortedCobrancas = [...cobrancas].sort((a, b) => 
     new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime()
  );

  const MobileCard = ({ cobranca }: { cobranca: any }) => {
      const { badge } = getStatusConfig(cobranca.status);
      
      return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                            {cobranca.descricao || `Assinatura - ${getMonthYear(cobranca.data_vencimento)}`}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                             <Calendar className="w-3 h-3 text-gray-400" />
                             <span className="text-xs text-gray-500">
                                Venc. {new Date(cobranca.data_vencimento).toLocaleDateString("pt-BR")}
                             </span>
                        </div>
                    </div>
                </div>
                {badge}
            </div>

            <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Valor</span>
                        <span className="text-lg font-bold text-gray-900">
                        {Number(cobranca.valor).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}
                        </span>
                </div>

                <div className="flex items-center gap-2">
                        {cobranca.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO ? (
                        <Button 
                            size="sm" 
                            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg"
                            onClick={() => onPagarClick(cobranca)}
                        >
                        Pagar
                        </Button>
                    ) : (
                        <ReceiptDialog cobranca={cobranca} trigger={
                            <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg">
                                <Receipt className="w-4 h-4" />
                                <span className="hidden xs:inline">Recibo</span>
                            </Button>
                        } />
                    )}
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 px-1">Histórico de Faturamento</h3>
        <ResponsiveDataList
            data={sortedCobrancas}
            emptyState={
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Receipt className="w-6 h-6 text-gray-400" />
                    </div>
                    <p>Nenhuma fatura encontrada.</p>
                </div>
            }
            mobileItemRenderer={(cobranca) => <MobileCard key={cobranca.id} cobranca={cobranca} />}
        >
            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <Table>
                    <thead className="bg-gray-50/50">
                        <TableRow className="border-b border-gray-100 hover:bg-transparent">
                            <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-wider w-[260px]">Descrição / Vencimento</TableHead>
                            <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</TableHead>
                            <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-right pr-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</TableHead>
                        </TableRow>
                    </thead>
                    <TableBody className="divide-y divide-gray-50">
                            {sortedCobrancas.map((cobranca) => {
                                const { badge } = getStatusConfig(cobranca.status);
                                return (
                                <TableRow key={cobranca.id} className="hover:bg-gray-50/50 transition-colors border-0">
                                    <TableCell className="py-4 font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">
                                                {cobranca.descricao || `Assinatura - ${getMonthYear(cobranca.data_vencimento)}`}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Vencimento: {new Date(cobranca.data_vencimento).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 font-bold text-gray-900">
                                        {Number(cobranca.valor).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </TableCell>
                                    <TableCell className="py-4">{badge}</TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        {cobranca.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO ? (
                                            <Button 
                                                size="sm" 
                                                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all hover:-translate-y-0.5"
                                                onClick={() => onPagarClick(cobranca)}
                                            >
                                            Pagar
                                            </Button>
                                        ) : (
                                            <ReceiptDialog cobranca={cobranca} trigger={
                                                <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg hover:text-gray-900 transition-colors">
                                                    <Receipt className="w-4 h-4" />
                                                    Recibo
                                                </Button>
                                            } />
                                        )}
                                    </TableCell>
                                </TableRow>
                            )})}
                    </TableBody>
                </Table>
            </div>
        </ResponsiveDataList>
    </div>
  );
}

// Extracted Receipt Dialog to avoid duplication and nesting issues
function ReceiptDialog({ cobranca, trigger }: { cobranca: any, trigger: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-md sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Comprovante de Pagamento</DialogTitle>
                </DialogHeader>
                <div id={`receipt-content-${cobranca.id}`} className="space-y-6 p-6 bg-white rounded-xl border border-gray-100 shadow-sm my-4">
                    <div className="text-center border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-lg text-gray-900">Van360</h3>
                        <p className="text-xs text-gray-500">Recibo de Pagamento</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Item</span>
                            <span className="font-medium text-gray-900 text-right max-w-[200px] break-words">
                                {cobranca.descricao || `Assinatura - ${getMonthYear(cobranca.data_vencimento)}`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Valor Pago</span>
                            <span className="font-bold text-gray-900">{Number(cobranca.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Data de Vencimento</span>
                            <span className="font-medium text-gray-900">{new Date(cobranca.data_vencimento).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Forma de Pagamento</span>
                            <span className="font-medium text-gray-900">
                                {formatPaymentType(cobranca.forma_pagamento || cobranca.metodo_pagamento || "PIX")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs">Pago</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-center space-y-1">
                        <p className="text-xs text-gray-400">ID da Transação</p>
                        <p className="text-xs font-mono text-gray-600">{cobranca.id}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 gap-2 rounded-xl h-11" onClick={() => {
                        const content = document.getElementById(`receipt-content-${cobranca.id}`)?.innerHTML;
                        const printWindow = window.open('', '', 'height=600,width=800');
                        if (printWindow && content) {
                            printWindow.document.write('<html><head><title>Recibo Van360</title>');
                            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); 
                            printWindow.document.write('</head><body class="p-8 bg-white">');
                            printWindow.document.write(content);
                            printWindow.document.write('</body></html>');
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => {
                                printWindow.print();
                                printWindow.close();
                            }, 500);
                        }
                    }}>
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11" onClick={() => {
                            const content = document.getElementById(`receipt-content-${cobranca.id}`)?.innerHTML;
                            const printWindow = window.open('', '', 'height=600,width=800');
                            if (printWindow && content) {
                                printWindow.document.write('<html><head><title>Recibo Van360</title>');
                                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); 
                                printWindow.document.write('</head><body class="p-8 bg-white">');
                                printWindow.document.write(content);
                                printWindow.document.write('</body></html>');
                                printWindow.document.close();
                                printWindow.focus();
                                setTimeout(() => {
                                    printWindow.print(); 
                                    printWindow.close();
                                }, 500);
                            }
                    }}>
                        <Download className="w-4 h-4" />
                        Baixar PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
