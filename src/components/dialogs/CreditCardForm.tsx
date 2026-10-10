import { Input } from "@/components/ui/input";
import { CreditCard, Lock, Calendar, ShieldCheck, User, MapPin, Info, Loader2, AlertCircle, FileText } from 'lucide-react';
import { isDevEnv } from '@/utils/detectPlatform';
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cepService } from "@/services/cepService";
import { usePaymentProvider } from "@/hooks/business/usePaymentProvider";
import { InstallmentOption } from "@/types/payment";
import { NativeSelect } from "@/components/ui/native-select";

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
  holderType?: "PF" | "PJ";
  holderDocument?: string;
}

interface CreditCardFormProps {
  onChange: (data: CreditCardData | null) => void;
  initialBirthDate?: string;
  cardError?: string | null;
  totalPrice?: number;
  userDocument?: string;
  initialHolderDocument?: string;
}

export default function CreditCardForm({
  onChange,
  initialBirthDate,
  cardError,
  totalPrice,
  userDocument,
  initialHolderDocument
}: CreditCardFormProps) {
  const { getInstallments } = usePaymentProvider();
  const [installmentsList, setInstallmentsList] = useState<InstallmentOption[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [loadingInstallments, setLoadingInstallments] = useState(false);

  const cleanUserDoc = (userDocument || "").replace(/\D/g, "");
  const isUserCnpj = cleanUserDoc.length > 11;

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

  const formatCpf = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const initialHolderType: "PF" | "PJ" = isUserCnpj ? "PF" : "PF";
  const defaultHolderDoc = isUserCnpj
    ? (initialHolderDocument ? formatCpf(initialHolderDocument) : "")
    : formatCpf(cleanUserDoc);

  const [holderType, setHolderType] = useState<"PF" | "PJ">(initialHolderType);
  const [maskedHolderDoc, setMaskedHolderDoc] = useState(defaultHolderDoc);

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
    installments: 1,
    holderType: initialHolderType,
    holderDocument: isUserCnpj ? (initialHolderDocument?.replace(/\D/g, "") || "") : cleanUserDoc
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

  const handleHolderTypeChange = (type: "PF" | "PJ") => {
    setHolderType(type);
    if (type === "PJ") {
      setFormData(prev => ({ ...prev, holderType: "PJ", holderDocument: cleanUserDoc }));
    } else {
      const doc = maskedHolderDoc.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, holderType: "PF", holderDocument: doc }));
    }
  };

  const handleHolderDocChange = (val: string) => {
    const formatted = formatCpf(val);
    setMaskedHolderDoc(formatted);
    setFormData(prev => ({ ...prev, holderDocument: formatted.replace(/\D/g, "") }));
  };

  useEffect(() => {
    const isDocValid = !isUserCnpj || (
      holderType === "PJ"
        ? true
        : ((formData.holderDocument?.replace(/\D/g, "").length || 0) === 11)
    );

    const isComplete =
      formData.number.length >= 13 &&
      formData.name.length >= 3 &&
      formData.expiry.length === 5 &&
      formData.cvv.length >= 3 &&
      isDocValid;

    if (isComplete) {
      onChange(formData);
    } else {
      onChange(null);
    }
  }, [formData, isUserCnpj, holderType, onChange]);

  useEffect(() => {
    if (cleanUserDoc) {
      const isCnpj = cleanUserDoc.length > 11;
      const docFormatted = isCnpj
        ? (initialHolderDocument ? formatCpf(initialHolderDocument) : "")
        : formatCpf(cleanUserDoc);

      setMaskedHolderDoc(prev => (prev ? prev : docFormatted));
      setFormData(prev => {
        if (prev.holderDocument) return prev;
        return {
          ...prev,
          holderType: isCnpj ? prev.holderType : "PF",
          holderDocument: isCnpj ? (initialHolderDocument?.replace(/\D/g, "") || "") : cleanUserDoc
        };
      });
    }
  }, [cleanUserDoc, initialHolderDocument]);

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

  const inputStyles = "w-full pl-10 pr-4 h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none transition-all";
  const labelStyles = "block text-xs font-medium text-[#0a0a0a] mb-1.5";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isDevEnv() && (
        <div className="flex flex-wrap gap-2 p-3 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
          <span className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dev Magic Fill</span>
          <button
            type="button"
            onClick={() => fillMagicData('success')}
            className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-[12px] hover:bg-emerald-100 transition-colors"
          >
            Sucesso (.7)
          </button>
          <button
            type="button"
            onClick={() => fillMagicData('error_invalid')}
            className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-[12px] hover:bg-rose-100 transition-colors"
          >
            Inválido (.1)
          </button>
          <button
            type="button"
            onClick={() => fillMagicData('error_risk')}
            className="flex-1 px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded-[12px] hover:bg-amber-100 transition-colors"
          >
            Risco (.2)
          </button>
        </div>
      )}

      {/* Seção 1: Dados do Cartão */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pt-1 pb-0.5">
          <CreditCard className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-foreground text-sm">Informações do Cartão</h4>
        </div>

        {cardError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-[18px] animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-destructive leading-relaxed">{cardError}</p>
          </div>
        )}

        <div className="grid gap-3 sm:gap-4">
          <div className="space-y-1">
            <label className={labelStyles}>
              Número do Cartão <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative group">
              <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
              <input
                className={cn(inputStyles, "pr-12")}
                placeholder="0000 0000 0000 0000"
                value={maskedNumber}
                onChange={(e) => handleChange("number", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelStyles}>
              Nome do Titular <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
              <input
                className={cn(inputStyles, "uppercase")}
                placeholder="COMO ESTÁ NO CARTÃO"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {isUserCnpj && (
            <div className="space-y-2.5 p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5] animate-in fade-in duration-300">
              <label className={labelStyles}>Titularidade do Cartão</label>
              <div className="flex gap-1.5 p-1 bg-white rounded-[14px] border border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => handleHolderTypeChange("PF")}
                  className={cn(
                    "flex-1 py-2 px-3 text-xs font-bold rounded-[10px] transition-all text-center",
                    holderType === "PF"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cartão Pessoal (CPF)
                </button>
                <button
                  type="button"
                  onClick={() => handleHolderTypeChange("PJ")}
                  className={cn(
                    "flex-1 py-2 px-3 text-xs font-bold rounded-[10px] transition-all text-center",
                    holderType === "PJ"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cartão da Empresa (CNPJ)
                </button>
              </div>

              {holderType === "PF" ? (
                <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                  <label className={labelStyles}>
                    CPF do Titular do Cartão <span className="text-[#e7000b]">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
                    <input
                      className={inputStyles}
                      placeholder="000.000.000-00"
                      value={maskedHolderDoc}
                      onChange={(e) => handleHolderDocChange(e.target.value)}
                      maxLength={14}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-normal leading-tight pt-0.5">
                    Informe o CPF de quem é dono deste cartão (você, sócio ou cônjuge).
                  </p>
                </div>
              ) : (
                <div className="pt-1 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                  Usando CNPJ da sua conta: <strong className="text-foreground">{cleanUserDoc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</strong>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className={labelStyles}>
                Validade <span className="text-[#e7000b]">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
                <input
                  className={inputStyles}
                  placeholder="MM/AA"
                  value={maskedExpiry}
                  onChange={(e) => handleChange("expiry", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelStyles}>
                CVV <span className="text-[#e7000b]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
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
          </div>

          {installmentsList.length > 0 && (
            <div className="space-y-1 animate-in fade-in duration-300">
              <label className={labelStyles}>Opções de Parcelamento</label>
              <NativeSelect
                value={String(selectedInstallment)}
                className="h-11 w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[18px] font-sans text-foreground text-xs sm:text-sm px-3 focus:bg-white focus:border-[#0a0a0a] shadow-none"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const opt = installmentsList.find(o => o.installment === val) || null;
                  setSelectedInstallment(val);
                  setFormData(prev => ({ ...prev, installments: val, installmentOption: opt }));
                }}
              >
                {installmentsList.map((opt) => (
                  <option key={opt.installment} value={String(opt.installment)}>
                    {opt.installment}x de R$ {opt.currency} {opt.has_interest ? '(com juros)' : '(sem juros)'}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
