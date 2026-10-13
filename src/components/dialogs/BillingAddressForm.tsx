import { Input } from "@/components/ui/input";
import { MapPin, Sparkles, Building2, User, FileText, Loader2, Search } from 'lucide-react';
import { isDevEnv } from '@/utils/detectPlatform';
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cepService, EnderecoSugestao } from "@/services/cepService";
import { formatarCEP } from "@/utils/formatters/address";
import { Banner } from "@/components/ui/Banner";
import { NativeSelect } from "@/components/ui/native-select";
import { ESTADOS_BRASILEIROS } from "@/constants/defaults";
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

  const initialZip = initialData?.zipcode ? formatarCEP(initialData.zipcode) : "";

  const [formData, setFormData] = useState<Partial<CreditCardData>>({
    birth: initialData?.birth || formattedInitialBirth || "",
    zipcode: initialZip,
    street: initialData?.street || "",
    number_address: initialData?.number_address || "",
    neighborhood: initialData?.neighborhood || "",
    city: initialData?.city || "",
    state: initialData?.state || ""
  });

  const [maskedBirth, setMaskedBirth] = useState(initialData?.birth || formattedInitialBirth || "");
  const [maskedZip, setMaskedZip] = useState(initialZip);
  const [loadingCep, setLoadingCep] = useState(false);

  const [sugestoes, setSugestoes] = useState<EnderecoSugestao[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const userTypedRef = useRef(false);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!userTypedRef.current || !formData.street || formData.street.trim().length < 3) {
      setSugestoes([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const uf = formData.state;
        const cidade = formData.city;
        const results = await cepService.buscarEnderecoPorTexto(formData.street!, uf, cidade);
        setSugestoes(results);
        setShowDropdown(results.length > 0 && isFocusedRef.current);
      } catch {
        setSugestoes([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.street, formData.state, formData.city]);

  const handleSelectSugestao = (sugestao: EnderecoSugestao) => {
    userTypedRef.current = false;
    const formattedCep = sugestao.cep ? formatZip(sugestao.cep) : formData.zipcode;
    if (formattedCep) setMaskedZip(formattedCep);

    setFormData(prev => ({
      ...prev,
      street: sugestao.logradouro,
      neighborhood: sugestao.bairro || prev.neighborhood,
      city: sugestao.cidade || prev.city,
      state: sugestao.estado || prev.state,
      zipcode: formattedCep || prev.zipcode
    }));

    setShowDropdown(false);
    setTimeout(() => {
      document.getElementById("number_address")?.focus();
    }, 100);
  };

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

  const inputStyles = "w-full pl-10 pr-4 h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none transition-all";
  const labelStyles = "block text-xs font-medium text-[#0a0a0a] mb-1.5";

  return (
    <div className="space-y-5 pt-2 animate-in fade-in duration-500">
      {isDevEnv() && (
        <div className="flex flex-wrap gap-2 p-3 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
          <span className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dev Magic Fill</span>
          <button
            type="button"
            onClick={() => fillMagicData('success')}
            className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-[12px] hover:bg-emerald-100 transition-colors"
          >
            Endereço Mágico
          </button>
        </div>
      )}

      <Banner
        variant="info"
        title="Não sabe o seu CEP?"
        description={
          <>
            Basta digitar o nome da rua no campo <strong>Logradouro</strong> para buscar as sugestões automaticamente.
          </>
        }
      />

      <div className="flex items-center gap-2 pt-1 pb-0.5">
        <MapPin className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground text-sm">Endereço de Cobrança</h4>
      </div>

      <div className="grid gap-3 sm:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
          <div className="sm:col-span-4 space-y-1">
            <label className={labelStyles}>
              CEP <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
              <input
                className={cn(inputStyles, "pr-10")}
                placeholder="00000-000"
                value={maskedZip}
                onChange={(e) => handleChange("zipcode", e.target.value)}
              />
              {loadingCep && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-8 space-y-1 relative">
            <label className={labelStyles}>
              Logradouro <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
              <input
                className={cn(inputStyles, isSearchingAddress && "pr-10")}
                placeholder="Rua, Avenida..."
                autoComplete="off"
                value={formData.street}
                onChange={(e) => {
                  userTypedRef.current = true;
                  handleChange("street", e.target.value);
                }}
                onFocus={() => {
                  isFocusedRef.current = true;
                  if (userTypedRef.current && sugestoes.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onBlur={() => {
                  isFocusedRef.current = false;
                  setTimeout(() => setShowDropdown(false), 200);
                }}
              />
              {isSearchingAddress && (
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>

            {showDropdown && sugestoes.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-[#e5e5e5] rounded-[18px] shadow-lg overflow-hidden max-h-60 overflow-y-auto divide-y divide-[#e5e5e5] animate-in fade-in slide-in-from-top-1 duration-150">
                {sugestoes.map((sugestao, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-[#f5f5f5] transition-colors flex items-start gap-3 text-xs text-foreground font-medium group"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSugestao(sugestao);
                    }}
                  >
                    <div className="w-7 h-7 rounded-[10px] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground block text-xs break-words leading-snug">
                        {sugestao.logradouro}
                      </span>
                      <span className="text-muted-foreground font-normal block text-[11px] break-words leading-relaxed mt-0.5">
                        {[sugestao.bairro, sugestao.cidade, sugestao.estado]
                          .filter(Boolean)
                          .join(", ")}
                        {sugestao.cep ? ` • CEP: ${sugestao.cep}` : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-12 gap-3 sm:gap-4">
          <div className="col-span-1 sm:col-span-4 space-y-1">
            <label className={labelStyles}>
              Nº <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative">
              <input
                id="number_address"
                className={cn(inputStyles, "pl-4 text-center sm:text-left")}
                placeholder="123"
                value={formData.number_address}
                onChange={(e) => handleChange("number_address", e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-3 sm:col-span-8 space-y-1">
            <label className={labelStyles}>
              Bairro <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
              <input
                className={inputStyles}
                placeholder="Seu bairro"
                value={formData.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-12 gap-3 sm:gap-4">
          <div className="col-span-2 sm:col-span-8 space-y-1">
            <label className={labelStyles}>
              Cidade <span className="text-[#e7000b]">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
              <input
                className={inputStyles}
                placeholder="Sua cidade"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-1 sm:col-span-4 space-y-1">
            <label className={labelStyles}>
              UF <span className="text-[#e7000b]">*</span>
            </label>
            <NativeSelect
              value={formData.state || ""}
              onChange={(e) => handleChange("state", e.target.value)}
              className="pl-2 sm:pl-3.5 pr-7 sm:pr-9 text-xs sm:text-sm font-medium"
            >
              <option value="" disabled hidden>UF</option>
              {ESTADOS_BRASILEIROS.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.value} - {estado.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelStyles}>
            Data de Nascimento <span className="text-[#e7000b]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#737373] pointer-events-none" />
            <input
              className={cn(
                inputStyles,
                initialBirthDate && "bg-[#ebebeb] cursor-not-allowed opacity-75 focus:border-[#e5e5e5]"
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
  );
}
