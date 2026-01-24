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
