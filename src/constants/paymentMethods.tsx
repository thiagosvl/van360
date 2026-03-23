import { CobrancaTipoPagamento } from "@/types/enums";
import { 
  Banknote, 
  CreditCard, 
  FileText, 
  QrCode, 
  Send 
} from "lucide-react";
import { ReactNode } from "react";

export interface PaymentMethodOption {
  value: CobrancaTipoPagamento;
  label: string;
  icon: ReactNode;
  color: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    value: CobrancaTipoPagamento.PIX,
    label: "PIX",
    icon: <QrCode className="w-5 h-5" />,
    color: "text-emerald-600",
  },
  {
    value: CobrancaTipoPagamento.DINHEIRO,
    label: "Dinheiro",
    icon: <Banknote className="w-5 h-5" />,
    color: "text-green-600",
  },
  {
    value: CobrancaTipoPagamento.CARTAO_CREDITO,
    label: "Cartão de Crédito",
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-blue-600",
  },
  {
    value: CobrancaTipoPagamento.CARTAO_DEBITO,
    label: "Cartão de Débito",
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-indigo-600",
  },
  {
    value: CobrancaTipoPagamento.TRANSFERENCIA,
    label: "Transferência",
    icon: <Send className="w-5 h-5" />,
    color: "text-orange-600",
  },
  {
    value: CobrancaTipoPagamento.BOLETO,
    label: "Boleto Bancário",
    icon: <FileText className="w-5 h-5" />,
    color: "text-slate-600",
  },
];

export const getPaymentMethodByValue = (value: string) => {
  return PAYMENT_METHODS.find((m) => m.value === value);
};
