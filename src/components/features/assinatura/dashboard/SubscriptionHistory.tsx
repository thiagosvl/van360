import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ASSINATURA_COBRANCA_STATUS_PAGO, ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO } from "@/constants";
import { formatPaymentType } from "@/utils/formatters/cobranca";
import { Download, Printer, Receipt } from "lucide-react";

interface SubscriptionHistoryProps {
  cobrancas: any[];
  onPagarClick: (cobranca: any) => void;
}

export function SubscriptionHistory({ cobrancas, onPagarClick }: SubscriptionHistoryProps) {
  // Mock function to "generate receipt"
  const handleReceipt = (cobranca: any) => {
    // In a real app, this would open a PDF or a printable view
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ASSINATURA_COBRANCA_STATUS_PAGO:
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Pago</Badge>;
      case ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none">Pendente</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">{status}</Badge>;
    }
  };

  const sortedCobrancas = [...cobrancas].sort((a, b) => 
     new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime()
  );

  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">Histórico de Faturamento</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCobrancas.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Nenhuma fatura encontrada.
                    </TableCell>
                </TableRow>
            ) : (
                sortedCobrancas.map((cobranca) => (
                <TableRow key={cobranca.id}>
                    <TableCell>
                    {new Date(cobranca.data_vencimento).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                    {Number(cobranca.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                    </TableCell>
                    <TableCell>{getStatusBadge(cobranca.status)}</TableCell>
                    <TableCell className="text-right">
                    {cobranca.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO ? (
                        <Button 
                            size="sm" 
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => onPagarClick(cobranca)}
                        >
                        Pagar
                        </Button>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 text-gray-600 border-gray-200 hover:bg-gray-50 h-8">
                                    <Receipt className="w-4 h-4" />
                                    Recibo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Comprovante de Pagamento</DialogTitle>
                                </DialogHeader>
                                <div id="receipt-content" className="space-y-6 p-6 bg-white rounded-lg border border-gray-100 shadow-sm my-4">
                                    <div className="text-center border-b border-gray-100 pb-4">
                                        <h3 className="font-bold text-lg text-gray-900">Van360</h3>
                                        <p className="text-xs text-gray-500">Recibo de Pagamento</p>
                                    </div>
                                    
                                    <div className="space-y-3 text-sm">
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
                                    <Button className="flex-1 gap-2" onClick={() => {
                                        const content = document.getElementById('receipt-content')?.innerHTML;
                                        const printWindow = window.open('', '', 'height=600,width=800');
                                        if (printWindow && content) {
                                            printWindow.document.write('<html><head><title>Recibo Van360</title>');
                                            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // Quick styling for print
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
                                    <Button variant="outline" className="flex-1 gap-2" onClick={() => {
                                         const content = document.getElementById('receipt-content')?.innerHTML;
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
                                                 printWindow.print(); // Browser's "Save as PDF" is here
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
                    )}
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
