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

  criarAssinaturaProfissionalPersonalizado: (payload: { usuario_id: string; quantidade: number }) =>
    apiClient.post(`/usuarios/criar-assinatura-profissional-personalizado`, payload).then(res => res.data),



  atualizarUsuario: (usuarioId: string, payload: {
    nome?: string;
    apelido?: string;
    telefone?: string;
    chave_pix?: string;
    tipo_chave_pix?: string;
  }) => apiClient.patch(`/usuarios/${usuarioId}`, payload).then(res => res.data),
};
