import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { cepService } from "@/services/cepService";
import { CreditCardData } from "./CreditCardForm";

interface BillingAddressFormProps {
  onChange: (data: Partial<CreditCardData> | null) => void;
  initialBirthDate?: string;
  initialData?: Partial<CreditCardData>;
}

export default function BillingAddressForm({ onChange, initialBirthDate, initialData }: BillingAddressFormProps) {
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

  const [formData, setFormData] = useState<Partial<CreditCardData>>({
    birth: initialData?.birth || formattedInitialBirth || "",
    zipcode: initialData?.zipcode || "",
    street: initialData?.street || "",
    number_address: initialData?.number_address || "",
    neighborhood: initialData?.neighborhood || "",
    city: initialData?.city || "",
    state: initialData?.state || ""
  });

  const [maskedBirth, setMaskedBirth] = useState(initialData?.birth || formattedInitialBirth || "");
  const [maskedZip, setMaskedZip] = useState(initialData?.zipcode || "");
  const [loadingCep, setLoadingCep] = useState(false);

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

    if (field === "birth") {
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
      (formData.birth?.length === 10) &&
      (formData.zipcode?.length === 9) &&
      (formData.street?.length ?? 0) >= 3 &&
      (formData.number_address?.length ?? 0) >= 1 &&
      (formData.neighborhood?.length ?? 0) >= 2 &&
      (formData.city?.length ?? 0) >= 2 &&
      (formData.state?.length === 2);

    if (isComplete) {
      onChange(formData);
    } else {
      onChange(null);
    }
  }, [formData, onChange]);

  useEffect(() => {
    if (initialBirthDate && !initialData?.birth) {
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
  }, [initialBirthDate, initialData?.birth]);

  const fillMagicData = (type: 'success') => {
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
    <div className="space-y-6 pt-2 animate-in fade-in duration-500">
      {import.meta.env.DEV && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
          <span className="w-full text-[10px] font-bold text-slate-500 uppercase">Dev Magic Fill</span>
          <button
            type="button"
            onClick={() => fillMagicData('success')}
            className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 text-[11px] font-bold rounded hover:bg-green-200 transition-colors"
          >
            ✅ Endereço Mágico
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-[#002444]" />
        <h4 className="font-manrope font-bold text-[#002444] text-sm">Endereço de Cobrança</h4>
      </div>

      <div className="grid gap-4 sm:gap-5">
        {/* Linha 1: CEP */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={labelStyles}>CEP</label>
            <div className="relative">
              <input
                className={cn(inputStyles, "pr-10")}
                placeholder="00000-000"
                value={maskedZip}
                onChange={(e) => handleChange("zipcode", e.target.value)}
              />
              {loadingCep && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-[#002444]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linha 2: Logradouro e Nº */}
        <div className="grid grid-cols-4 sm:grid-cols-12 gap-4">
          <div className="col-span-3 sm:col-span-9 space-y-1">
            <label className={labelStyles}>Logradouro</label>
            <input
              className={inputStyles}
              placeholder="Rua, Avenida..."
              value={formData.street}
              onChange={(e) => handleChange("street", e.target.value)}
            />
          </div>
          <div className="col-span-1 sm:col-span-3 space-y-1">
            <label className={labelStyles}>Nº</label>
            <input
              id="number_address"
              className={inputStyles}
              placeholder="123"
              value={formData.number_address}
              onChange={(e) => handleChange("number_address", e.target.value)}
            />
          </div>
        </div>

        {/* Linha 3: Bairro, Cidade e UF */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5 space-y-1">
            <label className={labelStyles}>Bairro</label>
            <input
              className={inputStyles}
              placeholder="Seu bairro"
              value={formData.neighborhood}
              onChange={(e) => handleChange("neighborhood", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 sm:hidden gap-4">
            <div className="col-span-2 space-y-1">
              <label className={labelStyles}>Cidade</label>
              <input
                className={inputStyles}
                placeholder="Sua cidade"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
            <div className="col-span-1 space-y-1">
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
          <div className="hidden sm:block sm:col-span-5 space-y-1">
            <label className={labelStyles}>Cidade</label>
            <input
              className={inputStyles}
              placeholder="Sua cidade"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="hidden sm:block sm:col-span-2 space-y-1">
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

        {/* Linha 4: Data de Nascimento */}
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={labelStyles}>Data de Nascimento</label>
              <input
                className={cn(
                  inputStyles,
                  initialBirthDate && "bg-[#d2d5d8] cursor-not-allowed opacity-70 focus:ring-0"
                )}
                placeholder="dd/mm/aaaa"
                value={maskedBirth}
                onChange={(e) => handleChange("birth", e.target.value)}
                readOnly={!!initialBirthDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
