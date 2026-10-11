import { parseCurrencyToNumber } from "./formatters/currency";

export const phoneMask = (value?: string | null): string => {
  if (!value) return "";
  
  let numericValue = value.replace(/\D/g, "");
  if (numericValue.length > 11 && numericValue.startsWith("55")) {
    numericValue = numericValue.substring(2);
  }
  numericValue = numericValue.slice(0, 11);

  if (numericValue.length <= 10) {
    return numericValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  
  return numericValue
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})/, "$1-$2");
};

export const moneyMask = (value: string | number): string => {
  if (value === undefined || value === null) return '';
  
  const stringValue = typeof value === 'number' 
    ? Math.round(value * 100).toString() 
    : value.toString();
    
  let numericValue = stringValue.replace(/\D/g, '');
  
  if (numericValue && numericValue.length === 1) {
    numericValue = '0' + numericValue;
  }
  
  const numberValue = Number(numericValue) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const moneyToNumber = (value: string | number | null | undefined): number => {
  return parseCurrencyToNumber(value);
};

export const cepMask = (value?: string | null): string => {
  if (!value) return "";
  
  const numericValue = value.replace(/\D/g, '');
  
  return numericValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

export const cpfMask = (value?: string | null): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "").slice(0, 11);

  return numericValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const cnpjMask = (value?: string | null): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "").slice(0, 14);

  return numericValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const cpfCnpjMask = (value?: string | null): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "");
  return numericValue.length <= 11 ? cpfMask(value) : cnpjMask(value);
};

export const evpMask = (value?: string | null): string => {
  if (!value) return "";
  
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');
  const limitedValue = cleanValue.slice(0, 32);
  
  return limitedValue
    .replace(/^([a-zA-Z0-9]{8})([a-zA-Z0-9])/, '$1-$2')
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2-$3')
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2-$3-$4')
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2-$3-$4-$5');
};

export const pixMask = (value?: string | null, tipo?: string | null): string => {
  if (!value) return "";
  const tipoUpper = (tipo || "").toUpperCase();
  if (tipoUpper === "CPF") return cpfMask(value);
  if (tipoUpper === "CNPJ") return cnpjMask(value);
  if (tipoUpper === "TELEFONE") return phoneMask(value);
  if (tipoUpper === "EVP" || tipoUpper === "ALEATORIA") return evpMask(value);
  return value;
};

export const dateMask = (value?: string | null): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "").slice(0, 8);

  return numericValue
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
};

export const timeMask = (value?: string | null, prevVal?: string): string => {
  if (!value) return "";

  if (prevVal && value.length < prevVal.length) {
    if (prevVal.endsWith(":") && !value.endsWith(":")) {
      return value.slice(0, -1);
    }
    return value;
  }

  const trimmed = value.trim();
  if (trimmed.includes(":") || trimmed.toLowerCase().includes("h")) {
    const parts = trimmed.toLowerCase().split(/[:h]/);
    const h = parts[0]?.replace(/\D/g, "");
    const m = parts[1]?.replace(/\D/g, "");
    if (h) {
      const hNum = Math.min(parseInt(h, 10), 23);
      const cleanH = String(isNaN(hNum) ? 0 : hNum).padStart(2, "0");
      if (m !== undefined && m !== "") {
        const mDigits = m.slice(0, 2);
        const mNum = Math.min(parseInt(mDigits, 10), 59);
        const cleanM = String(isNaN(mNum) ? 0 : mNum).padStart(mDigits.length, "0");
        return `${cleanH}:${cleanM}`;
      }
      return `${cleanH}:`;
    }
  }

  const raw = value.replace(/\D/g, "").slice(0, 4);
  if (!raw) return "";

  if (raw.length === 1) {
    if (raw > "2") {
      return `0${raw}:`;
    }
    return raw;
  }

  let h1 = raw[0];
  let h2 = raw[1];
  const hour = parseInt(h1 + h2, 10);
  if (hour > 23) {
    h1 = "2";
    h2 = "3";
  }

  if (raw.length === 2) {
    return `${h1}${h2}:`;
  }

  let m1 = raw[2];
  if (m1 > "5") {
    m1 = "5";
  }

  if (raw.length === 3) {
    return `${h1}${h2}:${m1}`;
  }

  const m2 = raw[3];
  return `${h1}${h2}:${m1}${m2}`;
};

