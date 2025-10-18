import { supabase } from "@/integrations/supabase/client";
import { Escola } from "@/types/escola";

const fetchPassageirosAtivosCount = async (escolaId: string): Promise<number> => {
    const userId = localStorage.getItem("app_user_id");

    const { count, error } = await supabase
        .from("passageiros")
        .select("id", { count: "exact" })
        .eq("escola_id", escolaId)
        .eq("ativo", true)
        .eq("usuario_id", userId);

    if (error) throw error;
    return count || 0;
};

export const fetchEscolasComContagemAtivos = async () => {
    const userId = localStorage.getItem("app_user_id");

    const { data, error } = await supabase
        .from("escolas")
        .select(`*, passageiros(count)`)
        .eq("usuario_id", userId)
         .eq("passageiros.ativo", true)
        .order("nome");

    if (error) throw error;

    return data.map(escola => ({
        ...escola,
        passageiros_ativos_count: escola.passageiros[0]?.count || 0,
    })) as (Escola & { passageiros_ativos_count: number })[];
};

export const saveEscola = async (data: any, editingEscola: Escola | null): Promise<Escola> => {
    const userId = localStorage.getItem("app_user_id");

    if (editingEscola && editingEscola.ativo && data.ativo === false) {
        const count = await fetchPassageirosAtivosCount(editingEscola.id);
        if (count > 0) {
            throw new Error(`Não é possível desativar. Existem passageiros ativos vinculados a esta escola.`);
        }
    }

    if (editingEscola) {
        const { data: updatedData, error } = await supabase
            .from("escolas")
            .update({ ...data, ativo: data.ativo ?? true })
            .eq("id", editingEscola.id)
            .select()
            .single();

        if (error) throw error;
        return updatedData as Escola;
    } else {
        const { data: createdData, error } = await supabase.from("escolas").insert([
            {
                ...data,
                ativo: true,
                usuario_id: userId,
            },
        ])
            .select()
            .single();

        if (error) throw error;
        return createdData as Escola;
    }
};

export const deleteEscola = async (escolaId: string): Promise<void> => {
    const userId = localStorage.getItem("app_user_id");
    
    const { data: passageiros, error: checkError } = await supabase
        .from("passageiros")
        .select("id")
        .eq("escola_id", escolaId)
        .eq("usuario_id", userId);

    if (checkError) throw checkError;

    if (passageiros && passageiros.length > 0) {
        throw new Error("Não é possível excluir escola com passageiros vinculados.");
    }

    const { error: deleteError } = await supabase
        .from("escolas")
        .delete()
        .eq("id", escolaId);

    if (deleteError) throw deleteError;
};

export const toggleAtivo = async (escola: Escola): Promise<boolean> => {
    const novoStatus = !escola.ativo;

    if (!novoStatus) {
        const count = await fetchPassageirosAtivosCount(escola.id);
        if (count > 0) {
            throw new Error("Não é possível desativar. Há passageiros ativos vinculados.");
        }
    }

    const { error } = await supabase
        .from("escolas")
        .update({ ativo: novoStatus })
        .eq("id", escola.id);

    if (error) throw error;

    return novoStatus;
};

export const escolaService = {
    fetchEscolasComContagemAtivos,
    saveEscola,
    deleteEscola,
    toggleAtivo
};