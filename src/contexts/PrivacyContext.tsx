import { formatCurrency } from "@/utils/formatters/currency";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface PrivacyContextType {
  hideValues: boolean;
  toggleHideValues: () => void;
  formatPrivateCurrency: (value: number | undefined | null) => string;
  formatPrivateNumber: (value: number | string | undefined | null) => string;
}

const PRIVACY_STORAGE_KEY = "van360_hide_financial_values";
const MASK_CURRENCY_PLACEHOLDER = "••••••";
const MASK_NUMBER_PLACEHOLDER = "••";

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hideValues, setHideValues] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
      return stored ? JSON.parse(stored) === true : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(hideValues));
    } catch {
      // Ignorar falhas de armazenamento de cota/permissão
    }
  }, [hideValues]);

  const toggleHideValues = () => {
    setHideValues(prev => !prev);
  };

  const formatPrivateCurrency = (value: number | undefined | null): string => {
    if (hideValues) {
      return MASK_CURRENCY_PLACEHOLDER;
    }
    return formatCurrency(value);
  };

  const formatPrivateNumber = (value: number | string | undefined | null): string => {
    if (hideValues) {
      return MASK_NUMBER_PLACEHOLDER;
    }
    return String(value ?? 0);
  };

  return (
    <PrivacyContext.Provider
      value={{
        hideValues,
        toggleHideValues,
        formatPrivateCurrency,
        formatPrivateNumber,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error("usePrivacy deve ser usado dentro de um PrivacyProvider");
  }
  return context;
}
