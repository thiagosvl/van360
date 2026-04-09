import { Input } from "@/components/ui/input";
import { CreditCard, User, Calendar, MapPin, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
}

interface CreditCardFormProps {
  onChange: (data: CreditCardData | null) => void;
}

export default function CreditCardForm({ onChange }: CreditCardFormProps) {
  const [formData, setFormData] = useState<CreditCardData>({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    birth: "",
    zipcode: "",
    street: "",
    number_address: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const [maskedNumber, setMaskedNumber] = useState("");
  const [maskedExpiry, setMaskedExpiry] = useState("");
  const [maskedBirth, setMaskedBirth] = useState("");
  const [maskedZip, setMaskedZip] = useState("");

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
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  useEffect(() => {
    const isComplete = 
      formData.number.length >= 13 && 
      formData.name.length >= 3 && 
      formData.expiry.length === 5 && 
      formData.cvv.length >= 3 &&
      formData.birth.length === 10 &&
      formData.zipcode.length === 9 &&
      formData.street.length >= 3 &&
      formData.number_address.length >= 1 &&
      formData.neighborhood.length >= 2;

    if (isComplete) {
      onChange(formData);
    } else {
      onChange(null);
    }
  }, [formData, onChange]);

  const fillMagicData = (type: 'success' | 'error_invalid' | 'error_risk') => {
    const cardNumber = type === 'success'
      ? '4485785674290087'  // último dígito 7 = aprovado (EfiPay docs)
      : type === 'error_invalid'
        ? '4111111111111111' // último dígito 1 = dados inválidos
        : '4000000000000002'; // último dígito 2 = recusado por segurança

    handleChange("number", cardNumber);
    handleChange("name", "JOAO DA SILVA TESTE");
    handleChange("expiry", "12/28");
    handleChange("cvv", "123");
    handleChange("birth", "01/01/1990");
    handleChange("zipcode", "01001-000");
    handleChange("street", "Praça da Sé");
    handleChange("number_address", "1");
    handleChange("neighborhood", "Sé");
    handleChange("city", "São Paulo");
    handleChange("state", "SP");
  };

  const inputStyles = "w-full px-4 py-3.5 bg-[#e0e3e5] border-none rounded-lg font-inter text-[#191c1e] focus:ring-2 focus:ring-[#002444]/40 transition-all placeholder:text-[#73777f]/60 text-sm";
  const labelStyles = "block text-[11px] font-bold text-[#545f73] uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {import.meta.env.DEV && (
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
              <div className="relative">
                <input 
                  type="text"
                  name="cvv"
                  id="cvv"
                  className={cn(inputStyles, "pr-12")}
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleChange("cvv", e.target.value)}
                  autoComplete="off"
                />
                <Info className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c3c6cf]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Endereço de Faturamento */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#002444]" />
          <h4 className="font-manrope font-bold text-[#002444] text-sm">Endereço de Cobrança</h4>
        </div>

        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelStyles}>Nascimento</label>
              <input 
                className={inputStyles}
                placeholder="DD/MM/AAAA"
                value={maskedBirth}
                onChange={(e) => handleChange("birth", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className={labelStyles}>CEP</label>
              <input 
                className={inputStyles}
                placeholder="00000-000"
                value={maskedZip}
                onChange={(e) => handleChange("zipcode", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-1">
              <label className={labelStyles}>Logradouro</label>
              <input 
                className={inputStyles}
                placeholder="Rua, Avenida..."
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className={labelStyles}>Nº</label>
              <input 
                className={inputStyles}
                placeholder="123"
                value={formData.number_address}
                onChange={(e) => handleChange("number_address", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelStyles}>Bairro</label>
            <input
              className={inputStyles}
              placeholder="Seu bairro"
              value={formData.neighborhood}
              onChange={(e) => handleChange("neighborhood", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-1">
              <label className={labelStyles}>Cidade</label>
              <input
                className={inputStyles}
                placeholder="Sua cidade"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className={labelStyles}>UF</label>
              <input
                className={cn(inputStyles, "uppercase")}
                placeholder="SP"
                maxLength={2}
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
