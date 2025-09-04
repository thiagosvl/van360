import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { useEffect, useState } from "react";

interface ManualPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancaId: string;
  passageiroNome: string;
  valorOriginal: number;
  onPaymentRecorded: () => void;
}

export default function ManualPaymentDialog({
  isOpen,
  onClose,
  cobrancaId,
  passageiroNome,
  valorOriginal,
  onPaymentRecorded,
}: ManualPaymentDialogProps) {
  const [valorPago, setValorPago] = useState("");
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tipoPagamento, setTipoPagamento] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset form values when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      setValorPago(
        valorOriginal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      );
      setDataPagamento(new Date().toISOString().split("T")[0]);
      setTipoPagamento("");
    }
  }, [isOpen, valorOriginal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoPagamento) {
      toast({
        title: "Erro",
        description: "Selecione a forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const valorNumerico = moneyToNumber(valorPago);

      const { error } = await supabase
        .from("cobrancas")
        .update({
          status: "pago",
          data_pagamento: dataPagamento,
          tipo_pagamento: tipoPagamento,
          valor: valorNumerico,
        })
        .eq("id", cobrancaId);

      if (error) throw error;

      toast({
        title: "Pagamento registrado com sucesso",
        description: `Pagamento de ${passageiroNome} foi registrado`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setValorPago(
      valorOriginal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    );
    setDataPagamento(new Date().toISOString().split("T")[0]);
    setTipoPagamento("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Registrar Pagamento Manual</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Passageiro</Label>
            <Input value={passageiroNome} disabled className="mt-1" />
          </div>

          <div>
            <Label htmlFor="valor" className="text-sm font-medium">
              Valor Pago
            </Label>
            <Input
              id="valor"
              value={valorPago}
              onChange={(e) => setValorPago(moneyMask(e.target.value))}
              placeholder="R$ 0,00"
              className="mt-1"
              required
              autoFocus={false}
            />
          </div>

          <div>
            <Label htmlFor="data" className="text-sm font-medium">
              Data do Pagamento
            </Label>
            <Input
              id="data"
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo" className="text-sm font-medium">
              Forma de Pagamento
            </Label>
            <Select value={tipoPagamento} onValueChange={setTipoPagamento}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="cartao-credito">
                  Cartão de Crédito
                </SelectItem>
                <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
