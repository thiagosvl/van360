import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { openBrowserLink } from "@/utils/browser";
import { Download, Receipt } from "lucide-react";
import React from "react";

interface ReceiptDialogProps {
  url?: string | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ReceiptDialog({ url, trigger, open, onOpenChange }: ReceiptDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md sm:rounded-2xl border-0 shadow-2xl">
                <DialogHeader className="mb-2">
                    <DialogTitle>Comprovante de Pagamento</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center justify-center min-h-[200px]">
                        {url && url !== "null" ? (
                            <img 
                                src={url} 
                                alt="Recibo" 
                                className="w-full h-auto object-contain rounded-lg shadow-sm"
                            />
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Imagem do comprovante indisponível.</p>
                            </div>
                        )}
                    </div>

                    {url && url !== "null" && (
                        <div className="flex gap-3">
                            <Button 
                                className="w-full gap-2 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-blue-100" 
                                onClick={() => openBrowserLink(url)}
                            >
                                <Download className="w-4 h-4" />
                                Baixar Original
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
