import { apiClient } from "./client";

const endpointBase = "/gasto-categorias";

export interface GastoCategoriaResponse {
  id: string;
  created_at: string;
  usuario_id: string | null;
  nome: string;
  slug: string;
  cor: string;
  icone: string;
}

export const gastoCategoriaApi = {
  listCategorias: (): Promise<GastoCategoriaResponse[]> =>
    apiClient
      .get(`${endpointBase}`)
      .then(res => res.data),

  createCategoria: (data: { nome: string; cor?: string; icone?: string }): Promise<GastoCategoriaResponse> =>
    apiClient
      .post(`${endpointBase}`, data)
      .then(res => res.data),

  updateCategoria: (id: string, data: { nome?: string; cor?: string; icone?: string }): Promise<GastoCategoriaResponse> =>
    apiClient
      .put(`${endpointBase}/${id}`, data)
      .then(res => res.data),

  deleteCategoria: (id: string): Promise<{ success: boolean }> =>
    apiClient
      .delete(`${endpointBase}/${id}`)
      .then(res => res.data),
};
