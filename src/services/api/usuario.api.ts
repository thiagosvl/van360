import { apiClient } from "./client";

export const usuarioApi = {
  registrarPlanoGratuito: (payload: any) =>
    apiClient.post(`/usuarios/registrar-plano-gratuito`, payload).then(res => res.data),

  registrarPlanoEssencial: (payload: any) =>
    apiClient.post(`/usuarios/registrar-plano-essencial`, payload).then(res => res.data),

  registrarPlanoProfissional: (payload: any) =>
    apiClient.post(`/usuarios/registrar-plano-profissional`, payload).then(res => res.data),

  cancelarAssinatura: (payload: { usuarioId: string }) =>
    apiClient.delete(
      `/usuarios/cancelar-assinatura/${payload.usuarioId}`
    ).then(res => res.data),

  desistirCancelarAssinatura: (usuarioId: string) => {
    apiClient.patch(
      `/usuarios/desistir-cancelar-assinatura/${usuarioId}`
    ).then(res => res.data)
  },

  upgradePlano: (payload: { usuario_id: string; plano_id: string; quantidade_personalizada?: number }) =>
    apiClient.post(`/usuarios/upgrade-plano`, payload).then(res => res.data),

  downgradePlano: (payload: { usuario_id: string; plano_id: string }) =>
    apiClient.post(`/usuarios/downgrade-plano`, payload).then(res => res.data),

  trocarSubplano: (payload: { usuario_id: string; subplano_id: string }) =>
    apiClient.post(`/usuarios/trocar-subplano`, payload).then(res => res.data),

  criarAssinaturaProfissionalPersonalizado: (payload: { usuario_id: string; quantidade: number; targetPassengerId?: string }) =>
    apiClient.post(`/usuarios/criar-assinatura-profissional-personalizado`, payload).then(res => res.data),

  listarPassageirosParaSelecao: (usuarioId: string, tipo: "upgrade" | "downgrade", franquia: number) =>
    apiClient.get(`/usuarios/${usuarioId}/passageiros-para-selecao`, {
      params: { tipo, franquia }
    }).then(res => res.data),

  confirmarSelecaoPassageiros: (usuarioId: string, payload: { 
    passageiroIds: string[]; 
    franquia: number;
    tipoDowngrade?: "subplano" | "personalizado";
    subplanoId?: string;
    quantidadePersonalizada?: number;
    tipo?: "upgrade" | "downgrade";
    planoId?: string;
    precoAplicado?: number;
    precoOrigem?: string;
  }) =>
    apiClient.post(`/usuarios/${usuarioId}/selecionar-passageiros-cobranca-automatica`, payload).then(res => res.data),

  verificarSelecaoManualNecessaria: (usuarioId: string) =>
    apiClient.get(`/usuarios/${usuarioId}/verificar-selecao-manual-necessaria`).then(res => res.data),

  salvarSelecaoPassageiros: (usuarioId: string, payload: {
    cobrancaId: string;
    passageiroIds: string[];
    tipo: "upgrade" | "downgrade";
    franquia: number;
  }) =>
    apiClient.post(`/usuarios/${usuarioId}/salvar-selecao-passageiros`, payload).then(res => res.data),
};
