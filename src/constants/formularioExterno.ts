export interface CamposFormularioExternoConfig {
  turma: boolean;
  data_nascimento: boolean;
  genero: boolean;
  periodo: boolean;
  modalidade: boolean;
  parentesco_responsavel: boolean;
  email_responsavel: boolean;
}

export const DEFAULT_CAMPOS_FORMULARIO_EXTERNO: CamposFormularioExternoConfig = {
  turma: false,
  data_nascimento: true,
  genero: true,
  periodo: true,
  modalidade: true,
  parentesco_responsavel: true,
  email_responsavel: true,
};
