import { Usuario } from "../../types/usuario";
import { apiClient } from "./client";

const endpointBase = "/usuarios";

export const usuarioApi = {
  getProfile: (usuarioId: string) => 
     apiClient.get<Usuario>(`/me/profile`).then(res => res.data),

  registrar: (payload: any) =>
    apiClient.post(`${endpointBase}/registrar`, payload).then(res => res.data),

  atualizarUsuario: (usuarioId: string, payload: {
    nome?: string;
    apelido?: string;
    telefone?: string;
    chave_pix?: string;
    tipo_chave_pix?: string;
    assinatura_digital_url?: string;
    config_contrato?: any;
  }) => apiClient.patch(`${endpointBase}/${usuarioId}`, payload).then(res => res.data),

};
