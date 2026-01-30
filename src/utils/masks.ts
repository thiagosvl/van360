export const phoneMask = (value: string): string => {
  if (!value) return value;
  
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2');
  }
  
  return value;
};

export const moneyMask = (value: string | number): string => {
  if (value === undefined || value === null) return '';
  
  // Se for número, formatamos como se fosse a entrada do usuário (sem pontos/vírgulas)
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

export const moneyToNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  const numericString = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  return parseFloat(numericString) || 0;
};

export const cepMask = (value: string): string => {
  if (!value) return value;
  
  const numericValue = value.replace(/\D/g, '');
  
  return numericValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

export const cpfMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 11);

  return numericValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const cnpjMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 14);

  return numericValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const cpfCnpjMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "");
  return numericValue.length <= 11 ? cpfMask(value) : cnpjMask(value);
};

export const evpMask = (value: string): string => {
  if (!value) return value;
  
  // Remove non-alphanumeric
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');
  
  // Limit to 32 chars
  const limitedValue = cleanValue.slice(0, 32);
  
  // 8-4-4-4-12 format
  // Capture groups: (8) (4) (4) (4) (12)
  return limitedValue
    .replace(/^([a-zA-Z0-9]{8})([a-zA-Z0-9])/, '$1-$2')
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2-$3')
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2-$3-$4')
    .replace(/^([a-zA-Z0-9]{8})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})-([a-zA-Z0-9]{4})([a-zA-Z0-9])/, '$1-$2-$3-$4-$5');
};

export const dateMask = (value: string): string => {
  if (!value) return value;
  const numericValue = value.replace(/\D/g, "").slice(0, 8); // Limit to 8 digits

  return numericValue
    .replace(/(\d{2})(\d)/, "$1/$2") // Add slash after 2nd digit
    .replace(/(\d{2})(\d)/, "$1/$2"); // Add slash after 4th digit (2nd part)
    // .replace(/(\d{4})(\d)/, "$1"); // No need, slice handles length
};
