import { apiClient } from "@/services/api/client";

export const responsavelService = {
  async loginPorCpfEmail(cpf: string, email: string) {
      try {
        const { data } = await apiClient.post("/auth/login/responsavel", { cpf, email });
        return data || [];
      } catch (error) {
          console.error("Erro login responsavel", error);
          return null;
      }
  },

  async getCobrancas(passageiroId: string, ano: number | null) {
      const cpf = localStorage.getItem("responsavel_cpf");
      const email = localStorage.getItem("responsavel_email");
      if (!cpf || !email) return [];

      try {
          const { data } = await apiClient.get(`/public/responsavel/cobrancas/${passageiroId}`, {
             params: ano ? { ano } : {},
             headers: {
                 "x-responsavel-cpf": cpf,
                 "x-responsavel-email": email
             }
          });
          return data || [];
      } catch (error) {
          console.error("Erro ao buscar cobranças", error);
          throw error;
      }
  },

  async getAnosDisponiveis(passageiroId: string) {
      const cpf = localStorage.getItem("responsavel_cpf");
      const email = localStorage.getItem("responsavel_email");
      if (!cpf || !email) return [];

      try {
          const { data } = await apiClient.get(`/public/responsavel/cobrancas/${passageiroId}/anos`, {
             headers: {
                 "x-responsavel-cpf": cpf,
                 "x-responsavel-email": email
             }
          });
          return data || [];
      } catch (error) {
           console.error("Erro ao buscar anos", error);
           return [];
      }
  }
}
