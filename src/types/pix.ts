export enum TipoChavePix {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  EMAIL = 'EMAIL',
  TELEFONE = 'TELEFONE',
  ALEATORIA = 'ALEATORIA'
}

export const TIPOS_CHAVE_PIX_LABEL: Record<TipoChavePix, string> = {
  [TipoChavePix.CPF]: 'CPF',
  [TipoChavePix.CNPJ]: 'CNPJ',
  [TipoChavePix.EMAIL]: 'E-mail',
  [TipoChavePix.TELEFONE]: 'Telefone',
  [TipoChavePix.ALEATORIA]: 'Chave Aleatória',
};
