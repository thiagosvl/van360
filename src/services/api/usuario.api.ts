import { Usuario } from "../../types/usuario";
import { apiClient } from "./client";

const endpointBase = "/usuarios";

export const usuarioApi = {
  getProfile: (usuarioId: string) => 
     apiClient.get<Usuario>(`/me/profile`).then(res => res.data),

  registrarPlanoEssencial: (payload: any) =>
    apiClient.post(`${endpointBase}/registrar-plano-essencial`, payload).then(res => res.data),

  registrarPlanoProfissional: (payload: any) =>
    apiClient.post(`${endpointBase}/registrar-plano-profissional`, payload).then(res => res.data),

  upgradePlano: (payload: { usuario_id: string; plano_id: string; quantidade_personalizada?: number }) =>
    apiClient.post(`${endpointBase}/upgrade-plano`, payload).then(res => res.data),

  downgradePlano: (payload: { usuario_id: string; plano_id: string }) =>
    apiClient.post(`${endpointBase}/downgrade-plano`, payload).then(res => res.data),

  trocarSubplano: (payload: { usuario_id: string; subplano_id: string }) =>
    apiClient.post(`${endpointBase}/trocar-subplano`, payload).then(res => res.data),

  criarAssinaturaProfissionalPersonalizado: (payload: { usuario_id: string; quantidade: number }) =>
    apiClient.post(`${endpointBase}/criar-assinatura-profissional-personalizado`, payload).then(res => res.data),

  atualizarUsuario: (usuarioId: string, payload: {
    nome?: string;
    apelido?: string;
    telefone?: string;
    chave_pix?: string;
    tipo_chave_pix?: string;
    assinatura_url?: string;
    config_contrato?: any;
  }) => apiClient.patch(`${endpointBase}/${usuarioId}`, payload).then(res => res.data),

};
