import { Input } from "@/components/ui/input";
import { CreditCard, Lock, Calendar, ShieldCheck, User, MapPin, Info, Loader2, AlertCircle } from 'lucide-react';
import { isDevEnv } from '@/utils/detectPlatform';
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cepService } from "@/services/cepService";
import { usePaymentProvider } from "@/hooks/business/usePaymentProvider";
import { InstallmentOption } from "@/types/payment";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CreditCardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  birth: string;
  zipcode: string;
  street: string;
  number_address: string;
  neighborhood: string;
  city: string;
  state: string;
  installments?: number;
  installmentOption?: InstallmentOption | null;
}

interface CreditCardFormProps {
  onChange: (data: CreditCardData | null) => void;
  initialBirthDate?: string;
  cardError?: string | null;
  totalPrice?: number;
}

export default function CreditCardForm({ onChange, initialBirthDate, cardError, totalPrice }: CreditCardFormProps) {
  const { getInstallments } = usePaymentProvider();
  const [installmentsList, setInstallmentsList] = useState<InstallmentOption[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [loadingInstallments, setLoadingInstallments] = useState(false);

  const formattedInitialBirth = (() => {
    if (!initialBirthDate) return "";
    const clean = initialBirthDate.trim();
    if (clean.includes("-")) {
      const parts = clean.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      }
    }
    return clean;
  })();

  const [formData, setFormData] = useState<CreditCardData>({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    birth: formattedInitialBirth,
    zipcode: "",
    street: "",
    number_address: "",
    neighborhood: "",
    city: "",
    state: "",
    installments: 1
  });

  const [maskedNumber, setMaskedNumber] = useState("");
  const [maskedExpiry, setMaskedExpiry] = useState("");
  const [maskedBirth, setMaskedBirth] = useState(formattedInitialBirth);
  const [maskedZip, setMaskedZip] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const fetchedKeyRef = useRef<string>("");

  useEffect(() => {
    const cleanNumber = formData.number.replace(/\D/g, "");
    if (cleanNumber.length >= 13 && totalPrice && totalPrice > 0 && getInstallments) {
      let brand = "mastercard";
      if (/^4/.test(cleanNumber)) brand = "visa";
      else if (/^5[1-5]/.test(cleanNumber)) brand = "mastercard";
      else if (/^3[47]/.test(cleanNumber)) brand = "amex";
      else if (/^6(?:011|5)/.test(cleanNumber)) brand = "elo";

      const totalCents = Math.round(totalPrice * 100);
      const cacheKey = `${brand}_${totalCents}_${cleanNumber.slice(0, 6)}`;

      if (fetchedKeyRef.current === cacheKey) return;
      fetchedKeyRef.current = cacheKey;

      setLoadingInstallments(true);

      getInstallments(brand, totalCents)
        .then((options) => {
          if (options && options.length > 0) {
            setInstallmentsList(options);
            setSelectedInstallment(options[0].installment);
            setFormData(prev => ({ ...prev, installments: options[0].installment, installmentOption: options[0] }));
          } else {
            setInstallmentsList([]);
            setFormData(prev => ({ ...prev, installments: 1, installmentOption: null }));
          }
        })
        .catch(() => {
          setInstallmentsList([]);
          setFormData(prev => ({ ...prev, installments: 1, installmentOption: null }));
        })
        .finally(() => {
          setLoadingInstallments(false);
        });
    } else {
      fetchedKeyRef.current = "";
      setInstallmentsList([]);
      setFormData(prev => ({ ...prev, installments: 1, installmentOption: null }));
    }
  }, [formData.number, totalPrice, getInstallments]);

  const handleCepFetch = async (cleanCep: string) => {
    setLoadingCep(true);
    try {
      const address = await cepService.buscarEndereco(cleanCep);
      if (address) {
        setFormData(prev => ({
          ...prev,
          street: address.logradouro,
          neighborhood: address.bairro,
          city: address.cidade,
          state: address.estado
        }));

        setTimeout(() => {
          document.getElementById("number_address")?.focus();
        }, 100);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const val = value.replace(/\D/g, "");
    const groups = val.match(/.{1,4}/g);
    return groups ? groups.join(" ").substr(0, 19) : val;
  };

  const formatExpiry = (value: string) => {
    const val = value.replace(/\D/g, "");
    return val.length >= 2 ? `${val.substr(0, 2)}/${val.substr(2, 2)}` : val;
  };

  const formatDate = (value: string) => {
    const val = value.replace(/\D/g, "");
    if (val.length <= 2) return val;
    if (val.length <= 4) return `${val.substr(0, 2)}/${val.substr(2, 2)}`;
    return `${val.substr(0, 2)}/${val.substr(2, 2)}/${val.substr(4, 4)}`;
  };

  const formatZip = (value: string) => {
    const val = value.replace(/\D/g, "");
    return val.length > 5 ? `${val.substr(0, 5)}-${val.substr(5, 3)}` : val;
  };

  const handleChange = (field: keyof CreditCardData, value: string) => {
    let finalValue = value;

    if (field === "number") {
      finalValue = value.replace(/\D/g, "");
      setMaskedNumber(formatCardNumber(value));
    } else if (field === "expiry") {
      finalValue = formatExpiry(value).substr(0, 5);
      setMaskedExpiry(finalValue);
    } else if (field === "cvv") {
      finalValue = value.replace(/\D/g, "").substr(0, 4);
    } else if (field === "birth") {
      finalValue = formatDate(value).substr(0, 10);
      setMaskedBirth(finalValue);
    } else if (field === "zipcode") {
      finalValue = formatZip(value).substr(0, 9);
      setMaskedZip(finalValue);
      const cleanValue = finalValue.replace(/\D/g, "");
      if (cleanValue.length === 8) {
        handleCepFetch(cleanValue);
      }
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  useEffect(() => {
    const isComplete =
      formData.number.length >= 13 &&
      formData.name.length >= 3 &&
      formData.expiry.length === 5 &&
      formData.cvv.length >= 3;

    if (isComplete) {
      onChange(formData);
    } else {
      onChange(null);
    }
  }, [formData, onChange]);

  useEffect(() => {
    if (initialBirthDate) {
      const clean = initialBirthDate.trim();
      let formatted = clean;
      if (clean.includes("-")) {
        const parts = clean.split("-");
        if (parts.length === 3) {
          const [y, m, d] = parts;
          formatted = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        }
      }
      setFormData(prev => ({ ...prev, birth: formatted }));
      setMaskedBirth(formatted);
    }
  }, [initialBirthDate]);

  const fillMagicData = (type: 'success' | 'error_invalid' | 'error_risk') => {
    const cardNumber = type === 'success'
      ? '4485785674290087'
      : type === 'error_invalid'
        ? '4111111111111111'
        : '4000000000000002';

    setMaskedNumber(formatCardNumber(cardNumber));
    setMaskedExpiry("12/28");
    setMaskedBirth("01/01/1990");
    setMaskedZip("01001-000");

    setFormData({
      number: cardNumber,
      name: "JOAO DA SILVA TESTE",
      expiry: "12/28",
      cvv: "123",
      birth: "01/01/1990",
      zipcode: "01001-000",
      street: "Praça da Sé",
      number_address: "1",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
      installments: 1
    });
  };

  const inputStyles = "w-full px-4 py-3.5 bg-[#e0e3e5] border-none rounded-lg font-inter text-[#191c1e] focus:ring-2 focus:ring-[#002444]/40 transition-all placeholder:text-[#73777f]/60 text-sm";
  const labelStyles = "block text-[11px] font-bold text-[#545f73] uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {isDevEnv() && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
          <span className="w-full text-[10px] font-bold text-slate-500 uppercase">Dev Magic Fill</span>
          <button
            type="button"
            onClick={() => fillMagicData('success')}
            className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 text-[11px] font-bold rounded hover:bg-green-200 transition-colors"
          >
            ✅ Sucesso (.7)
          </button>
          <button
            type="button"
            onClick={() => fillMagicData('error_invalid')}
            className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 text-[11px] font-bold rounded hover:bg-red-200 transition-colors"
          >
            ❌ Inválido (.1)
          </button>
          <button
            type="button"
            onClick={() => fillMagicData('error_risk')}
            className="flex-1 px-3 py-1.5 bg-orange-100 text-orange-800 text-[11px] font-bold rounded hover:bg-orange-200 transition-colors"
          >
            ⚠️ Risco (.2)
          </button>
        </div>
      )}

      {/* Seção 1: Dados do Cartão */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-[#002444]" />
          <h4 className="font-manrope font-bold text-[#002444] text-sm">Informações do Cartão</h4>
        </div>

        {cardError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-700 leading-relaxed">{cardError}</p>
          </div>
        )}

        <div className="grid gap-5">
          <div className="space-y-1">
            <label className={labelStyles}>Número do Cartão</label>
            <div className="relative group">
              <input
                className={cn(inputStyles, "pr-12")}
                placeholder="0000 0000 0000 0000"
                value={maskedNumber}
                onChange={(e) => handleChange("number", e.target.value)}
              />
              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c3c6cf]" />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelStyles}>Nome do Titular</label>
            <input
              className={cn(inputStyles, "uppercase")}
              placeholder="COMO ESTÁ NO CARTÃO"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelStyles}>Validade</label>
              <input
                className={inputStyles}
                placeholder="MM/AA"
                value={maskedExpiry}
                onChange={(e) => handleChange("expiry", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className={labelStyles}>CVV</label>
              <input
                type="text"
                name="cvv"
                id="cvv"
                className={inputStyles}
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleChange("cvv", e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          {installmentsList.length > 0 && (
            <div className="space-y-1 animate-in fade-in duration-300">
              <label className={labelStyles}>Opções de Parcelamento</label>
              <Select
                value={String(selectedInstallment)}
                onValueChange={(valStr) => {
                  const val = Number(valStr);
                  const opt = installmentsList.find(o => o.installment === val) || null;
                  setSelectedInstallment(val);
                  setFormData(prev => ({ ...prev, installments: val, installmentOption: opt }));
                }}
              >
                <SelectTrigger className={cn(inputStyles, "h-12 w-full focus:ring-2 focus:ring-[#002444]/40 text-sm text-left")}>
                  <SelectValue placeholder="Selecione as parcelas" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {installmentsList.map((opt) => (
                    <SelectItem key={opt.installment} value={String(opt.installment)}>
                      {opt.installment}x de R$ {opt.currency} {opt.has_interest ? '(com juros)' : '(sem juros)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
