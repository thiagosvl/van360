import { DispositivoCadastro } from "../../types/enums";
import { TipoChavePix } from "../../types/pix";
import { Usuario, MetadadosCadastroData } from "../../types/usuario";
import { apiClient } from "./client";

export interface RegistrarPayloadDTO {
  nome: string;
  apelido?: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  senha: string;
  termos_aceitos: boolean;
  data_nascimento?: string;
  razao_social?: string;
  indicador_id?: string;
  indicador_telefone?: string;
  dispositivo_cadastro?: DispositivoCadastro;
  metadados_cadastro?: MetadadosCadastroData;
  push_token?: string;
  platform?: string;
}

const endpointBase = "/usuarios";

export const usuarioApi = {
  getProfile: (usuarioId: string) => 
     apiClient.get<Usuario>(`/me/profile`).then(res => res.data),

  registrar: (payload: RegistrarPayloadDTO) =>
    apiClient.post(`${endpointBase}/registrar`, payload).then(res => res.data),


  atualizarUsuario: (usuarioId: string, payload: {
    nome?: string;
    razao_social?: string;
    apelido?: string;
    telefone?: string;
    assinatura_digital_url?: string;
    config_contrato?: any;
    data_nascimento?: string;
  }) => apiClient.patch(`${endpointBase}/${usuarioId}`, payload).then(res => res.data),

  atualizarPixUsuario: (usuarioId: string, payload: {
    chave_pix: string | null;
    tipo_chave_pix: TipoChavePix | null;
  }) => apiClient.patch(`${endpointBase}/${usuarioId}/pix`, payload).then(res => res.data),

  atualizarCanalAquisicao: (usuarioId: string, canal_aquisicao: string) => 
    apiClient.patch(`${endpointBase}/${usuarioId}/canal-aquisicao`, { canal_aquisicao }).then(res => res.data),

};
