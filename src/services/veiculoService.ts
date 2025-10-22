import { STORAGE_KEY_QUICKSTART_STATUS } from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { Veiculo } from "@/types/veiculo";

export const veiculoService = {
  async fetchPassageirosAtivosCount(veiculoId: string) {
    const userId = localStorage.getItem("app_user_id");

    const { count, error } = await supabase
      .from("passageiros")
      .select("id", { count: "exact" })
      .eq("veiculo_id", veiculoId)
      .eq("ativo", true)
      .eq("usuario_id", userId);

    if (error) throw error;
    return count || 0;
  },

  async fetchVeiculosComContagemAtivos() {
    const userId = localStorage.getItem("app_user_id");

    const { data, error } = await supabase
      .from("veiculos")
      .select(`*, passageiros(count)`)
      .eq("usuario_id", userId)
      .eq("passageiros.ativo", true)
      .order("placa");

    if (error) throw error;

    return data.map(veiculo => ({
      ...veiculo,
      passageiros_ativos_count: veiculo.passageiros[0]?.count || 0,
    })) as (Veiculo & { passageiros_ativos_count: number })[];
  },

  async saveVeiculo(data: any, editingVeiculo: Veiculo | null): Promise<Veiculo> {
    const userId = localStorage.getItem("app_user_id");

    if (editingVeiculo && editingVeiculo.ativo && data.ativo === false) {
      const count = await this.fetchPassageirosAtivosCount(editingVeiculo.id);
      if (count > 0) {
        throw new Error(`Existem passageiros ativos vinculados ao veículo.`);
      }
    }

    if (editingVeiculo) {
      const { data: updatedData, error } = await supabase
        .from("veiculos")
        .update({ ...data, ativo: data.ativo ?? true })
        .eq("id", editingVeiculo.id)
        .select()
        .single();

      if (error) throw error;
      return updatedData as Veiculo;
    } else {
      const storageKey = STORAGE_KEY_QUICKSTART_STATUS;
      const previousStatus = localStorage.getItem(storageKey);

      const { data: createdData, error } = await supabase.from("veiculos").insert([
        {
          ...data,
          ativo: true,
          usuario_id: userId,
        },
      ])
        .select()
        .single();

      if (error) {
        if (previousStatus) {
          localStorage.setItem(storageKey, previousStatus);
          console.warn("QuickStart revertido ao estado anterior (veículo).");
        }
        throw error;
      }

      const status = previousStatus ? JSON.parse(previousStatus) : {};
      status.step_veiculos = true;
      localStorage.setItem(storageKey, JSON.stringify(status));

      return createdData as Veiculo;
    }
  },

  async toggleAtivo(veiculo: Veiculo) {
    const novoStatus = !veiculo.ativo;

    if (!novoStatus) {
      const count = await this.fetchPassageirosAtivosCount(veiculo.id);
      if (count > 0) {
        throw new Error("Há passageiros ativos vinculado ao veículo.");
      }
    }

    const { error } = await supabase
      .from("veiculos")
      .update({ ativo: novoStatus })
      .eq("id", veiculo.id);

    if (error) throw error;

    return novoStatus;
  },

  async deleteVeiculo(veiculoId: string) {
    const userId = localStorage.getItem("app_user_id");

    const { data: passageiros, error: checkError } = await supabase
      .from("passageiros")
      .select("id")
      .eq("veiculo_id", veiculoId)
      .eq("usuario_id", userId);

    if (checkError) throw checkError;

    if (passageiros && passageiros.length > 0) {
      throw new Error("Não é possível excluir veículo com passageiros vinculados.");
    }

    const { error: deleteError } = await supabase
      .from("veiculos")
      .delete()
      .eq("id", veiculoId);

    if (deleteError) throw deleteError;
  }

};
