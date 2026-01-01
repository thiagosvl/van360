export enum TipoChavePix {
  CPF = 'cpf',
  CNPJ = 'cnpj',
  EMAIL = 'email',
  TELEFONE = 'telefone',
  ALEATORIA = 'aleatoria'
}

export const TIPOS_CHAVE_PIX_LABEL: Record<TipoChavePix, string> = {
  [TipoChavePix.CPF]: 'CPF',
  [TipoChavePix.CNPJ]: 'CNPJ',
  [TipoChavePix.EMAIL]: 'E-mail',
  [TipoChavePix.TELEFONE]: 'Telefone',
  [TipoChavePix.ALEATORIA]: 'Chave Aleatória',
};
