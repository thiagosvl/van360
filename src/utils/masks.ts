// Função para máscara de telefone celular
export const phoneMask = (value: string): string => {
  if (!value) return value;
  
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, '');
  
  // Aplica a máscara (11) 99999-9999
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})/, '$1-$2');
  }
  
  return value;
};

// Função para máscara de dinheiro
export const moneyMask = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  let numericValue = value.replace(/\D/g, '');
  
  // Garantir pelo menos 2 dígitos para centavos
  if (numericValue.length === 1) {
    numericValue = '0' + numericValue;
  }
  
  // Converte para formato de moeda brasileiro
  const numberValue = Number(numericValue) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Função para converter valor monetário mascarado para number
export const moneyToNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remove símbolos de moeda e espaços
  const numericString = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  return parseFloat(numericString) || 0;
};

// Função para máscara de CEP
export const cepMask = (value: string): string => {
  if (!value) return value;
  
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, '');
  
  // Aplica a máscara 99999-999
  return numericValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

// Função para máscara de CPF/CNPJ
export const cpfCnpjMask = (value: string): string => {
  if (!value) return value;
  
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, '');
  
  // Aplica máscara de CPF (11 dígitos) ou CNPJ (14 dígitos)
  if (numericValue.length <= 11) {
    return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
};