import { asaasService } from "@/integrations/asaasService";
import { supabase } from "@/integrations/supabase/client";

const asaasApiKey = localStorage.getItem("asaas_api_key");

export const passageiroService = {
  async getNumeroCobrancas(passageiroId: string): Promise<number> {
    const { count, error } = await supabase
      .from("cobrancas")
      .select("id", { count: "exact", head: true })
      .eq("passageiro_id", passageiroId);

    if (error) {
      console.error("Erro ao contar cobranças:", error);
      throw new Error("Não foi possível verificar as cobranças do passageiro.");
    }

    return count || 0;
  },

  async excluirPassageiro(passageiroId: string): Promise<void> {
    const { data: passageiro, error: passageiroError } = await supabase
      .from("passageiros")
      .select("asaas_customer_id")
      .eq("id", passageiroId)
      .single();

    if (passageiroError) {
      throw new Error("Não foi possível localizar o passageiro para exclusão.");
    }

    if (passageiro?.asaas_customer_id && asaasApiKey) {
      try {
        await asaasService.deleteCustomer(passageiro.asaas_customer_id, asaasApiKey);
      } catch (asaasErr) {
        console.error("Erro ao excluir cliente no Asaas. A operação foi abortada.", asaasErr);
        throw new Error("Falha ao excluir o cliente no provedor de pagamento.");
      }
    }

    const { error } = await supabase
      .from("passageiros")
      .delete()
      .eq("id", passageiroId);

    if (error) {
      throw new Error("Falha ao excluir o passageiro do banco de dados.");
    }
  },
};